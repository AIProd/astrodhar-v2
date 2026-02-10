# AstroDhar - Vedic Astrology Web Application

A modern web application for Vedic astrology compatibility analysis using Swiss Ephemeris.

## Architecture

```
astrodhar/
├── app/                    # Next.js App Router (frontend)
├── components/             # React components
├── lib/                    # TypeScript utilities
└── backend/                # Python FastAPI (astrology engine)
    ├── main.py             # API endpoints
    ├── schemas.py          # Data structures
    ├── chart.py            # Swiss Ephemeris calculations
    └── match.py            # Compatibility indicators
```

## Quick Start

### 1. Install Frontend Dependencies
```bash
cd /home/mohit/.gemini/antigravity/scratch/astrodhar
npm install
```

### 2. Install Python Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start Python Backend (Terminal 1)
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 4. Start Next.js Frontend (Terminal 2)
```bash
npm run dev
```

### 5. Open Browser
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

### 6. Quick Test Endpoints (Pre-filled Data)
For quick testing without manual data entry:
- **Test Traits**: http://localhost:3000/test-traits
- **Test Match**: http://localhost:3000/test-match

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check (checks Python backend) |
| `/api/compatibility` | POST | Calculate compatibility (proxies to Python) |
| `/health` (Python) | GET | Python backend health |
| `/chart` (Python) | POST | Calculate single birth chart |
| `/compatibility` (Python) | POST | Full compatibility analysis |

## Features

- **100-point Compatibility Score**: Based on Moon, Mercury, Venus-Mars, Saturn indicators
- **4 Dimension Breakdown**: Emotional, Communication, Attraction, Stability
- **Full Birth Charts**: Planets, ascendant, nakshatra positions
- **Explainable Insights**: Detailed signals with explanations
- **Preset Cities**: Quick selection with pre-filled coordinates
- **Dark/Light Mode**: Toggle in header

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | FastAPI, Python 3.11+ |
| Astrology | Swiss Ephemeris (pyswisseph) |
| Ayanamsa | Lahiri (Chitrapaksha) |
| Houses | Whole Sign |

## Environment Variables

Create `.env.local`:
```env
PYTHON_API_URL=http://localhost:8000
```

## Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Railway/Render)
Use the `backend/` folder with Python buildpack.

Set `PYTHON_API_URL` in Vercel to point to your deployed Python backend URL.
