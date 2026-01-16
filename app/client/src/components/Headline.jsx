import React from 'react';
import { ExternalLink } from 'lucide-react';

function Headline({ data }) {
  return (
    <a 
      href={data.link} 
      target="_blank" 
      rel="noreferrer"
      className="group flex items-start gap-3 p-4 -mx-4 rounded-lg transition-all duration-200 hover:bg-muted/50"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {data.headline}
        </p>
        {data.source && (
          <p className="text-xs text-muted-foreground mt-1">{data.source}</p>
        )}
      </div>
      <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
    </a>
  );
}

export default Headline;
