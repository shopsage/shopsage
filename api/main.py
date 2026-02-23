"""FastAPI application for hosting the ShopSage orchestrator and research agents"""

import os
import re
import uuid
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from google_shopping_scraper.agent import run_research_agent
from google_shopping_scraper.tools.llm_provider import LLMClient
from orchestrator.agent import run_orchestrator

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="ShopSage - AI Shopping Assistant",
    description="AI-powered agent for product research and supplier comparison",
    version="0.2.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response models ──────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(default_factory=list, description="Conversation history")
    latest_message: str = Field(..., description="The most recent user message")


class ResearchRequest(BaseModel):
    """Request model for product research"""

    query: str = Field(..., description="Natural language query for product research")
    max_results: Optional[int] = Field(
        20, description="Maximum number of search results to fetch", ge=1, le=50
    )
    top_n: Optional[int] = Field(
        5, description="Number of top recommendations to return", ge=1, le=20
    )
    provider: Optional[str] = Field(
        None, description="Override LLM provider (gemini, openai, anthropic)"
    )


class HealthResponse(BaseModel):
    """Health check response"""

    status: str
    version: str
    configured_provider: str


class ProvidersResponse(BaseModel):
    """Available LLM providers response"""

    current_provider: str
    available_providers: list[str]


# ── Transformer helpers ──────────────────────────────────────────────────────

def _slugify(text: str) -> str:
    """Convert text to a URL-friendly slug for use as an id."""
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    return slug[:60]


def _format_review_count(count) -> str:
    """Format a numeric review count to a display string like '1.2k'."""
    if count is None:
        return "0"
    try:
        count = int(count)
    except (ValueError, TypeError):
        return str(count)
    if count >= 1000:
        return f"{count / 1000:.1f}k"
    return str(count)


def transform_supplier_result(agent_result: dict) -> list:
    """
    Transform supplier agent output into frontend MessageContent[] blocks.

    Maps recommendations to Product objects the frontend carousel can render,
    and builds text summary blocks from metadata.
    """
    content_blocks = []
    recommendations = agent_result.get("recommendations", [])
    metadata = agent_result.get("metadata", {})
    price_insights = metadata.get("price_insights", {})
    query_analysis = metadata.get("query_analysis", {})

    # Intro text
    product_name = query_analysis.get("brand", "")
    model_name = query_analysis.get("model", "")
    full_name = f"{product_name} {model_name}".strip() or "your product"
    count = len(recommendations)

    if count > 0:
        intro = f"I found <strong>{count} supplier listings</strong> for the <strong>{full_name}</strong>. Here are the best options:"
    else:
        intro = f"I couldn't find any good listings for <strong>{full_name}</strong>. Try a different product name."
        content_blocks.append({"type": "text", "text": intro})
        return content_blocks

    content_blocks.append({"type": "text", "text": intro})

    # Map recommendations → frontend Product objects
    products = []
    for i, rec in enumerate(recommendations):
        price = rec.get("extracted_price") or rec.get("price")
        product = {
            "id": _slugify(rec.get("title", f"product-{i}")),
            "title": rec.get("title", "Unknown Product"),
            "price": round(float(price), 2) if price else 0,
            "rating": round(float(rec.get("rating", 0)), 1),
            "reviewCount": _format_review_count(rec.get("reviews", 0)),
            "platform": rec.get("seller") or rec.get("source", "Unknown"),
        }
        # Badge for the top-scored item
        if i == 0:
            product["badge"] = "Best Deal"
        products.append(product)

    if products:
        content_blocks.append({"type": "products", "products": products})

    # Analysis text with price insights
    analysis_parts = []
    if price_insights:
        low = price_insights.get("lowest_price")
        high = price_insights.get("highest_price")
        median = price_insights.get("median_price")
        if low and high:
            analysis_parts.append(f"Prices range from <strong>${low:.2f}</strong> to <strong>${high:.2f}</strong>")
        if median:
            analysis_parts.append(f"with a median of <strong>${median:.2f}</strong>")

    # Top recommendation reasoning
    reasoning_list = metadata.get("recommendations_reasoning", [])
    if reasoning_list:
        top = reasoning_list[0]
        why = top.get("why_recommended", "")
        if why:
            analysis_parts.append(f"<br><br>Top pick: {why}.")

    if analysis_parts:
        content_blocks.append({"type": "text", "text": " ".join(analysis_parts)})

    return content_blocks


