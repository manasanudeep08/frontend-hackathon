import React from 'react';

/**
 * Reusable Badge Component
 * @param {{ children: React.ReactNode, variant?: 'default' | 'primary' | 'success', className?: string }} props
 */
export function Badge({ children, variant = 'default', className = '' }) {
  const variantClass = variant === 'primary' ? 'badge-primary' : variant === 'success' ? 'badge-success' : '';
  return (
    <span className={`badge ${variantClass} ${className}`.trim()}>
      {children}
    </span>
  );
}
