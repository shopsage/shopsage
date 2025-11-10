import time
from typing import Dict, Any, Set
from product_research_scraper.state import AgentState
from product_research_scraper.tools.reddit_client import client

async def search_reddit(state: AgentState) -> Dict[str, Any]:
    """
    Searches Reddit asynchronously based on the query in the state.
    """
    start_time = time.monotonic()
    sources: Set[str] = set()
    error = None
    response = None

    reddit_query = (state.get("query", {})).get("reddit_query", "")

    if not reddit_query:
        error = "No query string found in state['reddit_query']['query']"
    else:
        try:
            response = await client.get_content_by_query(
                query=reddit_query, 
                subreddit="all",
                post_limit=2,
                sources=sources
            )
        except Exception as e:
            response = None
            error = f"Reddit search failed: {str(e)}"

    processing_time = (time.monotonic() - start_time) * 1000

    return {
        "reddit_dump": response,
        "reddit_sources": sources,
        "errors": state.get("errors", []) + [error] if error else state.get("errors", []),
        "processing_times": {
                **state.get("processing_times", {}),
                "searching_reddit_ms": processing_time,
            },
    }