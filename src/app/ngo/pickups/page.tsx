'use client';

import React from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import {
  UtensilsCrossed,
  HeartHandshake,
  Clock,
  Bike,
  Building2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function NGOActivePickupsPage() {
  const { pickups, releaseClaim, activeNGO, switchRole } = useFoodRescue();

  // Active NGO pickups
  const ngoPickups = pickups.filter(
    (p) => p.ngo_id === activeNGO.id || activeNGO.id === 'ngo-1'
  );

  const activeOnes = ngoPickups.filter((p) => p.status !== 'completed' && p.status !== 'cancelled');
  const pastOnes = ngoPickups.filter((p) => p.status === 'completed');

  const handleRelease = async (pickupId: string) => {
    if (confirm('Release this claim? The surplus food will immediately reopen for other nearby charity kitchens.')) {
      await releaseClaim(pickupId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <span>{activeNGO.name}</span>
            <span className="text-gray-300">•</span>
            <span>Coordination Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-text mt-1">
            Active Rescue Operations
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            Track collectors en route, monitor geofence arrivals, and review completion reports.
          </p>
        </div>

        <Link
          href="/ngo/map"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-soft hover:bg-primary-hover transition-all"
        >
          Find More Surplus
        </Link>
      </div>

      {/* Active Section */}
      <div className="mb-10">
        <h2 className="text-base font-black text-neutral-text mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
          <span>In-Progress Collections ({activeOnes.length})</span>
        </h2>

        {activeOnes.length === 0 ? (
          <div className="bg-white rounded-card border border-neutral-border p-10 text-center">
            <HeartHandshake className="w-10 h-10 text-neutral-muted mx-auto mb-2 opacity-40" />
            <h3 className="font-bold text-neutral-text text-sm">No active collections in flight</h3>
            <p className="text-xs text-neutral-muted mt-1 mb-4">
              Browse the live map to claim surplus food for your community shelter.
            </p>
            <Link
              href="/ngo/map"
              className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold"
            >
              Open Discovery Map
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOnes.map((pickup) => (
              <div
                key={pickup.id}
                className="bg-white rounded-card border border-neutral-border p-6 shadow-card hover:shadow-floating transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {pickup.status.replace(/_/g, ' ')}
                      </span>
                      {pickup.eta_minutes && (
                        <span className="text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                          ETA: ~{pickup.eta_minutes} mins
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-neutral-text">
                      {pickup.listing?.title || 'Surplus Food Batch'}
                    </h3>
                    <p className="text-xs text-neutral-muted mt-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-neutral-muted" />
                      <span>{pickup.listing?.hotel_name || 'Hotel Location'}</span>
                      <span>•</span>
                      <span>{pickup.listing?.portions_listed} portions listed</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <Link
                      href="/volunteer/active"
                      onClick={() => switchRole('volunteer')}
                      className="px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-soft flex items-center gap-1.5 transition-all"
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Open Trip Tracker</span>
                    </Link>

                    <button
                      onClick={() => handleRelease(pickup.id)}
                      className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-all"
                      title="Release claim back to other NGOs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Release Claim</span>
                    </button>
                  </div>
                </div>

                {/* Stepper */}
                <div className="mt-4 pt-3 border-t border-neutral-border/70">
                  <StatusTimeline
                    currentStatus={pickup.status}
                    timestamps={{
                      claimed_at: pickup.claimed_at,
                      started_at: pickup.started_at,
                      collected_at: pickup.collected_at,
                      completed_at: pickup.completed_at,
                    }}
                  />
                </div>

                {/* Assigned volunteer detail */}
                <div className="mt-4 p-3 bg-neutral-bg rounded-lg border border-neutral-border flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-primary" />
                    <span>
                      Driver: <strong>{pickup.volunteer_name || 'Unassigned'}</strong>
                    </span>
                    {pickup.volunteer_phone && (
                      <span className="text-neutral-muted">({pickup.volunteer_phone})</span>
                    )}
                  </div>
                  <span className="text-neutral-muted text-[11px]">
                    Claimed at: {new Date(pickup.claimed_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed History Section */}
      <div>
        <h2 className="text-base font-black text-neutral-text mb-4">
          Past Verified Rescues ({pastOnes.length})
        </h2>

        <div className="space-y-3">
          {pastOnes.map((pickup) => (
            <div
              key={pickup.id}
              className="bg-white rounded-card border border-neutral-border p-4 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Completed & Verified
                  </span>
                  <span className="text-xs font-black text-primary">
                    {pickup.portions_received} portions received
                  </span>
                </div>
                <h4 className="font-bold text-sm text-neutral-text">
                  {pickup.listing?.title || 'Continental Pastries & Sandwiches'}
                </h4>
                <p className="text-xs text-neutral-muted">
                  Collected from {pickup.listing?.hotel_name || 'Grand Palace Hotel'} by {pickup.volunteer_name}
                </p>
              </div>

              {pickup.photo_path && (
                <img
                  src={pickup.photo_path}
                  alt="Verified handoff"
                  className="w-16 h-12 object-cover rounded-md border border-neutral-border shadow-xs"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
