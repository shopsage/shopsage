import time
from typing import Dict, Any
from product_research_scraper.state import AgentState, create_initial_state
from product_research_scraper.tools.reddit_client import client

def search_reddit(state: AgentState) -> Dict[str, Any]:
    start_time = time.time()
    query = (state.get("reddit_query", {})).get("query", None)
    sources = set()
    error = None

    try:
        response = client.get_content_by_query(query=query, post_limit=2, sources=sources)
    except Exception as e:
        response = None
        error = str(e)

    processing_time = (time.time() - start_time) * 1000

    return {
        "reddit_dump": response,
        "sources": sources,
        "errors": state.get("errors", []) + [error] if error else state.get("errors", []),
        "current_step": "reddit_search_failed" if error else "reddit_searched",
        "processing_times": {
                **state.get("processing_times", {}),
                "searching_reddit_ms": processing_time,
            },
    }

