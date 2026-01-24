-- Migration: Add Backtest Notes Field
-- Description: Add notes field to backtests table for custom annotations
-- Date: 2026-01-24

-- Add notes column to backtests table
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for new column
COMMENT ON COLUMN backtests.notes IS 'Custom notes and annotations for the backtest';
