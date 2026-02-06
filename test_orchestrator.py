"""Test script for the orchestrator router agent"""

import json
import sys
from datetime import datetime
from orchestrator.agent import run_orchestrator


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f" {title}")
    print("=" * 80)


def test_orchestrator(
    query: str,
    messages: list = None,
    save_json: bool = False,
):
    """
    Test the orchestrator agent.

    Args:
        query: The latest user message
        messages: Optional conversation history
        save_json: Whether to save full results to JSON
    """
    print_section("ORCHESTRATOR ROUTER TEST")
    print(f"\n Latest Message: {query}")

    if messages:
        print(f" Conversation History: {len(messages)} messages")
        for msg in messages:
            role = msg["role"].upper()
            content = msg["content"][:80]
            print(f"   {role}: {content}{'...' if len(msg['content']) > 80 else ''}")

    print("\n Running orchestrator...")

    try:
        result = run_orchestrator(
            messages=messages or [],
            latest_message=query,
        )

        # Print routing decision
        route = result.get("route", "unknown")
        extracted_query = result.get("extracted_query", "")
        errors = result.get("errors", [])

        print_section("ROUTING DECISION")
        if route == "supplier":
            print(f"\n Route: SUPPLIER RESEARCH")
            print(f" Extracted Query: {extracted_query}")
        else:
            print(f"\n Route: PRODUCT RESEARCH")
            print(f" Extracted Query: {extracted_query[:120]}{'...' if len(extracted_query) > 120 else ''}")

        # Print errors if any
        if errors:
            print_section("ERRORS")
            for error in errors:
                print(f"\n {error}")

        # Print agent result summary
        agent_result = result.get("result")
        if agent_result:
            if route == "supplier":
                # Supplier agent result
                recommendations = agent_result.get("recommendations", [])
                metadata = agent_result.get("metadata", {})

                print_section(f"SUPPLIER RESULTS ({len(recommendations)} recommendations)")
                for i, product in enumerate(recommendations, 1):
                    seller = product.get("seller") or product.get("source", "N/A")
                    price = product.get("extracted_price")
                    score = product.get("overall_score", 0)
                    print(f"\n  {i}. {product.get('title', 'N/A')[:70]}")
                    print(f"     Seller: {seller}")
                    print(f"     Price: ${price:.2f}" if price else "     Price: N/A")
                    print(f"     Score: {score}/10")

                price_insights = metadata.get("price_insights", {})
                if price_insights:
                    print(f"\n Price Range: ${price_insights.get('lowest_price', 0):.2f} - ${price_insights.get('highest_price', 0):.2f}")
                    print(f" Median: ${price_insights.get('median_price', 0):.2f}")

            elif route == "product":
                # Product research agent result
                evaluation = agent_result.get("evaluation")
                if evaluation:
                    print_section("PRODUCT RESEARCH RESULTS")
                    if isinstance(evaluation, dict):
                        print(f"\n{evaluation.get('evaluation', str(evaluation))}")
                    else:
                        print(f"\n{evaluation}")

                sources = agent_result.get("sources", set())
                if sources:
                    print(f"\n Sources: {len(sources)} found")

            # Print agent warnings/errors
            agent_warnings = agent_result.get("warnings", [])
            if agent_warnings:
                print_section("AGENT WARNINGS")
                for w in agent_warnings:
                    print(f"  {w}")

            agent_errors = agent_result.get("errors", [])
            if agent_errors:
                print_section("AGENT ERRORS")
                for e in agent_errors:
                    print(f"  {e}")
        else:
            print_section("NO RESULT")
            print("\n Agent returned no result.")

        # Save JSON
        if save_json:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"orchestrator_result_{timestamp}.json"
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2, default=str, ensure_ascii=False)
            print(f"\n Full results saved to: {filename}")

        print_section("TEST COMPLETE")
        return result

    except Exception as e:
        print_section("ERROR")
        print(f"\n Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    # Default test
    query = "Sony WH1000XM6"

    # Allow command line arguments
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])

    test_orchestrator(query=query, save_json=True)
