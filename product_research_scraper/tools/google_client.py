import os
import asyncio
from typing import List, Dict, Any
from googleapiclient.discovery import build, Resource

class GoogleClient:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        self.cse_id = os.getenv("GOOGLE_CSE_ID")
        
        if not self.api_key or not self.cse_id:
            raise ValueError("GOOGLE_API_KEY or GOOGLE_CSE_ID must be set")
            
        try:
            self.service: Resource = build("customsearch", "v1", developerKey=self.api_key)
        except Exception as e:
            raise RuntimeError(f"Failed to build Google API service: {e}")

    def _search_sync(self, query: str, num_results: int) -> List[Dict[str, Any]]:
        """
        Private synchronous method that runs the actual search.
        """
        try:
            res = self.service.cse().list(
                q=query,
                cx=self.cse_id,
                num=num_results
            ).execute()
            return res.get('items', [])
        except Exception as e:
            print(f"Google API search error: {e}")
            raise e

    async def search_by_query(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """
        Asynchronous wrapper for the search.
        This is the method your node will call.
        """
        return await asyncio.to_thread(
            self._search_sync,
            query=query,
            num_results=num_results
        )

client = GoogleClient()