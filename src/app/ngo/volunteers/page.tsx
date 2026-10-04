'use client';

import React, { useState } from 'react';
import { useFoodRescue } from '@/lib/store';
import { Volunteer } from '@/types';
import {
  Bike,
  PlusCircle,
  Phone,
  CheckCircle2,
  XCircle,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

export default function NGOVolunteersPage() {
  const { volunteers, activeNGO } = useFoodRescue();
  const [volList, setVolList] = useState<Volunteer[]>(volunteers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('Scooter with Thermal Crate');

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newVol: Volunteer = {
      id: 'vol-' + Date.now(),
      profile_id: 'user-vol-' + Date.now(),
      ngo_id: activeNGO.id,
      name,
      phone,
      vehicle,
      active: true,
    };

    setVolList([newVol, ...volList]);
    setName('');
    setPhone('');
    setShowAddForm(false);
  };

  const toggleActive = (id: string) => {
    setVolList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, active: !v.active } : v))
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <span>{activeNGO.name}</span>
            <span className="text-gray-300">•</span>
            <span>Dispatch Fleet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-text mt-1">
            Volunteer & Collector Roster
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            Manage authorized drivers assigned to collect surplus batches from partner kitchens.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-soft hover:bg-primary-hover flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Volunteer</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-card border border-neutral-border p-6 shadow-card mb-6 animate-in fade-in duration-200">
          <h3 className="font-black text-sm text-neutral-text mb-4">Add Team Member</h3>
          <form onSubmit={handleAddVolunteer} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Nair"
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 00000"
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1">Vehicle / Equipment</label>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="e.g. Two-wheeler / Van"
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg bg-neutral-bg border border-neutral-border text-xs font-bold text-neutral-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-soft"
              >
                Save Volunteer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Volunteer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {volList.map((vol) => (
          <div
            key={vol.id}
            className="bg-white rounded-card border border-neutral-border p-5 shadow-soft flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-black text-sm">
                    {vol.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-text">{vol.name}</h3>
                    <p className="text-[11px] text-neutral-muted flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-muted" />
                      <span>{vol.phone}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    vol.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {vol.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-3 p-2 bg-neutral-bg rounded-lg border border-neutral-border text-xs text-neutral-muted">
                <span className="font-semibold text-neutral-text">Transport:</span> {vol.vehicle || 'Standard'}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-border flex items-center justify-between text-xs">
              <span className="text-neutral-muted">Verified Driver</span>
              <button
                onClick={() => toggleActive(vol.id)}
                className="text-xs font-bold text-primary hover:underline"
              >
                {vol.active ? 'Set Inactive' : 'Set Active'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