def _build_evidence_preview_sources(
    evidence_list: list,
    reddit_urls: list,
    google_urls: list,
) -> list:
    """
    Convert LLM evidence items into SourceItem dicts for sourcePreview blocks.

    Each evidence item is expected to have {quote, author, timestamp}.
    URL assignment: Reddit evidence (author contains "u/") → first Reddit URL,
    otherwise → first Google URL, falling back to first Reddit URL.
    """
    sources = []
    for ev in evidence_list[:2]:
        if not isinstance(ev, dict):
            continue
        quote = (ev.get("quote") or "").strip()
        author = (ev.get("author") or "").strip()
        timestamp = (ev.get("timestamp") or "").strip()
        if not quote:
            continue
        is_reddit = "u/" in author
        if is_reddit and reddit_urls:
            url = reddit_urls[0]
        elif not is_reddit and google_urls:
            url = google_urls[0]
        elif reddit_urls:
            url = reddit_urls[0]
        else:
            url = ""
        sources.append({
            "title": "",
            "url": url,
            "snippet": quote,
            "author": author or None,
            "timestamp": timestamp or None,
        })
    return sources


def transform_product_result(agent_result: dict) -> list:
    """
    Transform product research agent output into frontend MessageContent[] blocks.

    Produces: top pick text, honourable mentions, key findings, and source links.
    """
    content_blocks = []
    evaluation = agent_result.get("evaluation")
    print(evaluation)
    print("I am here")

    if not evaluation or not isinstance(evaluation, dict):
        content_blocks.append({
            "type": "text",
            "text": "I wasn't able to find enough information to give you a good recommendation. Could you try rephrasing your question?"
        })
        return content_blocks

    # Block 1: Top Pick
    top_pick = evaluation.get("top_pick")
    top_pick_name = ""
    if top_pick and isinstance(top_pick, dict):
        top_pick_name = top_pick.get("name", "")
        reason = top_pick.get("reason", "")
        intro = f"Based on my research, the top pick is the <strong>{top_pick_name}</strong>."
        if reason:
            intro += f" {reason}"
        content_blocks.append({"type": "text", "text": intro})

    # Block 1b: Source preview cards (shown right after the top pick)
    reddit_sources = agent_result.get("reddit_sources", set())
    google_sources = agent_result.get("google_sources", set())

    preview_sources = []
    for src in list(reddit_sources)[:3]:
        title = str(src[0]) if len(src) > 0 else ""
        url = str(src[1]) if len(src) > 1 else ""
        snippet = str(src[2]) if len(src) > 2 else ""
        if title and url:
            preview_sources.append({"title": title, "url": url, "snippet": snippet})
    if len(preview_sources) < 3:
        for src in list(google_sources)[:3 - len(preview_sources)]:
            title = str(src[0]) if len(src) > 0 else ""
            url = str(src[1]) if len(src) > 1 else ""
            snippet = str(src[2]) if len(src) > 2 else ""
            if title and url:
                preview_sources.append({"title": title, "url": url, "snippet": snippet})
    if preview_sources:
        content_blocks.append({
            "type": "sourcePreview",
            "sources": preview_sources,
            "productName": top_pick_name,
        })

    # Flat URL lists used by evidence helper below
    reddit_url_list = [str(src[1]) for src in reddit_sources if len(src) > 1]
    google_url_list = [str(src[1]) for src in google_sources if len(src) > 1]

    # Block 2: Honourable Mentions — one text + optional evidence cards per mention
    mentions = evaluation.get("honourable_mentions", [])
    if mentions:
        content_blocks.append({"type": "text", "text": "<strong>Honourable Mentions:</strong>"})
        for m in mentions:
            if not isinstance(m, dict):
                continue
            mname = m.get("name", "")
            mreason = m.get("reason", "")
            if not mname:
                continue
            content_blocks.append({"type": "text", "text": f"&bull; <strong>{mname}</strong> &mdash; {mreason}"})
            ev_sources = _build_evidence_preview_sources(
                m.get("evidence", []), reddit_url_list, google_url_list
            )
            if ev_sources:
                content_blocks.append({"type": "sourcePreview", "sources": ev_sources, "productName": mname})

    # Block 3: Key Findings — one text + optional evidence cards per finding
    findings = evaluation.get("key_findings", [])
    if findings:
        content_blocks.append({"type": "text", "text": "<strong>Key Research Findings:</strong>"})
        for f in findings:
            if isinstance(f, dict):
                finding_text = f.get("finding", "")
                evidence = f.get("evidence", [])
            else:
                finding_text = str(f)
                evidence = []
            if not finding_text:
                continue
            content_blocks.append({"type": "text", "text": f"&bull; {finding_text}"})
            ev_sources = _build_evidence_preview_sources(evidence, reddit_url_list, google_url_list)
            if ev_sources:
                content_blocks.append({"type": "sourcePreview", "sources": ev_sources, "productName": None})

    # Block 4: Sources
    source_groups = []
    if reddit_sources:
        reddit_list = [{"title": str(src[0]), "url": str(src[1]), "snippet": str(src[2]) if len(src) > 2 else ""} for src in reddit_sources]
        source_groups.append({"label": "Reddit", "sources": reddit_list})
    if google_sources:
        google_list = [{"title": str(src[0]), "url": str(src[1]), "snippet": str(src[2]) if len(src) > 2 else ""} for src in google_sources]
        source_groups.append({"label": "Google", "sources": google_list})
    if source_groups:
        content_blocks.append({"type": "sources", "sourceGroups": source_groups})

    print(content_blocks)

    # Fallback if no content was generated
    if not content_blocks:
        content_blocks.append({
            "type": "text",
            "text": "I wasn't able to find enough information to give you a good recommendation. Could you try rephrasing your question?"
        })

    return content_blocks


