'use client';

import React from 'react';
import { PickupStatus } from '@/types';
import { CheckCircle2, Circle, Truck, Package, Flag, Clock } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: PickupStatus | 'posted';
  timestamps?: {
    posted_at?: string;
    claimed_at?: string;
    started_at?: string;
    collected_at?: string;
    completed_at?: string;
  };
}

const STEPS = [
  { key: 'posted', label: 'Posted', icon: Clock },
  { key: 'claimed', label: 'Claimed', icon: Circle },
  { key: 'on_the_way', label: 'On the Way', icon: Truck },
  { key: 'collected', label: 'Collected', icon: Package },
  { key: 'completed', label: 'Completed', icon: Flag },
] as const;

export function StatusTimeline({ currentStatus, timestamps }: StatusTimelineProps) {
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'posted':
        return 0;
      case 'claimed':
        return 1;
      case 'on_the_way':
        return 2;
      case 'collected':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-neutral-border z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-primary z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          let timeText = '';
          if (step.key === 'posted') timeText = formatTime(timestamps?.posted_at);
          if (step.key === 'claimed') timeText = formatTime(timestamps?.claimed_at);
          if (step.key === 'on_the_way') timeText = formatTime(timestamps?.started_at);
          if (step.key === 'collected') timeText = formatTime(timestamps?.collected_at);
          if (step.key === 'completed') timeText = formatTime(timestamps?.completed_at);

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                  isDone
                    ? 'bg-primary border-primary text-white'
                    : isCurrent
                    ? 'bg-white border-primary text-primary ring-4 ring-primary-light animate-pulse'
                    : 'bg-white border-neutral-border text-neutral-muted'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
              </div>

              <span
                className={`mt-1.5 text-xs font-semibold whitespace-nowrap ${
                  isCurrent ? 'text-primary font-bold' : isDone ? 'text-neutral-text' : 'text-neutral-muted'
                }`}
              >
                {step.label}
              </span>

              {timeText && (
                <span className="text-[10px] text-neutral-muted whitespace-nowrap">{timeText}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
