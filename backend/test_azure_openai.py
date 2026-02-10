"""
Test Azure OpenAI Configuration
Verifies that Azure OpenAI is properly configured and working.
"""
import os
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Load env
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

def test_azure_openai_config():
    """Test Azure OpenAI configuration."""
    print("\n🔍 Testing Azure OpenAI Configuration...\n")
    
    # Check 1: Environment variables
    print("1. Environment Variables:")
    provider = os.getenv("LLM_PROVIDER")
    endpoint = os.getenv("OPENAI_ENDPOINT")
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL")
    deployment = os.getenv("OPENAI_DEPLOYMENT")
    api_version = os.getenv("OPENAI_API_VERSION")
    
    print(f"   LLM_PROVIDER: {provider}")
    print(f"   OPENAI_ENDPOINT: {endpoint}")
    print(f"   OPENAI_API_KEY: {api_key[:20]}... (hidden)")
    print(f"   OPENAI_MODEL: {model}")
    print(f"   OPENAI_DEPLOYMENT: {deployment}")
    print(f"   OPENAI_API_VERSION: {api_version}")
    
    if provider != "openai":
        print(f"\n   ⚠️  Warning: LLM_PROVIDER is '{provider}', not 'openai'")
        print(f"   → To use Azure OpenAI, set LLM_PROVIDER=openai in .env")
        return False
    
    if not endpoint:
        print("\n   ⚠️  No Azure endpoint configured")
        print("   → Will use standard OpenAI instead")
    else:
        print("\n   ✅ Azure OpenAI endpoint configured")
    
    # Check 2: Import llm module
    print("\n2. Loading LLM Module:")
    try:
        from llm_langchain import llm, llm_insights, LLM_PROVIDER as LOADED_PROVIDER
        print(f"   ✅ Module loaded successfully")
        print(f"   Provider: {LOADED_PROVIDER}")
        print(f"   LLM type: {type(llm).__name__}")
        print(f"   Insights LLM type: {type(llm_insights).__name__}")
        
        if "Azure" in type(llm).__name__:
            print("\n   ✅ Using AzureChatOpenAI - Azure endpoint active!")
        else:
            print("\n   ℹ️  Using standard ChatOpenAI")
    except Exception as e:
        print(f"   ❌ Failed to load: {e}")
        return False
    
    # Check 3: Test API call
    print("\n3. Testing API Call:")
    try:
        from langchain_core.messages import HumanMessage
        
        response = llm.invoke([HumanMessage(content="Say 'Hello from Azure OpenAI!' in one sentence.")])
        print(f"   ✅ API call successful!")
        print(f"   Response: {response.content}")
        
        # Check response metadata
        if hasattr(response, 'response_metadata'):
            metadata = response.response_metadata
            print(f"\n   Response Metadata:")
            print(f"   - Model: {metadata.get('model_name', 'N/A')}")
            print(f"   - Tokens: {metadata.get('token_usage', {}).get('total_tokens', 'N/A')}")
    except Exception as e:
        print(f"   ❌ API call failed: {e}")
        print(f"   → Check your Azure OpenAI deployment and API key")
        return False
    
    # All tests passed!
    print("\n" + "="*50)
    print("✅ All tests passed! Azure OpenAI is working!")
    print("="*50 + "\n")
    return True

if __name__ == "__main__":
    test_azure_openai_config()
