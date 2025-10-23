# ShopSage Architecture

## System Overview

ShopSage is a LangGraph-based intelligent agent that researches product suppliers, evaluates options, and provides recommendations with rich metadata.

## Agent Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INPUT                              │
│  "I want to buy sony wh1000xm6"                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   1. QUERY PROCESSING                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Extract brand, model, product type using LLM         │  │
│  │  • Normalize query                                       │  │
│  │  • Determine user intent                                 │  │
│  │  • Calculate confidence score                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Output: {brand: "Sony", model: "WH-1000XM6", type: "headphones"} │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      2. SEARCH                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Build optimized search query                          │  │
│  │  • Call SerpAPI Google Shopping                          │  │
│  │  • Preserve ALL response fields                          │  │
│  │  • Extract product listings                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Output: 20 raw product listings with complete SerpAPI data    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  3. FILTER & PROCESS                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Brand/model matching (fuzzy + exact)                  │  │
│  │  • Bundle detection (remove multi-packs)                 │  │
│  │  • Price outlier detection (z-score)                     │  │
│  │  • Duplicate removal                                     │  │
│  │  • Enrich with filter metadata                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Output: 12 filtered products + 8 rejected (with reasons)       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     4. EVALUATE                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Score price (lower = better)                          │  │
│  │  • Score rating (higher = better)                        │  │
│  │  • Score store reputation                                │  │
│  │  • Score review count (more = better)                    │  │
│  │  • Calculate composite score (weighted)                  │  │
│  │  • Rank all products                                     │  │
│  │  • Add price analysis                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Scoring Weights: Price 40% | Rating 30% | Reputation 20% | Reviews 10% │
│  Output: 12 ranked products with scores                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  5. FORMAT RESPONSE                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Select top N recommendations                          │  │
│  │  • Generate reasoning for each                           │  │
│  │  • List pros and cons                                    │  │
│  │  • Compile rich metadata                                 │  │
│  │  • Calculate processing stats                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Output: Final response with recommendations + metadata         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FINAL OUTPUT                                │
│  • Top 5 recommendations (ranked)                              │
│  • Alternative options                                         │
│  • Rejected products (with reasons)                            │
│  • Complete metadata (query analysis, price insights, etc.)    │
│  • Warnings and errors                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                      LangGraph Agent                        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Query     │  │   Search    │  │   Filter    │       │
│  │  Processor  │→ │    Node     │→ │   & Process │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│         │                │                 │               │
│         ▼                ▼                 ▼               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  Evaluate   │  │   Format    │  │   AgentState│       │
│  │    Node     │→ │  Response   │→ │   (Output)  │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Uses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Tools Layer                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  SerpAPI   │  │    LLM     │  │  Product   │           │
│  │   Client   │  │  Provider  │  │   Filter   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│  ┌────────────┐  ┌────────────┐                           │
│  │  Product   │  │   Scoring  │                           │
│  │   Scorer   │  │  Utilities │                           │
│  └────────────┘  └────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Accesses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  SerpAPI   │  │   Gemini   │  │  OpenAI    │           │
│  │  (Search)  │  │    API     │  │    API     │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### State Evolution Through Pipeline

```
Initial State:
{
  "user_query": "I want to buy sony wh1000xm6",
  "max_results": 20,
  "top_n": 5,
  ...empty fields...
}

After Query Processing:
{
  "user_query": "I want to buy sony wh1000xm6",
  "processed_query": {
    "brand": "Sony",
    "model": "WH-1000XM6",
    "product_type": "headphones",
    "confidence": 0.95
  },
  ...
}

After Search:
{
  ...previous fields...,
  "raw_search_results": [
    {
      "title": "Sony WH-1000XM6...",
      "price": "$279.99",
      "extracted_price": 279.99,
      "rating": 4.8,
      "reviews": 1247,
      ...all SerpAPI fields...
    },
    ...19 more products...
  ],
  "search_metadata": {...}
}

After Filtering:
{
  ...previous fields...,
  "filtered_products": [12 products with filter metadata],
  "rejected_products": [8 products with rejection reasons],
  "filter_statistics": {
    "total": 20,
    "kept": 12,
    "removed": 8,
    "reasons_breakdown": {...}
  }
}

After Evaluation:
{
  ...previous fields...,
  "evaluated_products": [
    {
      ...original product data...,
      "overall_score": 8.7,
      "price_score": 7.5,
      "rating_score": 9.6,
      "reputation_score": 10.0,
      "review_count_score": 8.9,
      "rank": 1,
      "is_competitive": true,
      ...
    },
    ...11 more ranked products...
  ],
  "price_analysis": {
    "median_price": 279.99,
    "recommended_price_range": [260, 300],
    ...
  }
}

Final State (After Formatting):
{
  ...all previous fields...,
  "recommendations": [top 5 products],
  "alternative_options": [remaining products],
  "metadata": {
    "query_analysis": {...},
    "search_summary": {...},
    "filtering_summary": {...},
    "price_insights": {...},
    "evaluation_summary": {...},
    "recommendations_reasoning": [...],
    "processing_stats": {...}
  }
}
```

## Scoring Algorithm

### Composite Score Calculation

