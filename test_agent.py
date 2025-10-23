"""Test script for the supplier research agent"""

import json
import sys
from datetime import datetime
from google_shopping_scraper.agent import run_research_agent


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f" {title}")
    print("=" * 80)


def print_product(product: dict, index: int):
    """Print formatted product information"""
    seller = product.get("seller") or product.get("source", "N/A")
    print(f"\n{index}. {product.get('title', 'N/A')}")
    print(f"   👤 Seller: {seller}")
    print("-" * 80)

    # Basic info
    price = product.get("extracted_price")
    print(f"💰 Price: ${price:.2f}" if price else "💰 Price: N/A")

    rating = product.get("rating")
    reviews = product.get("reviews", 0)
    if rating:
        stars = "⭐" * int(rating)
        print(f"⭐ Rating: {rating}/5 {stars} ({reviews:,} reviews)")
    else:
        print("⭐ Rating: N/A")

    print(f"🏪 Store: {seller}")
    print(f"🔗 Link: {product.get('link', 'N/A')[:80]}...")

    # Scores
    overall_score = product.get("overall_score")
    if overall_score:
        print(f"\n📊 Overall Score: {overall_score}/10")
        print(f"   Price Score: {product.get('price_score', 0):.1f}/10")
        print(f"   Rating Score: {product.get('rating_score', 0):.1f}/10")
        print(f"   Reputation Score: {product.get('reputation_score', 0):.1f}/10")
        print(f"   Review Count Score: {product.get('review_count_score', 0):.1f}/10")

    # Price analysis
    is_competitive = product.get("is_competitive")
    if is_competitive is not None:
        competitive_status = "✅ Competitive" if is_competitive else "⚠️ Not in recommended range"
        print(f"\n{competitive_status}")

    price_percentile = product.get("price_percentile")
    if price_percentile is not None:
        print(f"📈 Price Percentile: {price_percentile}th")

    price_vs_median = product.get("price_vs_median")
    if price_vs_median is not None:
        diff = "below" if price_vs_median < 0 else "above"
        print(f"📊 {abs(price_vs_median):.1f}% {diff} median")

    # Store info
    store_info = product.get("store_info", {})
    if store_info:
        print(f"\n🏷️ Store Reputation: {store_info.get('reputation_tier', 'N/A')}")
        print(f"   {store_info.get('notes', '')}")

    # Extensions (features)
    extensions = product.get("extensions", [])
    if extensions:
        print(f"\n✨ Features:")
        for ext in extensions[:5]:  # Show first 5
            print(f"   • {ext}")

    # Delivery
    delivery = product.get("delivery")
    if delivery:
        print(f"\n🚚 Delivery: {delivery}")


