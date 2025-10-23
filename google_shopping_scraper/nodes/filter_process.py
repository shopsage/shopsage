"""Filter and process node - filters products by model, bundles, and price outliers"""

import time
import os
from typing import Dict, Any, List
import numpy as np
from google_shopping_scraper.state import AgentState
from google_shopping_scraper.tools.filters import ProductFilter, remove_duplicates
from dotenv import load_dotenv

load_dotenv()


def filter_and_process(state: AgentState) -> Dict[str, Any]:
    """
    Filter products based on model, bundles, and price outliers

    Note: Brand filtering is disabled - model number is sufficient for product identification

    Enriches each product with:
    - Filter pass/fail status
    - Confidence scores
    - Match scores (brand score kept for metadata only)
    - Filter reasons
    - Outlier detection results

    Args:
        state: Current agent state

    Returns:
        Updated state with filtered_products, rejected_products, and filter_statistics
    """
    start_time = time.time()

    raw_results = state.get("raw_search_results", [])
    processed_query = state.get("processed_query", {})

    # Get filter thresholds from environment
    brand_threshold = float(os.getenv("FILTER_BRAND_THRESHOLD", "0.7"))
    mad_threshold = float(os.getenv("PRICE_OUTLIER_MAD_THRESHOLD", "0.9"))
    too_good_threshold = float(os.getenv("PRICE_TOO_GOOD_THRESHOLD", "0.25"))  # 25% below median by default

    # Initialize filter
    product_filter = ProductFilter(
        brand_threshold=brand_threshold,
        model_threshold=brand_threshold,  # Use same threshold for model
        price_outlier_std=3.0,  # Keep for backwards compatibility
    )

    # Extract target brand and model
    target_brand = processed_query.get("brand")
    target_model = processed_query.get("model")

    # Remove duplicates
    unique_products = remove_duplicates(raw_results)

    rejected = []
    rejection_reasons = {}

    # STEP 1: Filter out bundles and $0 prices
    step1_products = []
    for product in unique_products:
        enriched_product = dict(product)
        filter_reasons = []

        # Check for bundle/combo listings
        is_bundle, bundle_reasons = product_filter.check_bundle_listing(
            product.get("title", "")
        )
        enriched_product["is_bundle"] = is_bundle

        # Check for $0 prices
        price = product.get("extracted_price")
        is_zero_price = (price is None or price <= 0)

        if is_bundle:
            filter_reasons.extend(bundle_reasons)
            enriched_product["filter_passed"] = False
            enriched_product["filter_reasons"] = filter_reasons
            _add_rejection_reason(rejection_reasons, "bundle_listing")
            rejected.append(enriched_product)
        elif is_zero_price:
            filter_reasons.append(f"Invalid price: ${price if price else 0:.2f}")
            enriched_product["filter_passed"] = False
            enriched_product["filter_reasons"] = filter_reasons
            _add_rejection_reason(rejection_reasons, "invalid_price")
            rejected.append(enriched_product)
        else:
            step1_products.append(enriched_product)

    # STEP 2: Filter by model only (brand check disabled - model number is sufficient)
    step2_products = []
    for product in step1_products:
        filter_reasons = []
        passed = True

        # Store brand match score for metadata (but don't reject based on it)
        if target_brand:
            brand_matches, brand_score, brand_reasons = product_filter.check_brand_match(
                product.get("title", ""), target_brand
            )
            product["brand_match_score"] = brand_score
            # Note: Not rejecting based on brand - some sellers omit brand name
        else:
            product["brand_match_score"] = None

        # Check model match (this is the main filter)
        if target_model:
            model_matches, model_score, model_reasons = product_filter.check_model_match(
                product.get("title", ""), target_model
            )
            product["model_match_score"] = model_score
            filter_reasons.extend(model_reasons)

            if not model_matches:
                passed = False
                _add_rejection_reason(rejection_reasons, "model_mismatch")
        else:
            product["model_match_score"] = None
            # If no model specified, accept all (after bundle/$0 filtering)

        product["filter_reasons"] = filter_reasons if filter_reasons else ["Passed model check"]

        if passed:
            step2_products.append(product)
        else:
            product["filter_passed"] = False
            rejected.append(product)

    # STEP 3: Detect price outliers ONLY on relevant products (right model)
    # Using MAD method + "too good to be true" check (>25% below median)
    outlier_results = product_filter.detect_price_outliers_by_iqr(
        step2_products, mad_threshold=mad_threshold, too_good_threshold=too_good_threshold
    )

    # STEP 4: Apply outlier filter and calculate final metrics
    filtered = []
    for i, product in enumerate(step2_products):
        filter_reasons = product.get("filter_reasons", [])

        # Check price outliers
        is_outlier, distance, outlier_reasons = outlier_results.get(
            i, (False, 0.0, [])
        )
        product["is_price_outlier"] = is_outlier
        product["price_outlier_distance"] = distance

        if is_outlier:
            filter_reasons.extend(outlier_reasons)
            product["filter_passed"] = False
            product["filter_reasons"] = filter_reasons
            _add_rejection_reason(rejection_reasons, "price_outlier")
            rejected.append(product)
        else:
            # Calculate confidence for accepted products
            brand_score = product.get("brand_match_score") or 1.0
            model_score = product.get("model_match_score") or 1.0
            confidence = product_filter.calculate_filter_confidence(
                brand_score, model_score, 1.0, 1.0
            )
            product["filter_confidence"] = confidence
            product["filter_reasons"] = filter_reasons or ["Passed all filters"]
            filtered.append(product)

    # Calculate statistics on CLEAN data (after filtering)
    if filtered:
        clean_prices = [p.get("extracted_price", 0) for p in filtered if p.get("extracted_price", 0) > 0]
        if clean_prices:
            statistics = {
                "total": len(unique_products),
                "kept": len(filtered),
                "removed": len(rejected),
                "reasons_breakdown": rejection_reasons,
                "price_statistics": {
                    "mean": np.mean(clean_prices),
                    "median": np.median(clean_prices),
                    "min": np.min(clean_prices),
                    "max": np.max(clean_prices),
                    "std": np.std(clean_prices),
                },
                "filter_settings": {
                    "brand_threshold": brand_threshold,
                    "model_threshold": brand_threshold,
                    "price_outlier_mad_threshold": mad_threshold,
                    "price_too_good_threshold_percent": too_good_threshold * 100,
                },
            }
        else:
            statistics = {
                "total": len(unique_products),
                "kept": len(filtered),
                "removed": len(rejected),
                "reasons_breakdown": rejection_reasons,
                "filter_settings": {
                    "brand_threshold": brand_threshold,
                    "model_threshold": brand_threshold,
                    "price_outlier_mad_threshold": mad_threshold,
                    "price_too_good_threshold_percent": too_good_threshold * 100,
                },
            }
    else:
        statistics = {
            "total": len(unique_products),
            "kept": len(filtered),
            "removed": len(rejected),
            "reasons_breakdown": rejection_reasons,
            "filter_settings": {
                "brand_threshold": brand_threshold,
                "model_threshold": brand_threshold,
                "price_outlier_percent": price_outlier_threshold,
            },
        }

    # Calculate processing time
    processing_time = (time.time() - start_time) * 1000

    # Generate warnings
    warnings = state.get("warnings", [])
    if len(rejected) > 0:
        warnings.append(f"{len(rejected)} listings filtered out")
    if rejection_reasons.get("bundle_listing", 0) > 0:
        warnings.append(
            f"{rejection_reasons['bundle_listing']} combo/bundle listing(s) removed"
        )
    if rejection_reasons.get("invalid_price", 0) > 0:
        warnings.append(
            f"{rejection_reasons['invalid_price']} listing(s) with invalid prices removed"
        )
    if rejection_reasons.get("price_outlier", 0) > 0:
        warnings.append(
            f"{rejection_reasons['price_outlier']} price outlier(s) removed (MAD method)"
        )

    # Print rejected listings details
    if rejected:
        print("\n" + "=" * 100)
        print(f"REJECTED LISTINGS ({len(rejected)} total)")
        print("=" * 100)

        for i, product in enumerate(rejected, 1):
            title = product.get("title", "N/A")
            price = product.get("extracted_price", 0)
            source = product.get("source", "N/A")
            reasons = product.get("filter_reasons", [])

            print(f"\n{i}. [REJECTED]")
            print(f"   Title:   {title}")
            print(f"   Price:   ${price:.2f}" if price else f"   Price:   $0.00")
            print(f"   Source:  {source}")
            print(f"   Brand:   {target_brand if target_brand else 'N/A'}")
            print(f"   Model:   {target_model if target_model else 'N/A'}")
            print(f"   Reason:  {reasons[0] if reasons else 'Unknown'}")
            if len(reasons) > 1:
                for reason in reasons[1:]:
                    print(f"            {reason}")

        print("\n" + "=" * 100 + "\n")

    return {
        "filtered_products": filtered,
        "rejected_products": rejected,
        "filter_statistics": statistics,
        "warnings": warnings,
        "current_step": "filtering_completed",
        "processing_times": {
            **state.get("processing_times", {}),
            "filtering_ms": processing_time,
        },
    }


def _add_rejection_reason(reasons_dict: Dict[str, int], reason: str) -> None:
    """Helper to add rejection reason to count"""
    reasons_dict[reason] = reasons_dict.get(reason, 0) + 1
