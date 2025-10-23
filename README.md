# ShopSage - Intelligent Supplier Research Agent

An AI-powered agent built with LangGraph that helps users research and evaluate product suppliers across online shopping platforms.

## Features

- **Smart Query Processing**: Extracts brand, model, and product details from natural language queries
- **Multi-Source Search**: Currently supports SerpAPI Google Shopping (extensible to other sources)
- **Intelligent Filtering**: Removes bundles, outliers, and irrelevant listings while preserving all metadata
- **Comprehensive Evaluation**: Scores products based on price, reviews, store reputation, and availability
- **Rich Metadata**: Preserves ALL data from search APIs for flexible UI rendering
- **Multi-LLM Support**: Swap between Gemini, OpenAI, and Anthropic easily

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

## Usage

### Run with LangGraph Studio

```bash
langgraph dev
```

Open LangGraph Studio and connect to visualize the agent execution.

### Run as API Server

```bash
python api/main.py
```

Send requests to `http://localhost:8000/research`:
```bash
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"query": "I want to buy sony wh1000xm6"}'
```

### Run Test Script

```bash
python test_agent.py
```

## Agent Flow

1. **Query Processing**: Extract product details using LLM
2. **Search**: Fetch results from SerpAPI Google Shopping
3. **Filter & Process**: Remove irrelevant listings, detect outliers
4. **Evaluate**: Score and rank products
5. **Format Response**: Return recommendations with rich metadata

## Configuration

Edit `.env` to configure:
- API keys (SerpAPI, LLM providers)
- LLM provider selection
- Filtering thresholds
- Result limits

## Project Structure

```
shopsage/
├── google_shopping_scraper/   # Main agent package
│   ├── agent.py              # LangGraph definition
│   ├── state.py              # State schema
│   ├── nodes/                # Processing nodes
│   ├── tools/                # API clients and utilities
│   ├── models/               # Data schemas
│   └── utils/                # Helper functions
├── api/                      # FastAPI server
├── requirements.txt
└── langgraph.json           # Studio configuration
```

## License

MIT
