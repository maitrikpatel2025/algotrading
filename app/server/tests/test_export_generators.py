"""
Unit Tests for Export Generators
=================================
Tests for CSV, JSON, and PDF export generation from backtest results.
"""

from datetime import datetime, timedelta

import pytest

from core.data_models import (
    BacktestConfig,
    BacktestResultsSummary,
    PartialCloseLevel,
    PartialClosesConfig,
    PositionSizingConfig,
    RiskManagementConfig,
    StopLossConfig,
    TakeProfitConfig,
    TrailingStopConfig,
)
from utils.export_generators import (
    format_currency,
    format_datetime,
    format_percentage,
    generate_csv_export,
    generate_json_export,
    generate_pdf_export,
)


@pytest.fixture
def sample_backtest_config():
    """Create a sample backtest configuration for testing."""
    return BacktestConfig(
        id="test-123",
        name="Test Backtest - 2026-01-24 - 14:30",
        description="Sample backtest for testing export functionality",
        strategy_id="strategy-456",
        strategy_name="Bollinger Bands Breakout",
        pair="EURUSD",
        timeframe="H1",
        start_date=datetime(2025, 1, 1),
        end_date=datetime(2025, 12, 31),
        initial_balance=10000.0,
        currency="USD",
        position_sizing=PositionSizingConfig(
            method="percentage", value=2.0, leverage=10, max_position_size=None, compound=True
        ),
        risk_management=RiskManagementConfig(
            stop_loss=StopLossConfig(type="fixed_pips", value=20.0),
            take_profit=TakeProfitConfig(type="risk_reward", value=2.0),
            trailing_stop=TrailingStopConfig(type="none", value=None, break_even_trigger=None),
            partial_closes=PartialClosesConfig(enabled=False, levels=[]),
        ),
        status="completed",
        results=None,
        notes="This is a test backtest with custom notes.",
        created_at=datetime(2026, 1, 24, 14, 30),
        updated_at=datetime(2026, 1, 24, 15, 45),
    )


@pytest.fixture
def sample_backtest_results():
    """Create sample backtest results for testing."""
    return BacktestResultsSummary(
        total_net_profit=2500.50,
        return_on_investment=25.01,
        final_balance=12500.50,
        total_trades=100,
        winning_trades=60,
        losing_trades=40,
        win_rate=60.0,
        profit_factor=1.85,
        average_win=150.25,
        average_loss=-75.10,
        win_loss_ratio=2.0,
        largest_win=450.75,
        largest_loss=-200.50,
        expectancy=25.01,
        average_trade_duration_minutes=240.5,
        max_drawdown_dollars=850.25,
        max_drawdown_percent=8.5,
        recovery_factor=2.94,
        sharpe_ratio=1.45,
        sortino_ratio=2.12,
        buy_hold_return=15.5,
        strategy_vs_benchmark=9.51,
        equity_curve=[10000.0, 10500.0, 11000.0, 11500.0, 12000.0, 12500.50],
        buy_hold_curve=[10000.0, 10300.0, 10600.0, 10900.0, 11200.0, 11550.0],
        equity_curve_dates=[
            "2025-01-01T00:00:00",
            "2025-03-01T00:00:00",
            "2025-05-01T00:00:00",
            "2025-07-01T00:00:00",
            "2025-09-01T00:00:00",
            "2025-12-31T00:00:00",
        ],
        trade_counts_per_candle=None,
        drawdown_periods=None,
        trades=[
            {
                "entry_time": "2025-01-15T10:00:00",
                "exit_time": "2025-01-15T14:00:00",
                "direction": "long",
                "entry_price": 1.0850,
                "exit_price": 1.0900,
                "profit_loss": 150.25,
                "duration_minutes": 240,
            },
            {
                "entry_time": "2025-02-20T08:00:00",
                "exit_time": "2025-02-20T10:00:00",
                "direction": "short",
                "entry_price": 1.0920,
                "exit_price": 1.0940,
                "profit_loss": -75.10,
                "duration_minutes": 120,
            },
        ],
    )


@pytest.fixture
def sample_backtest_results_zero_trades():
    """Create sample backtest results with zero trades."""
    return BacktestResultsSummary(
        total_net_profit=0.0,
        return_on_investment=0.0,
        final_balance=10000.0,
        total_trades=0,
        winning_trades=0,
        losing_trades=0,
        win_rate=0.0,
        profit_factor=0.0,
        average_win=0.0,
        average_loss=0.0,
        win_loss_ratio=0.0,
        largest_win=0.0,
        largest_loss=0.0,
        expectancy=0.0,
        average_trade_duration_minutes=0.0,
        max_drawdown_dollars=0.0,
        max_drawdown_percent=0.0,
        recovery_factor=0.0,
        sharpe_ratio=None,
        sortino_ratio=None,
        buy_hold_return=0.0,
        strategy_vs_benchmark=0.0,
        equity_curve=[10000.0],
        buy_hold_curve=[10000.0],
        equity_curve_dates=None,
        trade_counts_per_candle=None,
        drawdown_periods=None,
        trades=[],
    )


