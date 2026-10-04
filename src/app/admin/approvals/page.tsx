'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import {
  Building2,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  FileText,
  ArrowLeft,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export default function AdminApprovalsPage() {
  const { hotels, ngos, updateOrgStatus } = useFoodRescue();
  const [tab, setTab] = useState<'hotels' | 'ngos'>('hotels');

  const handleAction = (type: 'hotel' | 'ngo', id: string, status: 'approved' | 'rejected' | 'suspended') => {
    const reason = prompt(`Please provide an audit note for marking this ${type} as ${status}:`);
    updateOrgStatus(type, id, status, reason || undefined);
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-text">
            Organization Approvals Queue
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            Review food safety credentials, trade licenses, and capacity parameters before granting platform access.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-white border border-neutral-border p-1 rounded-xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setTab('hotels')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              tab === 'hotels' ? 'bg-primary text-white shadow-xs' : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hotels & Donors ({hotels.length})</span>
          </button>
          <button
            onClick={() => setTab('ngos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              tab === 'ngos' ? 'bg-primary text-white shadow-xs' : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>NGOs & Shelters ({ngos.length})</span>
          </button>
        </div>
      </div>

      {/* Grid of Orgs */}
      <div className="space-y-4">
        {tab === 'hotels' ? (
          hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-card border border-neutral-border p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      hotel.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : hotel.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {hotel.status}
                  </span>
                  <span className="text-xs text-neutral-muted uppercase font-bold tracking-wider">
                    {hotel.venue_type}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-neutral-text">{hotel.name}</h3>
                <p className="text-xs text-neutral-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{hotel.address}</span>
                </p>

                <div className="flex flex-wrap gap-3 pt-1 text-xs text-neutral-muted">
                  <span>Rooms: <strong>{hotel.rooms}</strong></span>
                  <span>Seats: <strong>{hotel.seats}</strong></span>
                  <span>Banquet: <strong>{hotel.banquet_capacity}</strong></span>
                  <span>Events/mo: <strong>{hotel.events_per_month}</strong></span>
                  <span>Active days: <strong>{hotel.operating_days_per_week}d/wk</strong></span>
                </div>

                {hotel.verification_doc_path && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline cursor-pointer">
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Submitted Verification Document (PDF)</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {hotel.status !== 'approved' && (
                  <button
                    onClick={() => handleAction('hotel', hotel.id, 'approved')}
                    className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-soft flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                )}

                {hotel.status !== 'rejected' && (
                  <button
                    onClick={() => handleAction('hotel', hotel.id, 'rejected')}
                    className="px-3.5 py-2 rounded-xl bg-neutral-bg border border-neutral-border text-neutral-text text-xs font-bold hover:bg-gray-100 flex items-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Reject</span>
                  </button>
                )}

                {hotel.status === 'approved' && (
                  <button
                    onClick={() => handleAction('hotel', hotel.id, 'suspended')}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 flex items-center gap-1.5 transition-all"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Suspend</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          ngos.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-white rounded-card border border-neutral-border p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      ngo.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ngo.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {ngo.status}
                  </span>
                  {ngo.registration_no && (
                    <span className="text-xs text-neutral-muted font-mono">
                      Reg: {ngo.registration_no}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-neutral-text">{ngo.name}</h3>
                <p className="text-xs text-neutral-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{ngo.address}</span>
                </p>

                <div className="flex flex-wrap gap-3 pt-1 text-xs text-neutral-muted">
                  <span>Capacity: <strong>{ngo.capacity_portions} portions/day</strong></span>
                  <span>Radius: <strong>{ngo.service_radius_km} km</strong></span>
                  <span>Trust Score: <strong>{(ngo.trust_score * 100).toFixed(0)}%</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {ngo.status !== 'approved' && (
                  <button
                    onClick={() => handleAction('ngo', ngo.id, 'approved')}
                    className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-soft flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve NGO</span>
                  </button>
                )}

                {ngo.status !== 'rejected' && (
                  <button
                    onClick={() => handleAction('ngo', ngo.id, 'rejected')}
                    className="px-3.5 py-2 rounded-xl bg-neutral-bg border border-neutral-border text-neutral-text text-xs font-bold hover:bg-gray-100 flex items-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Reject</span>
                  </button>
                )}

                {ngo.status === 'approved' && (
                  <button
                    onClick={() => handleAction('ngo', ngo.id, 'suspended')}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 flex items-center gap-1.5 transition-all"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Suspend</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
