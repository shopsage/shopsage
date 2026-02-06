"""State definition for the router/orchestrator agent"""

from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict


class RouterState(TypedDict):
    """
    State for the orchestrator that routes between supplier and product research agents.

    The classifier node populates route and extracted_query,
    then the appropriate agent wrapper node populates result.
    """

    # Input
    messages: List[Dict[str, str]]  # Full conversation history [{"role": "user"|"assistant", "content": "..."}]
    latest_message: str  # The most recent user message

    # Classification output
    route: Optional[str]  # "supplier" or "product"
    extracted_query: str  # Clean query for the chosen agent

    # Agent output
    result: Optional[Dict[str, Any]]  # Final result from whichever agent runs

    # Control
    errors: List[str]


def create_initial_state(
    messages: List[Dict[str, str]],
    latest_message: str,
) -> RouterState:
    """Create initial state for the orchestrator"""
    return RouterState(
        messages=messages,
        latest_message=latest_message,
        route=None,
        extracted_query="",
        result=None,
        errors=[],
    )
