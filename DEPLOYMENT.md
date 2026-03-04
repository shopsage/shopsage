# ShopSage Production Deployment Guide

## What you'll use
- **Vercel** — Next.js frontend (free)
- **Railway** — FastAPI backend + PostgreSQL (free hobby tier, ~$5/mo after)

---

## Step 0 — Push to GitHub

If the repo isn't on GitHub yet:

```bash
cd C:/coding-projects/shopsage
git init          # skip if already a repo
git add .
git commit -m "prep for deployment"
```

Go to [github.com/new](https://github.com/new), create a **private** repo called `shopsage`, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/shopsage.git
git push -u origin main
```

---

## Step 1 — Deploy the Backend on Railway

1. Go to [railway.app](https://railway.app) → **Sign up with GitHub**

2. Click **New Project → Deploy from GitHub repo** → select `shopsage`

3. Railway will detect Python. Before it deploys, click **Settings** on the service:
   - **Root Directory**: leave empty (project root)
   - **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`

4. **Add PostgreSQL**: In the project dashboard → **New** → **Database** → **PostgreSQL**. Railway auto-provisions it and injects `DATABASE_URL` into your backend service. You don't need to do anything else for the DB.

5. Go to your backend service → **Variables** tab → add every variable from the table below.

6. Click **Deploy**. Wait ~2 minutes. Once green, go to **Settings → Networking → Generate Domain**. Copy that URL — it looks like `https://shopsage-production.up.railway.app`. You'll need it for Step 2.

### Backend environment variables (paste into Railway Variables tab)

| Variable | Value |
|---|---|
| `JWT_SECRET` | Run `python -c "import secrets; print(secrets.token_hex(32))"` locally, paste result |
| `SERPAPI_API_KEY` | Your SerpAPI key |
| `GOOGLE_SEARCH_API_KEY` | Your Google Search API key |
| `GOOGLE_CSE_ID` | Your Google CSE ID |
| `REDDIT_CLIENT_ID` | Your Reddit client ID |
| `REDDIT_CLIENT_SECRET` | Your Reddit client secret |
| `GOOGLE_API_KEY` | Your Gemini API key |
| `LLM_PROVIDER` | `gemini` |
| `MAX_SEARCH_RESULTS` | `20` |
| `TOP_RECOMMENDATIONS` | `5` |
| `FILTER_BRAND_THRESHOLD` | `0.7` |
| `PRICE_OUTLIER_STD` | `3.0` |

> `DATABASE_URL` is injected automatically by Railway PostgreSQL — do **not** add it manually.

---

## Step 2 — Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**

2. Click **Add New Project** → Import `shopsage`

3. Vercel will ask for configuration:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: click **Edit** → type `frontend/shopsage-app`
   - Leave everything else default

4. Before deploying, expand **Environment Variables** and add:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://shopsage-production.up.railway.app` ← your Railway URL from Step 1 |

5. Click **Deploy**. Done. Vercel gives you a URL like `https://shopsage.vercel.app`.

---

## Step 3 — Verify it works

1. Open your Vercel URL
2. Sign up for an account
3. Search for a product — it should call your Railway backend and return results
4. Check Railway logs (service → **Logs** tab) if anything errors

---

## Troubleshooting

**CORS error in browser console**
The backend already allows all origins (`"*"`), so this shouldn't happen. If it does, check that `NEXT_PUBLIC_API_URL` doesn't have a trailing slash.

**502/503 from Railway on first request**
The first cold start after inactivity can take ~10s. Subsequent requests are fast.

**`DATABASE_URL` not found**
Make sure the PostgreSQL service is in the same Railway *project* as the backend service (not a separate project). Railway auto-links services within the same project.

**LangGraph checkpoint error**
`langgraph-checkpoint-sqlite` stores agent state in a local SQLite file during a run. This is ephemeral (per-request) so it's fine on Railway — no persistent volume needed for this.

---

## Redeployments

- **Backend changes**: `git push` to `main` → Railway auto-redeploys
- **Frontend changes**: `git push` → Vercel auto-redeploys
- **New env var**: add in Railway/Vercel dashboard → trigger a manual redeploy
