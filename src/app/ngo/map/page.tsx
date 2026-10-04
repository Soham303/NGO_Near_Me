'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFoodRescue } from '@/lib/store';
import { LeafletMap } from '@/components/map/LeafletMap';
import { CountdownPill } from '@/components/ui/CountdownPill';
import { Listing, FoodDiet } from '@/types';
import {
  MapPin,
  List,
  Filter,
  UtensilsCrossed,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Bike,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function NGOMapDiscoveryPage() {
  const router = useRouter();
  const { listings, activeNGO, volunteers, claimListing, pickups } = useFoodRescue();

  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>(volunteers[0]?.id || '');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  // Filters
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [minPortions, setMinPortions] = useState<number>(0);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(15);

  // Open listings only
  const openListings = listings.filter((l) => l.status === 'posted');

  // Filter listings
  const filteredListings = openListings.filter((l) => {
    if (selectedDiet !== 'all' && l.diet !== selectedDiet) return false;
    if (l.portions_listed < minPortions) return false;
    return true;
  });

  const handleClaimInitiate = (listing: Listing) => {
    setSelectedListing(listing);
    setClaimError(null);
    setShowClaimModal(true);
  };

  const handleConfirmClaim = () => {
    if (!selectedListing) return;

    const result = claimListing(selectedListing.id, activeNGO.id, selectedVolunteerId);

    if (result.success) {
      setClaimSuccess(`Successfully claimed ${selectedListing.portions_listed} portions! Assigned to volunteer.`);
      setTimeout(() => {
        setShowClaimModal(false);
        setClaimSuccess(null);
        router.push('/ngo/pickups');
      }, 1200);
    } else {
      setClaimError(result.error || 'Failed to claim');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
      {/* Top Bar: NGO Info & Filter Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <span>{activeNGO.name}</span>
            <span className="text-gray-300">•</span>
            <span>Capacity: {activeNGO.capacity_portions} portions/day</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-text mt-0.5">
            Surplus Food Discovery Map
          </h1>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-neutral-border p-1 rounded-xl shadow-xs flex items-center">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'split' ? 'bg-primary text-white' : 'text-neutral-muted hover:text-neutral-text'
              }`}
            >
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'map' ? 'bg-primary text-white' : 'text-neutral-muted hover:text-neutral-text'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Map Only</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'list' ? 'bg-primary text-white' : 'text-neutral-muted hover:text-neutral-text'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white rounded-card border border-neutral-border p-3.5 shadow-soft mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-neutral-muted flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Filters:</span>
          </span>

          {/* Diet filters */}
          {['all', 'veg', 'non_veg', 'mixed'].map((diet) => (
            <button
              key={diet}
              onClick={() => setSelectedDiet(diet)}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                selectedDiet === diet
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-neutral-bg border border-neutral-border text-neutral-muted hover:text-neutral-text'
              }`}
            >
              {diet === 'all' ? 'All Diets' : diet.replace('_', ' ')}
            </button>
          ))}

          {/* Min Portions filter */}
          <select
            value={minPortions}
            onChange={(e) => setMinPortions(Number(e.target.value))}
            className="px-2.5 py-1 rounded-lg border border-neutral-border bg-neutral-bg font-semibold text-neutral-text outline-none"
          >
            <option value={0}>Any Portions</option>
            <option value={20}>&ge; 20 portions</option>
            <option value={40}>&ge; 40 portions</option>
            <option value={60}>&ge; 60 portions</option>
          </select>
        </div>

        <span className="text-xs font-bold text-neutral-muted">
          Showing <strong className="text-primary">{filteredListings.length}</strong> available listings
        </span>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Map View */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div
            className={`${
              viewMode === 'split' ? 'lg:col-span-7 h-[420px] lg:h-[600px]' : 'lg:col-span-12 h-[650px]'
            } bg-white rounded-card border border-neutral-border shadow-card overflow-hidden relative`}
          >
            <LeafletMap
              listings={filteredListings}
              selectedListingId={selectedListing?.id}
              onSelectListing={(listing) => setSelectedListing(listing)}
            />
          </div>
        )}

        {/* List View / Selected Drawer */}
        {(viewMode === 'split' || viewMode === 'list') && (
          <div
            className={`${
              viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'
            } flex flex-col space-y-3 max-h-[600px] overflow-y-auto pr-1`}
          >
            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-card border border-neutral-border p-8 text-center">
                <UtensilsCrossed className="w-10 h-10 text-neutral-muted mx-auto mb-2 opacity-40" />
                <h3 className="font-bold text-neutral-text text-sm">Nothing nearby right now</h3>
                <p className="text-xs text-neutral-muted mt-1">
                  We&apos;ll notify your team the second surplus food is posted within your radius.
                </p>
              </div>
            ) : (
              filteredListings.map((listing) => {
                const isSelected = selectedListing?.id === listing.id;

                return (
                  <div
                    key={listing.id}
                    onClick={() => setSelectedListing(listing)}
                    className={`bg-white rounded-card border p-4 shadow-soft transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 shadow-card'
                        : 'border-neutral-border hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
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
                      <CountdownPill pickupBy={listing.pickup_by} size="sm" />
                    </div>

                    <h3 className="font-bold text-neutral-text text-sm leading-snug">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-neutral-muted mt-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-neutral-muted" />
                      <span>{listing.hotel_name}</span>
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-neutral-border/60 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black text-primary">
                          {listing.portions_listed}
                        </span>
                        <span className="text-xs text-neutral-muted ml-1">portions</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaimInitiate(listing);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-soft transition-all"
                      >
                        1-Tap Claim
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Selected Listing Bottom Sheet / Details on Mobile */}
      {selectedListing && (
        <div className="mt-6 bg-white rounded-card border border-primary/30 p-5 shadow-floating flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary uppercase">Active Selection</span>
              <CountdownPill pickupBy={selectedListing.pickup_by} size="sm" />
            </div>
            <h3 className="text-lg font-black text-neutral-text">{selectedListing.title}</h3>
            <p className="text-xs text-neutral-muted">
              {selectedListing.hotel_name} • {selectedListing.hotel_address} • {selectedListing.portions_listed} Portions
            </p>
            {selectedListing.packaging_notes && (
              <p className="text-xs text-neutral-text italic mt-1">
                &quot;{selectedListing.packaging_notes}&quot;
              </p>
            )}
          </div>

          <button
            onClick={() => handleClaimInitiate(selectedListing)}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary-hover shadow-card transition-all flex items-center justify-center gap-2"
          >
            <span>Lock & Claim ({selectedListing.portions_listed} portions)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Claim Confirmation & Volunteer Assignment Modal (PRD FR-C3, FR-C4) */}
      {showClaimModal && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-floating border border-neutral-border animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-primary-light text-primary">
                  <UtensilsCrossed className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-base text-neutral-text">Confirm Atomic Claim</h3>
                  <p className="text-xs text-neutral-muted">Locks surplus immediately for your shelter</p>
                </div>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-neutral-muted hover:text-neutral-text p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {claimSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-primary mx-auto animate-bounce" />
                <p className="text-sm font-bold text-emerald-900">{claimSuccess}</p>
                <p className="text-xs text-neutral-muted">Redirecting to active pickups...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {claimError && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{claimError}</span>
                  </div>
                )}

                <div className="p-3 bg-neutral-bg rounded-lg border border-neutral-border text-xs space-y-1">
                  <p className="font-bold text-neutral-text text-sm">{selectedListing.title}</p>
                  <p className="text-neutral-muted">{selectedListing.hotel_name}</p>
                  <p className="font-semibold text-primary">{selectedListing.portions_listed} Portions ({selectedListing.diet})</p>
                </div>

                {/* Volunteer selection */}
                <div>
                  <label className="block text-xs font-bold text-neutral-text uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5 text-primary" />
                    <span>Assign Pickup Volunteer / Collector</span>
                  </label>
                  <select
                    value={selectedVolunteerId}
                    onChange={(e) => setSelectedVolunteerId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none font-medium"
                  >
                    {volunteers.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.vehicle || 'Standard transport'})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-neutral-muted mt-1 block">
                    The collector will receive instant route coordinates and wake-lock instructions.
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={handleConfirmClaim}
                    className="flex-1 py-3 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary-hover shadow-soft transition-all"
                  >
                    Confirm & Claim Surplus
                  </button>
                  <button
                    onClick={() => setShowClaimModal(false)}
                    className="px-4 py-3 rounded-xl bg-neutral-bg border border-neutral-border text-neutral-text text-sm font-bold hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