```
Overall Score = (Price Score × 0.40) +
                (Rating Score × 0.30) +
                (Reputation Score × 0.20) +
                (Review Count Score × 0.10)

Where each component is 0-10:

Price Score:
  - Lower price = higher score
  - Normalized against all prices
  - inverted_normalized_price × 10

Rating Score:
  - (rating / 5) × 10
  - Direct conversion from 5-star to 10-point scale

Reputation Score:
  - Premium stores (Amazon, Best Buy, B&H): 10
  - Trusted stores: 8
  - Unknown stores: 5

Review Count Score:
  - Log-scaled (handles wide range)
  - Normalized against all review counts
  - log_normalized_count × 10
```

## Filtering Strategy

### Brand/Model Matching
- **Exact match**: substring in title → score 1.0
- **Fuzzy match**: Levenshtein ratio ≥ threshold → pass
- **Word match**: individual words compared
- **Threshold**: 0.7 (configurable)

### Bundle Detection
Reject if title contains:
- "pack of", "X pack"
- "bundle", "set of"
- "X piece", "lot of"
- "multi-pack", "combo"

### Price Outlier Detection
- Calculate z-score for each price
- Reject if |z-score| > 3.0 (configurable)
- Requires minimum 3 products with valid prices

### Confidence Scoring
```
confidence = (brand_match_score + model_match_score) / 2 × 0.6 +
             (checks_passed / total_checks) × 0.4
```

## Multi-Provider LLM Support

```
┌─────────────────────────────────────┐
│        LLMClient (Factory)          │
└─────────────┬───────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Gemini │ │ OpenAI │ │Anthropic│
└────────┘ └────────┘ └────────┘
```

**Features:**
- Single unified interface
- Easy provider switching via env variable
- Default models per provider
- Temperature control
- Error handling

## API Layer

```
┌────────────────────────────────────────┐
│          FastAPI Server                │
│                                        │
│  POST /research                        │
│    → Full results                      │
│                                        │
│  POST /research/summary                │
│    → Summary only                      │
│                                        │
│  GET /health                           │
│    → Status check                      │
│                                        │
│  GET /providers                        │
│    → List LLM providers                │
└────────┬───────────────────────────────┘
         │
         │ Invokes
         ▼
┌────────────────────────────────────────┐
│      LangGraph Agent                   │
└────────────────────────────────────────┘
```

## LangGraph Studio Integration

**Configuration**: `langgraph.json`
```json
{
  "dependencies": ["./google_shopping_scraper"],
  "graphs": {
    "supplier_research_agent": "./google_shopping_scraper/agent.py:graph"
  },
  "env": ".env"
}
```

**Features:**
- Visual graph representation
- Step-by-step execution
- State inspection at each node
- Interactive testing
- Debugging support

## Deployment Options

### 1. Direct Python Usage
```python
from google_shopping_scraper.agent import run_research_agent
result = run_research_agent("query")
```

### 2. FastAPI Server
```bash
python api/main.py
# Access via HTTP REST API
```

### 3. LangGraph Studio
```bash
langgraph dev
# Visual interface for testing
```

### 4. Future: Integration Layer
```
Your Platform → ShopSage API → Results
```

## Performance Characteristics

**Typical Execution Time:**
- Query Processing: ~800ms (LLM call)
- Search: ~450ms (SerpAPI)
- Filtering: ~600ms (local computation)
- Evaluation: ~1200ms (scoring all products)
- Formatting: ~150ms (metadata compilation)
- **Total: ~3.2 seconds**

**Bottlenecks:**
1. LLM API calls (query processing)
2. SerpAPI search
3. Product evaluation (scales with number of products)

**Optimization Opportunities:**
- Cache LLM responses for similar queries
- Parallel API calls where possible
- Reduce evaluation complexity for large result sets

## Error Handling

**Graceful Degradation:**
- If LLM fails → use fallback query parsing
- If SerpAPI fails → return error but don't crash
- If filtering fails → return unfiltered results
- All errors collected in `errors` array
- Warnings for non-critical issues

## Extensibility Points

### 1. Add New Search Sources
```python
# Implement new search client
class NewSearchClient:
    def search(self, query): ...

# Add to search node
```

### 2. Add New Filters
```python
# Add to ProductFilter class
def check_availability(self, product):
    # Custom filter logic
    ...
```

### 3. Customize Scoring
```python
# Modify ProductScorer weights
scorer = ProductScorer(
    price_weight=0.5,      # Increase price importance
    rating_weight=0.3,
    reputation_weight=0.1,
    review_count_weight=0.1
)
```

### 4. Add New Nodes
```python
# Add custom node to graph
def custom_node(state):
    # Your logic
    return updated_state

workflow.add_node("custom", custom_node)
workflow.add_edge("evaluate", "custom")
workflow.add_edge("custom", "format")
```

## Security Considerations

**API Keys:**
- Store in `.env` (never commit)
- Validate on startup
- Rotate regularly

**Input Validation:**
- Sanitize user queries
- Limit max_results
- Rate limiting (implement in API layer)

**Data Privacy:**
- Don't log sensitive data
- Clear cache appropriately
- GDPR compliance (if applicable)
