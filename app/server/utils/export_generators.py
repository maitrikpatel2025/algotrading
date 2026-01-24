"""
Export Generator Utilities
===========================
Functions for generating CSV, JSON, and PDF exports from backtest results.
"""

import csv
import io
from datetime import datetime
from typing import Any, Dict

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from core.data_models import BacktestConfig, BacktestResultsSummary


def format_currency(value: float, currency: str = "USD") -> str:
    """Format a currency value with appropriate symbol and precision."""
    symbol = {"USD": "$", "EUR": "€", "GBP": "£"}.get(currency, "$")
    return f"{symbol}{value:,.2f}"


def format_percentage(value: float, decimals: int = 2) -> str:
    """Format a percentage value with % symbol."""
    return f"{value:.{decimals}f}%"


def format_datetime(dt: datetime) -> str:
    """Format a datetime object as ISO 8601 string."""
    if dt is None:
        return ""
    return dt.isoformat()


def generate_csv_export(
    backtest_result: BacktestResultsSummary, backtest_config: BacktestConfig
) -> str:
    """
    Generate CSV export from backtest results.

    Args:
        backtest_result: Backtest results summary
        backtest_config: Backtest configuration

    Returns:
        CSV string with sections: Summary Metrics, Trade Statistics, Risk Metrics, Trade List
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Header comments
    writer.writerow([f"# Backtest Results Export - {backtest_config.name}"])
    writer.writerow([f"# Generated: {datetime.now().isoformat()}"])
    writer.writerow(
        [
            f"# Strategy: {backtest_config.strategy_name or 'N/A'}, "
            f"Pair: {backtest_config.pair or 'N/A'}, "
            f"Timeframe: {backtest_config.timeframe or 'N/A'}"
        ]
    )
    writer.writerow(
        [
            f"# Period: {format_datetime(backtest_config.start_date)} to "
            f"{format_datetime(backtest_config.end_date)}"
        ]
    )
    writer.writerow([])

    # Section 1: Summary Metrics
    writer.writerow(["SUMMARY METRICS"])
    writer.writerow(["Metric", "Value"])
    writer.writerow(
        [
            "Total Net Profit",
            format_currency(backtest_result.total_net_profit, backtest_config.currency),
        ]
    )
    writer.writerow(["Return on Investment", format_percentage(backtest_result.return_on_investment)])
    writer.writerow(
        ["Final Balance", format_currency(backtest_result.final_balance, backtest_config.currency)]
    )
    writer.writerow(
        [
            "Initial Balance",
            format_currency(backtest_config.initial_balance, backtest_config.currency),
        ]
    )
    writer.writerow([])

    # Section 2: Trade Statistics
    writer.writerow(["TRADE STATISTICS"])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Trades", backtest_result.total_trades])
    writer.writerow(["Winning Trades", backtest_result.winning_trades])
    writer.writerow(["Losing Trades", backtest_result.losing_trades])
    writer.writerow(["Win Rate", format_percentage(backtest_result.win_rate)])
    writer.writerow(["Profit Factor", f"{backtest_result.profit_factor:.2f}"])
    writer.writerow(
        ["Average Win", format_currency(backtest_result.average_win, backtest_config.currency)]
    )
    writer.writerow(
        ["Average Loss", format_currency(backtest_result.average_loss, backtest_config.currency)]
    )
    writer.writerow(["Win/Loss Ratio", f"{backtest_result.win_loss_ratio:.2f}"])
    writer.writerow(
        ["Largest Win", format_currency(backtest_result.largest_win, backtest_config.currency)]
    )
    writer.writerow(
        ["Largest Loss", format_currency(backtest_result.largest_loss, backtest_config.currency)]
    )
    writer.writerow(["Expectancy", format_currency(backtest_result.expectancy, backtest_config.currency)])
    writer.writerow(
        ["Average Trade Duration (minutes)", f"{backtest_result.average_trade_duration_minutes:.2f}"]
    )
    writer.writerow([])

    # Section 3: Risk Metrics
    writer.writerow(["RISK METRICS"])
    writer.writerow(["Metric", "Value"])
    writer.writerow(
        [
            "Max Drawdown ($)",
            format_currency(backtest_result.max_drawdown_dollars, backtest_config.currency),
        ]
    )
    writer.writerow(["Max Drawdown (%)", format_percentage(backtest_result.max_drawdown_percent)])
    writer.writerow(["Recovery Factor", f"{backtest_result.recovery_factor:.2f}"])
    writer.writerow(
        ["Sharpe Ratio", f"{backtest_result.sharpe_ratio:.2f}" if backtest_result.sharpe_ratio else "N/A"]
    )
    writer.writerow(
        [
            "Sortino Ratio",
            f"{backtest_result.sortino_ratio:.2f}" if backtest_result.sortino_ratio else "N/A",
        ]
    )
    writer.writerow(["Buy-Hold Return", format_percentage(backtest_result.buy_hold_return)])
    writer.writerow(
        ["Strategy vs Benchmark", format_percentage(backtest_result.strategy_vs_benchmark)]
    )
    writer.writerow([])

    # Section 4: Configuration Details
    writer.writerow(["CONFIGURATION DETAILS"])
    writer.writerow(["Parameter", "Value"])
    writer.writerow(["Backtest Name", backtest_config.name])
    writer.writerow(["Description", backtest_config.description or "N/A"])
    writer.writerow(["Strategy", backtest_config.strategy_name or "N/A"])
    writer.writerow(["Pair", backtest_config.pair or "N/A"])
    writer.writerow(["Timeframe", backtest_config.timeframe or "N/A"])
    writer.writerow(["Start Date", format_datetime(backtest_config.start_date)])
    writer.writerow(["End Date", format_datetime(backtest_config.end_date)])
    writer.writerow(
        ["Initial Balance", format_currency(backtest_config.initial_balance, backtest_config.currency)]
    )
    writer.writerow(["Currency", backtest_config.currency])
    writer.writerow(
        ["Position Sizing Method", backtest_config.position_sizing.method]
    )
    writer.writerow(["Position Sizing Value", backtest_config.position_sizing.value])
    writer.writerow(["Leverage", backtest_config.position_sizing.leverage])
    writer.writerow(["Compound", backtest_config.position_sizing.compound])
    writer.writerow(["Stop Loss Type", backtest_config.risk_management.stop_loss.type])
    writer.writerow(["Take Profit Type", backtest_config.risk_management.take_profit.type])
    writer.writerow(["Notes", backtest_config.notes or "N/A"])
    writer.writerow([])

    # Section 5: Time Period Analysis - Monthly
    if backtest_result.monthly_performance:
        writer.writerow(["TIME PERIOD ANALYSIS - MONTHLY"])
        writer.writerow(["Month", "# Trades", "Win Rate (%)", "Net P/L", "Is Best", "Is Worst"])
        for row in backtest_result.monthly_performance:
            writer.writerow([
                row.get("month", ""),
                row.get("trades", 0),
                f"{row.get('win_rate', 0):.1f}",
                format_currency(row.get("net_pnl", 0), backtest_config.currency),
                "Yes" if row.get("is_best") else "No",
                "Yes" if row.get("is_worst") else "No",
            ])
        writer.writerow([])

    # Section 6: Time Period Analysis - Day of Week
    if backtest_result.day_of_week_performance:
        writer.writerow(["TIME PERIOD ANALYSIS - DAY OF WEEK"])
        writer.writerow(["Day", "Day Name", "# Trades", "Win Rate (%)", "Net P/L", "Is Best", "Is Worst"])
        for row in backtest_result.day_of_week_performance:
            writer.writerow([
                row.get("day", ""),
                row.get("day_name", ""),
                row.get("trades", 0),
                f"{row.get('win_rate', 0):.1f}",
                format_currency(row.get("net_pnl", 0), backtest_config.currency),
                "Yes" if row.get("is_best") else "No",
                "Yes" if row.get("is_worst") else "No",
            ])
        writer.writerow([])

    # Section 7: Time Period Analysis - Hourly
    if backtest_result.hourly_performance:
        writer.writerow(["TIME PERIOD ANALYSIS - HOURLY"])
        writer.writerow(["Hour", "# Trades", "Win Rate (%)", "Net P/L", "Is Best", "Is Worst"])
        for row in backtest_result.hourly_performance:
            writer.writerow([
                f"{row.get('hour', 0):02d}:00",
                row.get("trades", 0),
                f"{row.get('win_rate', 0):.1f}",
                format_currency(row.get("net_pnl", 0), backtest_config.currency),
                "Yes" if row.get("is_best") else "No",
                "Yes" if row.get("is_worst") else "No",
            ])
        writer.writerow([])

    # Section 8: Trade List
    if backtest_result.trades:
        writer.writerow(["TRADE LIST"])
        # Get headers from first trade
        if backtest_result.trades:
            headers = list(backtest_result.trades[0].keys())
            writer.writerow(headers)

            # Write each trade
            for trade in backtest_result.trades:
                writer.writerow([trade.get(h, "") for h in headers])

    return output.getvalue()


def generate_json_export(
    backtest_result: BacktestResultsSummary, backtest_config: BacktestConfig
) -> Dict[str, Any]:
    """
    Generate JSON export from backtest results.

    Args:
        backtest_result: Backtest results summary
        backtest_config: Backtest configuration

    Returns:
        Dictionary with complete backtest configuration and results
    """
    return {
        "metadata": {
            "export_date": datetime.now().isoformat(),
            "export_version": "1.0",
        },
        "configuration": {
            "id": backtest_config.id,
            "name": backtest_config.name,
            "description": backtest_config.description,
            "strategy_id": backtest_config.strategy_id,
            "strategy_name": backtest_config.strategy_name,
            "pair": backtest_config.pair,
            "timeframe": backtest_config.timeframe,
            "start_date": format_datetime(backtest_config.start_date),
            "end_date": format_datetime(backtest_config.end_date),
            "initial_balance": backtest_config.initial_balance,
            "currency": backtest_config.currency,
            "position_sizing": {
                "method": backtest_config.position_sizing.method,
                "value": backtest_config.position_sizing.value,
                "leverage": backtest_config.position_sizing.leverage,
                "max_position_size": backtest_config.position_sizing.max_position_size,
                "compound": backtest_config.position_sizing.compound,
            },
            "risk_management": {
                "stop_loss": {
                    "type": backtest_config.risk_management.stop_loss.type,
                    "value": backtest_config.risk_management.stop_loss.value,
                },
                "take_profit": {
                    "type": backtest_config.risk_management.take_profit.type,
                    "value": backtest_config.risk_management.take_profit.value,
                },
                "trailing_stop": {
                    "type": backtest_config.risk_management.trailing_stop.type,
                    "value": backtest_config.risk_management.trailing_stop.value,
                    "break_even_trigger": backtest_config.risk_management.trailing_stop.break_even_trigger,
                },
                "partial_closes": {
                    "enabled": backtest_config.risk_management.partial_closes.enabled,
                    "levels": [
                        {"target_pips": level.target_pips, "close_percentage": level.close_percentage}
                        for level in backtest_config.risk_management.partial_closes.levels
                    ],
                },
            },
            "notes": backtest_config.notes,
            "created_at": format_datetime(backtest_config.created_at),
            "updated_at": format_datetime(backtest_config.updated_at),
        },
        "results": {
            "summary": {
                "total_net_profit": backtest_result.total_net_profit,
                "return_on_investment": backtest_result.return_on_investment,
                "final_balance": backtest_result.final_balance,
            },
            "trade_statistics": {
                "total_trades": backtest_result.total_trades,
                "winning_trades": backtest_result.winning_trades,
                "losing_trades": backtest_result.losing_trades,
                "win_rate": backtest_result.win_rate,
                "profit_factor": backtest_result.profit_factor,
                "average_win": backtest_result.average_win,
                "average_loss": backtest_result.average_loss,
                "win_loss_ratio": backtest_result.win_loss_ratio,
                "largest_win": backtest_result.largest_win,
                "largest_loss": backtest_result.largest_loss,
                "expectancy": backtest_result.expectancy,
                "average_trade_duration_minutes": backtest_result.average_trade_duration_minutes,
            },
            "risk_metrics": {
                "max_drawdown_dollars": backtest_result.max_drawdown_dollars,
                "max_drawdown_percent": backtest_result.max_drawdown_percent,
                "recovery_factor": backtest_result.recovery_factor,
                "sharpe_ratio": backtest_result.sharpe_ratio,
                "sortino_ratio": backtest_result.sortino_ratio,
            },
            "benchmark": {
                "buy_hold_return": backtest_result.buy_hold_return,
                "strategy_vs_benchmark": backtest_result.strategy_vs_benchmark,
            },
            "equity_curves": {
                "equity_curve": backtest_result.equity_curve,
                "buy_hold_curve": backtest_result.buy_hold_curve,
                "equity_curve_dates": backtest_result.equity_curve_dates,
            },
            "time_period_analysis": {
                "monthly_performance": backtest_result.monthly_performance,
                "day_of_week_performance": backtest_result.day_of_week_performance,
                "hourly_performance": backtest_result.hourly_performance,
                "day_hour_heatmap": backtest_result.day_hour_heatmap,
            },
        },
        "trades": backtest_result.trades,
    }


def generate_pdf_export(
    backtest_result: BacktestResultsSummary, backtest_config: BacktestConfig
) -> bytes:
    """
    Generate PDF export from backtest results.

    Args:
        backtest_result: Backtest results summary
        backtest_config: Backtest configuration

    Returns:
        PDF bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75 * inch, bottomMargin=0.75 * inch)

    # Container for the 'Flowable' objects
    elements = []

    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "CustomTitle", parent=styles["Heading1"], fontSize=24, textColor=colors.HexColor("#1a1a1a")
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=16,
        textColor=colors.HexColor("#2563eb"),
        spaceAfter=12,
    )
    normal_style = styles["Normal"]

    # Page 1: Cover page
    elements.append(Paragraph("Backtest Results", title_style))
    elements.append(Spacer(1, 0.3 * inch))
    elements.append(Paragraph(f"<b>{backtest_config.name}</b>", heading_style))
    elements.append(Spacer(1, 0.2 * inch))

    # Cover page details
    cover_data = [
        ["Strategy:", backtest_config.strategy_name or "N/A"],
        ["Pair:", backtest_config.pair or "N/A"],
        ["Timeframe:", backtest_config.timeframe or "N/A"],
        ["Period:", f"{format_datetime(backtest_config.start_date)} to {format_datetime(backtest_config.end_date)}"],
        ["Generated:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
    ]
    cover_table = Table(cover_data, colWidths=[2 * inch, 4 * inch])
    cover_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    elements.append(cover_table)
    elements.append(Spacer(1, 0.3 * inch))

    # Key metrics box
    currency = backtest_config.currency
    key_metrics_data = [
        ["Key Performance Metrics", ""],
        [
            "Total Net Profit",
            f"{format_currency(backtest_result.total_net_profit, currency)}",
        ],
        ["Return on Investment", f"{format_percentage(backtest_result.return_on_investment)}"],
        ["Final Balance", f"{format_currency(backtest_result.final_balance, currency)}"],
        ["Win Rate", f"{format_percentage(backtest_result.win_rate)}"],
        ["Profit Factor", f"{backtest_result.profit_factor:.2f}"],
    ]
    key_metrics_table = Table(key_metrics_data, colWidths=[3 * inch, 3 * inch])
    key_metrics_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 12),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 1), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
            ]
        )
    )
    elements.append(key_metrics_table)
    elements.append(PageBreak())

    # Page 2: Summary Tables
    elements.append(Paragraph("Trade Statistics", heading_style))
    trade_stats_data = [
        ["Total Trades", str(backtest_result.total_trades)],
        ["Winning Trades", str(backtest_result.winning_trades)],
        ["Losing Trades", str(backtest_result.losing_trades)],
        ["Win Rate", format_percentage(backtest_result.win_rate)],
        ["Average Win", format_currency(backtest_result.average_win, currency)],
        ["Average Loss", format_currency(backtest_result.average_loss, currency)],
        ["Win/Loss Ratio", f"{backtest_result.win_loss_ratio:.2f}"],
        ["Largest Win", format_currency(backtest_result.largest_win, currency)],
        ["Largest Loss", format_currency(backtest_result.largest_loss, currency)],
        ["Expectancy", format_currency(backtest_result.expectancy, currency)],
        [
            "Avg Trade Duration",
            f"{backtest_result.average_trade_duration_minutes:.2f} minutes",
        ],
    ]
    trade_stats_table = Table(trade_stats_data, colWidths=[3 * inch, 3 * inch])
    trade_stats_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]
        )
    )
    elements.append(trade_stats_table)
    elements.append(Spacer(1, 0.3 * inch))

    # Risk Metrics
    elements.append(Paragraph("Risk Metrics", heading_style))
    risk_metrics_data = [
        [
            "Max Drawdown ($)",
            format_currency(backtest_result.max_drawdown_dollars, currency),
        ],
        ["Max Drawdown (%)", format_percentage(backtest_result.max_drawdown_percent)],
        ["Recovery Factor", f"{backtest_result.recovery_factor:.2f}"],
        [
            "Sharpe Ratio",
            f"{backtest_result.sharpe_ratio:.2f}" if backtest_result.sharpe_ratio else "N/A",
        ],
        [
            "Sortino Ratio",
            f"{backtest_result.sortino_ratio:.2f}" if backtest_result.sortino_ratio else "N/A",
        ],
        ["Buy-Hold Return", format_percentage(backtest_result.buy_hold_return)],
        ["Strategy vs Benchmark", format_percentage(backtest_result.strategy_vs_benchmark)],
    ]
    risk_metrics_table = Table(risk_metrics_data, colWidths=[3 * inch, 3 * inch])
    risk_metrics_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]
        )
    )
    elements.append(risk_metrics_table)
    elements.append(Spacer(1, 0.3 * inch))

    # Configuration
    elements.append(Paragraph("Configuration", heading_style))
    config_data = [
        ["Initial Balance", format_currency(backtest_config.initial_balance, currency)],
        ["Position Sizing", backtest_config.position_sizing.method],
        ["Sizing Value", str(backtest_config.position_sizing.value)],
        ["Leverage", f"{backtest_config.position_sizing.leverage}:1"],
        ["Compound", "Yes" if backtest_config.position_sizing.compound else "No"],
        ["Stop Loss", backtest_config.risk_management.stop_loss.type],
        ["Take Profit", backtest_config.risk_management.take_profit.type],
    ]
    config_table = Table(config_data, colWidths=[3 * inch, 3 * inch])
    config_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]
        )
    )
    elements.append(config_table)

    # Notes section if available
    if backtest_config.notes:
        elements.append(Spacer(1, 0.3 * inch))
        elements.append(Paragraph("Notes", heading_style))
        elements.append(Paragraph(backtest_config.notes, normal_style))

    # Trade list (paginated if >100 trades)
    if backtest_result.trades:
        elements.append(PageBreak())
        elements.append(Paragraph("Trade List", heading_style))
        elements.append(Spacer(1, 0.1 * inch))

        # Limit to first 100 trades for PDF
        trades_to_show = backtest_result.trades[:100]
        if len(backtest_result.trades) > 100:
            elements.append(
                Paragraph(
                    f"<i>Showing first 100 of {len(backtest_result.trades)} trades</i>",
                    normal_style,
                )
            )
            elements.append(Spacer(1, 0.1 * inch))

        # Create trade table with key columns
        trade_headers = [["#", "Entry", "Exit", "P/L", "Duration"]]
        trade_data = []
        for i, trade in enumerate(trades_to_show, 1):
            trade_data.append(
                [
                    str(i),
                    trade.get("entry_time", "")[:10] if trade.get("entry_time") else "N/A",
                    trade.get("exit_time", "")[:10] if trade.get("exit_time") else "N/A",
                    format_currency(trade.get("profit_loss", 0), currency),
                    f"{trade.get('duration_minutes', 0):.0f}m" if trade.get("duration_minutes") else "N/A",
                ]
            )

        trade_table = Table(
            trade_headers + trade_data, colWidths=[0.5 * inch, 1.5 * inch, 1.5 * inch, 1.5 * inch, 1 * inch]
        )
        trade_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f3f4f6")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        elements.append(trade_table)

    # Build PDF
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return pdf_bytes
