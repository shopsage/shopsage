"""Main LangGraph agent for supplier research"""

from langgraph.graph import StateGraph, END

from google_shopping_scraper.state import AgentState, create_initial_state
from google_shopping_scraper.nodes.query_processor import process_query
from google_shopping_scraper.nodes.search import search_products
from google_shopping_scraper.nodes.filter_process import filter_and_process
from google_shopping_scraper.nodes.evaluate import evaluate_products
from google_shopping_scraper.nodes.format_response import format_response


def create_supplier_research_graph():
    """
    Create the LangGraph for supplier research

    Flow:
    START → Query Processing → Search → Filter & Process → Evaluate → Format Response → END

    Returns:
        Compiled graph ready for execution
    """
    # Create the graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("process_query", process_query)
    workflow.add_node("search", search_products)
    workflow.add_node("filter", filter_and_process)
    workflow.add_node("evaluate", evaluate_products)
    workflow.add_node("format", format_response)

    # Define edges (linear flow)
    workflow.set_entry_point("process_query")
    workflow.add_edge("process_query", "search")
    workflow.add_edge("search", "filter")
    workflow.add_edge("filter", "evaluate")
    workflow.add_edge("evaluate", "format")
    workflow.add_edge("format", END)

    # Compile graph (LangGraph Studio handles checkpointing automatically)
    graph = workflow.compile()

    return graph


# Create the graph instance for LangGraph Studio
graph = create_supplier_research_graph()


def run_research_agent(
    query: str, max_results: int = 20, top_n: int = 5, config: dict = None,
    user_preferences: dict = None,
) -> dict:
    """
    Run the supplier research agent

    Args:
        query: User's natural language query
        max_results: Maximum number of search results to fetch
        top_n: Number of top recommendations to return
        config: Optional LangGraph configuration (for checkpointing, etc.)
        user_preferences: Normalised scoring weights from user profile

    Returns:
        Final state dictionary with recommendations and metadata
    """
    # Create initial state
    initial_state = create_initial_state(query, max_results, top_n)
    if user_preferences:
        initial_state["user_preferences"] = user_preferences

    # Run the graph
    if config is None:
        config = {"configurable": {"thread_id": "default"}}

    final_state = graph.invoke(initial_state, config)

    return final_state


# Example usage
if __name__ == "__main__":
    import json

    # Test the agent
    result = run_research_agent("I want to buy sony wh1000xm6", max_results=10, top_n=3)

    print("=" * 80)
    print("SUPPLIER RESEARCH RESULTS")
    print("=" * 80)

    # Print recommendations
    print(f"\n🎯 TOP {len(result['recommendations'])} RECOMMENDATIONS:\n")
    for i, product in enumerate(result["recommendations"], 1):
        seller = product.get('seller') or product.get('source', 'N/A')
        print(f"{i}. {product.get('title', 'N/A')[:80]}")
        print(f"   Seller: {seller}")
        print(f"   Price: ${product.get('extracted_price', 'N/A')}")
        print(f"   Rating: {product.get('rating', 'N/A')}/5 ({product.get('reviews', 0)} reviews)")
        print(f"   Score: {product.get('overall_score', 0)}/10")
        print()

    # Print metadata summary
    metadata = result.get("metadata", {})
    print("\n📊 SUMMARY:")
    print(f"Total search results: {metadata.get('search_summary', {}).get('total_results', 0)}")
    print(
        f"Filtered products: {metadata.get('filtering_summary', {}).get('kept', 0)}/{metadata.get('filtering_summary', {}).get('total', 0)}"
    )
    print(
        f"Processing time: {metadata.get('processing_stats', {}).get('total_time_ms', 0):.0f}ms"
    )

    # Print price insights
    price_insights = metadata.get("price_insights", {})
    if price_insights:
        print("\n💰 PRICE INSIGHTS:")
        print(f"Range: ${price_insights.get('lowest_price', 0)} - ${price_insights.get('highest_price', 0)}")
        print(f"Median: ${price_insights.get('median_price', 0)}")
        print(
            f"Recommended range: ${price_insights.get('recommended_price_range', [0, 0])[0]} - ${price_insights.get('recommended_price_range', [0, 0])[1]}"
        )

    # Print warnings
    warnings = result.get("warnings", [])
    if warnings:
        print("\n⚠️ WARNINGS:")
        for warning in warnings:
            print(f"  - {warning}")

    # Print errors
    errors = result.get("errors", [])
    if errors:
        print("\n❌ ERRORS:")
        for error in errors:
            print(f"  - {error}")

    print("\n" + "=" * 80)

    # Optionally save full result to JSON file
    # with open('research_result.json', 'w') as f:
    #     json.dump(result, f, indent=2, default=str)
