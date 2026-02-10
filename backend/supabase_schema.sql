-- AstroDhar Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up all tables

-- ============================================================================
-- Enable UUID generation
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: users (optional, for future authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: birth_charts
-- Store all calculated birth charts for analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS birth_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  
  -- Birth information
  name TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT,
  
  -- Full chart data as JSONB
  chart_data JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Indexes for birth_charts
CREATE INDEX IF NOT EXISTS idx_birth_charts_session ON birth_charts(session_id);
CREATE INDEX IF NOT EXISTS idx_birth_charts_created ON birth_charts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_birth_charts_user ON birth_charts(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- TABLE: compatibility_queries
-- Store compatibility calculations
-- ============================================================================
CREATE TABLE IF NOT EXISTS compatibility_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  
  chart_a_id UUID REFERENCES birth_charts(id) ON DELETE SET NULL,
  chart_b_id UUID REFERENCES birth_charts(id) ON DELETE SET NULL,
  
  -- Key scores
  overall_score INTEGER,
  guna_score INTEGER,
  
  -- Full compatibility data as JSONB
  compatibility_data JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for compatibility_queries
CREATE INDEX IF NOT EXISTS idx_compatibility_session ON compatibility_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_created ON compatibility_queries(created_at DESC);

-- ============================================================================
-- TABLE: chat_conversations
-- Store chat conversation metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  
  chart_id UUID REFERENCES birth_charts(id) ON DELETE SET NULL,
  compatibility_id UUID REFERENCES compatibility_queries(id) ON DELETE SET NULL,
  
  conversation_type TEXT CHECK (conversation_type IN ('traits', 'compatibility')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Indexes for chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conv_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_created ON chat_conversations(created_at DESC);

-- ============================================================================
-- TABLE: chat_messages
-- Store individual messages in conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  
  -- LLM metadata
  llm_provider TEXT,
  llm_model TEXT,
  tokens_used INTEGER,
  latency_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at DESC);

-- ============================================================================
-- TABLE: api_logs
-- Track all API calls for debugging and analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Request info
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  session_id TEXT,
  
  -- Response info
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  
  -- Error tracking
  error_message TEXT,
  error_stack TEXT,
  
  -- LLM metadata
  llm_provider TEXT,
  llm_tokens INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET
);

-- Indexes for api_logs
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_errors ON api_logs(status_code) WHERE status_code >= 400;
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_logs(created_at DESC);

-- ============================================================================
-- TABLE: feedback
-- Store user feedback
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE SET NULL,
  
  feedback_type TEXT CHECK (feedback_type IN ('email', 'rating', 'text')),
  feedback_content TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for feedback
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);

-- ============================================================================
-- ANALYTICS FUNCTIONS
-- ============================================================================

-- Function: Get daily active users
CREATE OR REPLACE FUNCTION get_daily_active_users(days INTEGER DEFAULT 7)
RETURNS TABLE (
  date DATE,
  active_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT session_id) as active_users
  FROM api_logs
  WHERE created_at > NOW() - (days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get popular questions
CREATE OR REPLACE FUNCTION get_popular_questions(question_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  question TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    content as question,
    COUNT(*) as count
  FROM chat_messages
  WHERE role = 'user'
  GROUP BY content
  ORDER BY count DESC
  LIMIT question_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get average conversation length
CREATE OR REPLACE FUNCTION get_avg_conversation_length()
RETURNS TABLE (
  avg_messages NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT AVG(message_count)::NUMERIC
  FROM (
    SELECT conversation_id, COUNT(*) as message_count
    FROM chat_messages
    GROUP BY conversation_id
  ) sub;
END;
$$ LANGUAGE plpgsql;

-- Function: Get LLM provider costs estimate
CREATE OR REPLACE FUNCTION get_llm_costs()
RETURNS TABLE (
  provider TEXT,
  total_tokens BIGINT,
  estimated_cost_usd NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    llm_provider as provider,
    SUM(tokens_used) as total_tokens,
    (SUM(tokens_used) / 1000000.0 * CASE 
      WHEN llm_provider = 'anthropic' THEN 15  -- Claude input cost
      WHEN llm_provider = 'openai' THEN 0.15   -- GPT-4o-mini
      ELSE 0
    END)::NUMERIC as estimated_cost_usd
  FROM chat_messages
  WHERE llm_provider IS NOT NULL
  GROUP BY llm_provider;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Optional but recommended
-- ============================================================================

-- Enable RLS on sensitive tables
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE birth_charts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see their own data
-- CREATE POLICY users_own_data ON users
--   FOR ALL USING (auth.uid() = id);

-- ============================================================================
-- DATA RETENTION POLICY
-- ============================================================================

-- Function to clean up old API logs (run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_api_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM api_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Next steps:
-- 1. Set SUPABASE_URL and SUPABASE_KEY in your .env file
-- 2. Backend will automatically start logging to database
-- 3. View analytics in Supabase dashboard or via the functions above
