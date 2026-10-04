'use client';

import React from 'react';

interface CounterTileProps {
  count: number | string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'accent' | 'neutral';
}

export function CounterTile({
  count,
  label,
  sublabel,
  icon,
  variant = 'primary',
}: CounterTileProps) {
  const variantStyles = {
    primary: 'border-primary/20 bg-primary-subtle text-primary',
    accent: 'border-accent/20 bg-accent-light text-accent',
    neutral: 'border-neutral-border bg-white text-neutral-text',
  }[variant];

  return (
    <div className={`p-5 rounded-card border shadow-card transition-all hover:shadow-floating ${variantStyles}`}>
      <div className="flex items-center justify-between">
        <span className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-text">
          {typeof count === 'number' ? count.toLocaleString() : count}
        </span>
        {icon && <div className="p-2.5 rounded-full bg-white/80 shadow-soft">{icon}</div>}
      </div>
      <div className="mt-2 text-sm font-bold text-neutral-text">{label}</div>
      {sublabel && <div className="text-xs text-neutral-muted mt-0.5">{sublabel}</div>}
    </div>
  );
}
