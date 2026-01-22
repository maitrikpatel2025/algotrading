-- Migration: Add Backtest Progress Tracking Fields
-- Description: Add fields for tracking backtest execution progress
-- Date: 2026-01-22

-- Add progress tracking columns to backtests table
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS progress_percentage INTEGER NOT NULL DEFAULT 0;
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS current_date_processed TIMESTAMP WITH TIME ZONE;
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS total_candles INTEGER;
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS candles_processed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS trade_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS partial_results JSONB;

-- Add constraints for new columns
ALTER TABLE backtests ADD CONSTRAINT backtests_progress_percentage_range
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
ALTER TABLE backtests ADD CONSTRAINT backtests_candles_processed_min
    CHECK (candles_processed >= 0);
ALTER TABLE backtests ADD CONSTRAINT backtests_trade_count_min
    CHECK (trade_count >= 0);

-- Update status constraint to include 'cancelling' status
ALTER TABLE backtests DROP CONSTRAINT IF EXISTS backtests_status_valid;
ALTER TABLE backtests ADD CONSTRAINT backtests_status_valid
    CHECK (status IN ('pending', 'running', 'cancelling', 'completed', 'failed'));

-- Index for finding running backtests quickly
CREATE INDEX IF NOT EXISTS backtests_status_running_idx ON backtests (status) WHERE status = 'running';

-- Add comments for new columns
COMMENT ON COLUMN backtests.progress_percentage IS 'Execution progress as percentage (0-100)';
COMMENT ON COLUMN backtests.current_date_processed IS 'Current date being processed during execution';
COMMENT ON COLUMN backtests.total_candles IS 'Total number of candles to process in the backtest';
COMMENT ON COLUMN backtests.candles_processed IS 'Number of candles processed so far';
COMMENT ON COLUMN backtests.trade_count IS 'Number of trades simulated during backtest';
COMMENT ON COLUMN backtests.started_at IS 'Timestamp when backtest execution started';
COMMENT ON COLUMN backtests.completed_at IS 'Timestamp when backtest execution completed';
COMMENT ON COLUMN backtests.error_message IS 'Error message if backtest failed';
COMMENT ON COLUMN backtests.partial_results IS 'Partial results saved when backtest is cancelled with keep_partial option';
