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

    system_prompt = """You are an expert product research evaluator. Analyze the user's question and the provided research context to give a clear, structured recommendation.

Your answer MUST be a JSON object with these exact keys:

- top_pick: An object with:
  - name: The product name (string)
  - reason: A concise 1-2 sentence explanation of why this is the top pick (string)
  - evidence: An array of 1-2 objects, each a verbatim quote from the context supporting this pick:
    - quote: Exact word-for-word text from the research context (string)
    - author: The Reddit username exactly as it appears, e.g. "u/username" — or null if from a web source (string or null)
    - timestamp: The date string exactly as it appears in the context, e.g. "2024-01-15" — or null (string or null)

- honourable_mentions: An array of 2-3 objects, each with:
  - name: The product name (string)
  - reason: A concise 1 sentence explanation (string)
  - evidence: An array of 1-2 objects with the same {quote, author, timestamp} shape as above

- key_findings: An array of 3-5 objects, each with:
  - finding: A short bullet point string summarizing one important research finding (string)
  - evidence: An array of 1-2 objects with the same {quote, author, timestamp} shape as above

- confidence: Your confidence in the recommendation (0-1 float)

Rules for evidence:
- Quotes must be copied verbatim from the provided context — do not paraphrase
- Author and timestamp must be taken exactly from the "[Author: u/xxx | Date: YYYY-MM-DD]" lines in the context
- If a finding or mention has no supporting quote in the context, set evidence to []

If you cannot identify a clear top pick or there is not enough context, set top_pick to null and provide your best findings in key_findings.

Return ONLY valid JSON. No markdown, no explanation outside the JSON."""

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
                "top_pick",
                "honourable_mentions",
                "key_findings",
                "confidence"
            ]
            for field in required_fields:
                if field not in processed_evaluation:
                    processed_evaluation[field] = None
            error = None

        except json.JSONDecodeError as e:
            processed_evaluation = {
                "top_pick": None,
                "honourable_mentions": [],
                "key_findings": [{"finding": "Unable to provide recommendation based on available data.", "evidence": []}],
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

        fallback_evaluation = {
            "top_pick": None,
            "honourable_mentions": [],
            "key_findings": [{"finding": "Unable to provide recommendation based on available data.", "evidence": []}],
            "confidence": 0.0
        }

        return {
            "evaluation": fallback_evaluation,
            "errors": state.get("errors", []) + [error_msg],
            "current_step": "evaluation_generation_failed",
            "processing_times": {
                **state.get("processing_times", {}),
                "evaluation_processing_ms": processing_time,
            },
        } 