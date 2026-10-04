'use client';

import React from 'react';
import { ScoreTier } from '@/types';
import { Sprout, Trees, Sparkles } from 'lucide-react';

interface TierBadgeProps {
  tier: ScoreTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TierBadge({ tier, size = 'md', showLabel = true }: TierBadgeProps) {
  const tierConfig = {
    seed: {
      label: 'Seed Tier',
      icon: <span className="text-amber-700">🌱</span>,
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    sprout: {
      label: 'Sprout Tier',
      icon: <Sprout className="w-3.5 h-3.5 text-emerald-600" />,
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    canopy: {
      label: 'Canopy Tier',
      icon: <Trees className="w-3.5 h-3.5 text-teal-600" />,
      bg: 'bg-teal-50 text-teal-900 border-teal-200',
    },
    forest: {
      label: 'Forest Tier',
      icon: <Sparkles className="w-3.5 h-3.5 text-primary" />,
      bg: 'bg-primary-light text-primary border-primary-border shadow-sm',
    },
  }[tier] || {
    label: 'Seed Tier',
    icon: <span>🌱</span>,
    bg: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all ${tierConfig.bg} ${sizeClasses}`}
      title={`${tierConfig.label} - Rescued Food Benchmark Level`}
    >
      {tierConfig.icon}
      {showLabel && <span>{tierConfig.label}</span>}
    </span>
  );
}
