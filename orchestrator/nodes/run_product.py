"""Product research agent wrapper node - runs the product research agent"""

import asyncio
from typing import Dict, Any
from product_research_scraper.agent import run_research_agent


def run_product(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run the product research agent with the full conversation context as query.

    Args:
        state: Router state with extracted_query containing full conversation context

    Returns:
        State update with result from product research agent
    """
    query = state.get("extracted_query", "")

    try:
        # Try to get a running event loop (e.g. when called from FastAPI/uvicorn).
        # If one exists, we can't use asyncio.run(), so create a new thread loop.
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            # We're inside an existing event loop (FastAPI/uvicorn).
            # Run the async agent in a new thread with its own event loop.
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                result = pool.submit(asyncio.run, run_research_agent(query=query)).result()
        else:
            result = asyncio.run(run_research_agent(query=query))

        return {"result": result}
    except Exception as e:
        return {
            "result": None,
            "errors": state.get("errors", []) + [f"Product agent failed: {str(e)}"],
        }
