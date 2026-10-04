'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFoodRescue } from '@/lib/store';
import { LeafletMap } from '@/components/map/LeafletMap';
import { TagChip } from '@/components/ui/TagChip';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import {
  Bike,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Upload,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Eye,
  Building2,
  PackageCheck
} from 'lucide-react';

export default function VolunteerActiveTripPage() {
  const router = useRouter();
  const {
    pickups,
    startTrip,
    recordPickupHandoff,
    submitCompletionReport,
    activeVolunteer,
    tags
  } = useFoodRescue();

  // Find active pickup for this volunteer or first active
  const activePickup = pickups.find(
    (p) => (p.status === 'claimed' || p.status === 'on_the_way' || p.status === 'collected')
  ) || pickups[0];

  // Geofence states
  const [inGeofence, setInGeofence] = useState(true);
  const [showReportModal, setShowReportModal] = useState(activePickup?.status === 'collected');

  // Report fields
  const [portionsReceived, setPortionsReceived] = useState<number>(activePickup?.listing?.portions_listed || 45);
  const [leftBehind, setLeftBehind] = useState<number>(0);
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop&q=80'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(['ready_on_time', 'fresh']);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    if (activePickup?.status === 'collected') {
      setShowReportModal(true);
    }
  }, [activePickup?.status]);

  if (!activePickup) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Bike className="w-12 h-12 text-neutral-muted mx-auto mb-3 opacity-40" />
        <h2 className="text-xl font-bold text-neutral-text">No Assigned Active Pickups</h2>
        <p className="text-xs text-neutral-muted mt-1 mb-4">
          Once your NGO coordinator claims a surplus listing and designates you, it will appear here.
        </p>
        <Link href="/ngo/map" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg">
          Browse Live Map
        </Link>
      </div>
    );
  }

  const handleStartTrip = () => {
    startTrip(activePickup.id);
  };

  const handleCollected = () => {
    // Record handoff with geofence verification
    recordPickupHandoff(activePickup.id, inGeofence);
    setShowReportModal(true);
  };

  const handleToggleTag = (code: string) => {
    if (selectedTags.includes(code)) {
      setSelectedTags(selectedTags.filter((t) => t !== code));
    } else {
      setSelectedTags([...selectedTags, code]);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);

    submitCompletionReport(activePickup.id, {
      portionsReceived,
      leftBehind,
      photoUrl,
      tags: selectedTags,
    });

    setTimeout(() => {
      setIsSubmittingReport(false);
      setShowReportModal(false);
      alert('Completion Report Verified & Submitted! Platform score updated.');
      router.push('/ngo/pickups');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
      {/* Screen Wake Lock Notice Banner (FR-P2, Section 3.2) */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 shadow-soft">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent shrink-0" />
          <span>
            <strong>Screen Wake Lock Active:</strong> Keep this browser tab open while driving to stream live GPS coordinates to the hotel kitchen.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/60 px-2 py-0.5 rounded">
          Active
        </span>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-card border border-neutral-border p-6 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-light text-primary">
                Collector View: {activeVolunteer.name}
              </span>
              <span className="text-xs font-bold text-neutral-muted">•</span>
              <span className="text-xs font-semibold text-neutral-text">
                {activePickup.listing?.portions_listed} portions
              </span>
            </div>

            <h1 className="text-2xl font-black text-neutral-text">
              {activePickup.listing?.title || 'Surplus Food Batch'}
            </h1>
            <p className="text-xs text-neutral-muted mt-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{activePickup.listing?.hotel_name}</span>
              <span>•</span>
              <span>{activePickup.listing?.hotel_address}</span>
            </p>
          </div>

          {/* Quick Action Button based on status */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {activePickup.status === 'claimed' && (
              <button
                onClick={handleStartTrip}
                className="px-5 py-3 rounded-xl bg-primary text-white font-black text-sm shadow-card hover:bg-primary-hover flex items-center gap-2 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Start Trip (Share GPS)</span>
              </button>
            )}

            {activePickup.status === 'on_the_way' && (
              <button
                onClick={handleCollected}
                className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-card hover:bg-emerald-700 flex items-center gap-2 transition-all animate-pulse"
              >
                <PackageCheck className="w-4 h-4" />
                <span>I Have Collected Food</span>
              </button>
            )}

            {activePickup.status === 'collected' && (
              <button
                onClick={() => setShowReportModal(true)}
                className="px-5 py-3 rounded-xl bg-accent text-white font-black text-sm shadow-card hover:bg-accent-hover flex items-center gap-2 transition-all"
              >
                <span>Open Completion Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div className="mt-6 pt-4 border-t border-neutral-border">
          <StatusTimeline
            currentStatus={activePickup.status}
            timestamps={{
              claimed_at: activePickup.claimed_at,
              started_at: activePickup.started_at,
              collected_at: activePickup.collected_at,
              completed_at: activePickup.completed_at,
            }}
          />
        </div>
      </div>

      {/* Live Map Screen */}
      <div className="bg-white rounded-card border border-neutral-border p-4 shadow-card mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            <h3 className="font-bold text-sm text-neutral-text">Live Route Navigation & Geofence</h3>
          </div>

          {/* Geofence Simulator Toggle for QA */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-muted">Simulate Location:</span>
            <button
              onClick={() => setInGeofence(true)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                inGeofence ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Inside 150m Geofence
            </button>
            <button
              onClick={() => setInGeofence(false)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                !inGeofence ? 'bg-amber-100 border-amber-500 text-amber-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Outside Geofence (400m)
            </button>
          </div>
        </div>

        <div className="h-[420px] w-full">
          <LeafletMap
            listings={activePickup.listing ? [activePickup.listing] : []}
            activePickup={activePickup}
            center={[12.9756, 77.6067]}
            zoom={14}
          />
        </div>

        {!inGeofence && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
            <span>
              <strong>Geofence Warning:</strong> Your current GPS is ~400m from the kitchen entrance. Marking collection here will trigger an automated admin audit flag.
            </span>
          </div>
        )}
      </div>

      {/* Completion Report Modal / Sheet (FR-R1, Section 7.5) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-floating border border-neutral-border animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-lg bg-primary-light text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-neutral-text">
                  NGO Completion Report (Source of Truth)
                </h3>
                <p className="text-xs text-neutral-muted">
                  Must be submitted promptly to verify the hotel&apos;s Rescue Score.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-5">
              {/* Portions Received Stepper */}
              <div>
                <label className="block text-xs font-bold text-neutral-text uppercase tracking-wider mb-1.5">
                  Actual Portions Received (Required) *
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPortionsReceived(Math.max(1, portionsReceived - 5))}
                    className="w-10 h-10 rounded-lg border border-neutral-border bg-neutral-bg font-black text-lg text-neutral-text hover:bg-gray-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    required
                    value={portionsReceived}
                    onChange={(e) => setPortionsReceived(parseInt(e.target.value) || 1)}
                    className="w-24 text-center font-black text-xl py-2 rounded-lg border border-neutral-border focus:border-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPortionsReceived(portionsReceived + 5)}
                    className="w-10 h-10 rounded-lg border border-neutral-border bg-neutral-bg font-black text-lg text-neutral-text hover:bg-gray-200"
                  >
                    +
                  </button>
                  <span className="text-xs text-neutral-muted">
                    Listed: <strong>{activePickup.listing?.portions_listed || 45} portions</strong>
                  </span>
                </div>
              </div>

              {/* Photo Upload / Proof */}
              <div>
                <label className="block text-xs font-bold text-neutral-text uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  <span>Handoff Verification Photo (Required) *</span>
                </label>
                <div className="relative border-2 border-dashed border-neutral-border rounded-xl p-3 bg-neutral-bg text-center">
                  {photoUrl ? (
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt="Handoff confirmation"
                        className="w-full h-36 object-cover rounded-lg border border-neutral-border"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] rounded font-bold"
                      >
                        Retake Photo
                      </button>
                    </div>
                  ) : (
                    <div className="py-6">
                      <Camera className="w-8 h-8 text-neutral-muted mx-auto mb-2" />
                      <p className="text-xs font-bold text-neutral-text">Capture surplus food in transport crate</p>
                      <button
                        type="button"
                        onClick={() =>
                          setPhotoUrl(
                            'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop&q=80'
                          )
                        }
                        className="mt-2 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg"
                      >
                        Simulate Camera Snap
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quality & Issue Tag Chips (PRD Section 7.5) */}
              <div>
                <label className="block text-xs font-bold text-neutral-text uppercase tracking-wider mb-1.5">
                  Quality & Hygiene Tags *
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagChip
                      key={tag.code}
                      label={tag.label}
                      kind={tag.kind}
                      selected={selectedTags.includes(tag.code)}
                      onToggle={() => handleToggleTag(tag.code)}
                    />
                  ))}
                </div>
              </div>

              {/* Portions Left Behind */}
              <div>
                <label className="block text-xs font-bold text-neutral-text uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Portions Left Behind (Optional)</span>
                  <span className="text-[11px] text-neutral-muted">if excess wasn&apos;t taken</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={leftBehind}
                  onChange={(e) => setLeftBehind(parseInt(e.target.value) || 0)}
                  className="w-32 px-3 py-1.5 text-sm rounded-lg border border-neutral-border outline-none font-bold"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-3.5 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary-hover shadow-card transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingReport ? (
                    <span>Verifying & Recording Report...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Verified Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
