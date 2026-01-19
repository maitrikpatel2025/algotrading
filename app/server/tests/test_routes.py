"""
Tests for API Routes
====================
Unit tests for the trading API routes module.
"""

import pytest

from api.routes import make_option, get_options, GRANULARITY_LABELS
from config import settings


class TestMakeOption:
    """Test cases for make_option function."""

    def test_make_option_key_only(self):
        """Test make_option with key only uses key for all fields."""
        result = make_option("M5")
        assert result == {"key": "M5", "text": "M5", "value": "M5"}

    def test_make_option_with_text(self):
        """Test make_option with custom text."""
        result = make_option("M5", "5 Min")
        assert result == {"key": "M5", "text": "5 Min", "value": "M5"}

    def test_make_option_text_none_fallback(self):
        """Test make_option with None text falls back to key."""
        result = make_option("H1", None)
        assert result == {"key": "H1", "text": "H1", "value": "H1"}


class TestGranularityLabels:
    """Test cases for GRANULARITY_LABELS constant."""

    def test_all_tfs_have_labels(self):
        """Test that all TFS keys have corresponding labels."""
        for tf_key in settings.TFS.keys():
            assert tf_key in GRANULARITY_LABELS, f"Missing label for {tf_key}"

    def test_label_format(self):
        """Test that labels have expected format."""
        expected_labels = {
            "M1": "1 Min",
            "M5": "5 Min",
            "M15": "15 Min",
            "M30": "30 Min",
            "H1": "1 Hour",
            "H4": "4 Hour",
            "D": "1 Day",
            "W1": "1 Week",
        }
        for key, expected_label in expected_labels.items():
            assert GRANULARITY_LABELS.get(key) == expected_label, (
                f"Label for {key} expected '{expected_label}', "
                f"got '{GRANULARITY_LABELS.get(key)}'"
            )


class TestGetOptions:
    """Test cases for get_options function."""

    def test_get_options_returns_dict(self):
        """Test that get_options returns a dictionary."""
        result = get_options()
        assert isinstance(result, dict)

    def test_get_options_has_granularities(self):
        """Test that get_options includes granularities."""
        result = get_options()
        assert "granularities" in result
        assert isinstance(result["granularities"], list)

    def test_get_options_has_pairs(self):
        """Test that get_options includes pairs."""
        result = get_options()
        assert "pairs" in result
        assert isinstance(result["pairs"], list)

    def test_get_options_granularities_count(self):
        """Test that get_options returns all 8 granularities."""
        result = get_options()
        assert len(result["granularities"]) == 8

    def test_get_options_granularities_have_labels(self):
        """Test that granularities have human-readable labels."""
        result = get_options()
        expected_granularities = [
            {"key": "M1", "text": "1 Min", "value": "M1"},
            {"key": "M5", "text": "5 Min", "value": "M5"},
            {"key": "M15", "text": "15 Min", "value": "M15"},
            {"key": "M30", "text": "30 Min", "value": "M30"},
            {"key": "H1", "text": "1 Hour", "value": "H1"},
            {"key": "H4", "text": "4 Hour", "value": "H4"},
            {"key": "D", "text": "1 Day", "value": "D"},
            {"key": "W1", "text": "1 Week", "value": "W1"},
        ]
        assert result["granularities"] == expected_granularities

    def test_get_options_granularity_order(self):
        """Test that granularities are in correct order (M1 to W1)."""
        result = get_options()
        granularity_values = [g["value"] for g in result["granularities"]]
        expected_order = ["M1", "M5", "M15", "M30", "H1", "H4", "D", "W1"]
        assert granularity_values == expected_order

    def test_get_options_pairs_sorted(self):
        """Test that pairs are sorted alphabetically."""
        result = get_options()
        pair_values = [p["value"] for p in result["pairs"]]
        assert pair_values == sorted(pair_values)

    def test_get_options_option_structure(self):
        """Test that each option has correct structure."""
        result = get_options()

        for gran in result["granularities"]:
            assert "key" in gran
            assert "text" in gran
            assert "value" in gran
            assert gran["key"] == gran["value"]  # key and value should match

        for pair in result["pairs"]:
            assert "key" in pair
            assert "text" in pair
            assert "value" in pair
            assert pair["key"] == pair["value"]  # key and value should match

    def test_get_options_m1_included(self):
        """Test that M1 (1 minute) timeframe is included."""
        result = get_options()
        granularity_values = [g["value"] for g in result["granularities"]]
        assert "M1" in granularity_values

    def test_get_options_m30_included(self):
        """Test that M30 (30 minute) timeframe is included."""
        result = get_options()
        granularity_values = [g["value"] for g in result["granularities"]]
        assert "M30" in granularity_values

    def test_get_options_w1_included(self):
        """Test that W1 (1 week) timeframe is included."""
        result = get_options()
        granularity_values = [g["value"] for g in result["granularities"]]
        assert "W1" in granularity_values


class TestTFSConfiguration:
    """Test cases for TFS settings configuration."""

    def test_tfs_has_all_timeframes(self):
        """Test that TFS has all expected timeframes."""
        expected_timeframes = ["M1", "M5", "M15", "M30", "H1", "H4", "D", "W1"]
        for tf in expected_timeframes:
            assert tf in settings.TFS, f"Missing timeframe {tf} in TFS"

    def test_tfs_values_are_seconds(self):
        """Test that TFS values are correct seconds."""
        expected_seconds = {
            "M1": 60,
            "M5": 300,
            "M15": 900,
            "M30": 1800,
            "H1": 3600,
            "H4": 14400,
            "D": 86400,
            "W1": 604800,
        }
        for tf, seconds in expected_seconds.items():
            assert settings.TFS.get(tf) == seconds, (
                f"TFS[{tf}] expected {seconds}, got {settings.TFS.get(tf)}"
            )

    def test_tfs_values_are_integers(self):
        """Test that all TFS values are integers."""
        for tf, value in settings.TFS.items():
            assert isinstance(value, int), f"TFS[{tf}] is not an integer"

    def test_tfs_values_are_positive(self):
        """Test that all TFS values are positive."""
        for tf, value in settings.TFS.items():
            assert value > 0, f"TFS[{tf}] is not positive"
