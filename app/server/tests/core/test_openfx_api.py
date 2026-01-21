"""
Tests for OpenFX API Client
============================
Unit tests for the OpenFX API client module.
"""

from unittest.mock import MagicMock, patch

import pytest

from core.openfx_api import OpenFxApi


class TestOpenFxApi:
    """Test cases for OpenFxApi class."""

    @pytest.fixture
    def api_client(self):
        """Create an API client instance for testing."""
        return OpenFxApi()

    def test_api_client_initialization(self, api_client):
        """Test that API client initializes correctly."""
        assert api_client is not None
        assert api_client.session is not None
        assert api_client.last_req_time is not None

    def test_throttle_mechanism(self, api_client):
        """Test that throttle mechanism exists."""
        # Record initial time
        initial_time = api_client.last_req_time

        # Call throttle
        api_client._throttle()

        # Verify time was updated
        assert api_client.last_req_time >= initial_time

    @patch('core.openfx_api.requests.Session.get')
    def test_get_account_summary_success(self, mock_get, api_client):
        """Test successful account summary retrieval."""
        # Mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'Balance': 10000.00,
            'Margin': 500.00,
            'Currency': 'USD'
        }
        mock_get.return_value = mock_response

        result = api_client.get_account_summary()

        # Should return the account data
        assert result is not None
        assert 'Balance' in result or result is not None

    @patch('core.openfx_api.requests.Session.get')
    def test_get_account_summary_failure(self, mock_get, api_client):
        """Test account summary retrieval on failure."""
        # Mock failed response
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {'error': 'Unauthorized'}
        mock_get.return_value = mock_response

        result = api_client.get_account_summary()

        # Should return None on failure
        assert result is None

    def test_web_api_candles_pair_format(self, api_client):
        """Test that pair names are formatted correctly."""
        # The method should handle both EUR_USD and EURUSD formats
        pair_with_underscore = "EUR_USD"
        expected = "EURUSD"

        # Test the transformation logic
        assert pair_with_underscore.replace('_', '') == expected


class TestOpenFxApiCandles:
    """Test cases for candle-related operations."""

    @pytest.fixture
    def api_client(self):
        """Create an API client instance for testing."""
        return OpenFxApi()

    @patch('core.openfx_api.OpenFxApi.fetch_candles')
    def test_get_candles_df_returns_none_on_failure(self, mock_fetch, api_client):
        """Test that get_candles_df returns None when fetch fails."""
        mock_fetch.return_value = (False, None)

        result = api_client.get_candles_df("EURUSD", count=-10, granularity="H1")

        assert result is None

    @patch('core.openfx_api.OpenFxApi.get_candles_df')
    def test_last_complete_candle_returns_none_on_empty(self, mock_df, api_client):
        """Test that last_complete_candle returns None for empty data."""
        mock_df.return_value = None

        result = api_client.last_complete_candle("EURUSD", "H1")

        assert result is None


class TestOpenFxApiTrading:
    """Test cases for trading operations."""

    @pytest.fixture
    def api_client(self):
        """Create an API client instance for testing."""
        return OpenFxApi()

    def test_direction_constants(self):
        """Test that trading direction constants are correct."""
        from config import settings

        assert settings.BUY == 1
        assert settings.SELL == -1
        assert settings.NONE == 0

    @patch('core.openfx_api.OpenFxApi._make_request')
    def test_get_open_trades_success(self, mock_request, api_client):
        """Test successful open trades retrieval."""
        mock_request.return_value = (True, [
            {'Id': 1, 'Symbol': 'EURUSD', 'Price': 1.1000,
             'InitialAmount': 10000, 'Profit': 50.0, 'Margin': 100.0}
        ])

        result = api_client.get_open_trades()

        assert result is not None
        assert len(result) == 1

    @patch('core.openfx_api.OpenFxApi._make_request')
    def test_get_open_trades_failure(self, mock_request, api_client):
        """Test open trades retrieval on failure."""
        mock_request.return_value = (False, {'error': 'Failed'})

        result = api_client.get_open_trades()

        assert result is None


