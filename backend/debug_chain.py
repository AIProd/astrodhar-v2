"""
Debug chain invocation directly
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

from llm_langchain import traits_chain, format_chart_context, get_current_astrological_context

# Sample chart
sample_chart = {
    "name": "Test User",
    "ascendant": {"sign": "Aries"},
    "sun": {"sign": "Leo"},
    "moon": {"sign": "Cancer", "nakshatra": "Pushya"},
}

print("\n=== DEBUG CHAIN INVOCATION ===\n")

print("1. Invoking chain with empty history...")
try:
    result = traits_chain.invoke({
        "temporal_context": get_current_astrological_context(),
        "chart_context": format_chart_context(sample_chart),
        "chat_history": [],
        "question": "What career paths suit my chart?"
    })
    print(f"   Result type: {type(result)}")
    print(f"   Result length: {len(result)}")
    print(f"   Result content: '{result}'")
    print(f"   Result repr: {repr(result)}")
except Exception as e:
    print(f"   Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*50 + "\n")
