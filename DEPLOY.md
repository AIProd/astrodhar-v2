# AstroDhar Deployment Guide

## 1. Push to GitHub

Since you have initialized the local git repository, you need to push it to a remote GitHub repository.

1.  Create a **new empty repository** on GitHub (e.g., `astrodhar-v2`).
2.  Run the following commands in your terminal (inside the project folder):

```bash
git remote add origin https://github.com/YOUR_USERNAME/astrodhar-v2.git
git branch -M main
git push -u origin main
```

## 2. Deploy to Vercel

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2.  Select your `astrodhar-v2` repository and click **Import**.
3.  **Configure Project:**
    *   **Framework Preset:** Next.js (should be auto-detected).
    *   **Root Directory:** `./` (default).
    *   **Build Command:** `next build` (default).
    *   **Output Directory:** `.next` (default).
4.  **Environment Variables:**
    Copy the values from your local `.env`. Important ones:
    *   `OPENAI_API_KEY`: ...
    *   `OPENAI_ENDPOINT`: ...
    *   `OPENAI_MODEL`: `gpt-4o-mini`
    *   `OPENAI_DEPLOYMENT_CHAT`: `gpt-4o-mini`
    *   `OPENAI_DEPLOYMENT_INSIGHTS`: `gpt-5-mini`
    *   `OPENAI_API_VERSION`: `2024-12-01-preview`
    *   `LLM_PROVIDER`: `openai`
    *   `SUPABASE_URL`: ...
    *   `SUPABASE_KEY`: ...
    *   `PYTHON_API_URL`: **Set this to `/api/py`** (This ensures the frontend talks to the Vercel serverless backend at the correct path).
    *   `MAX_CHAT_MESSAGES`: `10`
5.  Click **Deploy**.

## 3. Verify on Vercel

Once deployed:
- Go to the deployed URL.
- Try generating a chart (this hits `/api/chart`).
- Try the chat (this hits `/api/chat`).

## Technical Notes
- **API Routing:** `vercel.json` is configured to route all `/api/*` requests to the Python backend at `api/index.py`.
- **Python Runtime:** Vercel will automatically detect `requirements.txt` and install Python dependencies.
- **Frontend:** Next.js pages are served as usual.
