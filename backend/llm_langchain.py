"""
LLM Service for AstroDhar - LangChain Implementation
Using LangChain for improved conversation management, memory, and prompt engineering.
Anthropic Claude via LangChain-Anthropic integration.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

# Load environment variables from parent directory (root)
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Configuration
MAX_CHAT_MESSAGES = int(os.getenv("MAX_CHAT_MESSAGES", "10"))

# LangChain imports
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser

# ============================================================================
# LLM PROVIDER CONFIGURATION
# ============================================================================

# Provider selection (anthropic or openai)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "anthropic").lower()

# Get API configuration based on provider
if LLM_PROVIDER == "anthropic":
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    ANTHROPIC_ENDPOINT = os.getenv("ANTHROPIC_ENDPOINT", "https://mohit-mj1tw6ni-eastus2.services.ai.azure.com/anthropic/")
    ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-opus-4-5")
    
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set")
    
    # Initialize LangChain Anthropic client
    llm = ChatAnthropic(
        model=ANTHROPIC_MODEL,
        api_key=ANTHROPIC_API_KEY,
        base_url=ANTHROPIC_ENDPOINT,
        max_tokens=1000,
        temperature=0.7,
    )
    
    # Higher token limit for insights generation
    llm_insights = ChatAnthropic(
        model=ANTHROPIC_MODEL,
        api_key=ANTHROPIC_API_KEY,
        base_url=ANTHROPIC_ENDPOINT,
        max_tokens=2000,  # Increased for rich narrative insights
        temperature=0.7,
    )
    
    print(f"✓ Using Anthropic Claude ({ANTHROPIC_MODEL})")

elif LLM_PROVIDER == "openai":
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_ENDPOINT = os.getenv("OPENAI_ENDPOINT")  # Azure OpenAI endpoint
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    # Dual deployment setup
    OPENAI_DEPLOYMENT_CHAT = os.getenv("OPENAI_DEPLOYMENT_CHAT", os.getenv("OPENAI_DEPLOYMENT", "gpt-4o-mini"))
    OPENAI_DEPLOYMENT_INSIGHTS = os.getenv("OPENAI_DEPLOYMENT_INSIGHTS", os.getenv("OPENAI_DEPLOYMENT", "gpt-5-mini"))
    OPENAI_API_VERSION = os.getenv("OPENAI_API_VERSION", "2024-12-01-preview")
    
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY environment variable not set")
    
    # Check if using Azure OpenAI or standard OpenAI
    if OPENAI_ENDPOINT:
        # Azure OpenAI
        from langchain_openai import AzureChatOpenAI
        
        llm = AzureChatOpenAI(
            deployment_name=OPENAI_DEPLOYMENT_CHAT,
            api_key=OPENAI_API_KEY,
            azure_endpoint=OPENAI_ENDPOINT,
            api_version=OPENAI_API_VERSION,
            #max_tokens=1000,
            # temperature not supported by gpt-5-mini (only supports default=1)
            timeout=60,
        )
        
        llm_insights = AzureChatOpenAI(
            deployment_name=OPENAI_DEPLOYMENT_INSIGHTS,
            api_key=OPENAI_API_KEY,
            azure_endpoint=OPENAI_ENDPOINT,
            api_version=OPENAI_API_VERSION,
            #max_tokens=2000,
            # temperature not supported by gpt-5-mini (only supports default=1)
            timeout=60,
        )
        
        print(f"✓ Using Azure OpenAI (Chat: {OPENAI_DEPLOYMENT_CHAT}, Insights: {OPENAI_DEPLOYMENT_INSIGHTS})")
    else:
        # Standard OpenAI
        llm = ChatOpenAI(
            model=OPENAI_MODEL,
            api_key=OPENAI_API_KEY,
            #max_tokens=1000,
            #temperature=0.7,
            timeout=60,
        )
        
        llm_insights = ChatOpenAI(
            model=OPENAI_MODEL,
            api_key=OPENAI_API_KEY,
            #max_tokens=2000,
            #temperature=0.7,
        )
        
        print(f"✓ Using OpenAI ({OPENAI_MODEL})")

else:
    raise ValueError(f"Invalid LLM_PROVIDER: {LLM_PROVIDER}. Must be 'anthropic' or 'openai'")

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_current_astrological_context() -> str:
    """Returns current date/year for astrological context in prompts."""
    now = datetime.utcnow()
    return f"Current Date: {now.strftime('%B %d, %Y')} (Year {now.year})"


# ============================================================================
# SYSTEM PROMPTS (externalized to environment variables)
# ============================================================================

# Default prompt for traits chat
DEFAULT_SYSTEM_PROMPT_TRAITS = """You are Jyotish Guru — a warm, knowledgeable Vedic astrologer.

