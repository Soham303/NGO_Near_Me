'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import { TierBadge } from '@/components/ui/TierBadge';
import { VenueType } from '@/types';
import {
  Trophy,
  TrendingUp,
  Flame,
  Award,
  ArrowRight,
  Sparkles,
  Building2,
  Info
} from 'lucide-react';

export default function LeaderboardPage() {
  const { scores } = useFoodRescue();
  const [category, setCategory] = useState<string>('all');
  const [boardType, setBoardType] = useState<'overall' | 'improved' | 'streak'>('overall');

  // Filter and sort scores
  const filtered = scores.filter((s) => {
    if (category === 'all') return true;
    return s.venue_type === category;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (boardType === 'streak') {
      return (b.streak_weeks || 0) - (a.streak_weeks || 0);
    }
    if (boardType === 'improved') {
      return a.trend === 'up' && b.trend !== 'up' ? -1 : 1;
    }
    return b.composite - a.composite;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-3">
          <Trophy className="w-3.5 h-3.5 text-accent" />
          <span>Verified Weekly Impact Standings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-text tracking-tight">
          Public Rescue Score Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-neutral-muted mt-2 leading-relaxed">
          Transparent recognition for hospitality partners. Scores computed strictly from NGO-verified receipts over rolling 60 days. Minimum 5 pickups required for eligibility.
        </p>
      </div>

      {/* Board Type Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[
          { key: 'overall', label: 'Overall Standings', icon: Trophy },
          { key: 'improved', label: 'Most Improved', icon: TrendingUp },
          { key: 'streak', label: 'Longest Active Streak', icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setBoardType(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                boardType === tab.key
                  ? 'bg-primary text-white font-black shadow-soft'
                  : 'bg-white border border-neutral-border text-neutral-muted hover:text-neutral-text'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {[
          { key: 'all', label: 'All Categories' },
          { key: 'hotel', label: 'Hotels & Suites' },
          { key: 'restaurant', label: 'Restaurants & Bistros' },
          { key: 'banquet_hall', label: 'Banquet & Celebration Halls' },
          { key: 'hostel', label: 'Hostel & Campus Messes' },
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              category === c.key
                ? 'bg-neutral-text text-white'
                : 'bg-white border border-neutral-border text-neutral-muted hover:border-neutral-text'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white rounded-card border border-neutral-border shadow-card overflow-hidden">
        <div className="p-4 bg-neutral-bg border-b border-neutral-border flex items-center justify-between text-xs font-bold text-neutral-muted uppercase tracking-wider">
          <div className="flex items-center gap-6">
            <span className="w-8 text-center">Rank</span>
            <span>Hospitality Venue</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="hidden sm:inline">Tier</span>
            <span>Rescue Score</span>
            <span className="w-6"></span>
          </div>
        </div>

        <div className="divide-y divide-neutral-border">
          {sorted.map((item, idx) => {
            const isTop3 = idx < 3 && boardType === 'overall';

            return (
              <Link
                key={item.id}
                href={`/hotel/${item.hotel_slug}`}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-emerald-50/30 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : idx === 1
                        ? 'bg-gray-100 text-gray-800 border border-gray-300'
                        : idx === 2
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'text-neutral-muted'
                    }`}
                  >
                    #{idx + 1}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-neutral-text group-hover:text-primary transition-colors">
                      {item.hotel_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-muted">
                      <span className="capitalize">{item.venue_type?.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{item.portions_rescued} meals rescued</span>
                      {item.streak_weeks && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-accent font-semibold">
                            <Flame className="w-3 h-3" />
                            <span>{item.streak_weeks}w streak</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8">
                  {/* Tier badge */}
                  <div className="hidden sm:block">
                    <TierBadge tier={item.tier} size="sm" />
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">{item.composite}</span>
                    <span className="text-[10px] text-neutral-muted block">Score</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Fairness & Smoothing Note */}
      <div className="mt-8 p-4 bg-neutral-bg rounded-xl border border-neutral-border text-xs text-neutral-muted flex items-start gap-3">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Rescue Score Integrity:</strong> To prevent gaming and favoritism, scores use Bayesian platform smoothing (k=5) and cap single-NGO quality feedback at 40% of the total rating weight. Bottom rankings are never publicly displayed to maintain encouragement.
        </p>
      </div>
    </div>
  );
}
