"""Supplier agent wrapper node - runs the supplier research agent"""

from typing import Dict, Any
from google_shopping_scraper.agent import run_research_agent


def run_supplier(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run the supplier research agent with the extracted brand+model query.

    Args:
        state: Router state with extracted_query containing clean brand+model string

    Returns:
        State update with result from supplier agent
    """
    query = state.get("extracted_query", "")
    user_preferences = state.get("user_preferences")

    try:
        result = run_research_agent(query=query, max_results=20, top_n=5, user_preferences=user_preferences)
        return {"result": result}
    except Exception as e:
        return {
            "result": None,
            "errors": state.get("errors", []) + [f"Supplier agent failed: {str(e)}"],
        }
