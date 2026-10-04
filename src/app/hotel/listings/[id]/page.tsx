'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useFoodRescue } from '@/lib/store';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { LeafletMap } from '@/components/map/LeafletMap';
import { CountdownPill } from '@/components/ui/CountdownPill';
import {
  ArrowLeft,
  Clock,
  Building2,
  HeartHandshake,
  Bike,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Package,
  Calendar
} from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const { listings, pickups } = useFoodRescue();

  const listing = listings.find((l) => l.id === listingId) || listings[0];
  const relatedPickup = pickups.find((p) => p.listing_id === listing.id);

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Listing not found</h2>
        <Link href="/hotel/listings" className="text-primary mt-2 inline-block">
          &larr; Back to My Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-muted hover:text-neutral-text mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to listings</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
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
            <span className="text-xs text-neutral-muted">•</span>
            <span className="text-xs font-bold text-primary">{listing.portions_listed} Portions</span>
            {listing.status === 'posted' && (
              <CountdownPill pickupBy={listing.pickup_by} size="sm" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-neutral-text">
            {listing.title}
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            Listed at {new Date(listing.created_at).toLocaleString()} • Pickup by{' '}
            {new Date(listing.pickup_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full bg-white border border-neutral-border text-xs font-bold shadow-soft">
            Status: <span className="text-primary uppercase">{relatedPickup ? relatedPickup.status : listing.status}</span>
          </span>
        </div>
      </div>

      {/* Timeline Stepper */}
      <div className="bg-white rounded-card border border-neutral-border p-6 shadow-card mb-6">
        <StatusTimeline
          currentStatus={relatedPickup ? relatedPickup.status : 'posted'}
          timestamps={{
            posted_at: listing.created_at,
            claimed_at: relatedPickup?.claimed_at,
            started_at: relatedPickup?.started_at,
            collected_at: relatedPickup?.collected_at,
            completed_at: relatedPickup?.completed_at,
          }}
        />
      </div>

      {/* Grid: Map & Live Tracking alongside Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-card border border-neutral-border p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                <h3 className="font-bold text-sm text-neutral-text">
                  Live Dispatch Tracking Map
                </h3>
              </div>
              {relatedPickup?.status === 'on_the_way' && (
                <span className="text-xs font-bold bg-primary-light text-primary px-2 py-0.5 rounded-full">
                  Volunteer ETA: ~{relatedPickup.eta_minutes || 6} mins
                </span>
              )}
            </div>

            <div className="h-[400px] w-full">
              <LeafletMap
                listings={[listing]}
                activePickup={relatedPickup}
                center={[listing.lat || 12.9756, listing.lng || 77.6067]}
                zoom={14}
              />
            </div>
            <p className="text-[11px] text-neutral-muted mt-2 text-center">
              Map auto-refreshes coordinates every 4 seconds during active trips. Tracking ceases upon handoff.
            </p>
          </div>
        </div>

        {/* Right Column: Dispatch & Verified Receipt Info */}
        <div className="space-y-6">
          {/* Dispatch Partner Card */}
          <div className="bg-white rounded-card border border-neutral-border p-5 shadow-card">
            <h3 className="text-xs font-bold text-neutral-text uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-primary" />
              <span>Assigned Rescue Partner</span>
            </h3>

            {relatedPickup ? (
              <div className="space-y-3">
                <div className="p-3 bg-neutral-bg rounded-lg border border-neutral-border">
                  <p className="text-xs text-neutral-muted">Claiming NGO</p>
                  <p className="font-bold text-sm text-neutral-text">{relatedPickup.ngo_name}</p>
                </div>

                <div className="p-3 bg-neutral-bg rounded-lg border border-neutral-border">
                  <p className="text-xs text-neutral-muted">Designated Volunteer</p>
                  <p className="font-bold text-sm text-neutral-text">{relatedPickup.volunteer_name}</p>
                  {relatedPickup.volunteer_phone && (
                    <a
                      href={`tel:${relatedPickup.volunteer_phone}`}
                      className="inline-flex items-center gap-1 text-xs text-primary font-bold mt-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{relatedPickup.volunteer_phone}</span>
                    </a>
                  )}
                </div>

                <div className="text-[11px] text-neutral-muted">
                  Claim confirmed: {new Date(relatedPickup.claimed_at).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-neutral-bg rounded-lg text-center text-xs text-neutral-muted">
                Surplus listing broadcasted. Awaiting claim from nearest NGO.
              </div>
            )}
          </div>

          {/* Verified Completion Report (Source of Truth) */}
          {relatedPickup?.status === 'completed' && (
            <div className="bg-emerald-50 rounded-card border border-emerald-200 p-5 shadow-card">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>NGO Verified Receipt (Source of Truth)</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-900">Portions Received:</span>
                  <strong className="text-lg font-black text-emerald-900">
                    {relatedPickup.portions_received} meals
                  </strong>
                </div>

                {relatedPickup.photo_path && (
                  <div>
                    <span className="text-[11px] text-emerald-800 block mb-1">
                      Handoff Photo Proof:
                    </span>
                    <img
                      src={relatedPickup.photo_path}
                      alt="Verified surplus handoff"
                      className="w-full h-32 object-cover rounded-lg border border-emerald-300 shadow-xs"
                    />
                  </div>
                )}

                {relatedPickup.tags && relatedPickup.tags.length > 0 && (
                  <div>
                    <span className="text-[11px] text-emerald-800 block mb-1">Quality Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {relatedPickup.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300"
                        >
                          {t.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Packaging & Kitchen Instructions */}
          <div className="bg-white rounded-card border border-neutral-border p-5 shadow-card text-xs">
            <h4 className="font-bold text-neutral-text mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-neutral-muted" />
              <span>Packaging & Location Notes</span>
            </h4>
            <p className="text-neutral-muted leading-relaxed">
              {listing.packaging_notes || 'No special packaging instructions provided.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
