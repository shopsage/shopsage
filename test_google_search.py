import dotenv
import requests
from bs4 import BeautifulSoup
from typing import Dict, Any, Set
from rich.pretty import pprint
import asyncio

async def search_google_and_reddit(query: str):
    from product_research_scraper.tools.google_client import client as google_client
    from product_research_scraper.tools.reddit_client import client as reddit_client

    google_sources: Set[str] = set()
    reddit_tasks = []
    google_dump = []

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
                
                google_sources.add(link) 
                
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
        
        if reddit_tasks:
            reddit_content_list = await asyncio.gather(*reddit_tasks)
            google_dump.extend(reddit_content_list)

        print("\n".join(google_dump))

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    dotenv.load_dotenv()
    asyncio.run(search_google_and_reddit("good wired headphones gaming"))