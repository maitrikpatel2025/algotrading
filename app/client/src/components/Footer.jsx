import React from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * Footer Component - Precision Swiss Design System
 *
 * Minimal footer with light background.
 * Simple border-top, minimal content.
 */

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50">
      <div className="container-swiss py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-neutral-700">Forex Dash</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-neutral-500">
            {currentYear} Forex Trading Dashboard
          </p>

          {/* Status */}
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
