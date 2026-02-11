"""
AstroDhar Backend API
FastAPI server for Vedic astrology calculations using Swiss Ephemeris.
"""
from __future__ import annotations

import os
import sys
import time
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, List, Optional

# Load environment variables from .env file
from dotenv import load_dotenv
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .schemas import BirthInput
from .chart import calculate_vedic_chart
from .match import compatibility_indicators
from .guna import calculate_guna_milan


app = FastAPI(
    title="AstroDhar API",
    description="Vedic astrology calculations and relationship compatibility indicators",
    version="2.0.0",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json",
)

# Create a router for all endpoints with the prefix
router = APIRouter(prefix="/api/py")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://astrodhar.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API
class BirthInputRequest(BaseModel):
    name: str = ""
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="YYYY-MM-DD")
    time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="HH:MM (24h)")
    tz: str = Field(default="Asia/Kolkata", description="IANA timezone")
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")


class CompatibilityRequest(BaseModel):
    partnerA: BirthInputRequest
    partnerB: BirthInputRequest


class ChartRequest(BaseModel):
    birth: BirthInputRequest
    high_precision: bool = False
    use_true_node: bool = False


# Helper to convert Pydantic to dataclass
def _to_birth_input(req: BirthInputRequest) -> BirthInput:
    return BirthInput(
        name=req.name,
        date=req.date,
        time=req.time,
        tz=req.tz,
        lat=req.lat,
        lon=req.lon,
    )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "ok": True,
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "engine": "swisseph",
    }


@router.post("/chart")
async def calculate_chart(req: ChartRequest):
    """Calculate a single Vedic birth chart."""
    try:
        t_start = time.time()
        birth = _to_birth_input(req.birth)
        chart = calculate_vedic_chart(
            birth,
            high_precision=req.high_precision,
            use_true_node=req.use_true_node,
        )
        t_chart = time.time()
        
        response = chart.to_dict()
        
        # Generate LLM insights (graceful fallback if timeout)
        try:
            from .llm_langchain import generate_chart_insights
            insights = generate_chart_insights(chart.to_dict())
            response["insights"] = insights
        except Exception as llm_error:
            # LLM failed/timed out - continue with chart data only
            print(f"⚠️  LLM insights generation failed (continuing without insights): {llm_error}")
            response["insights"] = "Chart calculated successfully. AI insights temporarily unavailable — please try refreshing."
        
        t_end = time.time()
        chart_time = round(t_chart - t_start, 1)
        llm_time = round(t_end - t_chart, 1)
        total_time = round(t_end - t_start, 1)
        print(f"⏱️  Chart: {chart_time}s | LLM: {llm_time}s | Total: {total_time}s")
        response["timing"] = {"chart": chart_time, "llm": llm_time, "total": total_time}
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart calculation failed: {str(e)}")


@router.post("/compatibility")
async def calculate_compatibility(req: CompatibilityRequest):
    """Calculate compatibility indicators and Guna matching between two charts."""
    try:
        t_start = time.time()
        birth_a = _to_birth_input(req.partnerA)
        birth_b = _to_birth_input(req.partnerB)

        chart_a = calculate_vedic_chart(birth_a)
        chart_b = calculate_vedic_chart(birth_b)

        # Calculate both indicator-based and traditional Guna matching
        indicators = compatibility_indicators(chart_a, chart_b)
        guna = calculate_guna_milan(chart_a, chart_b)
        t_chart = time.time()
        
        result = {
            "charts": {
                "partnerA": chart_a.to_dict(),
                "partnerB": chart_b.to_dict(),
            },
            "compatibility": indicators.to_dict(),
            "guna": guna.to_dict(),
        }

        # Generate LLM insights (graceful fallback if timeout)
        try:
            from .llm_langchain import generate_compatibility_insights
            insights = generate_compatibility_insights(result)
            result["insights"] = insights
        except Exception as llm_error:
            # LLM failed/timed out - continue with chart data only
            print(f"⚠️  LLM insights generation failed (continuing without insights): {llm_error}")
            result["insights"] = "Charts calculated successfully. AI insights temporarily unavailable — please try refreshing."
        
        t_end = time.time()
        chart_time = round(t_chart - t_start, 1)
        llm_time = round(t_end - t_chart, 1)
        total_time = round(t_end - t_start, 1)
        print(f"⏱️  Compat Chart: {chart_time}s | LLM: {llm_time}s | Total: {total_time}s")
        result["timing"] = {"chart": chart_time, "llm": llm_time, "total": total_time}
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compatibility calculation failed: {str(e)}")

# LLM Chat Endpoints
class ChartChatRequest(BaseModel):
    chart: Dict[str, Any]
    question: str
    history: List[Dict[str, str]] = []


class CompatibilityChatRequest(BaseModel):
    result: Dict[str, Any]
    question: str
    history: List[Dict[str, str]] = []


@router.post("/chat/chart")
async def chat_chart(req: ChartChatRequest):
    """Chat about a birth chart using LLM."""
    try:
        t_start = time.time()
        from .llm_langchain import chat_about_chart
        response = chat_about_chart(req.chart, req.question, req.history)
        t_end = time.time()
        print(f"⏱️  Chat: {round(t_end - t_start, 1)}s")
        return {"response": response, "timing": round(t_end - t_start, 1)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.post("/chat/compatibility")
async def chat_compatibility(req: CompatibilityChatRequest):
    """Chat about compatibility using LLM."""
    try:
        from .llm_langchain import chat_about_compatibility
        response = chat_about_compatibility(req.result, req.question, req.history)
        return {"response": response}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.post("/insights/chart")
async def generate_chart_insights_endpoint(req: ChartRequest):
    """Generate LLM insights for a chart."""
    try:
        birth = _to_birth_input(req.birth)
        chart = calculate_vedic_chart(birth)
        chart_dict = chart.to_dict()
        
        from .llm_langchain import generate_chart_insights
        insights = generate_chart_insights(chart_dict)
        
        return {
            "chart": chart_dict,
            "insights": insights,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")


@router.post("/insights/compatibility")
async def generate_compatibility_insights_endpoint(req: CompatibilityRequest):
    """Generate LLM insights for compatibility."""
    try:
        birth_a = _to_birth_input(req.partnerA)
        birth_b = _to_birth_input(req.partnerB)

        chart_a = calculate_vedic_chart(birth_a)
        chart_b = calculate_vedic_chart(birth_b)

        indicators = compatibility_indicators(chart_a, chart_b)
        guna = calculate_guna_milan(chart_a, chart_b)

        result = {
            "charts": {
                "partnerA": chart_a.to_dict(),
                "partnerB": chart_b.to_dict(),
            },
            "compatibility": indicators.to_dict(),
            "guna": guna.to_dict(),
        }
        
        from .llm_langchain import generate_compatibility_insights
        insights = generate_compatibility_insights(result)
        
        return {
            **result,
            "llm_insights": insights,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")


# Include the router
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

