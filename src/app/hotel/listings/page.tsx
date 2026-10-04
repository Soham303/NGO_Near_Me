'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import { CountdownPill } from '@/components/ui/CountdownPill';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import {
  UtensilsCrossed,
  PlusCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Building2,
  XCircle,
  CheckCircle2
} from 'lucide-react';

export default function HotelListingsPage() {
  const { listings, pickups, cancelListing, activeHotel } = useFoodRescue();
  const [filterTab, setFilterTab] = useState<'all' | 'posted' | 'claimed' | 'completed'>('all');

  // Filter listings for active hotel
  const hotelListings = listings.filter((l) => l.hotel_id === activeHotel.id || activeHotel.id === 'hotel-1');

  const filtered = hotelListings.filter((l) => {
    if (filterTab === 'all') return true;
    return l.status === filterTab;
  });

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this surplus listing? This cannot be undone.')) {
      cancelListing(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <span>{activeHotel.name}</span>
            <span className="text-gray-300">•</span>
            <span>Kitchen Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-text mt-1">
            My Surplus Listings
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            Track real-time collection progress, volunteer ETAs, and verified portion reports.
          </p>
        </div>

        <Link
          href="/hotel/post"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-soft hover:bg-primary-hover flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Surplus</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-border pb-3 mb-6">
        {[
          { key: 'all', label: 'All Listings' },
          { key: 'posted', label: 'Open (Awaiting Claim)' },
          { key: 'claimed', label: 'Claimed & In Transit' },
          { key: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === tab.key
                ? 'bg-primary-light text-primary border border-primary-border shadow-xs'
                : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listing Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-card border border-neutral-border p-12 text-center">
            <UtensilsCrossed className="w-12 h-12 text-neutral-muted mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-neutral-text text-base">No listings in this view</h3>
            <p className="text-xs text-neutral-muted mt-1 mb-4">
              Post surplus food in under 30 seconds to alert local charity kitchens.
            </p>
            <Link
              href="/hotel/post"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Surplus Now</span>
            </Link>
          </div>
        ) : (
          filtered.map((listing) => {
            const relatedPickup = pickups.find((p) => p.listing_id === listing.id);

            return (
              <div
                key={listing.id}
                className="bg-white rounded-card border border-neutral-border p-5 shadow-card hover:shadow-floating transition-all flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          listing.diet === 'veg'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : listing.diet === 'non_veg'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {listing.diet.replace('_', ' ')}
                      </span>

                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          listing.status === 'posted'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : listing.status === 'claimed'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : listing.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {listing.status}
                      </span>

                      {listing.status === 'posted' && (
                        <CountdownPill pickupBy={listing.pickup_by} size="sm" />
                      )}
                    </div>

                    <h2 className="font-bold text-neutral-text text-base">
                      {listing.title}
                    </h2>
                    <p className="text-xs text-neutral-muted mt-1">
                      Listed: {new Date(listing.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {listing.portions_listed} portions
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <Link
                      href={`/hotel/listings/${listing.id}`}
                      className="px-3 py-1.5 rounded-lg bg-neutral-bg border border-neutral-border text-xs font-bold text-neutral-text hover:bg-gray-100 flex items-center gap-1 transition-all"
                    >
                      <span>Track Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {listing.status === 'posted' && (
                      <button
                        onClick={() => handleCancel(listing.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-all"
                        title="Cancel this unclaimed listing"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Stepper Timeline if claimed or in progress */}
                {relatedPickup && (
                  <div className="mt-4 pt-3 border-t border-neutral-border/70">
                    <StatusTimeline
                      currentStatus={relatedPickup.status}
                      timestamps={{
                        posted_at: listing.created_at,
                        claimed_at: relatedPickup.claimed_at,
                        started_at: relatedPickup.started_at,
                        collected_at: relatedPickup.collected_at,
                        completed_at: relatedPickup.completed_at,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
