'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import { PlatformSettings } from '@/types';
import {
  Settings,
  ArrowLeft,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { settings, updateSettings, recomputeScores } = useFoodRescue();
  const [formSettings, setFormSettings] = useState<PlatformSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleWeightChange = (key: keyof PlatformSettings['score_weights'], val: number) => {
    setFormSettings({
      ...formSettings,
      score_weights: {
        ...formSettings.score_weights,
        [key]: val,
      },
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    recomputeScores();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleResetDefaults = () => {
    const defaults: PlatformSettings = {
      score_weights: {
        rescue_rate: 0.40,
        participation: 0.20,
        listing_accuracy: 0.15,
        handoff_quality: 0.15,
        left_behind: 0.10,
      },
      smoothing_k: 5,
      min_pickups_for_board: 5,
      geofence_radius_meters: 150,
      per_ngo_weight_cap: 0.40,
      report_deadline_hours: 4,
    };
    setFormSettings(defaults);
    updateSettings(defaults);
  };

  const totalWeight = Object.values(formSettings.score_weights).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-muted hover:text-neutral-text mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Admin Center</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-text">
            Rescue Score Engine & Parameters
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            Tune algorithmic signal weights, smoothing constants, and geofence tolerances.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-neutral-bg border border-neutral-border text-xs font-bold text-neutral-text hover:bg-gray-100 flex items-center gap-1.5 transition-all shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-neutral-muted" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved! All 60-day rolling Rescue Scores have been recomputed across all active hotels.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Signal Weights (PRD Section 8) */}
        <div className="bg-white rounded-card border border-neutral-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-neutral-text flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span>Signal Weights Calibration</span>
              </h2>
              <p className="text-xs text-neutral-muted">
                Must sum to 100% (1.00). Tuned during platform pilot.
              </p>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                Math.abs(totalWeight - 1.0) < 0.01
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              Total: {(totalWeight * 100).toFixed(0)}%
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                key: 'rescue_rate',
                label: 'Rescue Rate',
                desc: 'portions confirmed received ÷ size benchmark expected portions',
              },
              {
                key: 'participation',
                label: 'Participation',
                desc: 'operating days with ≥1 completed rescue ÷ active days',
              },
              {
                key: 'listing_accuracy',
                label: 'Listing Accuracy',
                desc: '1 − average of |listed − received| ÷ listed',
              },
              {
                key: 'handoff_quality',
                label: 'Handoff Quality',
                desc: 'positive tags ÷ (positive + issue tags), per-NGO capped',
              },
              {
                key: 'left_behind',
                label: 'Left-Behind',
                desc: '1 − left_behind ÷ (received + left_behind)',
              },
            ].map((sig) => {
              const weightVal = formSettings.score_weights[sig.key as keyof PlatformSettings['score_weights']];

              return (
                <div key={sig.key} className="p-3 bg-neutral-bg rounded-lg border border-neutral-border">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-neutral-text">{sig.label}</span>
                    <strong className="text-primary font-black text-sm">
                      {(weightVal * 100).toFixed(0)}%
                    </strong>
                  </div>
                  <p className="text-[11px] text-neutral-muted mb-2">{sig.desc}</p>
                  <input
                    type="range"
                    min="0"
                    max="0.80"
                    step="0.05"
                    value={weightVal}
                    onChange={(e) =>
                      handleWeightChange(
                        sig.key as keyof PlatformSettings['score_weights'],
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full accent-primary"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Tolerances & Governance Parameters */}
        <div className="bg-white rounded-card border border-neutral-border p-6 shadow-card space-y-4">
          <h2 className="text-base font-black text-neutral-text">
            Operational Tolerances & Constants
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1">
                Bayesian Smoothing Constant (k)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formSettings.smoothing_k}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, smoothing_k: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border font-bold outline-none"
              />
              <span className="text-[11px] text-neutral-muted mt-0.5 block">
                Default: 5 pickups weight toward platform mean to stabilize new hotels.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1">
                Minimum Pickups for Public Board
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formSettings.min_pickups_for_board}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, min_pickups_for_board: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border font-bold outline-none"
              />
              <span className="text-[11px] text-neutral-muted mt-0.5 block">
                Venues below this appear only in private hotel dashboards.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1">
                Geofence Verification Radius (meters)
              </label>
              <input
                type="number"
                min="50"
                max="1000"
                value={formSettings.geofence_radius_meters}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, geofence_radius_meters: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border font-bold outline-none"
              />
              <span className="text-[11px] text-neutral-muted mt-0.5 block">
                Flag pickups if collector confirms outside this circle.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1">
                Single-NGO Weight Cap
              </label>
              <input
                type="number"
                step="0.05"
                min="0.10"
                max="1.00"
                value={formSettings.per_ngo_weight_cap}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, per_ngo_weight_cap: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border font-bold outline-none"
              />
              <span className="text-[11px] text-neutral-muted mt-0.5 block">
                Prevents favoritism by capping one NGO&apos;s quality feedback impact at 40%.
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-primary text-white font-black text-sm shadow-card hover:bg-primary-hover flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings & Recalculate Live Scores</span>
          </button>
        </div>
      </form>
    </div>
  );
}
