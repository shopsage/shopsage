"""Classifier node - determines which agent to route to and extracts the query"""

import json
import re
from typing import Dict, Any, Optional, Tuple
from google_shopping_scraper.tools.llm_provider import get_llm_client


# Words to strip when extracting brand from natural language
_STOP_WORDS = {
    "the", "a", "an", "i", "me", "my", "we", "us",
    "want", "to", "buy", "get", "purchase", "order", "find",
    "looking", "would", "like", "need", "can", "could", "should",
    "will", "for", "on", "at", "from", "about", "please", "some",
    "just", "now", "here", "there", "is", "are", "have", "has",
}

# Matches product model numbers containing digits:
#   - letters + 2+ digits + optional tail: WH1000XM6, V15, S24, QC45, GTX4090, XPS15
#   - hyphenated models with digits: SM-G998, WH-1000XM6, MX-500
# NOTE: intentionally excludes purely alphabetic hyphenated words (in-ear, over-ear, noise-cancelling)
_MODEL_NUMBER_RE = re.compile(
    r'\b[A-Za-z]{1,8}-?[0-9]{2,}[A-Za-z0-9]*\b'
    r'|'
    r'\b[A-Za-z]{1,8}-[A-Za-z0-9]*[0-9][A-Za-z0-9]*\b',
)


def _try_heuristic_classify(message: str) -> Optional[Tuple[str, str]]:
    """
    Fast heuristic to detect specific product queries containing a model number.

    Returns (route, extracted_query) if a model number is found, else None.
    Falls through to LLM classifier for ambiguous natural-language queries.
    """
    models = _MODEL_NUMBER_RE.findall(message)
    if not models:
        return None

    # Take the first detected model number
    model = models[0]

    # Find where the model appears in the message and grab the words before it
    idx = message.lower().find(model.lower())
    prefix_words = [
        w.strip(".,!?\"'")
        for w in message[:idx].split()
        if w.strip(".,!?\"'").lower() not in _STOP_WORDS
    ]

    if prefix_words:
        # Use last 1–2 non-stop words as the brand name
        brand = " ".join(prefix_words[-2:])
        extracted_query = f"{brand} {model}"
    else:
        extracted_query = model

    return ("supplier", extracted_query)


CLASSIFIER_SYSTEM_PROMPT = """You are a routing classifier for a shopping assistant. Your job is to analyze the user's LATEST message and determine which agent should handle it.

There are four routes:

1. **supplier** - Use when the user already knows the EXACT product they want (specific brand + model).
   Examples:
   - "Sony WH1000XM6"
   - "Apple AirPods Pro 2"
   - "I want to buy the Samsung Galaxy S24 Ultra"
   - "Find me deals on Logitech MX Master 3S"

2. **clarify** - Use when the user is asking about a product CATEGORY but hasn't given enough detail to research effectively. The query is vague — missing key constraints like type, budget, use-case, or form factor that would significantly change the recommendations.
   Examples:
   - "I'm looking for good headphones" (missing: type, budget)
   - "I need a laptop" (missing: use-case, budget)
   - "What camera should I get?" (missing: type, budget, skill level)
   DO NOT clarify when:
   - The user already gave constraints: "best gaming mouse under $100" → route to product
   - The user is comparing specific products: "compare Sony and Bose headphones" → route to product
   - The conversation history already contains the user's preferences (check history!)

3. **product** - Use when the user is asking for recommendations with enough detail to research, OR comparing specific products.
   Examples:
   - "What are the best noise cancelling headphones under $300?"
   - "Recommend me a gaming mouse under $100"
   - "I need a good laptop for video editing"
   - "Compare the Sony and Bose headphones"
   - "Best budget mechanical keyboards 2024"
   - "In-ear noise cancelling headphones under $350" (has type + budget)

4. **chat** - Use when the user is asking a follow-up question about products ALREADY discussed in the conversation. The conversation history MUST contain prior assistant messages with product information or recommendations.
   Requirements:
   - There MUST be prior assistant messages with product information in the conversation history.
   - The user's question relates to products/information already discussed.
   - NEVER use chat on the first message (no conversation history with product results).
   Examples:
   - "How's the battery life on the Sony one?" (after products were shown)
   - "Which of those is best for running?" (after recommendations)
   - "Tell me more about the top pick" (after product research results)
   - "How does the first one compare to the second?" (after multiple products shown)
   - "Is it worth the extra $50 for the Pro model?" (after price comparison)
   Do NOT use chat when:
   - The user asks about a completely NEW product category → product or clarify
   - The user names a specific brand + model number → supplier
   - There is no conversation history with product results → product or clarify

5. **off_topic** - Use when the user's message has nothing to do with shopping, products, or buying decisions.
   Examples:
   - "Write me a poem"
   - "What is the capital of France?"
   - "How do I cook pasta?"

KEY RULES:
- If the user names a specific brand AND model number (e.g. "Sony WH1000XM6"), route to **supplier**.
- **supplier** requires BOTH a brand name AND a model identifier — a category name alone (even a specific one like "in-ear headphones") is NOT enough for supplier.
- If the query is vague (just a category, no constraints), route to **clarify**.
- If the query has constraints or the conversation history already has preferences, route to **product**.
- Focus on the LATEST message to determine intent. Previous messages provide context.

POST-CLARIFICATION RULE (highest priority):
- If the conversation history contains an assistant message with "[asked user preferences: ...]", the user's latest message is answering those preference questions.
- In that case, ALWAYS route to **product** — never supplier, never clarify again.
- For extracted_query: combine the original product category from history with the user's preference answers into one coherent search query.
  Example: history has "headphones" + "[asked user preferences: Type, Budget]", latest message "In-ear, Under $300" → route "product", extracted_query "in-ear headphones under $300"

You MUST respond with valid JSON only, no other text:

For supplier/product/off_topic routes:
{
    "route": "supplier" or "product" or "off_topic" or "chat",
    "extracted_query": "the cleaned query string"
}

For clarify route:
{
    "route": "clarify",
    "extracted_query": "the product category",
    "preferences": [
        {"label": "Category Label", "options": ["Option 1", "Option 2", "Option 3"]},
        {"label": "Budget", "options": ["Under $X", "Under $Y", "$Z+"]}
    ]
}

Rules for the clarify route's preferences:
- Generate 2-3 preference groups that are MOST relevant to narrowing down THIS specific product category.
- Each group should have 2-5 concise options. Keep labels short (1-3 words).
- Always include a Budget group with realistic price ranges for the category.
- Make options mutually exclusive within each group.
- Tailor groups to the category (e.g., headphones → Type/Budget; laptops → Use Case/Screen Size/Budget; cameras → Type/Skill Level/Budget).

Rules for extracted_query:
- If route is "supplier": Extract ONLY the clean brand + model name (must include a model number/identifier).
- If route is "product": Combine ALL relevant conversation context into a single coherent query.
- If route is "clarify": Extract the product category (e.g., "noise cancelling headphones", "laptop", "camera").
- If route is "off_topic": Summarise what the user asked about in a short noun phrase."""


