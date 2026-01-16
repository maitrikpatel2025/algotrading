import React from 'react';
import { cn } from '../lib/utils';

function TitleHead({ title, subtitle, className, action }) {
  return (
    <div className={cn("flex items-center justify-between py-4", className)}>
      <div>
        <h2 className="text-h3 text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default TitleHead;
