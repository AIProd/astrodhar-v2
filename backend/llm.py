"""
LLM Service for AstroDhar
Anthropic Claude (primary) / OpenAI (commented, switchable) powered astrological insights.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import List, Dict, Any, Optional

# Load environment variables from .env file
from dotenv import load_dotenv
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# ============================================================================
# ANTHROPIC (ACTIVE) - Claude via Azure AnthropicFoundry
# ============================================================================
from anthropic import AnthropicFoundry

anthropic_client: Optional[AnthropicFoundry] = None

def get_anthropic_client() -> AnthropicFoundry:
    """Get or create Anthropic client."""
    global anthropic_client
    if anthropic_client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        endpoint = os.getenv("ANTHROPIC_ENDPOINT", "https://mohit-mj1tw6ni-eastus2.services.ai.azure.com/anthropic/")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")
        anthropic_client = AnthropicFoundry(
            api_key=api_key,
            base_url=endpoint
        )
    return anthropic_client

# Model to use
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-opus-4-5")


# ============================================================================
# OPENAI (COMMENTED - for easy switching)
# ============================================================================
# from openai import OpenAI
# 
# openai_client: Optional[OpenAI] = None
# 
# def get_openai_client() -> OpenAI:
#     """Get or create OpenAI client."""
#     global openai_client
#     if openai_client is None:
#         api_key = os.getenv("OPENAI_API_KEY")
#         if not api_key:
#             raise ValueError("OPENAI_API_KEY environment variable not set")
#         openai_client = OpenAI(api_key=api_key)
#     return openai_client
# 
# OPENAI_MODEL = "gpt-4o-mini"
# ============================================================================


# Helper function for temporal context
def get_current_astrological_context() -> str:
    """Returns current date/year for astrological context in prompts."""
    from datetime import datetime
    now = datetime.utcnow()
    return f"Current Date: {now.strftime('%B %d, %Y')} (Year {now.year})"


# System prompts for different contexts - CONCISE for chat experience
SYSTEM_PROMPT_TRAITS = """You are Jyotish Guru, a friendly Vedic astrologer AI.

TEMPORAL AWARENESS:
- You are aware of the current year and date
- Consider current planetary transits when relevant
- Adjust advice based on current astrological timing

CRITICAL RULES:
- Keep responses SHORT (2-4 sentences max for chat, 1 paragraph for insights)
- Use plain text, avoid markdown formatting
- Be direct and practical
- Give specific advice based on the chart data
- Sound warm but brief

For questions: Answer directly in 2-3 sentences. No lengthy explanations.
For insights: One focused paragraph with key personality traits and one practical tip."""

SYSTEM_PROMPT_MATCH = """You are Jyotish Guru, a friendly Vedic astrologer AI for relationship guidance.

TEMPORAL AWARENESS:
- You are aware of the current year and date
- Consider current planetary transits when giving relationship advice
- Adjust remedies based on current astrological timing

CRITICAL RULES:
- Keep responses SHORT (2-4 sentences max for chat, 1 paragraph for insights)  
- Use plain text, avoid markdown formatting
- Be direct and solution-oriented
- Focus on practical remedies
- Sound compassionate but brief