def test_agent(query: str, max_results: int = 20, top_n: int = 5, save_json: bool = False):
    """
    Test the supplier research agent

    Args:
        query: Product search query
        max_results: Maximum search results
        top_n: Number of recommendations
        save_json: Whether to save full results to JSON file
    """
    print_section("SUPPLIER RESEARCH AGENT TEST")
    print(f"\n🔍 Query: {query}")
    print(f"📊 Max Results: {max_results}")
    print(f"🎯 Top N: {top_n}")

    print("\n⏳ Running agent...")

    try:
        # Run the agent
        result = run_research_agent(query=query, max_results=max_results, top_n=top_n)

        # Extract data
        recommendations = result.get("recommendations", [])
        alternatives = result.get("alternative_options", [])
        rejected = result.get("rejected_products", [])
        metadata = result.get("metadata", {})
        errors = result.get("errors", [])
        warnings = result.get("warnings", [])

        # Print query analysis
        print_section("QUERY ANALYSIS")
        query_analysis = metadata.get("query_analysis", {})
        if query_analysis:
            print(f"\n🔤 Original Query: {query_analysis.get('original_query')}")
            print(f"🏷️ Brand: {query_analysis.get('brand', 'N/A')}")
            print(f"📱 Model: {query_analysis.get('model', 'N/A')}")
            print(f"📦 Product Type: {query_analysis.get('product_type', 'N/A')}")
            print(f"🎯 Intent: {query_analysis.get('intent', 'N/A')}")
            print(f"✅ Confidence: {query_analysis.get('confidence', 0):.0%}")

        # Print search summary
        print_section("SEARCH SUMMARY")
        search_summary = metadata.get("search_summary", {})
        print(f"\n📊 Total Results Found: {search_summary.get('total_results', 0)}")
        print(
            f"⏱️ Search Time: {search_summary.get('search_time_ms', 0):.0f}ms"
        )

        # Print filtering summary
        print_section("FILTERING SUMMARY")
        filter_summary = metadata.get("filtering_summary", {})
        print(f"\n📥 Total Listings: {filter_summary.get('total', 0)}")
        print(f"✅ Kept: {filter_summary.get('kept', 0)}")
        print(f"❌ Removed: {filter_summary.get('removed', 0)}")

        reasons = filter_summary.get("reasons_breakdown", {})
        if reasons:
            print(f"\n📋 Rejection Reasons:")
            for reason, count in reasons.items():
                print(f"   • {reason}: {count}")

        # Print price insights
        print_section("PRICE INSIGHTS")
        price_insights = metadata.get("price_insights", {})
        if price_insights:
            print(f"\n💵 Price Range: ${price_insights.get('lowest_price', 0):.2f} - ${price_insights.get('highest_price', 0):.2f}")
            print(f"📊 Median: ${price_insights.get('median_price', 0):.2f}")
            print(f"📈 Average: ${price_insights.get('average_price', 0):.2f}")
            print(f"📉 Std Dev: ${price_insights.get('std_deviation', 0):.2f}")

            rec_range = price_insights.get("recommended_price_range", [])
            if rec_range and len(rec_range) == 2:
                print(f"✅ Recommended Range: ${rec_range[0]:.2f} - ${rec_range[1]:.2f}")

        # Print recommendations
        print_section(f"TOP {len(recommendations)} RECOMMENDATIONS")
        for i, product in enumerate(recommendations, 1):
            print_product(product, i)

        # Print recommendation reasoning
        print_section("RECOMMENDATION REASONING")
        reasoning_list = metadata.get("recommendations_reasoning", [])
        for reasoning in reasoning_list[:top_n]:
            rank = reasoning.get("rank", 0)
            print(f"\n#{rank} - {reasoning.get('product_title', 'N/A')}")
            print(f"📝 Why: {reasoning.get('why_recommended', 'N/A')}")
            print(f"✅ Confidence: {reasoning.get('confidence', 0):.0%}")

            pros = reasoning.get("pros", [])
            if pros:
                print(f"\n👍 Pros:")
                for pro in pros:
                    print(f"   • {pro}")

            cons = reasoning.get("cons", [])
            if cons:
                print(f"\n👎 Cons:")
                for con in cons:
                    print(f"   • {con}")

        # Print alternative options summary
        if alternatives:
            print_section(f"ALTERNATIVE OPTIONS ({len(alternatives)} available)")
            print("\n(Run with save_json=True to see full details)")

        # Print warnings
        if warnings:
            print_section("WARNINGS")
            for warning in warnings:
                print(f"\n⚠️ {warning}")

        # Print errors
        if errors:
            print_section("ERRORS")
            for error in errors:
                print(f"\n❌ {error}")

        # Print performance stats
        print_section("PERFORMANCE")
        stats = metadata.get("processing_stats", {})
        print(f"\n⏱️ Total Time: {stats.get('total_time_ms', 0):.0f}ms")
        print(f"   Query Processing: {stats.get('query_processing_ms', 0):.0f}ms")
        print(f"   Search: {stats.get('search_ms', 0):.0f}ms")
        print(f"   Filtering: {stats.get('filtering_ms', 0):.0f}ms")
        print(f"   Evaluation: {stats.get('evaluation_ms', 0):.0f}ms")
        print(f"   Formatting: {stats.get('formatting_ms', 0):.0f}ms")

        # Save to JSON if requested
        if save_json:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"research_result_{timestamp}.json"

            with open(filename, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2, default=str, ensure_ascii=False)

            print(f"\n💾 Full results saved to: {filename}")

        print_section("TEST COMPLETE")
        print(f"\n✅ Agent executed successfully!")
        print(f"🎯 Found {len(recommendations)} recommendations")

        return result

    except Exception as e:
        print_section("ERROR")
        print(f"\n❌ Test failed: {str(e)}")
        import traceback

        traceback.print_exc()
        return None


if __name__ == "__main__":
    # Default test query
    query = "I want to buy sony wh1000xm6"

    # Allow command line arguments
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])

    # Run test
    test_agent(query=query, max_results=15, top_n=5, save_json=True)