YOUR STYLE:
- Use Vedic astrology terms naturally where they belong (dasha, nakshatra, kundli, rashi, yoga) — don't translate them, they ARE the right words
- Be personal and specific — always reference THEIR actual chart placements (planet, sign, house)
- Be honest — if a placement is challenging, say so kindly, then offer a practical remedy
- Sound like a knowledgeable friend, not a textbook

TEMPORAL AWARENESS:
- You know the current year and date
- Reference current dasha periods and transits when relevant

RESPONSE RULES:
- Keep responses 3-5 sentences — concise but warm
- Always ground your answer in SPECIFIC chart data (e.g. "Your Mars in the 10th house means...")
- End with a subtle hook — tease a related insight to keep them curious (e.g. "Your Venus placement also tells an interesting story about relationships...")
- Use plain text, no markdown
- Be actionable — when suggesting remedies, name the specific gemstone, mantra, or practice"""

# Load from environment or use default
SYSTEM_PROMPT_TRAITS = os.getenv("SYSTEM_PROMPT_TRAITS", DEFAULT_SYSTEM_PROMPT_TRAITS)

# Default prompt for compatibility/match chat
DEFAULT_SYSTEM_PROMPT_MATCH = """You are Jyotish Guru — a warm, knowledgeable Vedic astrologer specializing in relationship compatibility.

YOUR STYLE:
- Use Vedic terms naturally where they belong (Guna Milan, Manglik dosha, Bhakoot, Nadi)
- Be honest about challenges but always solution-oriented
- Sound supportive and compassionate

RESPONSE RULES:
- Keep responses 3-5 sentences — warm but practical
- Always reference the SPECIFIC Guna Milan scores and what they mean for this couple
- If doshas are present (Manglik, Nadi, Bhakoot), mention them clearly with remedies
- End with a hook — tease a deeper insight they can ask about
- When giving remedies, be specific: which gemstone for whom, which practice, when
- Use plain text, no markdown"""

# Load from environment or use default
SYSTEM_PROMPT_MATCH = os.getenv("SYSTEM_PROMPT_MATCH", DEFAULT_SYSTEM_PROMPT_MATCH)


# ============================================================================
# PROMPT TEMPLATES
# ============================================================================

# Chart chat prompt template
traits_chat_prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT_TRAITS),
    ("system", "{temporal_context}"),
    ("system", "Chart Data:\n{chart_context}"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])

# Compatibility chat prompt template
compatibility_chat_prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT_MATCH),
    ("system", "{temporal_context}"),
    ("system", "Compatibility Analysis:\n{compat_context}"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])

# Chart insights prompt template - RICH NARRATIVE FORMAT
# Default prompt for chart insights
DEFAULT_SYSTEM_PROMPT_INSIGHTS = """You are Jyotish Guru — a warm, insightful Vedic astrologer who creates engaging, scannable cosmic insights.

RULES:
- Use Vedic astrology terms naturally where they belong (dasha, nakshatra, yoga, rashi)
- Keep each section SHORT — 2-3 sentences max
- Be SPECIFIC to their chart — reference actual placements, not generic traits
- Include practical remedies (gemstone, mantra, fasting day)
- Total response ~300 words — scannable, not a wall of text
- Use plain text with emoji section headers only
- Be honest about challenges, then offer remedies"""

# Load from environment or use default
SYSTEM_PROMPT_INSIGHTS = os.getenv("SYSTEM_PROMPT_INSIGHTS", DEFAULT_SYSTEM_PROMPT_INSIGHTS)

# Chart insights prompt template - SCANNABLE SECTIONS FORMAT
chart_insights_prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT_INSIGHTS),
    ("system", "{temporal_context}"),
    ("human", """Chart Data:
{chart_context}

