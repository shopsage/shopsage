# ShopSage Usage Examples

## Quick Start Examples

### 1. Python Script Usage

```python
from google_shopping_scraper.agent import run_research_agent

# Simple usage
result = run_research_agent("I want to buy sony wh1000xm6")

# Access recommendations
for product in result["recommendations"]:
    print(f"{product['title']}")
    print(f"Price: ${product['extracted_price']}")
    print(f"Score: {product['overall_score']}/10")
    print()
```

### 2. API Usage

```bash
# Start server
python api/main.py

# Make request
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I want to buy sony wh1000xm6",
    "max_results": 20,
    "top_n": 5
  }'
```

### 3. Test Script Usage

```bash
# Default query
python test_agent.py

# Custom query
python test_agent.py "best gaming laptop under 1500"

# Will save full results to JSON file
```

## Example Queries

### Electronics
```python
run_research_agent("sony wh1000xm6 headphones")
run_research_agent("I want to buy iPhone 15 Pro Max")
run_research_agent("best gaming laptop under 1500")
run_research_agent("samsung galaxy s24 ultra")
```

### Home & Kitchen
```python
run_research_agent("dyson v15 vacuum cleaner")
run_research_agent("ninja air fryer")
run_research_agent("kitchenaid stand mixer")
```

### Sports & Outdoors
```python
run_research_agent("nike air jordan 1")
run_research_agent("yeti cooler 45 qt")
```

## Example Response Structure

```json
{
  "recommendations": [
    {
      // Original SerpAPI data
      "title": "Sony WH-1000XM6 Wireless Headphones",
      "price": "$279.99",
      "extracted_price": 279.99,
      "rating": 4.8,
      "reviews": 1247,
      "source": "Amazon",
      "link": "https://...",
      "thumbnail": "https://...",
      "delivery": "Free delivery by Thu, Oct 24",
      "extensions": ["Free shipping", "In stock"],

      // Agent enrichments
      "overall_score": 8.7,
      "price_score": 7.5,
      "rating_score": 9.6,
      "reputation_score": 10.0,
      "review_count_score": 8.9,
      "rank": 1,

      // Filter metadata
      "filter_passed": true,
      "filter_confidence": 0.95,
      "brand_match_score": 1.0,
      "model_match_score": 0.98,
      "is_bundle": false,
      "is_price_outlier": false,

      // Price analysis
      "price_percentile": 45.0,
      "price_vs_median": -0.5,
      "is_competitive": true,

      // Store info
      "store_info": {
        "is_known": true,
        "reputation_tier": "A+",
        "notes": "Premium retailer with excellent reputation"
      }
    }
  ],

  "alternative_options": [...],
  "rejected_products": [...],

  "metadata": {
    "query_analysis": {
      "original_query": "I want to buy sony wh1000xm6",
      "brand": "Sony",
      "model": "WH-1000XM6",
      "product_type": "headphones",
      "confidence": 0.95
    },

    "search_summary": {
      "total_results": 20,
      "search_time_ms": 450
    },

    "filtering_summary": {
      "total": 20,
      "kept": 12,
      "removed": 8,
      "rejection_reasons": {
        "brand_mismatch": 4,
        "bundle_listing": 3,
        "price_outlier": 1
      }
    },

    "price_insights": {
      "lowest_price": 199.99,
      "highest_price": 349.99,
      "median_price": 279.99,
      "average_price": 282.45,
      "recommended_price_range": [260.0, 300.0]
    },

    "evaluation_summary": {
      "scoring_weights": {
        "price": 0.4,
        "rating": 0.3,
        "reputation": 0.2,
        "review_count": 0.1
      },
      "top_score": 8.7,
      "average_score": 6.3
    },

    "recommendations_reasoning": [
      {
        "rank": 1,
        "product_title": "Sony WH-1000XM6...",
        "why_recommended": "Best combination of competitive price ($279.99) and excellent rating (4.8/5)",
        "pros": [
          "Competitive price",
          "High rating (4.8/5)",
          "1,247 reviews",
          "Trusted seller (Amazon)"
        ],
        "cons": ["None identified"],
        "confidence": 0.92
      }
    ],

    "warnings": [
      "8 listings filtered out",
      "1 listing(s) removed due to suspicious pricing"
    ],

    "processing_stats": {
      "total_time_ms": 3200,
      "query_processing_ms": 800,
      "search_ms": 450,
      "filtering_ms": 600,
      "evaluation_ms": 1200,
      "formatting_ms": 150
    }
  }
}
```

## Accessing Specific Data

### Get Top Recommendation

