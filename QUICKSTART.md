# ShopSage Quick Start

## Get Running in 5 Minutes

### Step 1: Install Dependencies (1 min)

```bash
# Make sure you're in the project directory
cd D:\coding-projects\shopsage

# Activate virtual environment
venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### Step 2: Get API Keys (2 min)

#### Required: SerpAPI
1. Go to https://serpapi.com/
2. Sign up (free - 100 searches/month)
3. Copy your API key

#### Required: Google Gemini (Free)
1. Go to https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Create API key
4. Copy it

### Step 3: Configure (1 min)

```bash
# Copy example env file
copy .env.example .env

# Edit .env with your keys
notepad .env
```

Add your keys:
```env
SERPAPI_API_KEY=your_serpapi_key_here
GOOGLE_API_KEY=your_gemini_key_here
LLM_PROVIDER=gemini
```

### Step 4: Test (1 min)

```bash
python test_agent.py
```

You should see:
- ✅ Query analysis
- ✅ Search results
- ✅ Filtering statistics
- ✅ Top 5 recommendations
- ✅ Price insights
- ✅ Full results saved to JSON

## That's It! 🎉

## What to Try Next

### 1. Test with Different Queries

```bash
python test_agent.py "iPhone 15 Pro Max"
python test_agent.py "Sony PlayStation 5"
python test_agent.py "Sony WH1000XM6"
```

### 2. Start the API Server

```bash
python api/main.py
```

Then visit: http://localhost:8000/docs

### 3. Try LangGraph Studio

```bash
langgraph dev
```

Opens a visual interface to see the agent flow.

### 4. Use in Your Code

```python
from google_shopping_scraper.agent import run_research_agent

result = run_research_agent("sony wh1000xm6")

# Get top recommendation
top = result["recommendations"][0]
print(f"{top['title']}: ${top['extracted_price']}")
```

## Common Issues

### "No module named 'google_shopping_scraper'"
**Solution**: Make sure you're in the project root directory

### "SerpAPI API key is required"
**Solution**: Check your `.env` file has `SERPAPI_API_KEY=xxx`

### "GOOGLE_API_KEY environment variable required"
**Solution**: Check your `.env` file has `GOOGLE_API_KEY=xxx`

### Rate limit errors
**Solution**: Free tier has limits. Wait a bit or upgrade.

## Quick Reference

### Run agent directly
```python
from google_shopping_scraper.agent import run_research_agent
result = run_research_agent("query", max_results=20, top_n=5)
```

### Start API server
```bash
python api/main.py
# Then: POST http://localhost:8000/research
```

### Test with script
```bash
python test_agent.py "your query here"
```

### Launch Studio
```bash
langgraph dev
```

## Example API Call

```bash
curl -X POST http://localhost:8000/research \
  -H "Content-Type: application/json" \
  -d '{"query": "sony wh1000xm6", "max_results": 15, "top_n": 5}'
```

## What You Get

Every response includes:

✅ **Recommendations** - Top N products ranked by score
✅ **Alternative Options** - Other good choices
✅ **Rejected Products** - What was filtered out and why
✅ **Price Insights** - Min, max, median, recommended range
✅ **Recommendations Reasoning** - Pros/cons for each product
✅ **Filter Statistics** - What was removed and why
✅ **Processing Stats** - Performance metrics
✅ **Complete Original Data** - All SerpAPI fields preserved

## Directory Guide

```
test_agent.py           → Test the agent
api/main.py             → Start API server
google_shopping_scraper/agent.py  → Main agent logic
.env                    → Your API keys (create from .env.example)
requirements.txt        → Dependencies
langgraph.json          → Studio config
```

## Documentation

- **SETUP_GUIDE.md** - Detailed setup
- **USAGE_EXAMPLES.md** - Code examples
- **ARCHITECTURE.md** - How it works
- **PROJECT_SUMMARY.md** - Complete overview

## Help

If stuck, check:
1. Is `.env` file configured?
2. Are dependencies installed?
3. Are you in the right directory?
4. Is Python 3.10+ installed?

## Next Steps

1. ✅ Get it running (you're doing this now!)
2. Test with various queries
3. Explore the API docs
4. Try LangGraph Studio
5. Integrate into your platform

Happy researching! 🚀