# Test helper functions
def test_format_currency():
    """Test currency formatting."""
    assert format_currency(1234.56, "USD") == "$1,234.56"
    assert format_currency(1234.56, "EUR") == "€1,234.56"
    assert format_currency(1234.56, "GBP") == "£1,234.56"
    assert format_currency(-500.25, "USD") == "$-500.25"
    assert format_currency(0.0, "USD") == "$0.00"


def test_format_percentage():
    """Test percentage formatting."""
    assert format_percentage(25.5) == "25.50%"
    assert format_percentage(100.0) == "100.00%"
    assert format_percentage(0.0) == "0.00%"
    assert format_percentage(-10.25) == "-10.25%"
    assert format_percentage(12.345, decimals=1) == "12.3%"


def test_format_datetime():
    """Test datetime formatting."""
    dt = datetime(2026, 1, 24, 14, 30, 0)
    assert format_datetime(dt) == "2026-01-24T14:30:00"
    assert format_datetime(None) == ""


# Test CSV export
def test_generate_csv_export(sample_backtest_config, sample_backtest_results):
    """Test CSV export generation with valid data."""
    csv_output = generate_csv_export(sample_backtest_results, sample_backtest_config)

    # Verify CSV structure
    assert "# Backtest Results Export - Test Backtest - 2026-01-24 - 14:30" in csv_output
    assert "SUMMARY METRICS" in csv_output
    assert "TRADE STATISTICS" in csv_output
    assert "RISK METRICS" in csv_output
    assert "CONFIGURATION DETAILS" in csv_output
    assert "TRADE LIST" in csv_output

    # Verify key metrics are present
    assert "Total Net Profit" in csv_output
    assert "$2,500.50" in csv_output
    assert "Return on Investment" in csv_output
    assert "25.01%" in csv_output
    assert "Win Rate" in csv_output
    assert "60.00%" in csv_output

    # Verify configuration details
    assert "Bollinger Bands Breakout" in csv_output
    assert "EURUSD" in csv_output
    assert "H1" in csv_output
    assert "This is a test backtest with custom notes." in csv_output

    # Verify trade data
    assert "entry_time" in csv_output
    assert "exit_time" in csv_output
    assert "2025-01-15T10:00:00" in csv_output


def test_generate_csv_export_zero_trades(sample_backtest_config, sample_backtest_results_zero_trades):
    """Test CSV export with zero trades."""
    csv_output = generate_csv_export(sample_backtest_results_zero_trades, sample_backtest_config)

    # Should still contain headers and summary sections
    assert "SUMMARY METRICS" in csv_output
    assert "Total Trades" in csv_output
    assert "0" in csv_output  # Zero trades

    # Trade list should not be present (empty)
    lines = csv_output.split("\n")
    trade_list_present = any("TRADE LIST" in line for line in lines)
    # If there are no trades, the TRADE LIST section won't be added
    assert not trade_list_present


def test_generate_csv_export_negative_results(sample_backtest_config):
    """Test CSV export with negative results."""
    negative_results = BacktestResultsSummary(
        total_net_profit=-1500.0,
        return_on_investment=-15.0,
        final_balance=8500.0,
        total_trades=50,
        winning_trades=20,
        losing_trades=30,
        win_rate=40.0,
        profit_factor=0.75,
        average_win=100.0,
        average_loss=-150.0,
        win_loss_ratio=0.67,
        largest_win=250.0,
        largest_loss=-400.0,
        expectancy=-30.0,
        average_trade_duration_minutes=180.0,
        max_drawdown_dollars=2000.0,
        max_drawdown_percent=20.0,
        recovery_factor=-0.75,
        sharpe_ratio=-0.5,
        sortino_ratio=-0.8,
        buy_hold_return=10.0,
        strategy_vs_benchmark=-25.0,
        equity_curve=[10000.0, 9500.0, 9000.0, 8500.0],
        buy_hold_curve=[10000.0, 10500.0, 11000.0, 11000.0],
        equity_curve_dates=None,
        trade_counts_per_candle=None,
        drawdown_periods=None,
        trades=[],
    )

    csv_output = generate_csv_export(negative_results, sample_backtest_config)

    # Verify negative values are formatted correctly
    assert "$-1,500.00" in csv_output
    assert "-15.00%" in csv_output


