'use client';

import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showSubtitle?: boolean;
}

export function ScoreRing({
  score,
  size = 140,
  strokeWidth = 12,
  showSubtitle = true,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = '#2E7D32'; // Forest / High
  if (score < 60) strokeColor = '#F57C00'; // Seed
  else if (score < 80) strokeColor = '#10B981'; // Sprout
  else if (score < 90) strokeColor = '#059669'; // Canopy

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E4E7EC"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-neutral-text">
            {score.toFixed(1)}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-muted">
            Rescue Score
          </span>
        </div>
      </div>

      {showSubtitle && (
        <p className="mt-2 text-xs text-neutral-muted max-w-[200px]">
          Benchmarked 60-day rolling performance across verified pickups.
        </p>
      )}
    </div>
  );
}
