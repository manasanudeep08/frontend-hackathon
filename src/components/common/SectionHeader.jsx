import React from 'react';

/**
 * Reusable Section Header with Category Eyebrow, Title, and Subtitle
 * @param {{ eyebrow?: string, title: string, description?: string, align?: 'left' | 'center' }} props
 */
export function SectionHeader({ eyebrow, title, description, align = 'left' }) {
  return (
    <header className={`section-header ${align === 'center' ? 'text-center' : ''}`.trim()}>
      {eyebrow && (
        <span className="section-eyebrow">
          {eyebrow}
        </span>
      )}
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </header>
  );
}
