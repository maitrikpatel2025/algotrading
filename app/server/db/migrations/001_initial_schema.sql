-- =============================================================================
-- Forex Trading Database Schema
-- =============================================================================
-- Run this migration in your Supabase SQL Editor or via Supabase CLI
-- https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- forex_instruments table
-- Stores trading instrument definitions (currency pairs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS forex_instruments (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    precision INTEGER NOT NULL,
    trade_amount_step INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast symbol lookups
CREATE INDEX IF NOT EXISTS idx_forex_instruments_symbol ON forex_instruments(symbol);

-- -----------------------------------------------------------------------------
-- forex_sample table
-- Stores sample forex data
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS forex_sample (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- forex_calendar table
-- Stores forex calendar events
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS forex_calendar (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Enable Row Level Security (RLS) - Optional
-- Uncomment if you want to enable RLS for these tables
-- -----------------------------------------------------------------------------
-- ALTER TABLE forex_instruments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE forex_sample ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE forex_calendar ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Create policies for anonymous access - Optional
-- Uncomment if RLS is enabled and you want public read access
-- -----------------------------------------------------------------------------
-- CREATE POLICY "Allow public read access on forex_instruments"
--     ON forex_instruments FOR SELECT
--     USING (true);

-- CREATE POLICY "Allow public read access on forex_sample"
--     ON forex_sample FOR SELECT
--     USING (true);

-- CREATE POLICY "Allow public read access on forex_calendar"
--     ON forex_calendar FOR SELECT
--     USING (true);
