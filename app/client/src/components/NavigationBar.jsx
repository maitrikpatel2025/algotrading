import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Menu, X, TrendingUp } from 'lucide-react';

/**
 * NavigationBar Component - Precision Swiss Design System
 *
 * Clean horizontal navigation with no gradients.
 * White/light background with 1px bottom border.
 * Active state uses primary blue (#2563EB).
 */

const navItems = [
  { href: '/strategies', label: 'Strategies' },
  { href: '/backtests', label: 'Backtest' },
  { href: '/monitor', label: 'Monitor' },
  { href: '/account', label: 'Account' },
];

function NavigationBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
      <div className="container-swiss flex h-16 items-center justify-between">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-3 text-lg font-semibold text-neutral-900 transition-colors hover:text-primary"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span>Forex Dash</span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.href === '/strategies'
              ? location.pathname.startsWith('/strategies')
              : item.href === '/backtests'
              ? location.pathname.startsWith('/backtests')
              : location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors rounded-md',
                  isActive
                    ? 'text-primary bg-primary-light'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                )}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Market Status Badge */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-xs font-medium text-neutral-500">Market Open</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white animate-slide-in">
          <nav className="container-swiss py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === '/strategies'
                ? location.pathname.startsWith('/strategies')
                : item.href === '/backtests'
                ? location.pathname.startsWith('/backtests')
                : location.pathname === item.href;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-3 text-base font-medium rounded-md transition-colors',
                    isActive
                      ? 'text-primary bg-primary-light'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  )}
                >
                  {item.label}
                </NavLink>
              );
            })}
            {/* Mobile Market Status */}
            <div className="flex items-center gap-2 px-4 py-3 mt-4 border-t border-neutral-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-sm font-medium text-neutral-500">Market Open</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default NavigationBar;
