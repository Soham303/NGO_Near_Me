'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import { TierBadge } from '@/components/ui/TierBadge';
import {
  Trophy,
  Award,
  Building2,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface HotelRankingsWidgetProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
  maxItems?: number;
}

export function HotelRankingsWidget({
  title = 'Registered Hotel Donation Rankings',
  subtitle = 'Official leaderboard of verified hospitality partners ranked by total cooked food donated & ESG impact in Pune.',
  compact = false,
  maxItems = 10,
}: HotelRankingsWidgetProps) {
  const { scores, hotels, activeHotel, currentUser } = useFoodRescue();
  const [filterVenue, setFilterVenue] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'donated' | 'score' | 'pickups'>('donated');
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Match scores with registered hotel details
  const rankedHotels = hotels.map((hotel) => {
    const score = scores.find((s) => s.hotel_id === hotel.id);
    const portionsRescued = score ? score.portions_rescued : 0;
    const completedPickups = score ? score.completed_pickups : 0;
    const compositeScore = score ? score.composite : 78.0;
    const tier = score ? score.tier : 'sprout';
    const streak = score ? score.streak_weeks : 1;

    return {
      hotelId: hotel.id,
      name: hotel.name,
      slug: hotel.slug || `hotel-${hotel.id.substring(0, 6)}`,
      venueType: hotel.venue_type,
      address: hotel.address,
      portionsRescued,
      kgDonated: Math.round(portionsRescued * 0.45),
      completedPickups,
      compositeScore,
      tier,
      streak,
      isCurrentHotel: activeHotel?.id === hotel.id || (currentUser.role === 'hotel' && hotel.owner_id === currentUser.id),
    };
  });

  // Filter by venue type
  const filtered = rankedHotels.filter((h) => {
    if (filterVenue === 'all') return true;
    return h.venueType === filterVenue;
  });

  // Sort hotels
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'donated') {
      return b.portionsRescued - a.portionsRescued || b.compositeScore - a.compositeScore;
    }
    if (sortBy === 'pickups') {
      return b.completedPickups - a.completedPickups || b.portionsRescued - a.portionsRescued;
    }
    return b.compositeScore - a.compositeScore;
  });

  const displayList = isExpanded ? sorted.slice(0, maxItems) : sorted.slice(0, 3);

  return (
    <div className="bg-white rounded-card border border-neutral-border p-5 sm:p-6 shadow-card mb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-neutral-border/70">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg text-neutral-text">
                {title}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-light text-primary uppercase tracking-wider">
                Live Benchmarks
              </span>
            </div>
            <p className="text-xs text-neutral-muted mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Sorting and Category Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-neutral-bg border border-neutral-border p-0.5 rounded-lg text-xs font-bold">
            <button
              onClick={() => setSortBy('donated')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                sortBy === 'donated' ? 'bg-primary text-white shadow-xs' : 'text-neutral-muted hover:text-neutral-text'
              }`}
            >
              Most Food Donated
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                sortBy === 'score' ? 'bg-primary text-white shadow-xs' : 'text-neutral-muted hover:text-neutral-text'
              }`}
            >
              Rescue Score
            </button>
          </div>

          <Link
            href="/leaderboard"
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 ml-1"
          >
            <span>Full Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Hotel Rankings Table / Cards */}
      <div className="space-y-3">
        {displayList.map((item, idx) => (
          <div
            key={item.hotelId}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              item.isCurrentHotel
                ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/40 shadow-xs'
                : idx === 0
                ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                : 'bg-white border-neutral-border hover:bg-neutral-bg'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Rank Position */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                  idx === 0
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : idx === 1
                    ? 'bg-gray-200 text-gray-800'
                    : idx === 2
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-neutral-bg text-neutral-muted border border-neutral-border'
                }`}
              >
                #{idx + 1}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-neutral-text flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.isCurrentHotel && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white uppercase tracking-wider">
                        Your Venue
                      </span>
                    )}
                  </h4>
                  <TierBadge tier={item.tier} size="sm" showLabel={false} />
                </div>
                <p className="text-xs text-neutral-muted flex items-center gap-1.5 mt-0.5">
                  <span className="capitalize">{item.venueType.replace('_', ' ')}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-neutral-muted shrink-0" />
                    <span>{item.address || 'Pune City'}</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-border/60">
              <div>
                <span className="block text-[10px] font-bold text-neutral-muted uppercase tracking-wider">
                  Food Donated
                </span>
                <span className="text-sm font-black text-primary">
                  {item.portionsRescued} <span className="text-xs font-medium text-neutral-muted">meals</span>
                </span>
                <span className="text-[10px] text-neutral-muted block">
                  (~{item.kgDonated} kg)
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-neutral-muted uppercase tracking-wider">
                  Completed Rescues
                </span>
                <span className="text-sm font-black text-neutral-text">
                  {item.completedPickups} <span className="text-xs font-medium text-neutral-muted">pickups</span>
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-neutral-muted uppercase tracking-wider">
                  Rescue Score
                </span>
                <span className="text-sm font-black text-emerald-600 flex items-center justify-end gap-1">
                  <span>{item.compositeScore}</span>
                  <span className="text-[10px] font-medium text-neutral-muted">/100</span>
                </span>
              </div>

              <Link
                href={`/hotel/${item.slug}`}
                className="px-3 py-1.5 rounded-lg border border-neutral-border text-neutral-text hover:bg-neutral-bg text-xs font-bold transition-all shadow-xs"
              >
                View Impact
              </Link>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-8 text-neutral-muted text-xs">
            No registered hotels recorded in this category yet.
          </div>
        )}
      </div>

      {/* Expand/Collapse Toggle if more items */}
      {sorted.length > 3 && (
        <div className="mt-4 pt-3 border-t border-neutral-border/60 flex items-center justify-between text-xs font-bold text-neutral-muted">
          <span>Showing {displayList.length} of {sorted.length} registered venues in Pune</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:underline flex items-center gap-1"
          >
            <span>{isExpanded ? 'Collapse List' : 'View All Registered Hotels'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
