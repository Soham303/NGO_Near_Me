'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownPillProps {
  pickupBy: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownPill({ pickupBy, size = 'md' }: CountdownPillProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [urgency, setUrgency] = useState<'green' | 'amber' | 'red' | 'expired'>('green');

  useEffect(() => {
    function calculate() {
      const now = Date.now();
      const target = new Date(pickupBy).getTime();
      const diffMs = target - now;

      if (diffMs <= 0) {
        setTimeLeftStr('Expired');
        setUrgency('expired');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours >= 2) {
        setUrgency('green');
        setTimeLeftStr(`${hours}h ${minutes}m left`);
      } else if (hours >= 1) {
        setUrgency('amber');
        setTimeLeftStr(`${hours}h ${minutes}m left`);
      } else {
        setUrgency('red');
        setTimeLeftStr(`${minutes}m left`);
      }
    }

    calculate();
    const interval = setInterval(calculate, 30000);
    return () => clearInterval(interval);
  }, [pickupBy]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  }[size];

  if (urgency === 'expired') {
    return (
      <span className={`inline-flex items-center rounded-full bg-gray-100 text-gray-600 border border-gray-300 ${sizeClasses}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>Expired</span>
      </span>
    );
  }

  if (urgency === 'red') {
    return (
      <span className={`inline-flex items-center rounded-full bg-red-50 text-[#C62828] border border-red-200 pulse-urgent ${sizeClasses}`}>
        <span className="w-2 h-2 rounded-full bg-[#C62828] animate-ping" />
        <Clock className="w-3.5 h-3.5" />
        <span>{timeLeftStr}</span>
      </span>
    );
  }

  if (urgency === 'amber') {
    return (
      <span className={`inline-flex items-center rounded-full bg-amber-50 text-[#F9A825] border border-amber-200 ${sizeClasses}`}>
        <span className="w-2 h-2 rounded-full bg-[#F9A825]" />
        <Clock className="w-3.5 h-3.5" />
        <span>{timeLeftStr}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-emerald-50 text-[#2E7D32] border border-emerald-200 ${sizeClasses}`}>
      <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
      <Clock className="w-3.5 h-3.5" />
      <span>{timeLeftStr}</span>
    </span>
  );
}
