import asyncio
import httpx

from bs4 import BeautifulSoup
from typing import Dict, Any
from product_research_scraper.state import AgentState
from product_research_scraper.tools.google_client import client as google_client
from product_research_scraper.tools.reddit_client import client as reddit_client

async def fetch_and_parse(client, url):
    try:
        resp = await client.get(url, timeout=10.0)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        return soup.get_text(strip=True, separator=' ')
    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return ""

async def search_google(state: AgentState) -> Dict[str, Any]:
    start_time = asyncio.get_event_loop().time()
    google_sources = set()
    google_dump = []
    tasks = []
    
    query = state.get("query", {}).get("google_query")
    if not query:
        return {**state, "errors": state.get("errors", []) + ["No query found"]}

    try:
        search_results = await google_client.search_by_query(query=query, num_results=2)
        
        async with httpx.AsyncClient(follow_redirects=True) as http_client:
            for item in search_results:
                link = item.get("link")
                display_link = item.get("displayLink")
                if not link: continue

                if display_link == "www.reddit.com":
                    tasks.append(reddit_client.get_content_by_url(url=link, sources=google_sources))
                else:
                    tasks.append(fetch_and_parse(http_client, link))
                    snippet = item.get("snippet", "")
                    google_sources.add((display_link, link, snippet))

            results = await asyncio.gather(*tasks)
            
            google_dump.extend([r for r in results if r])

    except Exception as e:
        error = f"Google search failed: {str(e)}"

    processing_time = (asyncio.get_event_loop().time() - start_time) * 1000

    return {
        "google_dump": "\n".join(google_dump),
        "google_sources": google_sources,
        "errors": state.get("errors", []),
        "processing_times": {
            **state.get("processing_times", {}),
            "searching_google_ms": processing_time,
        },
    }