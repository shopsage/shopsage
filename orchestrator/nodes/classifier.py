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

# Matches product model numbers:
#   - letters + 2+ digits + optional tail: WH1000XM6, V15, S24, QC45, GTX4090, XPS15
#   - hyphenated models: MX-Keys, SM-G998, WH-1000XM6
_MODEL_NUMBER_RE = re.compile(
    r'\b[A-Za-z]{1,8}-?[0-9]{2,}[A-Za-z0-9]*\b'
    r'|'
    r'\b[A-Za-z]{2,8}-[A-Za-z0-9]{2,10}\b',
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

There are two agents:
1. **supplier** - Use when the user already knows the EXACT product they want (specific brand + model).
   Examples:
   - "Sony WH1000XM6"
   - "Apple AirPods Pro 2"
   - "I want to buy the Samsung Galaxy S24 Ultra"
   - "I want to buy the Sony WH1000XM6"
   - "Find me deals on Logitech MX Master 3S"
   - "Can I get the Apple MacBook Pro 14?"
   - "Looking to purchase the LG C3 55 inch"
   - "Where can I buy the Bose QuietComfort 45?"
   - "How much is the Dyson V15 Detect?"
   - "Sony WH1000XM6 please"
   - "Get me the Nvidia RTX 4090"

2. **product** - Use when the user is asking for recommendations, comparisons, or general research about a product category.
   Examples:
   - "What are the best noise cancelling headphones?"
   - "Recommend me a gaming mouse under $100"
   - "I need a good laptop for video editing"
   - "What wireless earbuds should I get?"
   - "Compare the Sony and Bose headphones"
   - "Best budget mechanical keyboards 2024"

KEY RULE: If the user names a specific brand AND model (even inside a sentence like "I want to buy the X"), route to **supplier**.

IMPORTANT: Focus on the LATEST message to determine intent. Previous messages provide context only.

You MUST respond with valid JSON only, no other text:
{
    "route": "supplier" or "product",
    "extracted_query": "the cleaned query string"
}

Rules for extracted_query:
- If route is "supplier": Extract ONLY the clean brand + model name (e.g., "Sony WH1000XM6", "Apple AirPods Pro 2"). Strip all conversational fluff like "I want to buy", "find me", "can I get", "please", etc.
- If route is "product": Combine ALL the conversation context into a single coherent query that captures what the user is looking for, including any preferences, budget constraints, and requirements mentioned across the conversation."""


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

        if route not in ("supplier", "product"):
            route = "product"

        return {
            "route": route,
            "extracted_query": extracted_query,
        }

    except Exception as e:
        return {
            "route": "product",
            "extracted_query": latest_message,
            "errors": state.get("errors", []) + [f"Classification failed: {str(e)}"],
        }
