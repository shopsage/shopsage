import json
import time
from typing import Dict, Any
from product_research_scraper.state import AgentState
from product_research_scraper.tools.llm_provider import get_llm_client

def evaluate_user_query(state: AgentState) -> Dict[str, Any]:
    start_time = time.time()

    user_query = state["user_query"]
    reddit_dump = state["reddit_dump"]
    google_dump = state["google_dump"]

    system_prompt = """You are an expert evaluator, able to answer the user's question based on the provided context.
Your task is to analyze the user query and answer it based on the provided context, explaining your decision making process and reasoning.

Your answer should be a JSON object with this following information:
- evaluation: Your evaluation of the users query based on the context that is provided to you as well as your reasoning.
- confidence: Your confidence in the extraction (0-1)

Return your response as a JSON object with these exact keys.
    """

    user_prompt = f"User Question: {user_query}\nReddit context: {reddit_dump}\nGoogle context{google_dump}"

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

            processed_evaluation = json.loads(response_clean)

            required_fields = [
                "evaluation",
                "confidence"
            ]
            for field in required_fields:
                if field not in processed_evaluation:
                    processed_evaluation[field] = None
            error = None

        except json.JSONDecodeError as e:
            processed_evaluation = {
                "evaluation": "I am unable to give you appropriate data based off your request, please try again with a new query.",
                "confidence": 0.0
            }
            error = f"Failed to parse LLM response as JSON: {str(e)}"

        processing_time = (time.time() - start_time) * 1000

        return {
            "evaluation": processed_evaluation,
            "errors": state.get("errors", []) + [error] if error else state.get("errors", []),
            "current_step": "evaluation_generated",
            "processing_times": {
                **state.get("processing_times", {}),
                "evaluation_processing_ms": processing_time,
            },
        }

    except Exception as e:
        processing_time = (time.time() - start_time) * 1000

        error_msg = f"Evaluation failed: {str(e)}"

        fallback_evaluation = {"evaluation": "I am unable to give you appropriate data based off your request, please try again with a new query", "confidence": 0.0}

        return {
            "evaluation": fallback_evaluation,
            "errors": state.get("errors", []) + [error_msg],
            "current_step": "evaluation_generation_failed",
            "processing_times": {
                **state.get("processing_times", {}),
                "evaluation_processing_ms": processing_time,
            },
        } 