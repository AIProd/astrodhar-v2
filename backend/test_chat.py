"""
Quick test to simulate a chat request
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Test chat
from llm_langchain import chat_about_chart

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

print("Testing chat_about_chart...")
try:
    response = chat_about_chart(sample_chart, "What career paths suit my chart?", [])
    print(f"\n✅ Chat successful!")
    print(f"Response: {response}\n")
except Exception as e:
    print(f"\n❌ Chat failed: {e}\n")
    import traceback
    traceback.print_exc()
