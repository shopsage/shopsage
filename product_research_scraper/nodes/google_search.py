import time
import requests
import asyncio

from bs4 import BeautifulSoup
from typing import Dict, Any, Set
from product_research_scraper.state import AgentState
from product_research_scraper.tools.google_client import client as google_client
from product_research_scraper.tools.reddit_client import client as reddit_client

async def search_google(state: AgentState) -> Dict[str, Any]:
    """
    Searches Google asynchronously using the GoogleClient.
    """
    start_time = time.monotonic()
    google_sources: Set[str] = set()
    reddit_tasks = []
    google_dump = []
    error = None
    response_json = None

    query_details = state.get("query", {})
    query = query_details.get("google_query")

    if not query:
        error = "No query string found in state['query']['google_query']"
    else:
        try:
            search_results = await google_client.search_by_query(
                query=query,
                num_results=2
            )
            
            if search_results:
                for item in search_results:
                    link = item.get("link")
                    if not link:
                        continue
                 
                    if item.get("displayLink") == "www.reddit.com":
                        reddit_tasks.append(
                            reddit_client.get_content_by_url(
                                url=link, 
                                sources=google_sources
                            )
                        )
                        pass
                    else:
                        response = requests.get(link) 
                        response.raise_for_status()  
                        soup = BeautifulSoup(response.text, 'html.parser')
                        text = soup.get_text(strip=True, separator=' ')
                        google_dump.append(text)

                        google_sources.add((item.get("displayLink"), link))
        
            if reddit_tasks:
                reddit_content_list = await asyncio.gather(*reddit_tasks)
                google_dump.extend(reddit_content_list)
                
        except Exception as e:
            error = f"Google search failed: {str(e)}"

    processing_time = (time.monotonic() - start_time) * 1000

    return {
        "google_dump": "\n".join(google_dump),
        "google_sources": google_sources,
        "errors": state.get("errors", []) + [error] if error else state.get("errors", []),
        "processing_times": {
                **state.get("processing_times", {}),
                "searching_google_ms": processing_time,
            },
    }