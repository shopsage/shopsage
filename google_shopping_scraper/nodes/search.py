"""Search node - fetches products from SerpAPI"""

import time
from typing import Dict, Any
from google_shopping_scraper.state import AgentState
from google_shopping_scraper.tools.serpapi_client import SerpAPIClient


def search_products(state: AgentState) -> Dict[str, Any]:
    """
    Search for products using SerpAPI Google Shopping

    Constructs optimized search query from processed_query and fetches results.
    Preserves ALL data from SerpAPI response.

    Args:
        state: Current agent state

    Returns:
        Updated state with raw_search_results and search_metadata
    """
    start_time = time.time()

    processed_query = state.get("processed_query", {})
    max_results = state.get("max_results", 20)

    # Build search query from processed information
    search_query = _build_search_query(processed_query)

    try:
        # Initialize SerpAPI client
        client = SerpAPIClient()

        # Perform search
        response = client.search_google_shopping(
            query=search_query, num_results=max_results, location="Singapore"
        )

        # Extract products with all fields preserved
        products = client.extract_shopping_results(response)

        # Get metadata
        metadata = client.get_search_metadata(response)

        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000

        # Update state
        return {
            "raw_search_results": products,
            "search_metadata": metadata,
            "current_step": "search_completed",
            "processing_times": {
                **state.get("processing_times", {}),
                "search_ms": processing_time,
            },
        }

    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        error_msg = f"Search failed: {str(e)}"

        return {
            "raw_search_results": [],
            "search_metadata": {
                "total_results": 0,
                "search_time_ms": processing_time,
                "api_provider": "SerpAPI",
                "error": error_msg,
            },
            "errors": state.get("errors", []) + [error_msg],
            "warnings": state.get("warnings", [])
            + ["No search results returned. Check API key and query."],
            "current_step": "search_failed",
            "processing_times": {
                **state.get("processing_times", {}),
                "search_ms": processing_time,
            },
        }


def _build_search_query(processed_query: Dict[str, Any]) -> str:
    """
    Build optimized search query from processed query data

    Args:
        processed_query: Structured query data from query processor

    Returns:
        Optimized search query string
    """
    parts = []

    # Add brand if available
    brand = processed_query.get("brand")
    if brand:
        parts.append(brand)

    # Add model if available
    model = processed_query.get("model")
    if model:
        parts.append(model)

    # Add product type if available and not already in model
    product_type = processed_query.get("product_type")
    if product_type:
        # Only add if not redundant with model
        if not model or product_type.lower() not in model.lower():
            parts.append(product_type)

    # If we have nothing, fall back to original query
    if not parts:
        return processed_query.get("original_query", "")

    # Join parts
    search_query = " ".join(parts)

    return search_query
