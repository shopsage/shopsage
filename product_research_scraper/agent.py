from langgraph.graph import StateGraph, END
from product_research_scraper.state import AgentState, create_initial_state
from product_research_scraper.nodes.query_processor import process_reddit_query
from product_research_scraper.nodes.search import search_reddit


def create_product_research_graph():
    """
    Create the LangGraph for product research

    Flow:
    START → Query Processing → Search → END

    Returns:
        Compiled graph ready for execution
    """
    workflow = StateGraph(AgentState)

    # TODO: add the summary and evaluation nodes
    workflow.add_node("process_query", process_reddit_query)
    workflow.add_node("search_reddit", search_reddit)

    workflow.set_entry_point("process_query")
    workflow.add_edge("process_query", "search_reddit")
    workflow.add_edge("search_reddit", END)

    graph = workflow.compile()

    return graph


# Create the graph instance for LangGraph Studio
graph = create_product_research_graph()


def run_research_agent(
    query: str, config: dict = None
) -> dict:
    """
    Run the supplier research agent

    Args:
        query: User's natural language query
        max_results: Maximum number of search results to fetch
        top_n: Number of top recommendations to return
        config: Optional LangGraph configuration (for checkpointing, etc.)

    Returns:
        Final state dictionary with recommendations and metadata
    """
    # Create initial state
    initial_state = create_initial_state(query)

    # Run the graph
    if config is None:
        config = {"configurable": {"thread_id": "default"}}

    final_state = graph.invoke(initial_state, config)

    return final_state

if __name__ == "__main__":
    try:
        from rich.pretty import pprint as print
    except:
        pass
    result = run_research_agent("What are good wired headphones I can buy for gaming?")
    print(result)