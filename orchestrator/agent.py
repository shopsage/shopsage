"""Main LangGraph orchestrator that routes between supplier and product research agents"""

from typing import Dict, Any, List, Optional
from langgraph.graph import StateGraph, END

from orchestrator.state import RouterState, create_initial_state
from orchestrator.nodes.classifier import classify
from orchestrator.nodes.run_supplier import run_supplier
from orchestrator.nodes.run_product import run_product


def route_decision(state: Dict[str, Any]) -> str:
    """Conditional edge: route to the appropriate agent based on classification."""
    return state.get("route", "product")


def off_topic(state: Dict[str, Any]) -> Dict[str, Any]:
    """No-op node for off-topic messages — skips all agents."""
    return {}


def clarify(state: Dict[str, Any]) -> Dict[str, Any]:
    """No-op node for clarification — preferences are already set by the classifier."""
    return {}


def create_orchestrator_graph():
    """
    Create the LangGraph orchestrator.

    Flow:
    START → classify → (conditional) → run_supplier OR run_product OR off_topic → END
    """
    workflow = StateGraph(RouterState)

    # Add nodes
    workflow.add_node("classify", classify)
    workflow.add_node("run_supplier", run_supplier)
    workflow.add_node("run_product", run_product)
    workflow.add_node("off_topic", off_topic)
    workflow.add_node("clarify", clarify)

    # Set entry point
    workflow.set_entry_point("classify")

    # Conditional routing based on classification
    workflow.add_conditional_edges(
        "classify",
        route_decision,
        {
            "supplier": "run_supplier",
            "product": "run_product",
            "off_topic": "off_topic",
            "clarify": "clarify",
        },
    )

    # All agent nodes lead to END
    workflow.add_edge("run_supplier", END)
    workflow.add_edge("run_product", END)
    workflow.add_edge("off_topic", END)
    workflow.add_edge("clarify", END)

    graph = workflow.compile()
    return graph


# Create the graph instance for LangGraph Studio
graph = create_orchestrator_graph()


def run_orchestrator(
    messages: Optional[List[Dict[str, str]]] = None,
    latest_message: str = "",
    config: Optional[dict] = None,
) -> dict:
    """
    Run the orchestrator agent.

    Args:
        messages: Full conversation history [{"role": "user"|"assistant", "content": "..."}]
        latest_message: The most recent user message (used for routing)
        config: Optional LangGraph configuration

    Returns:
        Final state dictionary with route, extracted_query, and result
    """
    if messages is None:
        messages = []

    # If no latest_message provided, use the last user message from history
    if not latest_message and messages:
        for msg in reversed(messages):
            if msg.get("role") == "user":
                latest_message = msg["content"]
                break

    initial_state = create_initial_state(messages=messages, latest_message=latest_message)

    if config is None:
        config = {"configurable": {"thread_id": "default"}}

    final_state = graph.invoke(initial_state, config)
    return final_state
