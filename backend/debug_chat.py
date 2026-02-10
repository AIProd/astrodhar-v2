"""
Debug test - check what's actually being returned
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

from llm_langchain import llm, chat_about_chart, format_chart_context, get_current_astrological_context
from langchain_core.messages import HumanMessage

# Sample chart
sample_chart = {
    "name": "Test User",
    "ascendant": {"sign": "Aries"},
    "sun": {"sign": "Leo"},
    "moon": {"sign": "Cancer", "nakshatra": "Pushya"},
    "mercury": {"sign": "Virgo"},
    "venus": {"sign": "Libra"},
    "mars": {"sign": "Scorpio"},
    "jupiter": {"sign": "Sagittarius"},
    "saturn": {"sign": "Capricorn"}
}

print("\n=== DEBUG AZURE OPENAI ===\n")

# Test 1: Direct LLM call
print("1. Testing direct LLM call...")
try:
    response = llm.invoke([HumanMessage(content="Say 'Hello' in one word.")])
    print(f"   Response type: {type(response)}")
    print(f"   Response content: '{response.content}'")
    print(f"   Response length: {len(response.content)}")
except Exception as e:
    print(f"   Error: {e}")

# Test 2: Check context formatting
print("\n2. Checking context formatting...")
chart_ctx = format_chart_context(sample_chart)
temporal_ctx = get_current_astrological_context()
print(f"   Chart context length: {len(chart_ctx)}")
print(f"   Temporal context length: {len(temporal_ctx)}")
print(f"   Chart context preview: {chart_ctx[:100]}...")

# Test 3: Full chat test
print("\n3. Testing full chat_about_chart...")
response = chat_about_chart(sample_chart, "What career paths suit my chart?", [])
print(f"   Response type: {type(response)}")
print(f"   Response length: {len(response)}")
print(f"   Response content: '{response}'")

print("\n" + "="*50 + "\n")
