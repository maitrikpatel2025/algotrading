# FXOpen TickTrader Web API Documentation

## Overview

This documentation covers the FXOpen TickTrader Web API, including REST endpoints and WebSocket interfaces for trading operations, account management, and market data.

**Base URL:** `https://marginalttdemowebapi.fxopen.net`

**API Version:** 2.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [REST API Endpoints](#rest-api-endpoints)
   - [Account Information](#account-information)
   - [Currency Information](#currency-information)
   - [Interest Rate History](#interest-rate-history)
   - [Quote History](#quote-history)
   - [Server Information](#server-information)
   - [Stock Events](#stock-events)
   - [Swap Size History](#swap-size-history)
   - [Symbols Information](#symbols-information)
   - [Trade History](#trade-history)
   - [Trade Operations](#trade-operations)
3. [WebSocket API](#websocket-api)
4. [Data Types & Schemas](#data-types--schemas)
5. [Error Codes](#error-codes)

---

## Authentication

### HMAC Authentication

All API requests require HMAC authentication using the following headers:

```
Content-type: application/json
Accept: application/json
Accept-encoding: gzip, deflate
Authorization: HMAC webApiId:webApiKey:unix_timestamp_in_ms:Base64HMACSignature
```

### Signature Calculation

```javascript
// JavaScript Example
long timestamp = new Date(System.currentTimeMillis()).getTime();
String signature = timestamp + webApiId + webApiKey + req.getMethod() + req.getURI() + content;
byte[] messageBytes = signature.getBytes(StandardCharsets.US_ASCII);
byte[] hmacKeyByte = webApiSecret.getBytes(StandardCharsets.US_ASCII);
Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
SecretKeySpec secret_key = new SecretKeySpec(hmacKeyByte, "HmacSHA256");
sha256_HMAC.init(secret_key);
byte[] mac_data = sha256_HMAC.doFinal(messageBytes);
byte[] valueDecoded = Base64.encodeBase64(mac_data);
String base64HMACStr = new String(valueDecoded);
```

### Python Implementation

```python
import hmac
import hashlib
import base64
import time
import requests

class FXOpenClient:
    def __init__(self, web_api_id: str, web_api_key: str, web_api_secret: str, base_url: str):
        self.web_api_id = web_api_id
        self.web_api_key = web_api_key
        self.web_api_secret = web_api_secret
        self.base_url = base_url

    def _create_signature(self, method: str, uri: str, content: str = "") -> tuple:
        timestamp = int(time.time() * 1000)
        signature_string = f"{timestamp}{self.web_api_id}{self.web_api_key}{method}{uri}{content}"
        
        hmac_hash = hmac.new(
            self.web_api_secret.encode('ascii'),
            signature_string.encode('ascii'),
            hashlib.sha256
        )
        base64_signature = base64.b64encode(hmac_hash.digest()).decode('ascii')
        
        return timestamp, base64_signature

    def _get_headers(self, method: str, uri: str, content: str = "") -> dict:
        timestamp, signature = self._create_signature(method, uri, content)
        return {
            "Content-type": "application/json",
            "Accept": "application/json",
            "Accept-encoding": "gzip, deflate",
            "Authorization": f"HMAC {self.web_api_id}:{self.web_api_key}:{timestamp}:{signature}"
        }

    def get(self, endpoint: str) -> dict:
        uri = f"/api/v2{endpoint}"
        headers = self._get_headers("GET", uri)
        response = requests.get(f"{self.base_url}{uri}", headers=headers)
        return response.json()

    def post(self, endpoint: str, data: dict) -> dict:
        import json
        uri = f"/api/v2{endpoint}"
        content = json.dumps(data)
        headers = self._get_headers("POST", uri, content)
        response = requests.post(f"{self.base_url}{uri}", headers=headers, data=content)
        return response.json()
```

---

## REST API Endpoints

### Account Information

#### GET `/api/v2/account`
Get account information.

**Response:** `WebApiAccount`

```json
{
  "Id": 5,
  "AccountingType": "Gross",
  "Name": "DemoForexGross",
  "Leverage": 100,
  "Balance": 999999741.19,
  "BalanceCurrency": "USD",
  "Profit": 0.0,
  "Commission": 0.0,
  "Swap": 0.0,
  "Equity": 999999741.19,
  "Margin": 0,
  "MarginLevel": 0,
  "MarginCallLevel": 50,
  "StopOutLevel": 30
}
```

---

#### GET `/api/v2/asset`
Get list of all cash account assets. **Works only for cash accounts!**

**Response:** `WebApiAsset[]`

```json
[
  {
    "Currency": "USD",
    "Amount": 100000.0,
    "FreeAmount": 95000.0,
    "LockedAmount": 5000.0
  }
]
```

---

#### GET `/api/v2/asset/{id}`
Get cash account asset by currency name.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Currency name (e.g., "USD", "EUR") |

**Response:** `WebApiAsset`

---

#### POST `/api/v2/dailysnapshots`
Get daily account snapshots.

**Request Body:** `WebApiDailyAccountSnapshotRequest`

```json
{
  "TimestampFrom": 1704067200000,
  "TimestampTo": 1704153600000,
  "RequestDirection": "Forward",
  "RequestPageSize": 100,
  "RequestLastId": null
}
```

**Response:** `WebApiDailyAccountSnapshotReport`

---

#### GET `/api/v2/position`
Get list of all available positions. **Works only for net accounts!**

**Response:** `WebApiPosition[]`

---

#### GET `/api/v2/position/{id}`
Get position by Id or symbol name. **Works only for net accounts!**

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Position Id or symbol name |

**Response:** `WebApiPosition`

---

### Currency Information

#### GET `/api/v2/currency`
Get list of all available currencies.

**Response:** `WebApiCurrency[]`

```json
[
  {
    "Name": "USD",
    "Precision": 2,
    "Description": "US Dollar",
    "Type": "Fiat",
    "Tax": 0.0,
    "DefaultStockFee": 0.0,
    "InterestRate": 0.0,
    "InterestMarkup": 0.0
  }
]
```

---

#### GET `/api/v2/currency/{filter}`
Get filtered currencies list.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | Yes | Currency names separated by space (e.g., "USD EUR GBP") |

**Response:** `WebApiCurrency[]`

---

#### GET `/api/v2/currency/type`
Get list of all available currency types.

**Response:** `WebApiCurrencyType[]`

---

### Interest Rate History

#### POST `/api/v2/interestratehistory`
Get currency interest rate history.

**Request Body:** `WebApiInterestRateHistoryRequest`

```json
{
  "Currencies": ["USD", "EUR"],
  "TimestampFrom": 1704067200000,
  "TimestampTo": 1704153600000,
  "RequestDirection": "Forward",
  "RequestPageSize": 1000,
  "RequestLastId": null
}
```

**Response:** `WebApiInterestRateHistoryReport`

---

### Quote History

#### GET `/api/v2/quotehistory/version`
Get quote history version.

**Response:** `integer`

---

#### GET `/api/v2/quotehistory/symbols`
Get quote history supported symbols.

**Response:** `string[]`

---

#### GET `/api/v2/quotehistory/{symbol}/periodicities`
Get supported bars periodicities for a symbol.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Symbol name (e.g., "EURUSD") |

**Response:** `string[]` (e.g., ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN1"])

---

#### GET `/api/v2/quotehistory/{symbol}/{periodicity}/bars/ask/info`
Get 'ask' bars meta information.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Symbol name |
| `periodicity` | string | Yes | Periodicity (M1, M5, M15, M30, H1, H4, D1, W1, MN1) |

**Response:** `WebApiQuoteHistoryInfo`

---

#### GET `/api/v2/quotehistory/{symbol}/{periodicity}/bars/bid/info`
Get 'bid' bars meta information.

**Path Parameters:** Same as above

**Response:** `WebApiQuoteHistoryInfo`

---

#### GET `/api/v2/quotehistory/{symbol}/{periodicity}/bars/ask`
Get 'ask' bars for a symbol.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Symbol name |
| `periodicity` | string | Yes | Periodicity |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `timestamp` | int64 | No | Timestamp in milliseconds |
| `count` | int32 | No | Count of bars (negative = backward, positive = forward, max 1000) |

**Response:** `WebApiQuoteHistoryBars`

```json
{
  "Symbol": "EURUSD",
  "From": 1704067200000,
  "To": 1704153600000,
  "AvailableFrom": 1609459200000,
  "AvailableTo": 1704153600000,
  "Bars": [
    {
      "Timestamp": 1704067200000,
      "Open": 1.10123,
      "High": 1.10234,
      "Low": 1.10012,
      "Close": 1.10198,
      "Volume": 15234.5
    }
  ]
}
```

---

#### GET `/api/v2/quotehistory/{symbol}/{periodicity}/bars/bid`
Get 'bid' bars for a symbol.

**Parameters:** Same as `/bars/ask`

**Response:** `WebApiQuoteHistoryBars`

---

#### GET `/api/v2/quotehistory/cache/{symbol}/{periodicity}/bars/ask`
Get cached 'ask' bars.

**Parameters:** Same as regular bars endpoint

**Response:** `WebApiQuoteHistoryBarsCache`

---

#### GET `/api/v2/quotehistory/cache/{symbol}/{periodicity}/bars/bid`
Get cached 'bid' bars.

**Parameters:** Same as regular bars endpoint

**Response:** `WebApiQuoteHistoryBarsCache`

---

#### GET `/api/v2/quotehistory/{symbol}/ticks/info`
Get ticks meta information.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Symbol name |

**Response:** `WebApiQuoteHistoryInfo`

---

#### GET `/api/v2/quotehistory/{symbol}/ticks`
Get quote history ticks.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Symbol name |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `timestamp` | int64 | No | Timestamp in milliseconds |
| `count` | int32 | No | Count of ticks (max 1000) |

**Response:** `WebApiQuoteHistoryTicks`

---

#### GET `/api/v2/quotehistory/{symbol}/level2/info`
Get Level2 ticks meta information.

**Response:** `WebApiQuoteHistoryInfo`

---

#### GET `/api/v2/quotehistory/{symbol}/level2`
Get Level2 ticks.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `timestamp` | int64 | No | Timestamp in milliseconds |
| `count` | int32 | No | Count of level2 ticks (max 1000) |

**Response:** `WebApiQuoteHistoryLevel2`

---

#### GET `/api/v2/quotehistory/{symbol}/vwap/{degree}/info`
Get VWAP ticks meta information.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | Yes | Symbol name |
| `degree` | int32 | Yes | Decimal degree VWAP volume level |

**Response:** `WebApiQuoteHistoryInfo`

---

#### GET `/api/v2/quotehistory/{symbol}/ticks/vwap/{degree}`
Get VWAP ticks.

**Response:** `WebApiQuoteHistoryInfo`

---

### Server Information

#### GET `/api/v2/tradeserverinfo`
Get trade server information.

**Response:** `WebApiTradeServerInfo`

```json
{
  "CompanyName": "FXOpen",
  "CompanyFullName": "FXOpen Ltd",
  "ServerName": "TickTrader Demo",
  "ServerAddress": "marginalttdemowebapi.fxopen.net",
  "ServerRestPort": 443
}
```

---

#### GET `/api/v2/tradesession`
Get trade session information.

**Response:** `WebApiTradeSessionStatus`

```json
{
  "PlatformName": "TickTrader Demo Server",
  "PlatformCompany": "FXOpen",
  "PlatformTimezoneOffset": 3,
  "SessionId": "e36c076b-4e38-472d-b271-017a4152f09e",
  "SessionStatus": "Opened",
  "SessionStartTime": 1443722400000,
  "SessionEndTime": 253402297200000,
  "SessionOpenTime": 1443722400000,
  "SessionCloseTime": 253402297200000
}
```

---

### Stock Events

#### GET `/api/v2/dividend`
Get all dividends.

**Response:** `WebApiDividend[]`

---

#### GET `/api/v2/dividend/{filter}`
Get dividends by filter.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | Yes | Symbol names separated by space |

**Response:** `WebApiDividend[]`

---

#### GET `/api/v2/merger-and-acquisition`
Get all merger and acquisitions.

**Response:** `WebApiMergerAndAcquisition[]`

---

#### GET `/api/v2/merger-and-acquisition/{filter}`
Get merger and acquisitions by symbols.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | Yes | Symbol names separated by space |

**Response:** `WebApiMergerAndAcquisition[]`

---

#### GET `/api/v2/split`
Get all splits.

**Response:** `WebApiSplit[]`

---

#### GET `/api/v2/split/bysymbol/{filter}`
Get splits by symbols.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | Yes | Symbol names separated by space |

**Response:** `WebApiSplit[]`

---

#### GET `/api/v2/split/bycurrency/{filter}`
Get splits by currency.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | Yes | Currency names separated by space |

**Response:** `WebApiSplit[]`

---

### Swap Size History

#### POST `/api/v2/swapsizehistory`
Get symbol swap size history.

**Request Body:** `WebApiSwapSizeHistoryRequest`

```json
{
  "Symbols": ["EURUSD", "GBPUSD"],
  "TimestampFrom": 1704067200000,
  "TimestampTo": 1704153600000,
  "RequestDirection": "Forward",
  "RequestPageSize": 1000,
  "RequestLastId": null
}
```

**Response:** `WebApiSwapSizeHistoryReport`

---

### Symbols Information

#### GET `/api/v2/symbol`
Get list of all available symbols.

**Response:** `WebApiSymbol[]`

```json
[
  {
    "Symbol": "EURUSD",
    "Precision": 5,
    "MarginMode": "Forex",
    "ProfitMode": "Forex",
    "ContractSize": 100000,
    "MarginFactor": 1.0,
    "MarginCurrency": "EUR",
    "ProfitCurrency": "USD",
    "Description": "Euro vs US Dollar",
    "SwapEnabled": true,
    "SwapType": "Points",
    "SwapSizeShort": -0.5,
    "SwapSizeLong": 0.3,
    "MinTradeAmount": 0.01,
    "MaxTradeAmount": 100.0,
    "TradeAmountStep": 0.01
  }
]
```

---

#### GET `/api/v2/symbol/{filter}`
Get filtered symbols list.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | Yes | Symbol names separated by space |

**Response:** `WebApiSymbol[]`

---

#### GET `/api/v2/tick`
Get list of all available feed ticks.

**Response:** `WebApiFeedTick[]`

```json
[
  {
    "Symbol": "EURUSD",
    "Timestamp": 1704153600000,
    "BestBid": { "Type": "Bid", "Price": 1.10123, "Volume": 1000000 },
    "BestAsk": { "Type": "Ask", "Price": 1.10125, "Volume": 1000000 },
    "IndicativeTick": false
  }
]
```

---

#### GET `/api/v2/tick/{filter}`
Get filtered feed ticks list.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | Yes | Symbol names separated by space |

**Response:** `WebApiFeedTick[]`

---

#### GET `/api/v2/level2`
Get list of all available Level2 ticks.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `depth` | int32 | 1 | Depth of Market |

**Response:** `WebApiFeedTickLevel2[]`

---

#### GET `/api/v2/level2/{filter}`
Get filtered Level2 tick list.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filter` | string | Yes | Symbol names separated by space |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `depth` | int32 | 1 | Depth of Market |

**Response:** `WebApiFeedTickLevel2[]`

---

#### GET `/api/v2/pipsvalue`
Get list of pips values.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `targetCurrency` | string | No | Target currency |
| `symbols` | string | No | Symbol names separated by space (default = all) |

**Response:** `WebApiPipsValue[]`

---

### Trade History

#### POST `/api/v2/tradehistory`
Get account trade history.

**Request Body:** `WebApiTradeHistoryRequest`

```json
{
  "TimestampFrom": 1704067200000,
  "TimestampTo": 1704153600000,
  "OrderId": null,
  "SkipCancelOrder": false,
  "RequestDirection": "Forward",
  "RequestPageSize": 1000,
  "RequestLastId": null
}
```

**Response:** `WebApiTradeHistoryReport`

```json
{
  "IsLastReport": false,
  "TotalReports": 1500,
  "LastId": "abc123",
  "Records": [
    {
      "Id": "record123",
      "TransactionType": "OrderFilled",
      "TransactionReason": "ClientRequest",
      "TransactionTimestamp": 1704153600000,
      "Symbol": "EURUSD",
      "TradeId": 769002,
      "TradeSide": "Buy",
      "TradeType": "Market"
    }
  ]
}
```

---

### Trade Operations

#### GET `/api/v2/trade`
Get list of all available trades.

**Response:** `WebApiTrade[]`

```json
[
  {
    "Id": 769002,
    "ClientId": "client-123",
    "AccountId": 5,
    "Type": "Position",
    "InitialType": "Market",
    "Side": "Buy",
    "Status": "Calculated",
    "Symbol": "EURUSD",
    "Price": 1.11992,
    "InitialAmount": 100000,
    "RemainingAmount": 100000,
    "FilledAmount": 0,
    "Commission": -5.60,
    "Swap": 0,
    "Created": 1444060398377,
    "Modified": 1444060398384
  }
]
```

---

#### GET `/api/v2/trade/{id}`
Get trade by Id.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | int64 | Yes | Trade Id |

**Response:** `WebApiTrade`

---

#### POST `/api/v2/trade`
Create new trade.

**Request Body:** `WebApiTradeCreate`

```json
{
  "ClientId": "my-trade-123",
  "Type": "Market",
  "Side": "Buy",
  "Symbol": "EURUSD",
  "Amount": 100000,
  "Price": null,
  "StopPrice": null,
  "StopLoss": 1.10000,
  "TakeProfit": 1.12000,
  "Expired": null,
  "ImmediateOrCancel": false,
  "MarketWithSlippage": false,
  "Slippage": 0.0001,
  "Comment": "My trade"
}
```

**Trade Types:**
- `Market` - Market order
- `Limit` - Limit order (requires `Price`)
- `Stop` - Stop order (requires `StopPrice`)
- `StopLimit` - Stop-Limit order (requires both `Price` and `StopPrice`)

**Response:** `WebApiTrade`

---

#### PUT `/api/v2/trade`
Modify existing trade.

**Request Body:** `WebApiTradeModify`

```json
{
  "Id": 769002,
  "Price": 1.10500,
  "StopPrice": null,
  "AmountChange": 50000,
  "StopLoss": 1.09500,
  "TakeProfit": 1.12000,
  "Expired": null,
  "Comment": "Modified trade"
}
```

**Response:** `WebApiTrade`

---

#### DELETE `/api/v2/trade`
Cancel or close existing trade.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `Type` | string | Yes | `Cancel`, `Close`, or `CloseBy` |
| `Id` | int64 | Yes | Trade Id |
| `Amount` | double | No | Close amount (for partial close) |
| `ById` | int64 | No | By trade Id (for CloseBy operation) |

**Response:** `TradeDeleteResult`

---

#### POST `/api/v2/trade/oco`
Create new OCO (One-Cancels-the-Other) trades.

**Request Body:** `WebApiOcoTradeRequest`

```json
{
  "FirstRequest": {
    "Type": "Stop",
    "Side": "Buy",
    "Symbol": "EURUSD",
    "Amount": 100000,
    "StopPrice": 1.12000,
    "Comment": "OCO Stop"
  },
  "SecondRequest": {
    "Type": "Limit",
    "Side": "Buy",
    "Symbol": "EURUSD",
    "Amount": 100000,
    "Price": 1.10000,
    "Comment": "OCO Limit"
  }
}
```

**Response:** `TradeCreateOcoResult`

```json
{
  "FirstTrade": { ... },
  "SecondTrade": { ... }
}
```

---

## WebSocket API

### Connection

Connect using WebSocket Secure (wss://):

```
wss://marginalttdemowebapi.fxopen.net:443
```

### Authentication

#### Login Request

```json
{
  "Id": "unique-request-id",
  "Request": "Login",
  "Params": {
    "AuthType": "HMAC",
    "WebApiId": "your-web-api-id",
    "WebApiKey": "your-web-api-key",
    "Timestamp": 1704153600000,
    "Signature": "base64-hmac-signature",
    "DeviceId": "WebBrowser",
    "AppSessionId": "session-123"
  }
}
```

#### Login Response

```json
{
  "Id": "unique-request-id",
  "Response": "Login",
  "Result": {
    "Info": "ok",
    "TwoFactorFlag": false
  }
}
```

### WebSocket Requests

#### Session Information

```json
{ "Id": "req-1", "Request": "SessionInfo" }
```

#### Trade Session Information

```json
{ "Id": "req-2", "Request": "TradeSessionInfo" }
```

#### Account Information

```json
{ "Id": "req-3", "Request": "Account" }
```

#### Get Assets (Cash accounts only)

```json
{ "Id": "req-4", "Request": "Assets" }
```

```json
{ "Id": "req-5", "Request": "Assets", "Params": { "Currency": "USD" } }
```

#### Get Positions (Net accounts only)

```json
{ "Id": "req-6", "Request": "Positions" }
```

```json
{ "Id": "req-7", "Request": "Positions", "Params": { "Id": 555003 } }
```

```json
{ "Id": "req-8", "Request": "Positions", "Params": { "Symbol": "EURUSD" } }
```

#### Get Trades

```json
{ "Id": "req-9", "Request": "Trades" }
```

```json
{ "Id": "req-10", "Request": "Trades", "Params": { "Id": 769002 } }
```

#### Create Trade

```json
{
  "Id": "req-11",
  "Request": "TradeCreate",
  "Params": {
    "Type": "Market",
    "Side": "Buy",
    "Symbol": "EURUSD",
    "Amount": 100000,
    "StopLoss": 1.10000,
    "TakeProfit": 1.12000,
    "Comment": "WebSocket API trade",
    "ClientId": "client-trade-123"
  }
}
```

#### Create Limit Trade

```json
{
  "Id": "req-12",
  "Request": "TradeCreate",
  "Params": {
    "Type": "Limit",
    "Side": "Buy",
    "Symbol": "EURUSD",
    "Amount": 100000,
    "Price": 1.10500,
    "Expired": 1704240000000,
    "Comment": "WebSocket API limit"
  }
}
```

#### Create Stop Trade

```json
{
  "Id": "req-13",
  "Request": "TradeCreate",
  "Params": {
    "Type": "Stop",
    "Side": "Buy",
    "Symbol": "EURUSD",
    "Amount": 100000,
    "Price": 1.12000,
    "Comment": "WebSocket API stop"
  }
}
```

#### Modify Trade

```json
{
  "Id": "req-14",
  "Request": "TradeModify",
  "Params": {
    "Id": 769002,
    "StopLoss": 1.09500,
    "TakeProfit": 1.12500,
    "Comment": "Modified via WebSocket"
  }
}
```

#### Cancel Pending Trade

```json
{
  "Id": "req-15",
  "Request": "TradeDelete",
  "Params": {
    "Type": "Cancel",
    "Id": 769004
  }
}
```

#### Close Market Trade (Full)

```json
{
  "Id": "req-16",
  "Request": "TradeDelete",
  "Params": {
    "Type": "Close",
    "Id": 769002
  }
}
```

#### Close Market Trade (Partial)

```json
{
  "Id": "req-17",
  "Request": "TradeDelete",
  "Params": {
    "Type": "Close",
    "Id": 769002,
    "Amount": 50000
  }
}
```

#### Close By Trade

```json
{
  "Id": "req-18",
  "Request": "TradeDelete",
  "Params": {
    "Type": "CloseBy",
    "Id": 769002,
    "ById": 769003
  }
}
```

#### Trade History

```json
{
  "Id": "req-19",
  "Request": "TradeHistory",
  "Params": {
    "TimestampFrom": 1704067200000,
    "TimestampTo": 1704153600000,
    "RequestDirection": "Forward",
    "RequestPageSize": 100
  }
}
```

#### Daily Snapshots

```json
{
  "Id": "req-20",
  "Request": "DailySnapshots",
  "Params": {
    "TimestampFrom": 1704067200000,
    "TimestampTo": 1704153600000,
    "RequestDirection": "Forward",
    "RequestPageSize": 100
  }
}
```

### WebSocket Notifications

The server sends notifications automatically for various events:

#### Trade Session Update

```json
{
  "Response": "SessionInfo",
  "Result": {
    "PlatformName": "TickTrader Demo Server",
    "SessionStatus": "Opened",
    ...
  }
}
```

#### Account Update

```json
{
  "Response": "Account",
  "Result": {
    "Id": 5,
    "Balance": 999999741.19,
    ...
  }
}
```

#### Execution Report

```json
{
  "Id": "exec-123",
  "Response": "ExecutionReport",
  "Result": {
    "Event": "Filled",
    "Trade": { ... },
    "Fill": {
      "Amount": 100000,
      "Price": 1.12539
    }
  }
}
```

**Execution Events:**
- `Accepted` - Order accepted
- `Filled` - Order filled
- `PartiallyFilled` - Order partially filled
- `Allocated` - Position allocated
- `Modified` - Trade modified
- `PendingModify` - Modification pending
- `Canceled` - Trade canceled
- `PendingCancel` - Cancellation pending

---

## Data Types & Schemas

### Enums

#### AccountingTypes
```
Gross | Net | Cash
```

#### OrderSides
```
Buy | Sell
```

#### OrderTypes
```
Market | Limit | Stop | Position | StopLimit
```

#### OrderStatuses
```
New | Calculated | Filled | Canceled | Rejected | Expired | PartiallyFilled | Activated | Executing | Invalid
```

#### TradeDeleteTypes
```
Cancel | Close | CloseBy
```

#### TradingSessionStatus
```
Closed | Opened
```

#### StreamingDirections
```
Forward | Backward
```

#### FxPriceType
```
Bid | Ask
```

#### SwapType
```
Points | PercentPerYear
```

#### MarginCalculationModes
```
Forex | CFD | Futures | CFD_Index | CFD_Leverage
```

#### ContingentOrderTriggerTypes
```
None | OnPendingOrderExpired | OnPendingOrderPartiallyFilled | OnTime
```

#### TradeTransTypes
```
OrderOpened | OrderCanceled | OrderExpired | OrderFilled | PositionClosed | Balance | Credit | PositionOpened | OrderActivated | TradeModified
```

#### TradeTransReasons
```
ClientRequest | PndOrdAct | StopOut | StopLossAct | TakeProfitAct | DealerDecision | Rollover | Delete | Expired | TransferMoney | Split | Dividend | OneCancelsTheOther | Overnight
```

### Core Data Types

#### WebApiAccount
```typescript
{
  Id: number;                    // Account Id
  AccountingType: AccountingTypes;
  Name: string;
  FirstName?: string;
  LastName?: string;
  Phone?: string;
  Country?: string;
  State?: string;
  City?: string;
  Address?: string;
  ZipCode?: string;
  Email?: string;
  Comment?: string;
  Registered: number;            // Timestamp in milliseconds
  Modified: number;
  IsArchived: boolean;
  IsBlocked: boolean;
  IsReadonly: boolean;
  IsValid: boolean;
  IsWebApiEnabled: boolean;
  Leverage?: number;
  Balance?: number;
  BalanceCurrency?: string;
  Profit?: number;
  Commission?: number;
  AgentCommission?: number;
  Swap?: number;
  Rebate?: number;
  Equity?: number;
  Margin?: number;
  MarginLevel?: number;
  MarginCallLevel?: number;
  StopOutLevel?: number;
  ReportCurrency?: string;
  IsLongOnly: boolean;
}
```

#### WebApiTrade
```typescript
{
  Id: number;                    // Trade Id
  ClientId?: string;             // Client trade Id
  AccountId: number;
  Type: OrderTypes;
  InitialType: OrderTypes;
  Side: OrderSides;
  Status: OrderStatuses;
  Symbol: string;
  SymbolPrecision?: number;
  StopPrice?: number;
  Price?: number;
  CurrentPrice?: number;
  InitialAmount: number;
  RemainingAmount: number;
  FilledAmount: number;
  MaxVisibleAmount?: number;
  StopLoss?: number;
  TakeProfit?: number;
  Margin?: number;
  Profit?: number;
  Commission?: number;
  AgentCommission?: number;
  Swap?: number;
  ImmediateOrCancel: boolean;
  MarketWithSlippage: boolean;
  FillOrKill: boolean;
  OneCancelsTheOther: boolean;
  Created: number;               // Timestamp in milliseconds
  Expired?: number;
  Modified?: number;
  Filled?: number;
  PositionCreated?: number;
  Comment?: string;
  ClientApp?: string;
  Slippage?: number;
  Rebate?: number;
  RelatedTradeId?: number;
  ContingentOrder: boolean;
  TriggerType: ContingentOrderTriggerTypes;
  TriggerTime?: number;
  OrderIdTriggeredBy?: number;
  ClosePrice?: number;
}
```

#### WebApiTradeCreate
```typescript
{
  ClientId?: string;
  Type: OrderTypes;              // Market | Limit | Stop | StopLimit
  Side: OrderSides;              // Buy | Sell
  Symbol: string;
  Price?: number;                // Required for Limit/StopLimit
  StopPrice?: number;            // Required for Stop/StopLimit
  Amount: number;
  MaxVisibleAmount?: number;     // For iceberg orders
  StopLoss?: number;
  TakeProfit?: number;
  Expired?: number;              // Timestamp in milliseconds
  ImmediateOrCancel?: boolean;
  MarketWithSlippage?: boolean;
  FillOrKill?: boolean;
  Comment?: string;
  ClientIp?: string;
  ClientApp?: string;
  Slippage?: number;
  OneCancelsTheOther?: boolean;
  OcoEqualAmount?: boolean;
  RelatedTradeId?: number;
  ContingentOrder?: boolean;
  TriggerType?: ContingentOrderTriggerTypes;
  TriggerTime?: number;
  OrderIdTriggeredBy?: number;
}
```

#### WebApiTradeModify
```typescript
{
  Id: number;                    // Trade Id (required)
  Price?: number;
  StopPrice?: number;
  AmountChange?: number;         // Change in amount
  MaxVisibleAmount?: number;
  StopLoss?: number;
  TakeProfit?: number;
  Expired?: number;
  Comment?: string;
  ImmediateOrCancel?: boolean;
  FillOrKill?: boolean;
  Slippage?: number;
  OneCancelsTheOther?: boolean;
  OcoEqualAmount?: boolean;
  RelatedTradeId?: number;
  TriggerType?: ContingentOrderTriggerTypes;
  TriggerTime?: number;
  OrderIdTriggeredBy?: number;
}
```

#### WebApiSymbol
```typescript
{
  Symbol: string;
  Precision: number;
  MarginMode: MarginCalculationModes;
  ProfitMode: ProfitCalculationModes;
  ContractSize: number;
  MarginHedged: number;
  MarginFactor: number;
  MarginCurrency: string;
  MarginCurrencyPrecision: number;
  ProfitCurrency: string;
  ProfitCurrencyPrecision: number;
  Description?: string;
  Schedule?: string;
  SwapEnabled: boolean;
  SwapType: SwapType;
  SwapSizeShort: number;
  SwapSizeLong: number;
  TripleSwapDay: number;
  MinTradeAmount: number;
  MaxTradeAmount: number;
  TradeAmountStep: number;
  CommissionType: CommissionValueType;
  CommissionChargeType: CommissionChargeType;
  Commission: number;
  LimitsCommission: number;
  MinCommission: number;
  MinCommissionCurrency?: string;
  DefaultSlippage: number;
  StatusGroupId?: string;
  SecurityName?: string;
  SecurityDescription?: string;
  ISIN?: string;
  TradingMode?: string;
}
```

#### WebApiPosition
```typescript
{
  Id: number;
  Symbol: string;
  LongAmount: number;
  LongPrice: number;
  ShortAmount: number;
  ShortPrice: number;
  Commission?: number;
  AgentCommission?: number;
  Swap?: number;
  Modified?: number;
  Margin?: number;
  Profit?: number;
  CurrentBestAsk?: number;
  CurrentBestBid?: number;
  Created?: number;
}
```

#### WebApiAsset
```typescript
{
  Currency: string;
  Amount: number;
  FreeAmount: number;
  LockedAmount: number;
  CurrencyToReportConversionRate?: number;
  ReportToCurrencyConversionRate?: number;
}
```

#### WebApiFeedTick
```typescript
{
  Symbol: string;
  Timestamp: number;
  BestBid: WebApiFeedLevel2Record;
  BestAsk: WebApiFeedLevel2Record;
  IndicativeTick: boolean;
  TickType: TickTypes;
}
```

#### WebApiFeedLevel2Record
```typescript
{
  Type: FxPriceType;             // Bid | Ask
  Price: number;
  Volume: number;
}
```

#### WebApiFeedBar
```typescript
{
  Timestamp: number;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}
```

#### WebApiQuoteHistoryBars
```typescript
{
  Symbol: string;
  From?: number;
  To?: number;
  AvailableFrom?: number;
  AvailableTo?: number;
  LastTickId?: string;
  Bars: WebApiFeedBar[];
}
```

#### WebApiTradeHistory
```typescript
{
  Id: string;
  TransactionType: TradeTransTypes;
  TransactionReason: TradeTransReasons;
  TransactionTimestamp: number;
  Symbol?: string;
  SymbolPrecision?: number;
  TradeId: number;
  ClientTradeId?: string;
  TradeSide: OrderSides;
  TradeType: OrderTypes;
  TradeCreated?: number;
  TradeModified?: number;
  TradeAmount?: number;
  TradeInitialAmount?: number;
  TradeLastFillAmount?: number;
  TradePrice?: number;
  TradeFillPrice?: number;
  PositionId?: number;
  PositionById?: number;
  PositionAmount?: number;
  PositionInitialAmount?: number;
  PositionLastAmount?: number;
  PositionOpenPrice?: number;
  PositionOpened?: number;
  PositionClosePrice?: number;
  PositionClosed?: number;
  Balance?: number;
  BalanceMovement?: number;
  BalanceCurrency?: string;
  StopLoss?: number;
  TakeProfit?: number;
  Commission?: number;
  CommissionCurrency?: string;
  Swap?: number;
  Rebate?: number;
  Comment?: string;
}
```

#### WebApiCurrency
```typescript
{
  Name: string;
  Precision: number;
  Description?: string;
  Type?: string;
  Tax: number;
  DefaultStockFee: number;
  ExposureSwapSize: number;
  InterestRate: number;
  InterestMarkup: number;
}
```

#### WebApiDividend
```typescript
{
  Id: string;
  Symbol: string;
  Time: number;
  GrossRate: number;
  Currency?: string;
  Fee: number;
  IsApplied: boolean;
}
```

#### WebApiSplit
```typescript
{
  Id: number;
  StartTime: number;
  Ratio: number;
  Symbols?: string[];
  Currencies?: string[];
  FromFactor: number;
  ToFactor: number;
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Ok - Request successful |
| 204 | No Content - Request successful, no content returned |
| 400 | Bad Request - Malformed request syntax |
| 401 | Unauthorized - Authentication required |
| 402 | Payment Required - Insufficient funds |
| 403 | Forbidden - Limited access rights |
| 404 | Not Found - Resource not found |
| 410 | Gone - Off quotes or dealer reject |
| 429 | Too Many Requests - Throttling limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Response Format

```json
{
  "Id": "request-id",
  "Response": "Error",
  "Error": "Error description from server"
}
```

---

## Rate Limiting

The API implements throttling to prevent abuse. When limits are exceeded:
- HTTP 429 status code is returned
- WebSocket connections may be temporarily blocked

### Throttling Configuration

Throttling limits are configured per:
- Protocol (REST, WebSocket)
- Method (Login, Trade operations, etc.)
- Sessions per account
- Requests per second

---

## Best Practices

1. **Use WebSocket for real-time data** - More efficient than polling REST endpoints
2. **Handle reconnection** - Implement automatic reconnection logic for WebSocket
3. **Cache symbol information** - Symbol data rarely changes
4. **Use pagination** - For trade history and snapshots, always use pagination
5. **Implement proper error handling** - Handle all HTTP status codes
6. **Respect rate limits** - Implement backoff when receiving 429 errors
7. **Use HMAC authentication** - Always calculate fresh signatures

---

## Code Examples

### Python - Get Account Info

```python
client = FXOpenClient(
    web_api_id="your-id",
    web_api_key="your-key",
    web_api_secret="your-secret",
    base_url="https://marginalttdemowebapi.fxopen.net"
)

account = client.get("/account")
print(f"Balance: {account['Balance']} {account['BalanceCurrency']}")
```

### Python - Create Market Order

```python
trade_request = {
    "Type": "Market",
    "Side": "Buy",
    "Symbol": "EURUSD",
    "Amount": 100000,
    "StopLoss": 1.10000,
    "TakeProfit": 1.12000,
    "Comment": "API Trade"
}

result = client.post("/trade", trade_request)
print(f"Trade ID: {result['Id']}")
```

### Python - Get Historical Bars

```python
# Get last 100 M1 bars for EURUSD
import time

timestamp = int(time.time() * 1000)
bars = client.get(f"/quotehistory/EURUSD/M1/bars/bid?timestamp={timestamp}&count=-100")

for bar in bars['Bars']:
    print(f"{bar['Timestamp']}: O={bar['Open']} H={bar['High']} L={bar['Low']} C={bar['Close']}")
```

### JavaScript - WebSocket Connection

```javascript
const crypto = require('crypto');

function createSignature(timestamp, id, key, secret) {
    const message = timestamp + id + key;
    return crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('base64');
}

const ws = new WebSocket('wss://marginalttdemowebapi.fxopen.net:443');

ws.onopen = () => {
    const timestamp = Date.now();
    const signature = createSignature(timestamp, webApiId, webApiKey, webApiSecret);
    
    ws.send(JSON.stringify({
        Id: 'login-1',
        Request: 'Login',
        Params: {
            AuthType: 'HMAC',
            WebApiId: webApiId,
            WebApiKey: webApiKey,
            Timestamp: timestamp,
            Signature: signature,
            DeviceId: 'NodeJS',
            AppSessionId: 'session-1'
        }
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};
```

---

*Documentation generated from FXOpen TickTrader Web API v2.0*
*Last updated: January 2026*
