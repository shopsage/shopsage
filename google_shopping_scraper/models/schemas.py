"""Pydantic models and schemas for the supplier research agent"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ProductListing(BaseModel):
    """Complete product listing with SerpAPI data and agent enrichments"""

    # === Original SerpAPI Data (preserved exactly as received) ===
    position: Optional[int] = None
    title: str
    link: Optional[str] = None
    product_link: Optional[str] = None
    product_id: Optional[str] = None
    serpapi_product_api: Optional[str] = None
    source: str
    price: Optional[str] = None
    extracted_price: Optional[float] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    reviews_original: Optional[str] = None
    thumbnail: Optional[str] = None
    delivery: Optional[str] = None
    tag: Optional[str] = None  # "Sale", "Top rated", etc.
    extensions: Optional[List[str]] = Field(default_factory=list)
    second_hand_condition: Optional[str] = None

    # Additional SerpAPI fields that may be present
    seller: Optional[str] = None
    seller_link: Optional[str] = None
    shipping: Optional[str] = None
    in_stock: Optional[bool] = None
    currency: Optional[str] = None

    # Store original raw data for any fields we might have missed
    raw_data: Optional[Dict[str, Any]] = Field(default_factory=dict)

    # === Agent Enrichments ===

    # Filtering metadata
    filter_passed: bool = True
    filter_confidence: float = 1.0
    filter_reasons: List[str] = Field(default_factory=list)
    brand_match_score: Optional[float] = None
    model_match_score: Optional[float] = None
    is_bundle: bool = False
    is_price_outlier: bool = False
    price_z_score: Optional[float] = None

    # Evaluation metadata
    overall_score: Optional[float] = None
    price_score: Optional[float] = None
    rating_score: Optional[float] = None
    reputation_score: Optional[float] = None
    review_count_score: Optional[float] = None
    rank: Optional[int] = None

    # Store reputation data
    store_info: Optional[Dict[str, Any]] = Field(default_factory=dict)

    # Price analysis
    price_percentile: Optional[float] = None
    price_vs_median: Optional[float] = None
    is_competitive: Optional[bool] = None

    class Config:
        extra = "allow"  # Allow additional fields from SerpAPI


class ProcessedQuery(BaseModel):
    """Structured query after LLM processing"""
    original_query: str
    brand: Optional[str] = None
    model: Optional[str] = None
    product_type: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    intent: Optional[str] = None
    confidence: float = 0.0
    reasoning: Optional[str] = None


class SearchMetadata(BaseModel):
    """Metadata about the search operation"""
    total_results: int = 0
    search_time_ms: Optional[float] = None
    api_provider: str = "SerpAPI"
    search_parameters: Dict[str, Any] = Field(default_factory=dict)
    serpapi_search_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)


class FilterStatistics(BaseModel):
    """Statistics about filtering operations"""
    total: int = 0
    kept: int = 0
    removed: int = 0
    reasons_breakdown: Dict[str, int] = Field(default_factory=dict)
    filter_settings: Dict[str, Any] = Field(default_factory=dict)


class PriceAnalysis(BaseModel):
    """Price distribution and analysis"""
    lowest_price: Optional[float] = None
    highest_price: Optional[float] = None
    median_price: Optional[float] = None
    average_price: Optional[float] = None
    price_range: Optional[float] = None
    std_deviation: Optional[float] = None
    recommended_price_range: Optional[List[float]] = None
    price_distribution: Optional[Dict[str, int]] = Field(default_factory=dict)


class RecommendationReasoning(BaseModel):
    """Reasoning for a specific recommendation"""
    rank: int
    product_title: str
    why_recommended: str
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    confidence: float = 0.0


class EvaluationSummary(BaseModel):
    """Summary of evaluation process"""
    scoring_weights: Dict[str, float] = Field(default_factory=dict)
    top_score: Optional[float] = None
    average_score: Optional[float] = None
    score_distribution: Optional[Dict[str, int]] = Field(default_factory=dict)


class ProcessingStats(BaseModel):
    """Performance metrics for the agent"""
    total_time_ms: Optional[float] = None
    query_processing_ms: Optional[float] = None
    search_ms: Optional[float] = None
    filtering_ms: Optional[float] = None
    evaluation_ms: Optional[float] = None
    formatting_ms: Optional[float] = None


class AgentMetadata(BaseModel):
    """Rich metadata for the entire agent execution"""
    query_analysis: Optional[ProcessedQuery] = None
    search_summary: Optional[SearchMetadata] = None
    filtering_summary: Optional[FilterStatistics] = None
    price_insights: Optional[PriceAnalysis] = None
    evaluation_summary: Optional[EvaluationSummary] = None
    recommendations_reasoning: List[RecommendationReasoning] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    processing_stats: Optional[ProcessingStats] = None


class AgentResponse(BaseModel):
    """Complete response from the agent"""
    recommendations: List[ProductListing] = Field(default_factory=list)
    alternative_options: List[ProductListing] = Field(default_factory=list)
    rejected_products: List[ProductListing] = Field(default_factory=list)
    metadata: AgentMetadata = Field(default_factory=AgentMetadata)
    errors: List[str] = Field(default_factory=list)


class ResearchRequest(BaseModel):
    """Request model for the research API endpoint"""
    query: str = Field(..., description="Natural language query for product research")
    max_results: Optional[int] = Field(20, description="Maximum number of search results to fetch")
    top_n: Optional[int] = Field(5, description="Number of top recommendations to return")
    provider: Optional[str] = Field(None, description="Override LLM provider (gemini, openai, anthropic)")
