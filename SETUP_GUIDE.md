# ShopSage Setup Guide

## Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- API keys for:
  - SerpAPI (https://serpapi.com/)
  - Google Gemini (https://ai.google.dev/) or other LLM providers

## Installation Steps

### 1. Install Dependencies

```bash
# Activate virtual environment (if not already activated)
# On Windows:
venv\Scripts\activate
# On Unix/Mac:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your API keys
# You can use any text editor
notepad .env  # Windows
nano .env     # Unix/Mac
```

Add your API keys to `.env`:

```env
# Required: SerpAPI key
SERPAPI_API_KEY=your_serpapi_key_here

# Required: At least one LLM provider key
LLM_PROVIDER=gemini
GOOGLE_API_KEY=your_google_gemini_key_here

# Optional: Other LLM providers
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### 3. Get API Keys

#### SerpAPI (Required)

1. Go to https://serpapi.com/
2. Sign up for a free account (100 searches/month)
3. Find your API key in the dashboard
4. Copy it to `.env` as `SERPAPI_API_KEY`

#### Google Gemini (Recommended - Free Tier Available)

1. Go to https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Create a new API key
4. Copy it to `.env` as `GOOGLE_API_KEY`

#### OpenAI (Optional)

1. Go to https://platform.openai.com/
2. Create an account and add payment method
3. Generate an API key
4. Copy it to `.env` as `OPENAI_API_KEY`

#### Anthropic Claude (Optional)

1. Go to https://console.anthropic.com/
2. Create an account
3. Generate an API key
4. Copy it to `.env` as `ANTHROPIC_API_KEY`

## Testing the Agent

### Option 1: Run Test Script

```bash
python test_agent.py
```

Or with a custom query:

```bash
python test_agent.py "I want to buy iPhone 15 Pro"
```

### Option 2: Run Agent Directly

```bash
python google_shopping_scraper/agent.py
```

### Option 3: Start API Server

```bash
python api/main.py
```

Then visit http://localhost:8000/docs for the interactive API documentation.

Test with curl:

```bash
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"query": "I want to buy sony wh1000xm6"}'
```

### Option 4: Use LangGraph Studio

```bash
langgraph dev
```

Then open LangGraph Studio and connect to visualize the agent execution.

## Troubleshooting

### "SerpAPI API key is required"

Make sure you've set `SERPAPI_API_KEY` in your `.env` file.

### "GOOGLE_API_KEY environment variable required for Gemini"

Make sure you've set `GOOGLE_API_KEY` in your `.env` file if using Gemini.

### "Module not found" errors

Make sure you've installed all dependencies:

```bash
pip install -r requirements.txt
```

### Import errors

Make sure you're running commands from the project root directory (`shopsage/`).

### Rate limiting errors

SerpAPI free tier has limits. If you hit the limit, you'll need to wait or upgrade your plan.

## Configuration Options

Edit `.env` to customize behavior:

```env
# Search configuration
MAX_SEARCH_RESULTS=20        # Maximum results from SerpAPI
TOP_RECOMMENDATIONS=5         # Number of top recommendations to return

# Filtering thresholds
FILTER_BRAND_THRESHOLD=0.7    # Brand matching threshold (0-1)
PRICE_OUTLIER_STD=3.0         # Standard deviations for outlier detection

# API server
HOST=0.0.0.0
PORT=8000
```

## Next Steps

1. Test the agent with various queries
2. Explore the API documentation at http://localhost:8000/docs
3. Visualize execution in LangGraph Studio
4. Integrate into your larger platform

## LangGraph Studio Usage

1. Start the development server:
   ```bash
   langgraph dev
   ```

2. Open LangGraph Studio (automatically opens in browser)

3. You'll see your agent graph visualized

4. Submit a query through the UI

5. Watch the agent execute step-by-step:
   - Query Processing
   - Search
   - Filter & Process
   - Evaluate
   - Format Response

6. Inspect the state at each step to see how data is enriched

## Project Structure

```
shopsage/
├── google_shopping_scraper/     # Main package
│   ├── agent.py                # LangGraph definition
│   ├── state.py                # State schema
│   ├── nodes/                  # Processing nodes
│   │   ├── query_processor.py
│   │   ├── search.py
│   │   ├── filter_process.py
│   │   ├── evaluate.py
│   │   └── format_response.py
│   ├── tools/                  # Tools and clients
│   │   ├── serpapi_client.py
│   │   ├── llm_provider.py
│   │   └── filters.py
│   ├── models/                 # Data models
│   │   └── schemas.py
│   └── utils/                  # Utilities
│       └── scoring.py
├── api/                        # FastAPI server
│   └── main.py
├── requirements.txt            # Dependencies
├── .env                        # Configuration (create from .env.example)
├── langgraph.json             # LangGraph Studio config
├── test_agent.py              # Test script
└── README.md                  # Documentation
```

## Support

For issues or questions:
- Check the README.md
- Review example outputs from test_agent.py
- Check API docs at /docs endpoint
- Review LangGraph execution in Studio