def classify(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classify the user's intent and extract the appropriate query.

    First tries a fast regex-based heuristic (detects model numbers).
    Falls back to LLM classification for ambiguous natural-language queries.

    Returns:
        State update with route and extracted_query
    """
    messages = state.get("messages", [])
    latest_message = state.get("latest_message", "")

    # --- Fast path: heuristic model-number detection ---
    heuristic = _try_heuristic_classify(latest_message)
    if heuristic:
        route, extracted_query = heuristic
        return {"route": route, "extracted_query": extracted_query}

    # --- Slow path: LLM classifier ---
    context_parts = []
    if messages:
        context_parts.append("=== CONVERSATION HISTORY ===")
        for msg in messages:
            role = msg.get("role", "user").upper()
            content = msg.get("content", "")
            context_parts.append(f"{role}: {content}")
        context_parts.append("=== END CONVERSATION HISTORY ===\n")

    context_parts.append(f"LATEST MESSAGE: {latest_message}")
    prompt = "\n".join(context_parts)

    try:
        llm_client = get_llm_client(temperature=0.0)
        response = llm_client.get_completion(
            prompt=prompt,
            system_prompt=CLASSIFIER_SYSTEM_PROMPT,
        )

        # Parse LLM response
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        parsed = json.loads(cleaned)
        route = parsed.get("route", "product")
        extracted_query = parsed.get("extracted_query", latest_message)

        if route not in ("supplier", "product", "off_topic", "clarify", "chat"):
            route = "product"

        state_update = {
            "route": route,
            "extracted_query": extracted_query,
        }

        # Parse preference groups for the clarify route
        if route == "clarify":
            raw_prefs = parsed.get("preferences", [])
            preference_groups = []
            for group in raw_prefs:
                if isinstance(group, dict) and "label" in group and "options" in group:
                    preference_groups.append({
                        "label": group["label"],
                        "options": [
                            {"value": opt.lower().replace(" ", "-").replace("$", "").replace("+", "plus"),
                             "label": opt}
                            for opt in group["options"]
                        ],
                    })
            if preference_groups:
                state_update["preferences"] = preference_groups
            else:
                # Fallback: if no valid preferences, just do product research
                state_update["route"] = "product"

        return state_update

    except Exception as e:
        return {
            "route": "product",
            "extracted_query": latest_message,
            "errors": state.get("errors", []) + [f"Classification failed: {str(e)}"],
        }
