import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * Headline Component - Precision Swiss Design System
 *
 * Individual headline item with clean styling.
 * Hover state with subtle background change.
 */

function Headline({ data }) {
  return (
    <a
      href={data.link}
      target="_blank"
      rel="noreferrer"
      className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 group-hover:text-primary transition-colors line-clamp-2">
          {data.headline}
        </p>
        {data.source && (
          <p className="text-xs text-neutral-500 mt-1">{data.source}</p>
        )}
      </div>
      <ExternalLink className="h-4 w-4 flex-shrink-0 text-neutral-300 group-hover:text-primary transition-colors mt-0.5" />
    </a>
  );
}

export default Headline;