# ── Chat endpoint (main integration point) ───────────────────────────────────

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Main chat endpoint for the frontend.

    Accepts conversation history + latest message, routes through the
    orchestrator, and returns a formatted assistant message.
    """
    try:
        # Convert Pydantic models to plain dicts for the orchestrator
        messages = [{"role": m.role, "content": m.content} for m in request.messages]

        # Run the orchestrator
        state = run_orchestrator(
            messages=messages,
            latest_message=request.latest_message,
        )

        route = state.get("route", "product")
        agent_result = state.get("result")
        errors = state.get("errors", [])

        # Transform agent result into frontend content blocks
        if agent_result:
            if route == "supplier":
                content = transform_supplier_result(agent_result)
            else:
                content = transform_product_result(agent_result)
        else:
            content = [{"type": "text", "text": "Something went wrong processing your request. Please try again."}]
            if errors:
                content.append({"type": "text", "text": f"Error: {errors[-1]}"})

        response = {
            "id": f"assistant-{uuid.uuid4().hex[:8]}",
            "role": "assistant",
            "content": content,
            "route": route,
            "extracted_query": state.get("extracted_query", ""),
        }

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Chat processing failed", "error": str(e)},
        )


# ── Existing endpoints ───────────────────────────────────────────────────────

@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "message": "ShopSage AI Shopping Assistant API",
        "version": "0.2.0",
        "endpoints": {
            "POST /api/chat": "Chat with the orchestrator (main endpoint)",
            "POST /research": "Direct supplier research query",
            "GET /health": "Health check",
            "GET /providers": "List available LLM providers",
        },
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="0.2.0",
        configured_provider=os.getenv("LLM_PROVIDER", "gemini"),
    )


@app.get("/providers", response_model=ProvidersResponse)
async def list_providers():
    """List available LLM providers"""
    return ProvidersResponse(
        current_provider=os.getenv("LLM_PROVIDER", "gemini"),
        available_providers=LLMClient.list_providers(),
    )


@app.post("/research")
async def research_product(request: ResearchRequest):
    """
    Research product suppliers (direct, bypasses orchestrator)
    """
    try:
        if request.provider:
            original_provider = os.getenv("LLM_PROVIDER")
            os.environ["LLM_PROVIDER"] = request.provider

        result = run_research_agent(
            query=request.query,
            max_results=request.max_results,
            top_n=request.top_n,
        )

        if request.provider and original_provider:
            os.environ["LLM_PROVIDER"] = original_provider

        errors = result.get("errors", [])
        if errors and not result.get("recommendations"):
            raise HTTPException(
                status_code=500,
                detail={"message": "Agent execution failed", "errors": errors},
            )

        response = {
            "query": request.query,
            "recommendations": result.get("recommendations", []),
            "alternative_options": result.get("alternative_options", []),
            "rejected_products": result.get("rejected_products", []),
            "metadata": result.get("metadata", {}),
            "errors": errors,
            "warnings": result.get("warnings", []),
        }

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Internal server error", "error": str(e)},
        )


@app.post("/research/summary")
async def research_product_summary(request: ResearchRequest):
    """
    Research product suppliers (summary only)
    """
    try:
        result = run_research_agent(
            query=request.query,
            max_results=request.max_results,
            top_n=request.top_n,
        )

        metadata = result.get("metadata", {})
        response = {
            "query": request.query,
            "recommendations": result.get("recommendations", []),
            "summary": {
                "total_found": metadata.get("search_summary", {}).get("total_results", 0),
                "filtered_count": metadata.get("filtering_summary", {}).get("kept", 0),
                "price_range": {
                    "min": metadata.get("price_insights", {}).get("lowest_price"),
                    "max": metadata.get("price_insights", {}).get("highest_price"),
                    "median": metadata.get("price_insights", {}).get("median_price"),
                },
                "processing_time_ms": metadata.get("processing_stats", {}).get(
                    "total_time_ms", 0
                ),
            },
            "warnings": result.get("warnings", []),
        }

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Internal server error", "error": str(e)},
        )


# Run server
if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    print(f"Starting ShopSage API server on {host}:{port}")
    print(f"LLM Provider: {os.getenv('LLM_PROVIDER', 'gemini')}")
    print(f"Docs available at http://{host}:{port}/docs")

    uvicorn.run(app, host=host, port=port)