# Test JSON export
def test_generate_json_export(sample_backtest_config, sample_backtest_results):
    """Test JSON export generation with valid data."""
    json_output = generate_json_export(sample_backtest_results, sample_backtest_config)

    # Verify JSON structure
    assert "metadata" in json_output
    assert "configuration" in json_output
    assert "results" in json_output
    assert "trades" in json_output

    # Verify metadata
    assert json_output["metadata"]["export_version"] == "1.0"
    assert "export_date" in json_output["metadata"]

    # Verify configuration
    config = json_output["configuration"]
    assert config["name"] == "Test Backtest - 2026-01-24 - 14:30"
    assert config["strategy_name"] == "Bollinger Bands Breakout"
    assert config["pair"] == "EURUSD"
    assert config["timeframe"] == "H1"
    assert config["initial_balance"] == 10000.0
    assert config["currency"] == "USD"
    assert config["notes"] == "This is a test backtest with custom notes."

    # Verify position sizing
    assert config["position_sizing"]["method"] == "percentage"
    assert config["position_sizing"]["value"] == 2.0
    assert config["position_sizing"]["leverage"] == 10

    # Verify risk management
    assert config["risk_management"]["stop_loss"]["type"] == "fixed_pips"
    assert config["risk_management"]["take_profit"]["type"] == "risk_reward"

    # Verify results
    results = json_output["results"]
    assert results["summary"]["total_net_profit"] == 2500.50
    assert results["summary"]["return_on_investment"] == 25.01
    assert results["trade_statistics"]["total_trades"] == 100
    assert results["trade_statistics"]["win_rate"] == 60.0
    assert results["risk_metrics"]["max_drawdown_percent"] == 8.5

    # Verify trades
    assert len(json_output["trades"]) == 2
    assert json_output["trades"][0]["direction"] == "long"
    assert json_output["trades"][0]["profit_loss"] == 150.25


def test_generate_json_export_zero_trades(sample_backtest_config, sample_backtest_results_zero_trades):
    """Test JSON export with zero trades."""
    json_output = generate_json_export(sample_backtest_results_zero_trades, sample_backtest_config)

    assert json_output["results"]["trade_statistics"]["total_trades"] == 0
    assert len(json_output["trades"]) == 0


# Test PDF export
def test_generate_pdf_export(sample_backtest_config, sample_backtest_results):
    """Test PDF export generation with valid data."""
    pdf_bytes = generate_pdf_export(sample_backtest_results, sample_backtest_config)

    # Verify PDF bytes are generated
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 0

    # Verify PDF header
    assert pdf_bytes[:4] == b"%PDF"


def test_generate_pdf_export_zero_trades(sample_backtest_config, sample_backtest_results_zero_trades):
    """Test PDF export with zero trades."""
    pdf_bytes = generate_pdf_export(sample_backtest_results_zero_trades, sample_backtest_config)

    # Should still generate a valid PDF
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 0
    assert pdf_bytes[:4] == b"%PDF"


def test_generate_pdf_export_many_trades(sample_backtest_config, sample_backtest_results):
    """Test PDF export with many trades (>100)."""
    # Create 150 trades
    many_trades = []
    for i in range(150):
        many_trades.append(
            {
                "entry_time": f"2025-01-{i%28 + 1:02d}T10:00:00",
                "exit_time": f"2025-01-{i%28 + 1:02d}T14:00:00",
                "direction": "long" if i % 2 == 0 else "short",
                "entry_price": 1.0850 + (i * 0.001),
                "exit_price": 1.0900 + (i * 0.001),
                "profit_loss": 50.0 if i % 2 == 0 else -25.0,
                "duration_minutes": 240,
            }
        )

    sample_backtest_results.trades = many_trades

    pdf_bytes = generate_pdf_export(sample_backtest_results, sample_backtest_config)

    # Should still generate a valid PDF (limited to first 100 trades)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 0
    assert pdf_bytes[:4] == b"%PDF"


def test_generate_pdf_export_with_notes(sample_backtest_config, sample_backtest_results):
    """Test PDF export includes notes section."""
    sample_backtest_config.notes = "This backtest demonstrates strong performance during trending markets."

    pdf_bytes = generate_pdf_export(sample_backtest_results, sample_backtest_config)

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 0


def test_generate_pdf_export_no_notes(sample_backtest_config, sample_backtest_results):
    """Test PDF export without notes."""
    sample_backtest_config.notes = None

    pdf_bytes = generate_pdf_export(sample_backtest_results, sample_backtest_config)

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 0
