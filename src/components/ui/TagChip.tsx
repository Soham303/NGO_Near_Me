'use client';

import React from 'react';
import { TagKind } from '@/types';
import { Check, AlertCircle } from 'lucide-react';

interface TagChipProps {
  label: string;
  kind: TagKind;
  selected: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}

export function TagChip({ label, kind, selected, onToggle, disabled = false }: TagChipProps) {
  const isPositive = kind === 'positive';

  const baseStyle =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-all border';

  let activeStyle = '';
  if (isPositive) {
    activeStyle = selected
      ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32] shadow-sm font-bold'
      : 'bg-white text-neutral-text border-[#A5D6A7] hover:bg-[#F1F8F1]';
  } else {
    activeStyle = selected
      ? 'bg-[#FFF3E0] text-[#E65100] border-[#F57C00] shadow-sm font-bold'
      : 'bg-white text-neutral-text border-[#FFCC80] hover:bg-[#FFF8E1]';
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`${baseStyle} ${activeStyle} ${disabled ? 'opacity-70 cursor-default' : ''}`}
    >
      {selected ? (
        <Check className="w-3.5 h-3.5" />
      ) : isPositive ? (
        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-[#F57C00]" />
      )}
      <span>{label}</span>
    </button>
  );
}
