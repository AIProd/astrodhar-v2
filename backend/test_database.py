"""
Test Supabase Database Connection
Run this to verify your database connection is working.
"""
from database import SUPABASE_ENABLED, supabase
import asyncio

def test_connection():
    """Test basic Supabase connection."""
    print("\n🔍 Testing Supabase Connection...\n")
    
    # Check 1: Is Supabase configured?
    print("1. Configuration Check:")
    if not SUPABASE_ENABLED:
        print("   ❌ Supabase NOT configured")
        print("   → Make sure SUPABASE_URL and SUPABASE_KEY are in .env file")
        return False
    print("   ✅ Supabase configured")
    
    # Check 2: Can we connect?
    print("\n2. Connection Test:")
    try:
        # Simple ping - fetch one row from any table
        result = supabase.table('api_logs').select('id').limit(1).execute()
        print("   ✅ Connection successful")
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        print("   → Check your SUPABASE_URL and SUPABASE_KEY")
        return False
    
    # Check 3: Can we write data?
    print("\n3. Write Test:")
    try:
        from database import log_api_call
        test_id = asyncio.run(log_api_call(
            endpoint="/test",
            method="GET",
            session_id="test-session",
            status_code=200,
            response_time_ms=100
        ))
        if test_id:
            print(f"   ✅ Write successful (ID: {test_id[:8]}...)")
        else:
            print("   ⚠️  Write returned None (check function)")
    except Exception as e:
        print(f"   ❌ Write failed: {e}")
        return False
    
    # Check 4: Can we read data?
    print("\n4. Read Test:")
    try:
        result = supabase.table('api_logs').select('*').limit(5).execute()
        count = len(result.data) if result.data else 0
        print(f"   ✅ Read successful ({count} rows found)")
        
        if count > 0:
            print("\n   Recent API Logs:")
            for row in result.data[:3]:
                print(f"   - {row.get('endpoint')} ({row.get('status_code')})")
    except Exception as e:
        print(f"   ❌ Read failed: {e}")
        return False
    
    # All tests passed!
    print("\n" + "="*50)
    print("✅ All tests passed! Database is working perfectly!")
    print("="*50 + "\n")
    return True

if __name__ == "__main__":
    test_connection()
