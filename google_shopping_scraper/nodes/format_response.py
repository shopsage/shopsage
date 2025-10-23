"""Format response node - prepares final output with recommendations"""

import time
from typing import Dict, Any, List
from google_shopping_scraper.state import AgentState


def format_response(state: AgentState) -> Dict[str, Any]:
    """
    Format final response with recommendations and rich metadata

    Selects top N recommendations and prepares alternative options.
    Generates reasoning for each recommendation.
    Compiles comprehensive metadata for the response.

    Args:
        state: Current agent state

    Returns:
        Updated state with recommendations, alternative_options, and complete metadata
    """
    start_time = time.time()

    evaluated_products = state.get("evaluated_products", [])
    top_n = state.get("top_n", 5)
    processed_query = state.get("processed_query", {})
    filter_statistics = state.get("filter_statistics", {})
    price_analysis = state.get("price_analysis", {})

    # Split into recommendations and alternatives
    recommendations = evaluated_products[:top_n] if evaluated_products else []
    alternative_options = evaluated_products[top_n:] if len(evaluated_products) > top_n else []

    # Generate reasoning for each recommendation
    recommendations_reasoning = []
    for product in recommendations:
        reasoning = _generate_recommendation_reasoning(product, price_analysis)
        recommendations_reasoning.append(reasoning)

    # Compile complete metadata
    processing_times = state.get("processing_times", {})
    total_time = sum(processing_times.values())

    metadata = {
        "query_analysis": processed_query,
        "search_summary": state.get("search_metadata", {}),
        "filtering_summary": filter_statistics,
        "price_insights": price_analysis,
        "evaluation_summary": state.get("metadata", {}).get("evaluation_summary", {}),
        "recommendations_reasoning": recommendations_reasoning,
        "warnings": state.get("warnings", []),
        "processing_stats": {
            **processing_times,
            "total_time_ms": round(total_time, 2),
            "formatting_ms": 0,  # Will be updated below
        },
    }

    # Calculate processing time
    processing_time = (time.time() - start_time) * 1000
    metadata["processing_stats"]["formatting_ms"] = round(processing_time, 2)
    metadata["processing_stats"]["total_time_ms"] = round(
        total_time + processing_time, 2
    )

    return {
        "recommendations": recommendations,
        "alternative_options": alternative_options,
        "metadata": metadata,
        "current_step": "completed",
        "processing_times": {
            **processing_times,
            "formatting_ms": processing_time,
        },
    }


def _generate_recommendation_reasoning(
    product: Dict[str, Any], price_analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate reasoning for why a product is recommended

    Args:
        product: Product dictionary with scores
        price_analysis: Price analysis data

    Returns:
        Dictionary with recommendation reasoning
    """
    rank = product.get("rank", 0)
    title = product.get("title", "Unknown Product")
    price = product.get("extracted_price")
    rating = product.get("rating")
    reviews = product.get("reviews")
    source = product.get("source", "Unknown")
    overall_score = product.get("overall_score", 0)

    # Build why_recommended message
    why_parts = []

    # Price reasoning
    if price and price_analysis.get("median_price"):
        median = price_analysis["median_price"]
        if price < median * 0.95:
            why_parts.append(f"competitive price (${price:.2f})")
        elif price > median * 1.05:
            why_parts.append(f"premium price (${price:.2f})")
        else:
            why_parts.append(f"fair price (${price:.2f})")

    # Rating reasoning
    if rating and rating >= 4.5:
        why_parts.append(f"excellent rating ({rating}/5)")
    elif rating and rating >= 4.0:
        why_parts.append(f"good rating ({rating}/5)")

    # Reviews reasoning
    if reviews and reviews >= 1000:
        why_parts.append(f"many reviews ({reviews:,})")
    elif reviews and reviews >= 100:
        why_parts.append(f"sufficient reviews ({reviews:,})")

    # Store reasoning
    store_info = product.get("store_info", {})
    if store_info.get("reputation_tier") == "A+":
        why_parts.append("premium retailer")
    elif store_info.get("reputation_tier") == "A":
        why_parts.append("trusted retailer")

    why_recommended = (
        "Best combination of " + " and ".join(why_parts) if why_parts else "Ranked by overall score"
    )

    # Build pros list
    pros = []

    if product.get("is_competitive"):
        pros.append("Competitive price")

    if rating and rating >= 4.5:
        pros.append(f"High rating ({rating}/5)")

    if reviews and reviews >= 100:
        pros.append(f"{reviews:,} reviews")

    if store_info.get("is_known"):
        pros.append(f"Trusted seller ({source})")

    extensions = product.get("extensions", [])
    for ext in extensions:
        if "free shipping" in ext.lower():
            pros.append("Free shipping")
            break

    if "in stock" in [ext.lower() for ext in extensions]:
        pros.append("In stock")

    # Build cons list
    cons = []

    if price and price_analysis.get("median_price"):
        median = price_analysis["median_price"]
        if price > median * 1.15:
            cons.append(f"Above average price (${price:.2f} vs median ${median:.2f})")

    if rating and rating < 4.0:
        cons.append(f"Lower rating ({rating}/5)")

    if reviews and reviews < 50:
        cons.append(f"Limited reviews ({reviews})")

    if not store_info.get("is_known"):
        cons.append("Less known retailer")

    delivery = product.get("delivery", "")
    if delivery and any(word in delivery.lower() for word in ["5-7 days", "7-10 days", "weeks"]):
        cons.append(f"Longer shipping: {delivery}")

    if not cons:
        cons.append("None identified")

    # Calculate confidence based on overall score and data completeness
    confidence = overall_score / 10  # Base on score

    # Adjust for data completeness
    if price and rating and reviews and reviews > 50:
        confidence = min(confidence + 0.1, 1.0)

    return {
        "rank": rank,
        "product_title": title[:100] + "..." if len(title) > 100 else title,
        "why_recommended": why_recommended,
        "pros": pros[:5],  # Limit to top 5
        "cons": cons[:3],  # Limit to top 3
        "confidence": round(confidence, 2),
    }
