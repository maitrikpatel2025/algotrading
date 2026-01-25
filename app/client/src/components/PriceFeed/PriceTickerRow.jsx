import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * PriceTickerRow Component
 *
 * Individual price row displaying:
 * - Pair name
 * - Bid/Ask prices
 * - Spread in pips
 * - Change in pips and %
 * - High/Low of day
 *
 * Features:
 * - Click to navigate to Strategy page with pair pre-selected
 * - Color flash animation on price changes (green up, red down)
 * - Tabular number formatting for proper alignment
 */
function PriceTickerRow({
  pair,
  priceData,
  change,
  flashDirection, // 'up', 'down', or null
}) {
  const navigate = useNavigate();

  // Determine decimal places based on pair type
  const isJpyPair = pair?.includes('JPY');
  const decimals = isJpyPair ? 3 : 5;

  // Format price with appropriate decimals
  const formatPrice = (price) => {
    if (price === undefined || price === null) return '--';
    return price.toFixed(decimals);
  };

  // Format spread
  const formatSpread = (spread) => {
    if (spread === undefined || spread === null) return '--';
    return spread.toFixed(1);
  };

  // Format change values
  const formatChange = (value, suffix = '') => {
    if (value === undefined || value === null) return '--';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}${suffix}`;
  };

  // Handle row click - navigate to Strategy page with pair
  const handleClick = () => {
    if (pair) {
      navigate(`/strategy?pair=${pair}`);
    }
  };

  // Determine if change is positive/negative
  const changeDirection = change?.pips !== null && change?.pips !== undefined
    ? (change.pips > 0 ? 'up' : change.pips < 0 ? 'down' : 'neutral')
    : 'neutral';

  // Format pair for display (EUR_USD -> EUR/USD)
  const displayPair = pair?.replace('_', '/') || '--';

  // Check for error state
  const hasError = priceData?.error;

  return (
    <tr
      onClick={handleClick}
      className={cn(
        'border-b border-neutral-100 dark:border-neutral-700',
        'transition-colors cursor-pointer',
        'hover:bg-neutral-50 dark:hover:bg-neutral-700/50',
        // Flash animations
        flashDirection === 'up' && 'animate-price-flash-up',
        flashDirection === 'down' && 'animate-price-flash-down'
      )}
    >
      {/* Pair Name */}
      <td className="py-3 px-4">
        <span className="font-medium text-neutral-900 dark:text-neutral-50">
          {displayPair}
        </span>
      </td>

      {/* Bid Price */}
      <td className="py-3 px-2 text-right">
        <span className={cn(
          'tabular-nums text-sm',
          hasError
            ? 'text-neutral-400 dark:text-neutral-500'
            : 'text-neutral-700 dark:text-neutral-200'
        )}>
          {formatPrice(priceData?.bid)}
        </span>
      </td>

      {/* Ask Price */}
      <td className="py-3 px-2 text-right">
        <span className={cn(
          'tabular-nums text-sm',
          hasError
            ? 'text-neutral-400 dark:text-neutral-500'
            : 'text-neutral-700 dark:text-neutral-200'
        )}>
          {formatPrice(priceData?.ask)}
        </span>
      </td>

      {/* Spread */}
      <td className="py-3 px-2 text-right">
        <span className="tabular-nums text-sm text-neutral-500 dark:text-neutral-400">
          {formatSpread(priceData?.spread)}
        </span>
      </td>

      {/* Change (pips) */}
      <td className="py-3 px-2 text-right">
        <div className="flex items-center justify-end gap-1">
          {changeDirection === 'up' && (
            <TrendingUp className="h-3 w-3 text-success" />
          )}
          {changeDirection === 'down' && (
            <TrendingDown className="h-3 w-3 text-danger" />
          )}
          {changeDirection === 'neutral' && (
            <Minus className="h-3 w-3 text-neutral-400" />
          )}
          <span className={cn(
            'tabular-nums text-sm font-medium',
            changeDirection === 'up' && 'text-success',
            changeDirection === 'down' && 'text-danger',
            changeDirection === 'neutral' && 'text-neutral-500 dark:text-neutral-400'
          )}>
            {formatChange(change?.pips)}
          </span>
        </div>
      </td>

      {/* Change (%) */}
      <td className="py-3 px-2 text-right">
        <span className={cn(
          'tabular-nums text-sm',
          changeDirection === 'up' && 'text-success',
          changeDirection === 'down' && 'text-danger',
          changeDirection === 'neutral' && 'text-neutral-500 dark:text-neutral-400'
        )}>
          {formatChange(change?.percent, '%')}
        </span>
      </td>

      {/* High */}
      <td className="py-3 px-2 text-right hidden md:table-cell">
        <span className="tabular-nums text-sm text-neutral-500 dark:text-neutral-400">
          {formatPrice(priceData?.high)}
        </span>
      </td>

      {/* Low */}
      <td className="py-3 px-2 text-right hidden md:table-cell">
        <span className="tabular-nums text-sm text-neutral-500 dark:text-neutral-400">
          {formatPrice(priceData?.low)}
        </span>
      </td>
    </tr>
  );
}

export default PriceTickerRow;
