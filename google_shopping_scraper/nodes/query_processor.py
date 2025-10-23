"""Query processing node - extracts structured data from user queries"""

import json
import time
from typing import Dict, Any
from google_shopping_scraper.state import AgentState
from google_shopping_scraper.tools.llm_provider import get_llm_client


def process_query(state: AgentState) -> Dict[str, Any]:
    """
    Process user query to extract structured product information

    Uses LLM to extract:
    - Brand
    - Model
    - Product type
    - Keywords
    - User intent

    Args:
        state: Current agent state

    Returns:
        Updated state with processed_query and query_reasoning
    """
    start_time = time.time()

    user_query = state["user_query"]

    # System prompt for query extraction
    system_prompt = """You are an expert at extracting product information from natural language queries.

Your task is to analyze a user's product search query and extract structured information.

Extract the following information:
- brand: The manufacturer/brand name (e.g., "Sony", "Apple", "Samsung")
- model: The specific model number or name (e.g., "WH-1000XM6", "iPhone 15 Pro")
- product_type: The type of product (e.g., "headphones", "smartphone", "laptop")
- keywords: Additional important search keywords
- intent: What the user is trying to do (e.g., "purchase", "compare", "research")
- confidence: Your confidence in the extraction (0-1)

Return your response as a JSON object with these exact keys.
If you cannot determine a field, use null for that field.

Examples:

Query: "I want to buy sony wh1000xm6"
Response: {
  "brand": "Sony",
  "model": "WH-1000XM6",
  "product_type": "headphones",
  "keywords": ["wireless", "noise canceling"],
  "intent": "purchase",
  "confidence": 0.95
}

Query: "looking for iphone 15 pro max"
Response: {
  "brand": "Apple",
  "model": "iPhone 15 Pro Max",
  "product_type": "smartphone",
  "keywords": ["iphone", "pro", "max"],
  "intent": "research",
  "confidence": 0.9
}

Query: "best gaming laptop under 1000"
Response: {
  "brand": null,
  "model": null,
  "product_type": "laptop",
  "keywords": ["gaming", "under 1000", "best"],
  "intent": "research",
  "confidence": 0.85
}

Now extract information from the user's query. Return ONLY the JSON object, no other text."""

    user_prompt = f"User query: {user_query}"

    try:
        # Get LLM client
        llm_client = get_llm_client(temperature=0.3)

        # Get completion
        response = llm_client.get_completion(user_prompt, system_prompt)

        # Parse JSON response
        try:
            # Extract JSON from response (handle potential markdown code blocks)
            response_clean = response.strip()
            if response_clean.startswith("```"):
                # Remove markdown code block
                lines = response_clean.split("\n")
                response_clean = "\n".join(
                    line for line in lines if not line.startswith("```")
                )

            processed_query = json.loads(response_clean)

            # Ensure all required fields exist
            required_fields = [
                "brand",
                "model",
                "product_type",
                "keywords",
                "intent",
                "confidence",
            ]
            for field in required_fields:
                if field not in processed_query:
                    processed_query[field] = None

            # Add original query
            processed_query["original_query"] = user_query

        except json.JSONDecodeError as e:
            # Fallback: create basic structured query
            processed_query = {
                "original_query": user_query,
                "brand": None,
                "model": None,
                "product_type": None,
                "keywords": user_query.split(),
                "intent": "research",
                "confidence": 0.5,
            }
            response = f"Failed to parse LLM response as JSON: {str(e)}"

        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000

        # Update state
        return {
            "processed_query": processed_query,
            "query_reasoning": response,
            "current_step": "query_processed",
            "processing_times": {
                **state.get("processing_times", {}),
                "query_processing_ms": processing_time,
            },
        }

    except Exception as e:
        # Handle errors gracefully
        processing_time = (time.time() - start_time) * 1000

        error_msg = f"Query processing failed: {str(e)}"

        # Create fallback query
        fallback_query = {
            "original_query": user_query,
            "brand": None,
            "model": None,
            "product_type": None,
            "keywords": user_query.split(),
            "intent": "research",
            "confidence": 0.3,
        }

        return {
            "processed_query": fallback_query,
            "query_reasoning": error_msg,
            "errors": state.get("errors", []) + [error_msg],
            "current_step": "query_processing_failed",
            "processing_times": {
                **state.get("processing_times", {}),
                "query_processing_ms": processing_time,
            },
        }
