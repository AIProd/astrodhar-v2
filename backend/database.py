"""
Database integration with Supabase
Handles all database operations for charts, conversations, and logging.
"""
from __future__ import annotations

import os
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from parent directory (root)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Import Supabase client
try:
    from supabase import create_client, Client
    
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    if SUPABASE_URL and SUPABASE_KEY:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        SUPABASE_ENABLED = True
        print("✓ Supabase connected")
    else:
        supabase = None
        SUPABASE_ENABLED = False
        print("⚠ Supabase not configured (set SUPABASE_URL and SUPABASE_KEY)")
except ImportError:
    supabase = None
    SUPABASE_ENABLED = False
    print("⚠ Supabase not installed (pip install supabase)")


# ============================================================================
# BIRTH CHARTS
# ============================================================================

async def save_birth_chart(
    chart_data: Dict[str, Any],
    session_id: str,
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> Optional[str]:
    """Save a calculated birth chart to database."""
    if not SUPABASE_ENABLED:
        return None
    
    try:
        # Extract birth info from chart
        name = chart_data.get("name", "")
        
        # Parse birth details (if available)
        # You might want to pass these separately
        birth_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "session_id": session_id,
            "name": name,
            "chart_data": chart_data,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("birth_charts").insert(birth_data).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error saving birth chart: {e}")
        return None


# ============================================================================
# COMPATIBILITY QUERIES
# ============================================================================

async def save_compatibility_query(
    compatibility_data: Dict[str, Any],
    session_id: str,
    chart_a_id: Optional[str] = None,
    chart_b_id: Optional[str] = None,
    user_id: Optional[str] = None
) -> Optional[str]:
    """Save a compatibility calculation to database."""
    if not SUPABASE_ENABLED:
        return None
    
    try:
        compat = compatibility_data.get("compatibility", {})
        guna = compatibility_data.get("guna", {})
        
        query_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "session_id": session_id,
            "chart_a_id": chart_a_id,
            "chart_b_id": chart_b_id,
            "overall_score": compat.get("overall_score_100", 0),
            "guna_score": guna.get("total_points", 0),
            "compatibility_data": compatibility_data,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("compatibility_queries").insert(query_data).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error saving compatibility query: {e}")
        return None


# ============================================================================
# CHAT CONVERSATIONS
# ============================================================================

async def create_conversation(
    session_id: str,
    conversation_type: str,  # 'traits' or 'compatibility'
    chart_id: Optional[str] = None,
    compatibility_id: Optional[str] = None,
    user_id: Optional[str] = None
) -> Optional[str]:
    """Create a new chat conversation record."""
    if not SUPABASE_ENABLED:
        return None
    
    try:
        conversation_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "session_id": session_id,
            "chart_id": chart_id,
            "compatibility_id": compatibility_id,
            "conversation_type": conversation_type,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("chat_conversations").insert(conversation_data).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error creating conversation: {e}")
        return None


async def save_chat_message(
    conversation_id: str,
    role: str,  # 'user' or 'assistant'
    content: str,
    llm_provider: Optional[str] = None,
    llm_model: Optional[str] = None,
    tokens_used: Optional[int] = None,
    latency_ms: Optional[int] = None
) -> Optional[str]:
    """Save a chat message to database."""
    if not SUPABASE_ENABLED:
        return None
    
    try:
        message_data = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "llm_provider": llm_provider,
            "llm_model": llm_model,
            "tokens_used": tokens_used,
            "latency_ms": latency_ms,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("chat_messages").insert(message_data).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error saving chat message: {e}")
        return None


# ============================================================================
# API LOGGING
# ============================================================================

async def log_api_call(
    endpoint: str,
    method: str,
    session_id: str,
    status_code: int,
    response_time_ms: int,
    error_message: Optional[str] = None,
    error_stack: Optional[str] = None,
    llm_provider: Optional[str] = None,
    llm_tokens: Optional[int] = None,
    ip_address: Optional[str] = None
) -> Optional[str]:
    """Log an API call for analytics and debugging."""
    if not SUPABASE_ENABLED:
        return None
    
    try:
        log_data = {
            "id": str(uuid.uuid4()),
            "endpoint": endpoint,
            "method": method,
            "session_id": session_id,
            "status_code": status_code,
            "response_time_ms": response_time_ms,
            "error_message": error_message,
            "error_stack": error_stack,
            "llm_provider": llm_provider,
            "llm_tokens": llm_tokens,
            "ip_address": ip_address,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("api_logs").insert(log_data).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error logging API call: {e}")
        return None


# ============================================================================
# FEEDBACK
# ============================================================================

async def save_feedback(
    session_id: str,
    feedback_content: str,
    feedback_type: str = "text",  # 'email', 'rating', 'text'
    rating: Optional[int] = None,
    conversation_id: Optional[str] = None
) -> Optional[str]:
    """Save user feedback."""
    if not SUPABASE_ENABLED:
        return None
    
    try:
        feedback_data = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "conversation_id": conversation_id,
            "feedback_type": feedback_type,
            "feedback_content": feedback_content,
            "rating": rating,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("feedback").insert(feedback_data).execute()
        return result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Error saving feedback: {e}")
        return None


# ============================================================================
# ANALYTICS QUERIES
# ============================================================================

def get_daily_active_users(days: int = 7) -> List[Dict[str, Any]]:
    """Get daily active users for the past N days."""
    if not SUPABASE_ENABLED:
        return []
    
    try:
        result = supabase.rpc('get_daily_active_users', {'days': days}).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Error fetching DAU: {e}")
        return []


def get_popular_questions(limit: int = 20) -> List[Dict[str, Any]]:
    """Get most commonly asked questions."""
    if not SUPABASE_ENABLED:
        return []
    
    try:
        result = supabase.rpc('get_popular_questions', {'question_limit': limit}).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Error fetching popular questions: {e}")
        return []