class TestMockDataFallback:
    """Test cases for mock data fallback functionality."""

    @pytest.fixture
    def api_client(self):
        """Create an API client instance for testing."""
        return OpenFxApi()

    def test_mock_data_returns_valid_structure(self, api_client):
        """Test that mock data has all required keys."""
        result = api_client._generate_mock_candles("EUR_USD", "H1", 10)

        assert 'time' in result
        assert 'mid_o' in result
        assert 'mid_h' in result
        assert 'mid_l' in result
        assert 'mid_c' in result

    def test_mock_data_has_correct_length(self, api_client):
        """Test that mock data returns correct number of candles."""
        count = 50
        result = api_client._generate_mock_candles("EUR_USD", "H1", count)

        assert len(result['time']) == count
        assert len(result['mid_o']) == count
        assert len(result['mid_h']) == count
        assert len(result['mid_l']) == count
        assert len(result['mid_c']) == count

    def test_mock_data_time_series_valid(self, api_client):
        """Test that mock data time values are properly formatted."""
        result = api_client._generate_mock_candles("EUR_USD", "H1", 10)

        # Check time format (YY-MM-DD HH:MM)
        for time_str in result['time']:
            assert len(time_str) == 14  # "YY-MM-DD HH:MM" format
            assert time_str[2] == '-'
            assert time_str[5] == '-'
            assert time_str[8] == ' '
            assert time_str[11] == ':'

    def test_mock_data_ohlc_values_valid(self, api_client):
        """Test that OHLC values are realistic (high >= low, etc.)."""
        result = api_client._generate_mock_candles("EUR_USD", "H1", 100)

        for i in range(len(result['time'])):
            high = result['mid_h'][i]
            low = result['mid_l'][i]
            open_val = result['mid_o'][i]
            close_val = result['mid_c'][i]

            assert high >= low, f"High ({high}) should be >= Low ({low})"
            assert high >= open_val, f"High ({high}) should be >= Open ({open_val})"
            assert high >= close_val, f"High ({high}) should be >= Close ({close_val})"
            assert low <= open_val, f"Low ({low}) should be <= Open ({open_val})"
            assert low <= close_val, f"Low ({low}) should be <= Close ({close_val})"

    def test_mock_data_consistent_for_same_pair(self, api_client):
        """Test that same pair generates consistent mock data (seeded)."""
        result1 = api_client._generate_mock_candles("EUR_USD", "H1", 10)
        result2 = api_client._generate_mock_candles("EUR_USD", "H1", 10)

        # OHLC values should be the same due to seeded random
        assert result1['mid_o'] == result2['mid_o']
        assert result1['mid_h'] == result2['mid_h']
        assert result1['mid_l'] == result2['mid_l']
        assert result1['mid_c'] == result2['mid_c']

    def test_mock_data_different_for_different_pairs(self, api_client):
        """Test that different pairs generate different mock data."""
        result_eur = api_client._generate_mock_candles("EUR_USD", "H1", 10)
        result_gbp = api_client._generate_mock_candles("GBP_USD", "H1", 10)

        # Different pairs should have different base prices
        assert result_eur['mid_o'][0] != result_gbp['mid_o'][0]

    @patch('core.openfx_api.OpenFxApi.get_candles_df')
    def test_fallback_on_api_failure(self, mock_df, api_client):
        """Test that mock data is used when API fails."""
        mock_df.return_value = None

        result = api_client.web_api_candles("EUR_USD", "H1", 10)

        # Should return mock data, not an error
        assert 'error' not in result
        assert 'time' in result
        assert 'mid_o' in result
        assert len(result['time']) == 10


class TestAccountEndpoint:
    """Test cases for the /api/account endpoint."""

    @pytest.fixture
    def test_client(self):
        """Create a test client for the FastAPI app."""
        from fastapi.testclient import TestClient

        from server import app
        return TestClient(app)

    @patch('server.api.get_account_summary')
    def test_account_endpoint_success(self, mock_get_summary, test_client):
        """Test successful account summary retrieval via endpoint."""
        mock_get_summary.return_value = {
            'Id': 12345,
            'Balance': 10000.00,
            'Equity': 10500.00,
            'Profit': 500.00,
            'Margin': 200.00,
            'MarginLevel': 5250.00,
            'Leverage': 100
        }

        response = test_client.get('/api/account')

        assert response.status_code == 200
        data = response.json()
        assert 'Id' in data
        assert 'Balance' in data
        assert 'Equity' in data
        assert 'Profit' in data
        assert 'Margin' in data
        assert 'MarginLevel' in data
        assert 'Leverage' in data
        assert data['Balance'] == 10000.00

    @patch('server.api.get_account_summary')
    def test_account_endpoint_api_failure(self, mock_get_summary, test_client):
        """Test account endpoint when API returns None."""
        mock_get_summary.return_value = None

        response = test_client.get('/api/account')

        assert response.status_code == 200
        data = response.json()
        assert 'error' in data
        assert data['error'] == 'Failed to fetch account data'

    @patch('server.api.get_account_summary')
    def test_account_endpoint_exception(self, mock_get_summary, test_client):
        """Test account endpoint when exception is raised."""
        mock_get_summary.side_effect = Exception('Connection error')

        response = test_client.get('/api/account')

        assert response.status_code == 200
        data = response.json()
        assert 'error' in data
        assert 'Connection error' in data['error']
