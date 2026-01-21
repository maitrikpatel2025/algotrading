import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Table Component - Precision Swiss Design System
 *
 * Data table following the design system specifications.
 * Header: neutral-100 background, uppercase, letter-spacing
 * Rows: hover state, optional zebra striping
 */

function Table({ zebra = false, className, children, ...props }) {
  return (
    <div className="table-container">
      <table className={cn('table', zebra && 'table-zebra', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

function TableHeader({ className, children, ...props }) {
  return (
    <thead className={cn('table-header', className)} {...props}>
      {children}
    </thead>
  );
}

function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn(className)} {...props}>
      {children}
    </tbody>
  );
}

function TableRow({ className, children, ...props }) {
  return (
    <tr className={cn('table-row', className)} {...props}>
      {children}
    </tr>
  );
}

function TableHead({ className, children, ...props }) {
  return (
    <th className={cn(className)} {...props}>
      {children}
    </th>
  );
}

function TableCell({ className, children, ...props }) {
  return (
    <td className={cn('table-cell', className)} {...props}>
      {children}
    </td>
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
export default Table;
