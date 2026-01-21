"""
Tests for Strategy Service Functions
====================================
Unit tests for the strategy service module including
duplicate, export, import, and validation functions.
"""

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

from core.data_models import (
    ImportValidationResult,
    StrategyConfig,
    StrategyExport,
)
from core.strategy_service import (
    SUPPORTED_SCHEMA_VERSIONS,
    _generate_copy_name,
    validate_import,
)


class TestGenerateCopyName:
    """Test cases for _generate_copy_name function."""

    def test_generates_simple_copy_name(self):
        """Test generating a simple copy name when no copies exist."""
        existing_names = ["Strategy A", "Strategy B"]
        result = _generate_copy_name("Strategy A", existing_names)
        assert result == "Strategy A - Copy"

    def test_generates_numbered_copy_when_copy_exists(self):
        """Test generating numbered copy name when simple copy already exists."""
        existing_names = ["Strategy A", "Strategy A - Copy"]
        result = _generate_copy_name("Strategy A", existing_names)
        assert result == "Strategy A - Copy (2)"

    def test_generates_next_number_for_multiple_copies(self):
        """Test generating next number when multiple copies exist."""
        existing_names = [
            "Strategy A",
            "Strategy A - Copy",
            "Strategy A - Copy (2)",
            "Strategy A - Copy (3)",
        ]
        result = _generate_copy_name("Strategy A", existing_names)
        assert result == "Strategy A - Copy (4)"

    def test_handles_gaps_in_copy_numbers(self):
        """Test handling gaps in copy numbers."""
        existing_names = ["Strategy A", "Strategy A - Copy", "Strategy A - Copy (5)"]
        result = _generate_copy_name("Strategy A", existing_names)
        assert result == "Strategy A - Copy (6)"

    def test_handles_empty_existing_names(self):
        """Test handling empty list of existing names."""
        result = _generate_copy_name("My Strategy", [])
        assert result == "My Strategy - Copy"

    def test_handles_special_characters_in_name(self):
        """Test handling special regex characters in name."""
        existing_names = ["Strategy (Test)", "Strategy (Test) - Copy"]
        result = _generate_copy_name("Strategy (Test)", existing_names)
        assert result == "Strategy (Test) - Copy (2)"


class TestValidateImport:
    """Test cases for validate_import function."""

    def test_validates_proper_export_format(self):
        """Test validation of properly formatted export data."""
        import_data = {
            "schema_version": "1.0",
            "export_date": "2024-01-15T10:00:00Z",
            "strategy": {
                "name": "Test Strategy",
                "trade_direction": "long",
                "indicators": [],
                "conditions": [],
            },
        }

        with patch("core.strategy_service.is_configured", return_value=False):
            result = validate_import(import_data)

        assert result.valid is True
        assert len(result.errors) == 0
        assert result.strategy_preview is not None
        assert result.strategy_preview["name"] == "Test Strategy"

    def test_rejects_unsupported_schema_version(self):
        """Test rejection of unsupported schema version."""
        import_data = {
            "schema_version": "99.0",
            "strategy": {"name": "Test Strategy", "trade_direction": "long"},
        }

        with patch("core.strategy_service.is_configured", return_value=False):
            result = validate_import(import_data)

        assert result.valid is False
        assert any("Unsupported schema version" in e for e in result.errors)

    def test_accepts_legacy_format_without_version(self):
        """Test acceptance of legacy format without version (assumes 1.0)."""
        import_data = {"strategy": {"name": "Legacy Strategy", "trade_direction": "both"}}

        with patch("core.strategy_service.is_configured", return_value=False):
            result = validate_import(import_data)

        assert result.valid is True
        assert any("No schema version" in w for w in result.warnings)

    def test_accepts_raw_strategy_data(self):
        """Test acceptance of raw strategy data without wrapper."""
        import_data = {"name": "Raw Strategy", "trade_direction": "short", "indicators": []}

        with patch("core.strategy_service.is_configured", return_value=False):
            result = validate_import(import_data)

        assert result.valid is True
        assert any("raw strategy data" in w.lower() for w in result.warnings)

    def test_rejects_missing_strategy_field(self):
        """Test rejection when strategy field is missing."""
        import_data = {"schema_version": "1.0", "export_date": "2024-01-15T10:00:00Z"}

        with patch("core.strategy_service.is_configured", return_value=False):
            result = validate_import(import_data)

        assert result.valid is False
        assert any("Missing 'strategy' field" in e for e in result.errors)

    def test_rejects_missing_name(self):
        """Test rejection when strategy name is missing."""
        import_data = {"schema_version": "1.0", "strategy": {"trade_direction": "long"}}

        with patch("core.strategy_service.is_configured", return_value=False):
            result = validate_import(import_data)

        assert result.valid is False
        assert any("name" in e.lower() for e in result.errors)

    def test_rejects_name_exceeding_max_length(self):
        """Test rejection when name exceeds 50 characters."""
        import_data = {
            "schema_version": "1.0",
            "strategy": {"name": "A" * 51, "trade_direction": "long"},
        }

        with patch("core.strategy_service.is_configured", return_value=False):
            result = validate_import(import_data)

        assert result.valid is False
        assert any("50 characters" in e for e in result.errors)

    def test_rejects_invalid_trade_direction(self):
        """Test rejection of invalid trade direction."""
        import_data = {
            "schema_version": "1.0",
            "strategy": {"name": "Test Strategy", "trade_direction": "invalid_direction"},
        }

        with patch("core.strategy_service.is_configured", return_value=False):
            result = validate_import(import_data)

        assert result.valid is False
        assert any("trade_direction" in e.lower() for e in result.errors)

    def test_generates_preview_for_valid_data(self):
        """Test that preview is generated for valid import data."""
        import_data = {
            "schema_version": "1.0",
            "strategy": {
                "name": "Preview Test",
                "description": "Test description",
                "tags": ["tag1", "tag2"],
                "trade_direction": "both",
                "pair": "EUR_USD",
                "timeframe": "H1",
                "indicators": [{"id": "rsi"}, {"id": "macd"}],
                "conditions": [{"id": "cond1"}],
                "drawings": [],
                "patterns": [{"id": "pat1"}],
            },
        }

        with patch("core.strategy_service.is_configured", return_value=False):
            result = validate_import(import_data)

        assert result.valid is True
        assert result.strategy_preview["name"] == "Preview Test"
        assert result.strategy_preview["description"] == "Test description"
        assert result.strategy_preview["indicator_count"] == 2
        assert result.strategy_preview["condition_count"] == 1
        assert result.strategy_preview["pattern_count"] == 1

    def test_detects_name_conflict_when_configured(self):
        """Test detection of name conflict when Supabase is configured."""
        import_data = {
            "schema_version": "1.0",
            "strategy": {"name": "Existing Strategy", "trade_direction": "long"},
        }

        mock_check_result = MagicMock()
        mock_check_result.exists = True
        mock_check_result.strategy_id = "existing-id-123"

        with patch("core.strategy_service.is_configured", return_value=True):
            with patch(
                "core.strategy_service.check_name_exists",
                return_value=(True, mock_check_result, None),
            ):
                result = validate_import(import_data)

        assert result.valid is True
        assert result.name_conflict is True
        assert result.conflicting_strategy_id == "existing-id-123"
        assert any("already exists" in w for w in result.warnings)


