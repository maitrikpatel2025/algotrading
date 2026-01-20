-- ============================================================================
-- Create Strategies Table for Supabase
-- ============================================================================
-- Run this SQL in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cwcmvkhwklnsvsskofsh/sql/new
-- ============================================================================

-- Create strategies table (matches strategy_service.py expected schema)
CREATE TABLE IF NOT EXISTS strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    tags TEXT[],
    trade_direction VARCHAR(10) NOT NULL DEFAULT 'both',
    confirm_on_candle_close VARCHAR(3) NOT NULL DEFAULT 'yes',
    pair VARCHAR(20),
    timeframe VARCHAR(10),
    candle_count VARCHAR(10),
    indicators JSONB DEFAULT '[]',
    patterns JSONB DEFAULT '[]',
    conditions JSONB DEFAULT '[]',
    groups JSONB DEFAULT '[]',
    reference_indicators JSONB DEFAULT '[]',
    time_filter JSONB,
    drawings JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for name uniqueness check
CREATE UNIQUE INDEX IF NOT EXISTS strategies_name_idx ON strategies (name);

-- Index for listing strategies (sorted by updated_at DESC)
CREATE INDEX IF NOT EXISTS strategies_updated_at_idx ON strategies (updated_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
DROP TRIGGER IF EXISTS update_strategies_updated_at ON strategies;
CREATE TRIGGER update_strategies_updated_at
    BEFORE UPDATE ON strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - allow all operations for now
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for production)
CREATE POLICY "Allow all operations on strategies" ON strategies
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Verify table was created
SELECT 'strategies table created successfully!' as status;
