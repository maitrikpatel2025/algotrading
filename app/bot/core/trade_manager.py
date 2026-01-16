"""
Trade Manager
=============
Handles trade execution and risk management.
Uses Pydantic models for type-safe trade operations.
"""

from typing import Optional, Callable

from core.models import TradeDecision, TradeResult, TradeSignal

# Risk parameters
BASE_AMOUNT = 10000
MINIMUM_AMOUNT = 1000


def is_trade_open(pair: str, api) -> Optional[object]:
    """
    Check if there's already an open trade for the pair.
    
    Args:
        pair: Trading pair name
        api: API client instance
        
    Returns:
        OpenTrade if found, None otherwise
    """
    open_trades = api.get_open_trades()

    if open_trades:
        for trade in open_trades:
            if trade.instrument == pair:
                return trade

    return None


def get_trade_size(
    api,
    pair: str,
    loss: float,
    trade_risk: float,
    log_message: Callable
) -> int:
    """
    Calculate appropriate trade size based on risk parameters.
    
    Uses fixed fractional position sizing based on:
    - Account risk per trade
    - Expected loss (stop loss distance)
    - Pip value for the pair
    
    Args:
        api: API client instance
        pair: Trading pair name
        loss: Expected loss in price units (SL distance)
        trade_risk: Maximum risk per trade in account currency
        log_message: Logging function
        
    Returns:
        Trade amount (0 if below minimum or calculation fails)
    """
    # Get pip values from API
    pip_values = api.get_pip_value([pair])

    if pip_values is None or len(pip_values) == 0:
        log_message("get_trade_size() pip_values is none", pair)
        return 0

    our_pip_value = pip_values[pair]
    log_message(f"get_trade_size() our_pip_value {our_pip_value:.6f}", pair)

    # Get instrument details
    from infrastructure.instrument_collection import instrument_collection
    instrument = instrument_collection.get(pair)
    
    if instrument is None:
        log_message(f"Instrument not found: {pair}", pair)
        return 0

    # Calculate position size
    pip_location = instrument.pipLocation
    num_pips = loss / pip_location
    per_pip_loss = trade_risk / num_pips
    ratio = per_pip_loss / our_pip_value
    trade_pure = BASE_AMOUNT * ratio
    trade_size = int(trade_pure / instrument.TradeAmountStep) * instrument.TradeAmountStep

    log_message(
        f"get_trade_size() num_pips:{num_pips:.2f} per_pip_loss:{per_pip_loss:.4f} "
        f"ratio:{ratio:.4f} trade_pure:{trade_pure:.0f} trade_size:{trade_size}",
        pair
    )

    if trade_size < MINIMUM_AMOUNT:
        return 0

    return trade_size


def place_trade(
    trade_decision: TradeDecision,
    api,
    log_message: Callable,
    log_error: Callable,
    trade_risk: float
) -> TradeResult:
    """
    Place a trade based on the trade decision.
    
    Workflow:
    1. Check for existing open trade
    2. Calculate position size based on risk
    3. Execute trade via API
    4. Return result as Pydantic model
    
    Args:
        trade_decision: TradeDecision Pydantic model from strategy
        api: API client instance
        log_message: Logging function
        log_error: Error logging function
        trade_risk: Maximum risk per trade
        
    Returns:
        TradeResult Pydantic model with success/failure info
    """
    pair = trade_decision.pair
    
    # Check for existing open trade
    existing_trade = is_trade_open(pair, api)

    if existing_trade is not None:
        message = f"Already open trade exists: {existing_trade}"
        log_message(f"Failed to place {trade_decision}, {message}", pair)
        return TradeResult(
            success=False,
            pair=pair,
            message=message,
            error="Existing trade open"
        )

    # Calculate trade size based on risk management
    trade_amount = get_trade_size(
        api,
        pair,
        trade_decision.loss,
        trade_risk,
        log_message
    )

    if trade_amount == 0:
        message = f"Trade size too small or calculation failed"
        log_message(f"{message} for {trade_decision}", pair)
        return TradeResult(
            success=False,
            pair=pair,
            amount=trade_amount,
            message=message,
            error="Position size below minimum"
        )

    # Place the trade via API
    trade_id = api.place_trade(
        pair,
        trade_amount,
        trade_decision.signal,
        trade_decision.sl,
        trade_decision.tp
    )

    if trade_id is None:
        error_msg = f"API failed to place trade"
        log_error(f"ERROR placing {trade_decision}")
        log_message(f"ERROR placing {trade_decision}", pair)
        return TradeResult(
            success=False,
            pair=pair,
            amount=trade_amount,
            message="Trade placement failed",
            error=error_msg
        )

    # Success!
    log_message(f"Placed trade_id:{trade_id} for {trade_decision}", pair)
    return TradeResult(
        success=True,
        trade_id=trade_id,
        pair=pair,
        amount=trade_amount,
        message=f"Trade placed successfully: {trade_decision.signal_name}"
    )


def close_trade(
    trade_id: int,
    api,
    log_message: Callable,
    log_error: Callable
) -> TradeResult:
    """
    Close an existing trade by ID.
    
    Args:
        trade_id: ID of the trade to close
        api: API client instance
        log_message: Logging function
        log_error: Error logging function
        
    Returns:
        TradeResult Pydantic model with success/failure info
    """
    try:
        success = api.close_trade(trade_id)
        
        if success:
            log_message(f"Closed trade {trade_id}", "main")
            return TradeResult(
                success=True,
                trade_id=trade_id,
                pair="",
                message="Trade closed successfully"
            )
        else:
            log_error(f"Failed to close trade {trade_id}")
            return TradeResult(
                success=False,
                trade_id=trade_id,
                pair="",
                message="Trade close failed",
                error="API returned failure"
            )
    except Exception as e:
        log_error(f"Exception closing trade {trade_id}: {e}")
        return TradeResult(
            success=False,
            trade_id=trade_id,
            pair="",
            message="Trade close failed",
            error=str(e)
        )
