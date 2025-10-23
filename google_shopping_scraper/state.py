"""State definition for the LangGraph agent"""

from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict
from google_shopping_scraper.models.schemas import ProductListing


class AgentState(TypedDict):
    """
    State that flows through the LangGraph.

    Each node reads from and writes to this state, enriching it with additional data.
    All data is preserved - nodes add but never remove information.
    """

    # === Input ===
    user_query: str
    timestamp: Optional[str]
    max_results: int
    top_n: int

    # === Query Processing ===
    processed_query: Optional[Dict[str, Any]]  # ProcessedQuery as dict
    query_reasoning: Optional[str]

    # === Search Results ===
    raw_search_results: List[Dict[str, Any]]  # All SerpAPI data preserved
    search_metadata: Optional[Dict[str, Any]]

    # === Filtering ===
    filtered_products: List[Dict[str, Any]]  # Products that passed filter
    rejected_products: List[Dict[str, Any]]  # Products that failed filter (with reasons)
    filter_statistics: Optional[Dict[str, Any]]

    # === Evaluation ===
    evaluated_products: List[Dict[str, Any]]  # All filtered products with scores
    price_analysis: Optional[Dict[str, Any]]

    # === Final Output ===
    recommendations: List[Dict[str, Any]]  # Top N ranked products
    alternative_options: List[Dict[str, Any]]  # Other good options

    # === Rich Metadata ===
    metadata: Dict[str, Any]

    # === Control & Error Handling ===
    errors: List[str]
    warnings: List[str]
    current_step: str
    processing_times: Dict[str, float]  # Track time for each step


def create_initial_state(
    user_query: str, max_results: int = 20, top_n: int = 5
) -> AgentState:
    """Create initial state for the agent"""
    from datetime import datetime

    return AgentState(
        # Input
        user_query=user_query,
        timestamp=datetime.now().isoformat(),
        max_results=max_results,
        top_n=top_n,
        # Query Processing
        processed_query=None,
        query_reasoning=None,
        # Search Results
        raw_search_results=[],
        search_metadata=None,
        # Filtering
        filtered_products=[],
        rejected_products=[],
        filter_statistics=None,
        # Evaluation
        evaluated_products=[],
        price_analysis=None,
        # Final Output
        recommendations=[],
        alternative_options=[],
        # Metadata
        metadata={},
        # Control
        errors=[],
        warnings=[],
        current_step="initialized",
        processing_times={},
    )
