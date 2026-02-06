"""Classifier node - determines which agent to route to and extracts the query"""

import json
from typing import Dict, Any
from google_shopping_scraper.tools.llm_provider import get_llm_client


CLASSIFIER_SYSTEM_PROMPT = """You are a routing classifier for a shopping assistant. Your job is to analyze the user's LATEST message and determine which agent should handle it.

There are two agents:
1. **supplier** - Use when the user already knows the EXACT product they want (specific brand + model).
   Examples: "Sony WH1000XM6", "Apple AirPods Pro 2", "I want to buy the Samsung Galaxy S24 Ultra", "Find me deals on Logitech MX Master 3S"

2. **product** - Use when the user is asking for recommendations, comparisons, or general research about a product category.
   Examples: "What are the best noise cancelling headphones?", "Recommend me a gaming mouse under $100", "I need a good laptop for video editing", "What wireless earbuds should I get?"

IMPORTANT: Focus on the LATEST message to determine intent. Previous messages provide context only.

You MUST respond with valid JSON only, no other text:
{
    "route": "supplier" or "product",
    "extracted_query": "the cleaned query string"
}

Rules for extracted_query:
- If route is "supplier": Extract ONLY the clean brand + model name (e.g., "Sony WH1000XM6", "Apple AirPods Pro 2"). Strip out conversational fluff like "I want to buy" or "find me deals on".
- If route is "product": Combine ALL the conversation context into a single coherent query that captures what the user is looking for, including any preferences, budget constraints, and requirements mentioned across the conversation."""


def classify(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classify the user's intent and extract the appropriate query.

    Reads the latest message + conversation context, uses LLM to determine
    whether to route to supplier or product research agent.

    Returns:
        State update with route and extracted_query
    """
    messages = state.get("messages", [])
    latest_message = state.get("latest_message", "")

    # Build the prompt with conversation context
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
        # Handle markdown code blocks
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        parsed = json.loads(cleaned)
        route = parsed.get("route", "product")
        extracted_query = parsed.get("extracted_query", latest_message)

        # Validate route
        if route not in ("supplier", "product"):
            route = "product"

        return {
            "route": route,
            "extracted_query": extracted_query,
        }

    except Exception as e:
        # On failure, default to product research with the raw latest message
        return {
            "route": "product",
            "extracted_query": latest_message,
            "errors": state.get("errors", []) + [f"Classification failed: {str(e)}"],
        }
