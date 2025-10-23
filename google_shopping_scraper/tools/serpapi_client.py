"""SerpAPI client for Google Shopping searches"""

import os
from typing import Dict, Any, List, Optional
from serpapi import GoogleSearch
from dotenv import load_dotenv

load_dotenv()


class SerpAPIClient:
    """Client for interacting with SerpAPI Google Shopping"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize SerpAPI client

        Args:
            api_key: SerpAPI API key. If not provided, reads from SERPAPI_API_KEY env var
        """
        self.api_key = api_key or os.getenv("SERPAPI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "SerpAPI API key is required. Set SERPAPI_API_KEY environment variable "
                "or pass api_key to constructor."
            )

    def search_google_shopping(
        self,
        query: str,
        num_results: int = 20,
        location: str = "Singapore",
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Search Google Shopping via SerpAPI

        Args:
            query: Search query string
            num_results: Maximum number of results to return
            location: Geographic location for search (e.g., "Singapore")
            **kwargs: Additional parameters to pass to SerpAPI
                     Can override gl (country) and hl (language) parameters

        Returns:
            Complete SerpAPI response with all fields preserved

        Note:
            By default, searches are configured for Singapore (gl=sg, hl=en)
            This ensures results show Singapore stores, prices in SGD, etc.
        """
        params = {
            "engine": "google_shopping",
            "q": query,
            "api_key": self.api_key,
            "num": num_results,
            "location": location,
            "gl": "sg",  # Country code for Singapore
            "hl": "en",  # Language
            **kwargs,
        }

        try:
            search = GoogleSearch(params)
            results = search.get_dict()

            # Preserve the complete response
            return results

        except Exception as e:
            raise Exception(f"SerpAPI search failed: {str(e)}")

    def extract_shopping_results(
        self, serpapi_response: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Extract shopping results from SerpAPI response while preserving ALL fields

        Args:
            serpapi_response: Complete SerpAPI response dictionary

        Returns:
            List of product dictionaries with all original fields intact
        """
        shopping_results = serpapi_response.get("shopping_results", [])

        enriched_results = []
        for result in shopping_results:
            # Start with complete original data
            product = dict(result)

            # Ensure price is extracted as float if possible
            if "price" in product and product["price"]:
                try:
                    # Handle various price formats: "$299.99", "299.99", "299"
                    price_str = product["price"].replace("$", "").replace(",", "").strip()
                    product["extracted_price"] = float(price_str)
                except (ValueError, AttributeError):
                    product["extracted_price"] = None
            else:
                product["extracted_price"] = None

            # Copy source to seller for clarity (source is the seller/store name)
            if "source" in product:
                product["seller"] = product["source"]

            # Store original raw data for complete transparency
            product["raw_data"] = dict(result)

            enriched_results.append(product)

        return enriched_results

    def get_search_metadata(self, serpapi_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract metadata from SerpAPI response

        Args:
            serpapi_response: Complete SerpAPI response dictionary

        Returns:
            Metadata dictionary with search info
        """
        search_metadata = serpapi_response.get("search_metadata", {})
        search_params = serpapi_response.get("search_parameters", {})
        search_info = serpapi_response.get("search_information", {})

        return {
            "total_results": len(serpapi_response.get("shopping_results", [])),
            "search_time_ms": search_metadata.get("total_time_taken"),
            "api_provider": "SerpAPI",
            "search_parameters": search_params,
            "serpapi_search_id": search_metadata.get("id"),
            "search_metadata": search_metadata,
            "search_information": search_info,
            # Include any other top-level fields that might be useful
            "inline_shopping": serpapi_response.get("inline_shopping", {}),
            "pagination": serpapi_response.get("serpapi_pagination", {}),
        }


def search_products(
    query: str, max_results: int = 20, location: str = "Singapore"
) -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Convenience function to search products and return results + metadata

    Args:
        query: Search query
        max_results: Maximum results to return
        location: Search location

    Returns:
        Tuple of (product_list, metadata_dict)
    """
    client = SerpAPIClient()
    response = client.search_google_shopping(query, max_results, location)
    products = client.extract_shopping_results(response)
    metadata = client.get_search_metadata(response)

    return products, metadata


# Example usage
if __name__ == "__main__":
    # Test the client
    try:
        products, metadata = search_products("sony wh1000xm6", max_results=5)
        print(f"Found {len(products)} products")
        print(f"Search took {metadata['search_time_ms']}ms")
        if products:
            print(f"\nFirst product:")
            print(f"Title: {products[0].get('title')}")
            print(f"Price: {products[0].get('price')}")
            print(f"Source: {products[0].get('source')}")
            print(f"\nAll fields: {list(products[0].keys())}")
    except Exception as e:
        print(f"Error: {e}")