Create a cosmic insight reading following this EXACT structure. Keep each section to 2-3 sentences only:

[One-line headline capturing their unique cosmic identity]

[1-2 sentence warm greeting referencing their specific Ascendant and Moon sign]

🪷 Your Core Nature
[2-3 sentences about their core personality based on Ascendant, Sun, and key placements. Be specific to their chart.]

🌙 Your Inner World
[2-3 sentences about Moon sign, nakshatra, emotional patterns. What drives them emotionally.]

💼 Career & Purpose
[2-3 sentences about career indicators from their chart. Specific fields that suit them.]

💎 Lucky Elements
Gemstone: [specific stone based on chart] | Color: [lucky color] | Day: [auspicious day] | Mantra: [one specific mantra]

⏳ Current Dasha ({current_year})
[2-3 sentences about their current/upcoming dasha period and what it means practically.]

🔮 Questions to Explore
Here are things worth exploring about your chart:
• [Question about a specific placement — e.g., "Your Mars in Scorpio creates a powerful Ruchaka Yoga — ask me what this means for your career"]
• [Question about timing — e.g., "Your Saturn return is approaching — want to know how to prepare?"]
• [Question about relationships or health based on actual chart data]

Remember: Be PERSONAL and SPECIFIC. Use their actual planetary positions. Keep it under 300 words total.""")
])

# Compatibility insights prompt template
compatibility_insights_prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT_MATCH),
    ("system", "{temporal_context}"),
    ("human", """Analysis:
{compat_context}

Provide structured cosmic insights for this couple. Keep each section to 1-2 sentences:

💑 Relationship Energy: [1-2 sentences about overall compatibility and what the Guna Milan score means for them]

✨ Key Strengths: [1-2 sentences about the strongest aspects — mention their best Guna scores]

⚠️ Watch Out: [1-2 sentences about challenging aspects — mention specific doshas if present (Manglik, Nadi, Bhakoot)]

💎 Remedies: [2-3 specific remedies — gemstone for each partner, a mantra, or a specific practice]

Keep total response under 150 words. Use plain text, no markdown. Be specific about their scores.""")
])

# ============================================================================
# CHAINS (Prompt + LLM + Output Parser)
# ============================================================================

# Chat chains
traits_chain = traits_chat_prompt | llm | StrOutputParser()
compatibility_chain = compatibility_chat_prompt | llm | StrOutputParser()

# Insights chains (with higher token limit)
chart_insights_chain = chart_insights_prompt | llm_insights | StrOutputParser()
compatibility_insights_chain = compatibility_insights_prompt | llm_insights | StrOutputParser()


# ============================================================================
# DATA FORMATTING
# ============================================================================

def format_chart_context(chart: Dict[str, Any]) -> str:
    """Format chart data for LLM context."""
    name = chart.get("name", "the native")
    
    # Ascendant
    asc = chart.get("ascendant", {})
    asc_sign = asc.get("sign", "Unknown")
    
    # Moon
    moon = chart.get("moon", {})
    moon_sign = moon.get("sign", "Unknown")
    moon_nakshatra = moon.get("nakshatra", "Unknown")
    
    # Sun
    sun = chart.get("sun", {})
    sun_sign = sun.get("sign", "Unknown")
    
    context = f"""Name: {name}
