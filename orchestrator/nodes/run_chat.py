"""Chat node - handles conversational follow-ups using existing context"""

from typing import Dict, Any
from google_shopping_scraper.tools.llm_provider import get_llm_client

CHAT_SYSTEM_PROMPT = """You are ShopSage, a helpful and knowledgeable shopping assistant. The user is having a conversation about products and shopping. Use the conversation history to answer their follow-up questions.

Rules:
- Answer based on the products and information already discussed in the conversation.
- Be specific — reference product names, prices, and details from the conversation.
- If the user asks about something not covered in the conversation history, say so honestly and suggest they search for it.
- Stay on topic (shopping, products, buying decisions). If the user goes off-topic, gently redirect.
- Use HTML formatting for readability: <strong> for product names, <br> for line breaks.
- Keep responses concise but thorough."""


def run_chat(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle conversational follow-ups with a simple LLM call.
    No agent, no scraping — just the model + conversation history.
    """
    messages = state.get("messages", [])
    latest_message = state.get("latest_message", "")

    context_parts = []
    if messages:
        context_parts.append("=== CONVERSATION HISTORY ===")
        for msg in messages:
            role = msg.get("role", "user").upper()
            content = msg.get("content", "")
            context_parts.append(f"{role}: {content}")
        context_parts.append("=== END CONVERSATION HISTORY ===\n")
    context_parts.append(f"USER: {latest_message}")
    prompt = "\n".join(context_parts)

    try:
        llm_client = get_llm_client(temperature=0.7)
        response = llm_client.get_completion(
            prompt=prompt,
            system_prompt=CHAT_SYSTEM_PROMPT,
        )
        return {"result": {"chat_response": response.strip()}}
    except Exception as e:
        return {
            "result": None,
            "errors": state.get("errors", []) + [f"Chat failed: {str(e)}"],
        }