For questions: Answer directly in 2-3 sentences with one actionable remedy.
For insights: One paragraph on relationship potential with one key remedy."""


def format_chart_context(chart: Dict[str, Any]) -> str:
    """Format chart data for LLM context."""
    name = chart.get("name", "the native")
    moon = chart.get("moon", {})
    ascendant = chart.get("ascendant", {})
    planets = chart.get("planets", [])
    
    lines = [
        f"**{name}'s Birth Chart:**",
        f"- Ascendant (Lagna): {ascendant.get('sign', 'Unknown')} at {ascendant.get('degree', 0):.1f}°",
        f"- Moon Nakshatra: {moon.get('nakshatra', 'Unknown')}, Pada {moon.get('pada', 1)}",
        "",
        "Planetary Positions:",
    ]
    
    for planet in planets:
        # Handle different field name variations
        name_field = planet.get('name', planet.get('planet', 'Unknown'))
        sign = planet.get('sign', 'Unknown')
        # Try multiple possible degree field names
        degree = planet.get('longitude_in_sign', planet.get('degree', planet.get('longitude', 0)))
        house = planet.get('house', planet.get('house_num', '?'))
        
        try:
            lines.append(f"- {name_field}: {sign} at {float(degree):.1f}° (House {house})")
        except (ValueError, TypeError):
            lines.append(f"- {name_field}: {sign} (House {house})")
    
    return "\n".join(lines)


def format_compatibility_context(result: Dict[str, Any]) -> str:
    """Format compatibility data for LLM context."""
    charts = result.get("charts", {})
    compat = result.get("compatibility", {})
    guna = result.get("guna", {})
    
    chart_a = charts.get("partnerA", {})
    chart_b = charts.get("partnerB", {})
    
    lines = [
        format_chart_context(chart_a),
        "",
        format_chart_context(chart_b),
        "",
        "**Compatibility Analysis:**",
        f"- Overall Indicator Score: {compat.get('overall_score_100', 0)}/100 ({compat.get('label', 'Unknown')})",
        f"- Guna Milan Score: {guna.get('total_points', 0)}/{guna.get('max_points', 36)} ({guna.get('verdict', 'Unknown')})",
        "",
        "Dimension Scores:",
        f"- Emotional: {compat.get('dimensions', {}).get('emotional', {}).get('score_100', 0)}/100",
        f"- Communication: {compat.get('dimensions', {}).get('communication', {}).get('score_100', 0)}/100",
        f"- Attraction: {compat.get('dimensions', {}).get('attraction', {}).get('score_100', 0)}/100",
        f"- Stability: {compat.get('dimensions', {}).get('stability', {}).get('score_100', 0)}/100",
        "",
        "Koota Details:",
    ]
    
    kootas = guna.get("kootas", {})
    for name, koota in kootas.items():
        lines.append(f"- {name.title()}: {koota.get('points', 0)}/{koota.get('max', 0)} - {koota.get('description', '')}")
    
    signals = compat.get("signals", [])
    if signals:
        lines.append("")
        lines.append("Signals:")
        for signal in signals[:5]:  # Limit to 5
            lines.append(f"- {signal}")
    
    return "\n".join(lines)


def chat_about_chart(
    chart: Dict[str, Any],
    question: str,
    history: List[Dict[str, str]] = None
) -> str:
    """Generate LLM response about a birth chart using Anthropic Claude."""
    if history is None:
        history = []
    
    chart_context = format_chart_context(chart)
    temporal_context = get_current_astrological_context()
    
    # Build messages for Anthropic
    messages = []
    
    # Add history (last 10 messages for better context)
    for msg in history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    # Add current question with enhanced context
    user_content = f"""{temporal_context}

Here is the chart you're analyzing:

{chart_context}

User question: {question}"""
    
    messages.append({"role": "user", "content": user_content})
    
    try:
        # ANTHROPIC (ACTIVE)
        response = get_anthropic_client().messages.create(
            model=ANTHROPIC_MODEL,
            system=SYSTEM_PROMPT_TRAITS,
            messages=messages,
            max_tokens=250,
        )
        return response.content[0].text
        
        # ----------------------------------------------------------------
        # OPENAI (COMMENTED - uncomment to switch)
        # ----------------------------------------------------------------
        # openai_messages = [
        #     {"role": "system", "content": SYSTEM_PROMPT_TRAITS},
        #     {"role": "system", "content": f"Chart:\n\n{chart_context}"},
        # ]
        # for msg in history[-10:]:
        #     openai_messages.append({"role": msg["role"], "content": msg["content"]})
        # openai_messages.append({"role": "user", "content": question})
        # 
        # response = get_openai_client().chat.completions.create(
        #     model=OPENAI_MODEL,
        #     messages=openai_messages,
        #     temperature=0.7,
        #     max_tokens=1000,
        # )
        # return response.choices[0].message.content
        # ----------------------------------------------------------------
        
    except Exception as e:
        return f"I apologize, but I'm unable to provide insights at this moment. Error: {str(e)}"


def chat_about_compatibility(
    result: Dict[str, Any],
    question: str,
    history: List[Dict[str, str]] = None
) -> str:
    """Generate LLM response about compatibility using Anthropic Claude."""
    if history is None:
        history = []
    
    compat_context = format_compatibility_context(result)
    temporal_context = get_current_astrological_context()
    
    # Build messages for Anthropic
    messages = []
    
    # Add history (last 10 messages for better context)
    for msg in history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    # Add current question with enhanced context
    user_content = f"""{temporal_context}

