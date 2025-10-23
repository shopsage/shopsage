"""Evaluation node - scores and ranks products"""

import time
from typing import Dict, Any, List
from google_shopping_scraper.state import AgentState
from google_shopping_scraper.utils.scoring import (
    ProductScorer,
    calculate_price_analysis,
    calculate_price_percentile,
    calculate_price_vs_median,
)


def evaluate_products(state: AgentState) -> Dict[str, Any]:
    """
    Evaluate and score all filtered products

    Adds scoring metadata to each product:
    - Individual component scores (price, rating, reputation, review_count)
    - Composite overall score
    - Store information
    - Price analysis (percentile, vs median, competitiveness)

    Args:
        state: Current agent state

    Returns:
        Updated state with evaluated_products and price_analysis
    """
    start_time = time.time()

    filtered_products = state.get("filtered_products", [])

    if not filtered_products:
        # No products to evaluate
        processing_time = (time.time() - start_time) * 1000
        return {
            "evaluated_products": [],
            "price_analysis": {},
            "warnings": state.get("warnings", [])
            + ["No products available for evaluation"],
            "current_step": "evaluation_completed",
            "processing_times": {
                **state.get("processing_times", {}),
                "evaluation_ms": processing_time,
            },
        }

    # Initialize scorer with default weights
    scorer = ProductScorer(
        price_weight=0.40,
        rating_weight=0.30,
        reputation_weight=0.20,
        review_count_weight=0.10,
    )

    # Extract all prices and review counts for normalization
    all_prices = [
        p.get("extracted_price")
        for p in filtered_products
        if p.get("extracted_price") is not None and p.get("extracted_price") > 0
    ]

    all_review_counts = [
        p.get("reviews")
        for p in filtered_products
        if p.get("reviews") is not None and p.get("reviews") > 0
    ]

    # Calculate price analysis
    price_analysis = calculate_price_analysis(filtered_products)

    # Evaluate each product
    evaluated = []
    for product in filtered_products:
        enriched_product = dict(product)

        # Score individual components
        price = enriched_product.get("extracted_price")
        rating = enriched_product.get("rating")
        source = enriched_product.get("source", "")
        review_count = enriched_product.get("reviews")

        # Calculate scores
        if price and price > 0:
            price_score = scorer.score_price(price, all_prices)
        else:
            price_score = 0.0
        rating_score = 0.0
        # rating_score = scorer.score_rating(rating)
        reputation_score = scorer.score_reputation(source)
        
        review_count_score = 0.0
        # if review_count and review_count > 0:
        #     review_count_score = scorer.score_review_count(review_count, all_review_counts)

        # Calculate composite score
        overall_score = scorer.calculate_composite_score(
            price_score, rating_score, reputation_score, review_count_score
        )

        # Add scores to product
        enriched_product["price_score"] = round(price_score, 2)
        enriched_product["rating_score"] = round(rating_score, 2)
        enriched_product["reputation_score"] = round(reputation_score, 2)
        enriched_product["review_count_score"] = round(review_count_score, 2)
        enriched_product["overall_score"] = overall_score

        # Add store info
        enriched_product["store_info"] = scorer.get_store_info(source)

        # Add price analysis
        if price and price > 0 and price_analysis.get("median_price"):
            enriched_product["price_percentile"] = calculate_price_percentile(
                price, all_prices
            )
            enriched_product["price_vs_median"] = calculate_price_vs_median(
                price, price_analysis["median_price"]
            )

            # Determine if price is competitive (within recommended range)
            rec_range = price_analysis.get("recommended_price_range", [])
            if rec_range and len(rec_range) == 2:
                enriched_product["is_competitive"] = rec_range[0] <= price <= rec_range[1]
            else:
                enriched_product["is_competitive"] = None
        else:
            enriched_product["price_percentile"] = None
            enriched_product["price_vs_median"] = None
            enriched_product["is_competitive"] = None

        evaluated.append(enriched_product)

    # Sort by overall score (descending)
    evaluated.sort(key=lambda x: x.get("overall_score", 0), reverse=True)

    # Add rank
    for i, product in enumerate(evaluated):
        product["rank"] = i + 1

    # Calculate evaluation summary
    scores = [p.get("overall_score", 0) for p in evaluated]
    evaluation_summary = {
        "scoring_weights": scorer.weights,
        "top_score": max(scores) if scores else None,
        "average_score": round(sum(scores) / len(scores), 2) if scores else None,
        "total_products_evaluated": len(evaluated),
    }

    # Calculate processing time
    processing_time = (time.time() - start_time) * 1000

    return {
        "evaluated_products": evaluated,
        "price_analysis": price_analysis,
        "metadata": {
            **state.get("metadata", {}),
            "evaluation_summary": evaluation_summary,
            "price_insights": price_analysis,
        },
        "current_step": "evaluation_completed",
        "processing_times": {
            **state.get("processing_times", {}),
            "evaluation_ms": processing_time,
        },
    }
