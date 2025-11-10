import json
import time
from typing import Dict, Any
from product_research_scraper.state import AgentState, create_initial_state
from product_research_scraper.tools.llm_provider import get_llm_client

def process_reddit_query(state: AgentState) -> Dict[str, Any]:
    start_time = time.time()

    user_query = state["user_query"]

    system_prompt = """You are an expert redditor, able to create well optimised query searches given a topic.

Your task is to analyze a user's request and extract the important information into a single string. Your query should end with 'self:yes', so that only posts with an existing text body will be returned.

If you really cannot extract certain aspects of the user's request, you can either choose to ignore it or make it more generic. Ensure that your gennerated query does not have too much information because this will affect the search result. Summarise your query as best as you can, and you are allowed to skip over the more minor keywords.
Your answer should be a JSON object with this following information:
- query: The reddit search optimised query, ready to be passed straight into praw for scraping the reddit website, and the google serach optimised query.
- confidence: Your confidence in the extraction (0-1)

Return your response as a JSON object with these exact keys.
If you cannot determine a field, use null for that field.

Examples:

Query: "I need headphones with good ANC that are under $300"
Response: {
    "reddit_query": "headphones under $300 with good ANC self:yes",
    "google_query": "headphones under $300 with goood ANC",
    "confidence": 0.9
}

Query: "What's the best all-around laptop for a college student? Needs to have good battery life and be pretty lightweight for carrying around campus. Budget is flexible but not extreme."
Response: {
    "reddit_query": "best laptop college student lightweight good battery life self:yes",
    "google_query": "best laptop college student lightweight good battery life",
    "confidence": 0.7
}

Query: "I want to buy my first espresso machine for under $500. I'm stuck between the Breville Bambino and the Gaggia Classic Pro. Which one is better for a beginner?"
Response: {
    "reddit_query": "Breville Bambino vs Gaggia Classic Pro beginner espresso machine under $500 self:yes",
    "google_query": "Breville Bambino vs Gaggia Classic Pro beginner espresso machine under $500"
    "confidence": 0.6
}

Query: "I'm looking for a new pair of trail running shoes for rocky terrain. There are too many options... how do brands like Hoka compare to Salomon or Altra for durability?"
Response: {
    "reddit_query": "trail running shoes Hoka vs Salomon vs Altra self:yes",
    "google_query": "trail running shoes Hoka vs Salomon vs Altra"
    "confidence": 0.2
}
"""

    user_prompt = f"User query: {user_query}"

    try:
        llm_client = get_llm_client(temperature=0.0)
        response = llm_client.get_completion(user_prompt, system_prompt)

        try:
            response_clean = response.strip()
            if response_clean.startswith("```"):
                lines = response_clean.split("\n")
                response_clean = "\n".join(
                    line for line in lines if not line.startswith("```")
                )

            processed_query = json.loads(response_clean)

            required_fields = [
                "reddit_query",
                "google_query",
                "confidence"
            ]
            for field in required_fields:
                if field not in processed_query:
                    processed_query[field] = None
            error = None
        
        except json.JSONDecodeError as e:
            processed_query = {
                "reddit_query": user_query,
                "google_query": user_query,
                "confidence": 0.0
            }
            error = f"Failed to parse LLM response as JSON: {str(e)}"

        processing_time = (time.time() - start_time) * 1000

        return {
            "query": processed_query,
            "errors": state.get("errors", []) + [error] if error else state.get("errors", []),
            "current_step": "query_processed",
            "processing_times": {
                **state.get("processing_times", {}),
                "query_processing_ms": processing_time,
            },
        }

    except Exception as e:
        processing_time = (time.time() - start_time) * 1000

        error_msg = f"Query processing failed: {str(e)}"

        fallback_query = {"reddit_query": user_query, "google_query": user_query, "confidence": 0.0}

        return {
            "query": fallback_query,
            "errors": state.get("errors", []) + [error_msg],
            "current_step": "query_processed_failed",
            "processing_times": {
                **state.get("processing_times", {}),
                "query_processing_ms": processing_time,
            },
        }
    
if __name__ == "__main__":
    # testing node with mocked user query
    print(process_reddit_query(create_initial_state("What are good wired headphones I can buy for gaming?")))