class TestStrategyExportModel:
    """Test cases for StrategyExport model."""

    def test_creates_export_with_strategy(self):
        """Test creating an export model with strategy."""
        strategy = StrategyConfig(
            name="Export Test", trade_direction="long", indicators=[], conditions=[]
        )

        export = StrategyExport(
            schema_version="1.0", export_date=datetime.now(timezone.utc), strategy=strategy
        )

        assert export.schema_version == "1.0"
        assert export.strategy.name == "Export Test"

    def test_export_serializes_to_json(self):
        """Test that export model serializes to JSON correctly."""
        strategy = StrategyConfig(
            name="JSON Test",
            trade_direction="both",
            indicators=[],  # Empty indicators for simple test
            conditions=[],
        )

        export = StrategyExport(
            schema_version="1.0", export_date=datetime.now(timezone.utc), strategy=strategy
        )

        # Should not raise any errors
        json_data = export.model_dump(mode="json")
        assert json_data["schema_version"] == "1.0"
        assert json_data["strategy"]["name"] == "JSON Test"


class TestImportValidationResult:
    """Test cases for ImportValidationResult model."""

    def test_creates_valid_result(self):
        """Test creating a valid validation result."""
        result = ImportValidationResult(
            valid=True,
            errors=[],
            warnings=["Minor warning"],
            strategy_preview={"name": "Test"},
            name_conflict=False,
            conflicting_strategy_id=None,
        )

        assert result.valid is True
        assert len(result.warnings) == 1

    def test_creates_invalid_result(self):
        """Test creating an invalid validation result."""
        result = ImportValidationResult(
            valid=False,
            errors=["Error 1", "Error 2"],
            warnings=[],
            strategy_preview=None,
            name_conflict=False,
            conflicting_strategy_id=None,
        )

        assert result.valid is False
        assert len(result.errors) == 2

    def test_creates_result_with_conflict(self):
        """Test creating result with name conflict."""
        result = ImportValidationResult(
            valid=True,
            errors=[],
            warnings=["Name conflict detected"],
            strategy_preview={"name": "Conflicting"},
            name_conflict=True,
            conflicting_strategy_id="conflict-id-456",
        )

        assert result.name_conflict is True
        assert result.conflicting_strategy_id == "conflict-id-456"


class TestSupportedSchemaVersions:
    """Test cases for schema version support."""

    def test_version_1_0_is_supported(self):
        """Test that version 1.0 is in supported versions."""
        assert "1.0" in SUPPORTED_SCHEMA_VERSIONS

    def test_supported_versions_is_not_empty(self):
        """Test that there is at least one supported version."""
        assert len(SUPPORTED_SCHEMA_VERSIONS) > 0