Here is the compatibility analysis:

{compat_context}

User question: {question}"""
    
    messages.append({"role": "user", "content": user_content})
    
    try:
        # ANTHROPIC (ACTIVE)
        response = get_anthropic_client().messages.create(
            model=ANTHROPIC_MODEL,
            system=SYSTEM_PROMPT_MATCH,
            messages=messages,
            max_tokens=250,
        )
        return response.content[0].text
        
        # ----------------------------------------------------------------
        # OPENAI (COMMENTED - uncomment to switch)
        # ----------------------------------------------------------------
        # openai_messages = [
        #     {"role": "system", "content": SYSTEM_PROMPT_MATCH},
        #     {"role": "system", "content": f"Analysis:\n\n{compat_context}"},
        # ]
        # for msg in history[-10:]:
        #     openai_messages.append({"role": msg["role"], "content": msg["content"]})
        # openai_messages.append({"role": "user", "content": question})
        # 
        # response = get_openai_client().chat.completions.create(
        #     model=OPENAI_MODEL,
        #     messages=openai_messages,
        #     temperature=0.7,
        #     max_tokens=1000,
        # )
        # return response.choices[0].message.content
        # ----------------------------------------------------------------
        
    except Exception as e:
        return f"I apologize, but I'm unable to provide insights at this moment. Error: {str(e)}"


def generate_chart_insights(chart: Dict[str, Any]) -> str:
    """Generate automatic insights for a chart (used for initial display)."""
    chart_context = format_chart_context(chart)
    temporal_context = get_current_astrological_context()
    
    prompt = f"""{temporal_context}

Provide structured cosmic insights for this person with these EXACT sections:

🌟 Personality: [1-2 sentences about their core nature based on Ascendant and Moon nakshatra]

💼 Career: [1 sentence about suitable career paths or professional strengths]

❤️ Relationships: [1 sentence about their relationship approach and compatibility]

📅 Current Phase: [1 sentence about current transits or timing for {temporal_context.split('(Year ')[1].split(')')[0]}]

Keep each section concise and actionable. Use plain text, no markdown."""
    
    try:
        # ANTHROPIC (ACTIVE)
        response = get_anthropic_client().messages.create(
            model=ANTHROPIC_MODEL,
            system=SYSTEM_PROMPT_TRAITS,
            messages=[
                {"role": "user", "content": f"Chart:\n\n{chart_context}\n\n{prompt}"}
            ],
            max_tokens=400,
        )
        return response.content[0].text
        
    except Exception as e:
        return None


def generate_compatibility_insights(result: Dict[str, Any]) -> str:
    """Generate automatic insights for compatibility (used for initial display)."""
    compat_context = format_compatibility_context(result)
    temporal_context = get_current_astrological_context()
    
    prompt = f"""{temporal_context}

Provide structured cosmic insights for this couple with these EXACT sections:

💑 Overall Dynamic: [1-2 sentences about the relationship potential and energy]

✨ Strengths: [1 sentence about the key positive aspects of this match]

🌱 Growth Areas: [1 sentence about aspects to work on or challenges]

🔮 Remedies: [1 sentence with one practical remedy to strengthen the bond]

Keep each section concise and actionable. Use plain text, no markdown."""
    
    try:
        # ANTHROPIC (ACTIVE)
        response = get_anthropic_client().messages.create(
            model=ANTHROPIC_MODEL,
            system=SYSTEM_PROMPT_MATCH,
            messages=[
                {"role": "user", "content": f"Analysis:\n\n{compat_context}\n\n{prompt}"}
            ],
            max_tokens=400,
        )
        return response.content[0].text
        
    except Exception as e:
        return None

