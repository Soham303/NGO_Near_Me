'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { TierBadge } from '@/components/ui/TierBadge';
import { CounterTile } from '@/components/ui/CounterTile';
import {
  Trophy,
  Download,
  Code,
  QrCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  Building2,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function HotelImpactPage() {
  const { scores, activeHotel, certificates } = useFoodRescue();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Score snapshot for active hotel
  const hotelScore = scores.find((s) => s.hotel_id === activeHotel.id || s.hotel_id === 'hotel-1') || scores[0];

  // Embed badge snippet
  const embedCodeSnippet = `<a href="https://foodrescue.org/hotel/${hotelScore.hotel_slug}" target="_blank">
  <img src="https://foodrescue.org/api/badge/${hotelScore.hotel_slug}" alt="${hotelScore.hotel_name} Verified Food Rescue Partner" />
</a>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleDownloadCert = () => {
    alert(`Downloading Monthly Impact Certificate for ${hotelScore.hotel_name} (PDF ready for audit & ESG reporting).`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <span>{activeHotel.name}</span>
            <span className="text-gray-300">•</span>
            <span>ESG & Recognition Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-text mt-1">
            Impact Passport & Rescue Score
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            Official monthly verification certificates, public embeds, and 60-day performance telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCert}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-soft hover:bg-primary-hover flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Monthly PDF</span>
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            className="px-4 py-2 rounded-xl bg-white border border-neutral-border text-neutral-text text-xs font-bold hover:bg-neutral-bg flex items-center gap-1.5 transition-all shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-primary" />
            <span>Guest QR Card</span>
          </button>
        </div>
      </div>

      {/* Main Score & Tier Card */}
      <div className="bg-white rounded-card border border-neutral-border p-8 shadow-card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Circular Score Ring */}
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-border pb-6 md:pb-0 md:pr-6">
            <ScoreRing score={hotelScore.composite} size={160} strokeWidth={14} />
            <div className="mt-4">
              <TierBadge tier={hotelScore.tier} size="lg" />
            </div>
          </div>

          {/* Core Metrics & Rank */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Category Benchmark
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Rank #{hotelScore.rank_in_category} in {hotelScore.venue_type}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-text mt-1">
                {hotelScore.hotel_name}
              </h2>
              <p className="text-xs text-neutral-muted mt-1 leading-relaxed">
                Eligible for public leaderboard with a <strong>{hotelScore.streak_weeks}-week active donation streak</strong>.
                Formula accounts for hotel size, banquet frequency, and portion completion verification.
              </p>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-neutral-bg rounded-lg border border-neutral-border">
                <span className="text-[10px] uppercase font-bold text-neutral-muted block">Meals Rescued</span>
                <span className="text-xl font-black text-primary">{hotelScore.portions_rescued}</span>
              </div>
              <div className="p-3 bg-neutral-bg rounded-lg border border-neutral-border">
                <span className="text-[10px] uppercase font-bold text-neutral-muted block">Completed Pickups</span>
                <span className="text-xl font-black text-neutral-text">{hotelScore.completed_pickups}</span>
              </div>
              <div className="p-3 bg-neutral-bg rounded-lg border border-neutral-border">
                <span className="text-[10px] uppercase font-bold text-neutral-muted block">CO₂ Diversion</span>
                <span className="text-xl font-black text-emerald-700">
                  {((hotelScore.portions_rescued * 2.5) / 1000).toFixed(1)}t
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Rescue Signals Breakdown (PRD Section 8) */}
      <div className="bg-white rounded-card border border-neutral-border p-6 shadow-card mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-neutral-text">
              Rescue Score Signals Breakdown (60-Day Rolling)
            </h3>
            <p className="text-xs text-neutral-muted mt-0.5">
              Weighted strictly from NGO-reported data. Tuned with platform smoothing k=5.
            </p>
          </div>
          <span className="text-xs font-bold bg-primary-light text-primary px-2.5 py-1 rounded-full">
            Weights Calibrated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-neutral-bg rounded-lg border border-neutral-border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-neutral-text">Rescue Rate</span>
              <span className="font-semibold text-primary">40% Wt</span>
            </div>
            <p className="text-2xl font-black text-primary">{((hotelScore.rescue_rate || 0.94) * 100).toFixed(0)}%</p>
            <p className="text-[11px] text-neutral-muted mt-1 leading-snug">
              Portions received vs size benchmark.
            </p>
          </div>

          <div className="p-4 bg-neutral-bg rounded-lg border border-neutral-border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-neutral-text">Participation</span>
              <span className="font-semibold text-primary">20% Wt</span>
            </div>
            <p className="text-2xl font-black text-primary">{((hotelScore.participation || 0.88) * 100).toFixed(0)}%</p>
            <p className="text-[11px] text-neutral-muted mt-1 leading-snug">
              Days with completed pickups / active days.
            </p>
          </div>

          <div className="p-4 bg-neutral-bg rounded-lg border border-neutral-border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-neutral-text">Listing Accuracy</span>
              <span className="font-semibold text-primary">15% Wt</span>
            </div>
            <p className="text-2xl font-black text-primary">{((hotelScore.listing_accuracy || 0.96) * 100).toFixed(0)}%</p>
            <p className="text-[11px] text-neutral-muted mt-1 leading-snug">
              Match between listed and actual portions.
            </p>
          </div>

          <div className="p-4 bg-neutral-bg rounded-lg border border-neutral-border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-neutral-text">Handoff Quality</span>
              <span className="font-semibold text-primary">15% Wt</span>
            </div>
            <p className="text-2xl font-black text-primary">{((hotelScore.handoff_quality || 0.95) * 100).toFixed(0)}%</p>
            <p className="text-[11px] text-neutral-muted mt-1 leading-snug">
              Positive tags ratio (capped 40%/NGO).
            </p>
          </div>

          <div className="p-4 bg-neutral-bg rounded-lg border border-neutral-border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-neutral-text">Left-Behind</span>
              <span className="font-semibold text-primary">10% Wt</span>
            </div>
            <p className="text-2xl font-black text-primary">{((hotelScore.left_behind || 0.98) * 100).toFixed(0)}%</p>
            <p className="text-[11px] text-neutral-muted mt-1 leading-snug">
              Ratio of surplus successfully cleared.
            </p>
          </div>
        </div>
      </div>

      {/* Embeddable Live Badge & Certificate Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Embed Widget */}
        <div className="bg-white rounded-card border border-neutral-border p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Code className="w-4 h-4" />
              <span>Embeddable Web Badge (FR-I2)</span>
            </div>
            <h3 className="font-bold text-base text-neutral-text">Showcase Your Rescue Tier on Your Website</h3>
            <p className="text-xs text-neutral-muted mt-1 leading-relaxed">
              Add this live snippet to your hotel footer or ESG page to automatically display your current tier and rescued meal count.
            </p>

            <div className="mt-4 p-3 bg-neutral-bg rounded-lg border border-neutral-border font-mono text-[11px] text-neutral-text overflow-x-auto whitespace-pre">
              {embedCodeSnippet}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-border flex items-center justify-between">
            <span className="text-xs text-neutral-muted">Updates automatically</span>
            <button
              onClick={handleCopyEmbed}
              className="px-3.5 py-1.5 rounded-lg bg-primary-light text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy HTML Embed'}</span>
            </button>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-card border border-neutral-border p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-accent">
              <FileText className="w-4 h-4" />
              <span>Verified Certificate (FR-I1)</span>
            </div>
            <h3 className="font-bold text-base text-neutral-text">September 2026 ESG Impact Certificate</h3>
            <p className="text-xs text-neutral-muted mt-1 leading-relaxed">
              Legally compliant digital certificate detailing verified surplus meals provided to verified shelters, carbon diversion, and food safety protocols.
            </p>

            <div className="mt-4 p-4 rounded-lg border border-dashed border-neutral-border bg-neutral-bg flex items-center gap-4">
              <div className="w-12 h-14 bg-white rounded border border-neutral-border shadow-xs flex flex-col items-center justify-center p-1">
                <span className="text-[9px] font-black text-primary">PDF</span>
                <span className="text-[8px] text-neutral-muted">CERT</span>
              </div>
              <div className="text-xs">
                <p className="font-bold text-neutral-text">Cert_GrandPalace_2026_09.pdf</p>
                <p className="text-neutral-muted text-[11px]">720 Meals Rescued • 1.8 Tons CO₂ Diverted</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-border flex items-center justify-between">
            <span className="text-xs text-neutral-muted">Signed by Platform Director</span>
            <button
              onClick={handleDownloadCert}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-bg border border-neutral-border text-neutral-text text-xs font-bold hover:bg-gray-100 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-sm w-full p-6 text-center shadow-floating border border-neutral-border animate-in fade-in zoom-in duration-200">
            <h3 className="font-black text-lg text-neutral-text">Guest-Facing QR Standee</h3>
            <p className="text-xs text-neutral-muted mt-1 mb-4">
              Display at reception, dining tables, or in room key sleeves.
            </p>

            <div className="p-6 bg-primary-subtle rounded-xl border border-primary-border inline-block mx-auto mb-4">
              <div className="w-36 h-36 bg-white rounded-lg p-2 shadow-sm flex items-center justify-center border border-gray-200">
                <QrCode className="w-28 h-28 text-neutral-text" />
              </div>
              <p className="font-bold text-xs text-primary mt-2">Scan to See Our Impact</p>
            </div>

            <p className="text-xs text-neutral-muted mb-4 italic">
              &quot;Your stay at Grand Palace helped rescue 1,420 edible meals this quarter.&quot;
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert('Printing QR Standee card...');
                  setShowQRModal(false);
                }}
                className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-bold"
              >
                Print Standee
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2 rounded-lg bg-neutral-bg border border-neutral-border text-neutral-text text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