Ascendant (Lagna): {asc_sign}
Sun: {sun_sign}
Moon: {moon_sign} in {moon_nakshatra} nakshatra"""
    
    # Add other planets if available
    planets = ["mercury", "venus", "mars", "jupiter", "saturn"]
    for planet in planets:
        if planet in chart:
            p_data = chart[planet]
            p_sign = p_data.get("sign", "Unknown")
            context += f"\n{planet.capitalize()}: {p_sign}"
    
    return context


def format_compatibility_context(result: Dict[str, Any]) -> str:
    """Format compatibility result for LLM context."""
    compat = result.get("compatibility", {})
    score = compat.get("overall_score_100", 0)
    label = compat.get("label", "Unknown")
    
    dims = compat.get("dimensions", {})
    emotional = dims.get("emotional", {}).get("score", 0)
    communication = dims.get("communication", {}).get("score", 0)
    attraction = dims.get("attraction", {}).get("score", 0)
    stability = dims.get("stability", {}).get("score", 0)
    
    # Guna Milan
    guna = result.get("guna", {})
    guna_score = guna.get("total_points", 0)
    guna_verdict = guna.get("verdict", "Unknown")
    
    # Partner basics
    charts = result.get("charts", {})
    partner_a = charts.get("partnerA", {})
    partner_b = charts.get("partnerB", {})
    
    a_name = partner_a.get("name", "Partner A")
    b_name = partner_b.get("name", "Partner B")
    a_moon = partner_a.get("moon", {}).get("sign", "Unknown")
    b_moon = partner_b.get("moon", {}).get("sign", "Unknown")
    
    context = f"""Partners: {a_name} and {b_name}
Moon Signs: {a_name} is {a_moon}, {b_name} is {b_moon}

Compatibility Score: {score}/100 ({label})
Emotional: {emotional}/100
Communication: {communication}/100
Attraction: {attraction}/100
Stability: {stability}/100

Guna Milan: {guna_score}/36 ({guna_verdict})"""
    
    return context


# ============================================================================
# MAIN API FUNCTIONS
# ============================================================================

def chat_about_chart(
    chart: Dict[str, Any],
    question: str,
    history: List[Dict[str, str]] = None
) -> str:
    """Generate LLM response about a birth chart using LangChain."""
    if history is None:
        history = []
    
    # Convert history to LangChain message format
    chat_history = []
    # Keep last N messages for context (configurable)
    history_limit = MAX_CHAT_MESSAGES
    for msg in history[-history_limit:]:
        if msg["role"] == "user":
            chat_history.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            chat_history.append(AIMessage(content=msg["content"]))
    
    try:
        # Invoke chain with LangChain
        response = traits_chain.invoke({
            "temporal_context": get_current_astrological_context(),
            "chart_context": format_chart_context(chart),
            "chat_history": chat_history,
            "question": question
        })
        return response
        
    except Exception as e:
        return f"I apologize, but I'm unable to provide insights at this moment. Error: {str(e)}"


def chat_about_compatibility(
    result: Dict[str, Any],
    question: str,
    history: List[Dict[str, str]] = None
) -> str:
    """Generate LLM response about compatibility using LangChain."""
    if history is None:
        history = []
    
    # Convert history to LangChain message format
    chat_history = []
    # Keep last N messages for context (configurable)
    history_limit = MAX_CHAT_MESSAGES
    for msg in history[-history_limit:]:
        if msg["role"] == "user":
            chat_history.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            chat_history.append(AIMessage(content=msg["content"]))
    
    try:
        # Invoke chain with LangChain
        response = compatibility_chain.invoke({
            "temporal_context": get_current_astrological_context(),
            "compat_context": format_compatibility_context(result),
            "chat_history": chat_history,
            "question": question
        })
        return response
        
    except Exception as e:
        return f"I apologize, but I'm unable to provide insights at this moment. Error: {str(e)}"


def generate_chart_insights(chart: Dict[str, Any]) -> str:
    """Generate automatic insights for a chart using LangChain."""
    temporal_context = get_current_astrological_context()
    current_year = temporal_context.split("(Year ")[1].split(")")[0]
    
    try:
        response = chart_insights_chain.invoke({
            "temporal_context": temporal_context,
            "chart_context": format_chart_context(chart),
            "current_year": current_year
        })
        return response
        
    except Exception as e:
        return None


def generate_compatibility_insights(result: Dict[str, Any]) -> str:
    """Generate automatic insights for compatibility using LangChain."""
    try:
        response = compatibility_insights_chain.invoke({
            "temporal_context": get_current_astrological_context(),
            "compat_context": format_compatibility_context(result),
        })
        return response
        
    except Exception as e:
        return None
