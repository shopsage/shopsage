"""FastAPI application for hosting the supplier research agent"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from google_shopping_scraper.agent import run_research_agent
from google_shopping_scraper.tools.llm_provider import LLMClient

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="ShopSage - Supplier Research Agent",
    description="AI-powered agent for researching and evaluating product suppliers",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
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


# Endpoints
@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "message": "ShopSage Supplier Research Agent API",
        "version": "0.1.0",
        "endpoints": {
            "POST /research": "Submit a product research query",
            "GET /health": "Health check",
            "GET /providers": "List available LLM providers",
        },
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="0.1.0",
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
    Research product suppliers

    Processes the query through the LangGraph agent pipeline:
    1. Query processing (extract brand, model, etc.)
    2. Search (fetch from SerpAPI)
    3. Filter (remove irrelevant listings)
    4. Evaluate (score and rank)
    5. Format (prepare response)

    Returns comprehensive results with recommendations and metadata.
    """
    try:
        # Override LLM provider if specified
        if request.provider:
            original_provider = os.getenv("LLM_PROVIDER")
            os.environ["LLM_PROVIDER"] = request.provider

        # Run the agent
        result = run_research_agent(
            query=request.query,
            max_results=request.max_results,
            top_n=request.top_n,
        )

        # Restore original provider
        if request.provider and original_provider:
            os.environ["LLM_PROVIDER"] = original_provider

        # Check for errors
        errors = result.get("errors", [])
        if errors and not result.get("recommendations"):
            raise HTTPException(
                status_code=500,
                detail={"message": "Agent execution failed", "errors": errors},
            )

        # Format response
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

    Same as /research but returns only recommendations and key metadata,
    excluding rejected products and detailed filter data.
    Useful for UI that doesn't need complete data.
    """
    try:
        # Run full research
        result = run_research_agent(
            query=request.query,
            max_results=request.max_results,
            top_n=request.top_n,
        )

        # Return summary only
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
