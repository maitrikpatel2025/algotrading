-- Migration: Create Backtests Table
-- Description: Create table for storing backtest configurations
-- Date: 2026-01-21

-- Create backtests table
CREATE TABLE IF NOT EXISTS backtests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
    pair VARCHAR(20),
    timeframe VARCHAR(10),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 10000.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    position_sizing JSONB NOT NULL DEFAULT '{
        "method": "percentage",
        "value": 2.0,
        "leverage": 1,
        "max_position_size": null,
        "compound": true
    }'::jsonb,
    risk_management JSONB NOT NULL DEFAULT '{
        "stop_loss": {"type": "none", "value": null},
        "take_profit": {"type": "none", "value": null},
        "trailing_stop": {"type": "none", "value": null, "break_even_trigger": null},
        "partial_closes": {"enabled": false, "levels": []}
    }'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT backtests_initial_balance_min CHECK (initial_balance >= 100),
    CONSTRAINT backtests_initial_balance_max CHECK (initial_balance <= 10000000),
    CONSTRAINT backtests_currency_valid CHECK (currency IN ('USD', 'EUR', 'GBP')),
    CONSTRAINT backtests_status_valid CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    CONSTRAINT backtests_date_range_valid CHECK (end_date > start_date)
);

-- Index for listing backtests (sorted by updated_at DESC)
CREATE INDEX IF NOT EXISTS backtests_updated_at_idx ON backtests (updated_at DESC);

-- Index for filtering by strategy
CREATE INDEX IF NOT EXISTS backtests_strategy_id_idx ON backtests (strategy_id);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS backtests_status_idx ON backtests (status);

-- Create trigger to update updated_at on row update (reuses function from strategies table)
DROP TRIGGER IF EXISTS update_backtests_updated_at ON backtests;
CREATE TRIGGER update_backtests_updated_at
    BEFORE UPDATE ON backtests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE backtests IS 'Stores backtest configurations and results for strategy validation';
COMMENT ON COLUMN backtests.strategy_id IS 'Reference to the strategy being tested (nullable if strategy deleted)';
COMMENT ON COLUMN backtests.position_sizing IS 'JSON object with sizing method, leverage, max position, and compound settings';
COMMENT ON COLUMN backtests.risk_management IS 'JSON object with stop loss, take profit, trailing stop, and partial close settings';
COMMENT ON COLUMN backtests.status IS 'Backtest status: pending (not run), running, completed, or failed';
COMMENT ON COLUMN backtests.results IS 'JSON object with backtest results (win rate, P/L, trades, etc.) - null until completed';
