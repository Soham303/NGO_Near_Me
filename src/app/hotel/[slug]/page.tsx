'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useFoodRescue } from '@/lib/store';
import { TierBadge } from '@/components/ui/TierBadge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import {
  Building2,
  Heart,
  Award,
  Share2,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Flame,
  Download,
  Info
} from 'lucide-react';

export default function HotelPublicImpactPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { hotels, scores, currentUser, toggleFollowHotel, follows, sendKudos } = useFoodRescue();

  const hotel = hotels.find((h) => h.slug === slug) || hotels[0];
  const score = scores.find((s) => s.hotel_id === hotel.id || s.hotel_slug === slug) || scores[0];

  const isFollowed = follows.some((f) => f.userId === currentUser.id && f.hotelId === hotel.id);
  const [kudosFeedback, setKudosFeedback] = useState<string | null>(null);

  const handleSendKudos = () => {
    const res = sendKudos(hotel.id);
    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
      setKudosFeedback('❤️ Kudos Sent! Thanks for cheering on edible food rescue!');
    } else {
      setKudosFeedback(res.message);
    }

    setTimeout(() => setKudosFeedback(null), 4000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${hotel.name} - Verified Food Rescue Partner`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Impact link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6">
      {/* Hotel Hero Banner */}
      <div className="bg-white rounded-card border border-neutral-border p-6 sm:p-8 shadow-card mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center font-black text-2xl border border-primary-border shadow-xs shrink-0">
              {hotel.name.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <TierBadge tier={score.tier} size="sm" />
                <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider">
                  {hotel.venue_type}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary-subtle px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  <span>FSSAI & Platform Verified</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-neutral-text">
                {hotel.name}
              </h1>
              <p className="text-xs text-neutral-muted mt-1 leading-relaxed">
                {hotel.address}
              </p>
            </div>
          </div>

          {/* Social Action Buttons (FR-N3) */}
          <div className="flex flex-wrap items-center gap-2 sm:self-start">
            <button
              onClick={() => toggleFollowHotel(hotel.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                isFollowed
                  ? 'bg-neutral-bg border border-neutral-border text-neutral-text'
                  : 'bg-primary text-white hover:bg-primary-hover shadow-soft'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFollowed ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isFollowed ? 'Following' : 'Follow Hotel'}</span>
            </button>

            <button
              onClick={handleSendKudos}
              className="px-4 py-2 rounded-xl bg-accent-light text-accent border border-accent/20 hover:bg-accent hover:text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Send Kudos</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-neutral-bg border border-neutral-border text-neutral-text hover:bg-gray-100 transition-all"
              title="Share Impact Page"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {kudosFeedback && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-bold animate-in fade-in duration-200">
            {kudosFeedback}
          </div>
        )}
      </div>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-card border border-neutral-border p-5 shadow-card text-center">
          <span className="text-3xl sm:text-4xl font-black text-primary block">
            {score.portions_rescued.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-neutral-text mt-1 block">Meals Rescued</span>
          <span className="text-[11px] text-neutral-muted">Verified by recipient NGOs</span>
        </div>

        <div className="bg-white rounded-card border border-neutral-border p-5 shadow-card text-center">
          <span className="text-3xl sm:text-4xl font-black text-emerald-700 block">
            {((score.portions_rescued * 2.5) / 1000).toFixed(1)}t
          </span>
          <span className="text-xs font-bold text-neutral-text mt-1 block">CO₂ Emissions Diverted</span>
          <span className="text-[11px] text-neutral-muted">From urban municipal landfills</span>
        </div>

        <div className="bg-white rounded-card border border-neutral-border p-5 shadow-card text-center">
          <span className="text-3xl sm:text-4xl font-black text-accent block">
            {score.completed_pickups}
          </span>
          <span className="text-xs font-bold text-neutral-text mt-1 block">Completed Pickups</span>
          <span className="text-[11px] text-neutral-muted">{score.streak_weeks} weeks consecutive active</span>
        </div>
      </div>

      {/* Verified Performance Telemetry */}
      <div className="bg-white rounded-card border border-neutral-border p-6 sm:p-8 shadow-card mb-8">
        <h2 className="text-base font-black text-neutral-text mb-2">
          Public Rescue Score Verification
        </h2>
        <p className="text-xs text-neutral-muted mb-6 leading-relaxed">
          The Rescue Score reflects the venue&apos;s commitment to kitchen surplus redistribution, normalized against venue seating and banquet capacity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 p-6 bg-neutral-bg rounded-xl border border-neutral-border">
          <ScoreRing score={score.composite} size={150} strokeWidth={12} />

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>
                Rescue Rate: <strong>{((score.rescue_rate || 0.94) * 100).toFixed(0)}%</strong> vs kitchen capacity
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>
                Listing Accuracy: <strong>{((score.listing_accuracy || 0.96) * 100).toFixed(0)}%</strong> portion consistency
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>
                Handoff Quality: <strong>{((score.handoff_quality || 0.95) * 100).toFixed(0)}%</strong> positive NGO feedback
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainable Partner Guest Standee info */}
      <div className="p-4 bg-primary-subtle rounded-card border border-primary-border text-xs text-primary flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Visiting this venue?</strong> When you dine or host events at {hotel.name}, surplus edible dishes that are unserved are hygienically packed and dispatched to verified local shelters within a 2-hour safety window.
        </p>
      </div>
    </div>
  );
}
