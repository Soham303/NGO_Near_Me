'use client';

import React from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import { CounterTile } from '@/components/ui/CounterTile';
import {
  ShieldCheck,
  Building2,
  HeartHandshake,
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Settings,
  Newspaper
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { hotels, ngos, listings, flags, scores } = useFoodRescue();

  const pendingHotels = hotels.filter((h) => h.status === 'pending');
  const pendingNgos = ngos.filter((n) => n.status === 'pending');
  const pendingTotal = pendingHotels.length + pendingNgos.length;

  const openFlags = flags.filter((f) => f.status === 'open');
  const totalRescued = scores.reduce((sum, s) => sum + s.portions_rescued, 25420);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-primary text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Governance & Telemetry</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-text">
            Admin Command Center
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            Real-time monitoring of verification queues, audit flags, and platform-wide benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/settings"
            className="px-3.5 py-2 rounded-xl bg-white border border-neutral-border text-xs font-bold text-neutral-text hover:bg-neutral-bg flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-primary" />
            <span>Scoring Engine</span>
          </Link>
        </div>
      </div>

      {/* Critical Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Approvals Action Banner */}
        <Link
          href="/admin/approvals"
          className="p-5 rounded-card border border-neutral-border bg-white shadow-soft hover:shadow-card transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-neutral-text group-hover:text-primary transition-colors">
                Pending Organization Approvals
              </h2>
              <p className="text-xs text-neutral-muted mt-0.5">
                {pendingTotal} organizations awaiting document and FSSAI vetting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingTotal > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-accent-light text-accent font-black text-xs">
                {pendingTotal} Pending
              </span>
            )}
            <ArrowRight className="w-5 h-5 text-neutral-muted group-hover:translate-x-1 group-hover:text-primary transition-transform" />
          </div>
        </Link>

        {/* Audit Flags Banner */}
        <Link
          href="/admin/flags"
          className="p-5 rounded-card border border-neutral-border bg-white shadow-soft hover:shadow-card transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-neutral-text group-hover:text-primary transition-colors">
                Flagged Pickup Reports
              </h2>
              <p className="text-xs text-neutral-muted mt-0.5">
                {openFlags.length} discrepancy or geofence flags require moderation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {openFlags.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-black text-xs">
                {openFlags.length} Open
              </span>
            )}
            <ArrowRight className="w-5 h-5 text-neutral-muted group-hover:translate-x-1 group-hover:text-primary transition-transform" />
          </div>
        </Link>
      </div>

      {/* Pilot Success Metrics (PRD Section 10) */}
      <div className="mb-8">
        <h2 className="text-base font-black text-neutral-text mb-4">
          Platform Success Telemetry (PRD Section 10)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CounterTile
            count={totalRescued}
            label="Meals Rescued"
            sublabel="Target: Continuous weekly growth"
            variant="primary"
            icon={<Sparkles className="w-6 h-6 text-primary" />}
          />
          <CounterTile
            count="84%"
            label="Claim Rate"
            sublabel="Target: ≥ 70% claimed before expiry"
            variant="neutral"
            icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          />
          <CounterTile
            count="18 min"
            label="Median Post-to-Claim"
            sublabel="Target: ≤ 20 min response speed"
            variant="neutral"
            icon={<Clock className="w-6 h-6 text-primary" />}
          />
          <CounterTile
            count="96%"
            label="Report Completion < 4h"
            sublabel="Target: ≥ 90% source of truth compliance"
            variant="neutral"
            icon={<ShieldCheck className="w-6 h-6 text-accent" />}
          />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/approvals"
          className="p-4 bg-white rounded-card border border-neutral-border shadow-soft hover:shadow-card transition-all"
        >
          <Building2 className="w-5 h-5 text-primary mb-2" />
          <h3 className="font-bold text-sm text-neutral-text">Review Organizations</h3>
          <p className="text-xs text-neutral-muted mt-1">Approve or suspend hotels & NGOs</p>
        </Link>

        <Link
          href="/admin/flags"
          className="p-4 bg-white rounded-card border border-neutral-border shadow-soft hover:shadow-card transition-all"
        >
          <AlertTriangle className="w-5 h-5 text-accent mb-2" />
          <h3 className="font-bold text-sm text-neutral-text">Void & Correct Reports</h3>
          <p className="text-xs text-neutral-muted mt-1">Moderation queue with audit log</p>
        </Link>

        <Link
          href="/admin/settings"
          className="p-4 bg-white rounded-card border border-neutral-border shadow-soft hover:shadow-card transition-all"
        >
          <Settings className="w-5 h-5 text-emerald-600 mb-2" />
          <h3 className="font-bold text-sm text-neutral-text">Calibrate Score Weights</h3>
          <p className="text-xs text-neutral-muted mt-1">Tune constants, smoothing, and radii</p>
        </Link>
      </div>
    </div>
  );
}
