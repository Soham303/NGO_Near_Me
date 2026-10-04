'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Edit3,
  Building2,
  HeartHandshake,
  ShieldCheck,
  Camera,
  MapPin
} from 'lucide-react';

export default function AdminFlagsPage() {
  const { flags, resolveFlag } = useFoodRescue();
  const [correctModalFlagId, setCorrectModalFlagId] = useState<string | null>(null);
  const [correctedPortions, setCorrectedPortions] = useState<number>(30);
  const [auditReason, setAuditReason] = useState<string>('');

  const handleKeep = (flagId: string) => {
    const reason = prompt('Reason for keeping this report as-is (dismissing flag):');
    if (reason) {
      resolveFlag(flagId, 'keep', reason);
    }
  };

  const handleVoid = (flagId: string) => {
    const reason = prompt('Mandatory audit reason for VOIDING this pickup report (disqualifies from score):');
    if (reason) {
      resolveFlag(flagId, 'voided', reason);
    }
  };

  const handleConfirmCorrect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctModalFlagId || !auditReason) return;

    resolveFlag(correctModalFlagId, 'correct', auditReason, correctedPortions);
    setCorrectModalFlagId(null);
    setAuditReason('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-muted hover:text-neutral-text mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Admin Center</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-text">
          Audit & Flagged Reports Queue (Screen 23)
        </h1>
        <p className="text-xs text-neutral-muted mt-1">
          Review discrepancies between listed and reported quantities, geofence violations, and photo proof before scores settle.
        </p>
      </div>

      <div className="space-y-6">
        {flags.length === 0 ? (
          <div className="bg-white rounded-card border border-neutral-border p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2 opacity-50" />
            <h3 className="font-bold text-base text-neutral-text">Zero Unresolved Flags</h3>
            <p className="text-xs text-neutral-muted mt-1">
              All NGO receipts match listed quantities within configured tolerance thresholds.
            </p>
          </div>
        ) : (
          flags.map((flag) => {
            const pickup = flag.pickup;

            return (
              <div
                key={flag.id}
                className="bg-white rounded-card border border-neutral-border overflow-hidden shadow-card p-6"
              >
                {/* Flag Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-border">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 mr-2">
                        {flag.status.toUpperCase()}
                      </span>
                      <strong className="text-xs font-bold text-neutral-text">Flag #{flag.id}</strong>
                    </div>
                  </div>

                  <span className="text-xs text-neutral-muted">
                    Triggered: {new Date(flag.created_at).toLocaleString()} via {flag.source}
                  </span>
                </div>

                {/* Reason Banner */}
                <div className="mt-4 p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-xs font-semibold text-rose-900 leading-relaxed">
                  Reason for Review: {flag.reason}
                </div>

                {/* Side-by-Side Evidence Inspection (PRD Section 7.9) */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-bg p-5 rounded-xl border border-neutral-border">
                  {/* Left: Hotel & Claim Details */}
                  <div className="space-y-3 text-xs">
                    <h4 className="font-bold text-sm text-neutral-text flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>Original Listing by {flag.hotel_name}</span>
                    </h4>

                    <div className="p-3 bg-white rounded-lg border border-neutral-border space-y-1.5">
                      <p>
                        Listed Portions: <strong className="text-neutral-text text-sm">{pickup?.listing?.portions_listed || 45} meals</strong>
                      </p>
                      <p className="text-neutral-muted">
                        Diet: <span className="capitalize">{pickup?.listing?.diet || 'veg'}</span>
                      </p>
                      <p className="text-neutral-muted">
                        Claiming NGO: <strong>{flag.ngo_name}</strong>
                      </p>
                      <p className="text-neutral-muted">
                        Collector Driver: <strong>{pickup?.volunteer_name}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Right: NGO Reported Data & Photo Evidence */}
                  <div className="space-y-3 text-xs">
                    <h4 className="font-bold text-sm text-neutral-text flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>NGO Reported Receipt Evidence</span>
                    </h4>

                    <div className="p-3 bg-white rounded-lg border border-neutral-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Reported Received:</span>
                        <strong className="text-sm font-black text-rose-700">
                          {pickup?.portions_received} portions
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Reported Left Behind:</span>
                        <strong className="text-neutral-text">
                          {pickup?.left_behind_portions || 0} portions
                        </strong>
                      </div>

                      {pickup?.photo_path ? (
                        <div>
                          <span className="text-[10px] text-neutral-muted block mb-1">
                            Handoff Photo Proof:
                          </span>
                          <img
                            src={pickup.photo_path}
                            alt="Handoff evidence"
                            className="w-full h-32 object-cover rounded-md border border-neutral-border"
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-red-600 font-bold">No photo proof attached!</p>
                      )}

                      {pickup?.tags && pickup.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {pickup.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-bg border border-neutral-border"
                            >
                              {t.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Moderation Actions (Keep / Correct / Void) */}
                <div className="mt-6 pt-4 border-t border-neutral-border flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-neutral-muted">
                    Resolving recomputes hotel Rescue Score snapshot instantly.
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleKeep(flag.id)}
                      className="px-4 py-2 rounded-xl bg-white border border-neutral-border text-neutral-text text-xs font-bold hover:bg-neutral-bg flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Keep (Dismiss Flag)</span>
                    </button>

                    <button
                      onClick={() => {
                        setCorrectModalFlagId(flag.id);
                        setCorrectedPortions(pickup?.portions_received || 30);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5 shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-accent" />
                      <span>Correct Portions</span>
                    </button>

                    <button
                      onClick={() => handleVoid(flag.id)}
                      className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-100 flex items-center gap-1.5 shadow-xs"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Void Report</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Correct Portions Modal */}
      {correctModalFlagId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-sm w-full p-6 shadow-floating border border-neutral-border">
            <h3 className="font-bold text-base text-neutral-text mb-2">Correct Verified Portions</h3>
            <p className="text-xs text-neutral-muted mb-4">
              Enter the adjudicated portion count confirmed with donor and recipient kitchen.
            </p>

            <form onSubmit={handleConfirmCorrect} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">
                  Adjusted Portions *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={correctedPortions}
                  onChange={(e) => setCorrectedPortions(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">
                  Audit Reason (Mandatory) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="e.g. Confirmed with kitchen manager that 30 portions were packed."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-border outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-bold"
                >
                  Save & Recalculate
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectModalFlagId(null)}
                  className="px-4 py-2 rounded-lg bg-neutral-bg border border-neutral-border text-xs font-bold text-neutral-text"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
