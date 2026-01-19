-- Migration: Create Strategies Table
-- Description: Create table for storing trading strategy configurations
-- Date: 2026-01-19
-- Note: This migration is for future use when strategy saving is implemented

-- Create strategies table
CREATE TABLE IF NOT EXISTS forex_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    trade_direction TEXT NOT NULL CHECK (trade_direction IN ('long', 'short', 'both')),
    pair TEXT,
    timeframe TEXT,
    indicators JSONB DEFAULT '[]'::jsonb,
    conditions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on trade_direction for filtering
CREATE INDEX IF NOT EXISTS idx_strategies_trade_direction ON forex_strategies(trade_direction);

-- Create index on pair for filtering by currency pair
CREATE INDEX IF NOT EXISTS idx_strategies_pair ON forex_strategies(pair);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_strategies_created_at ON forex_strategies(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_strategies_updated_at
    BEFORE UPDATE ON forex_strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE forex_strategies IS 'Stores trading strategy configurations with indicators, conditions, and trade direction';
COMMENT ON COLUMN forex_strategies.trade_direction IS 'Trading direction: long (buy only), short (sell only), or both';
COMMENT ON COLUMN forex_strategies.indicators IS 'JSON array of indicator instances with parameters and styling';
COMMENT ON COLUMN forex_strategies.conditions IS 'JSON array of trading conditions (entry/exit rules)';
