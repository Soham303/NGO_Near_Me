'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Listing, Pickup } from '@/types';

interface LeafletMapProps {
  listings: Listing[];
  activePickup?: Pickup;
  selectedListingId?: string;
  onSelectListing?: (listing: Listing) => void;
  center?: [number, number];
  zoom?: number;
}

const DynamicMap = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-neutral-bg animate-pulse rounded-xl border border-neutral-border flex flex-col items-center justify-center text-neutral-muted text-xs gap-2">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span>Loading Interactive Map...</span>
    </div>
  ),
});

export function LeafletMap(props: LeafletMapProps) {
  return <DynamicMap {...props} />;
}