```python
result = run_research_agent("sony wh1000xm6")
top_product = result["recommendations"][0]

print(f"Title: {top_product['title']}")
print(f"Price: ${top_product['extracted_price']}")
print(f"Score: {top_product['overall_score']}/10")
print(f"Store: {top_product['source']}")
print(f"Link: {top_product['link']}")
```

### Get Price Analysis

```python
result = run_research_agent("sony wh1000xm6")
price_insights = result["metadata"]["price_insights"]

print(f"Price Range: ${price_insights['lowest_price']} - ${price_insights['highest_price']}")
print(f"Median: ${price_insights['median_price']}")
print(f"Recommended: ${price_insights['recommended_price_range'][0]} - ${price_insights['recommended_price_range'][1]}")
```

### Get Recommendations with Reasoning

```python
result = run_research_agent("sony wh1000xm6")
reasoning = result["metadata"]["recommendations_reasoning"]

for rec in reasoning:
    print(f"\n#{rec['rank']} - {rec['product_title']}")
    print(f"Why: {rec['why_recommended']}")
    print(f"Confidence: {rec['confidence']:.0%}")
    print(f"Pros: {', '.join(rec['pros'])}")
    print(f"Cons: {', '.join(rec['cons'])}")
```

### Check Rejected Products

```python
result = run_research_agent("sony wh1000xm6")
rejected = result["rejected_products"]

print(f"Total rejected: {len(rejected)}")
for product in rejected:
    print(f"\n{product['title']}")
    print(f"Reasons: {', '.join(product['filter_reasons'])}")
```

## Advanced Usage

### Override LLM Provider

```python
# Use OpenAI instead of default Gemini
result = run_research_agent(
    "sony wh1000xm6",
    config={"provider": "openai"}
)
```

### Custom Parameters

```python
result = run_research_agent(
    query="sony wh1000xm6",
    max_results=30,  # Fetch more results
    top_n=10         # Return more recommendations
)
```

### Save Full Results

```python
import json

result = run_research_agent("sony wh1000xm6")

with open("research_results.json", "w") as f:
    json.dump(result, f, indent=2, default=str)
```

## Integration with Your Platform

### Example: Display in UI

```python
def format_for_ui(result):
    """Format agent results for UI display"""
    return {
        "query": result["metadata"]["query_analysis"]["original_query"],
        "top_picks": [
            {
                "title": p["title"],
                "price": p["extracted_price"],
                "rating": p["rating"],
                "reviews": p["reviews"],
                "store": p["source"],
                "link": p["link"],
                "image": p["thumbnail"],
                "score": p["overall_score"],
                "pros": next(
                    (r["pros"] for r in result["metadata"]["recommendations_reasoning"] if r["rank"] == p["rank"]),
                    []
                ),
                "competitive": p.get("is_competitive", False)
            }
            for p in result["recommendations"]
        ],
        "price_summary": {
            "min": result["metadata"]["price_insights"]["lowest_price"],
            "max": result["metadata"]["price_insights"]["highest_price"],
            "median": result["metadata"]["price_insights"]["median_price"],
            "recommended_range": result["metadata"]["price_insights"]["recommended_price_range"]
        },
        "stats": {
            "total_found": result["metadata"]["search_summary"]["total_results"],
            "analyzed": result["metadata"]["filtering_summary"]["kept"],
            "processing_time": result["metadata"]["processing_stats"]["total_time_ms"]
        }
    }

# Usage
result = run_research_agent("sony wh1000xm6")
ui_data = format_for_ui(result)
```

### Example: Price Alert System

```python
def check_good_deals(result, target_percentile=25):
    """Find products in bottom 25% of price range"""
    good_deals = []

    for product in result["recommendations"]:
        if product.get("price_percentile", 100) <= target_percentile:
            good_deals.append({
                "title": product["title"],
                "price": product["extracted_price"],
                "percentile": product["price_percentile"],
                "link": product["link"]
            })

    return good_deals

# Usage
result = run_research_agent("sony wh1000xm6")
deals = check_good_deals(result)
print(f"Found {len(deals)} great deals!")
```

## API Endpoints

### POST /research
Full research with all data

```bash
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"query": "sony wh1000xm6", "max_results": 20, "top_n": 5}'
```

### POST /research/summary
Summary only (faster, less data)

```bash
curl -X POST http://localhost:8000/research/summary \
  -H "Content-Type: application/json" \
  -d '{"query": "sony wh1000xm6"}'
```

### GET /health
Health check

```bash
curl http://localhost:8000/health
```

### GET /providers
List available LLM providers

```bash
curl http://localhost:8000/providers
```
