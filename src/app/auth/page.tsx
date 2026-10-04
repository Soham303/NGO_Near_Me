'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFoodRescue } from '@/lib/store';
import { UserRole, VenueType } from '@/types';
import {
  Building2,
  HeartHandshake,
  Bike,
  Users,
  ShieldCheck,
  CheckCircle2,
  Upload,
  ArrowRight,
  Info
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { switchRole } = useFoodRescue();

  const [activeTab, setActiveTab] = useState<UserRole>('hotel');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [submitted, setSubmitted] = useState(false);

  // Hotel fields
  const [hotelName, setHotelName] = useState('');
  const [venueType, setVenueType] = useState<VenueType>('hotel');
  const [rooms, setRooms] = useState(120);
  const [seats, setSeats] = useState(80);
  const [banquetCap, setBanquetCap] = useState(350);
  const [eventsPerMonth, setEventsPerMonth] = useState(6);
  const [operatingDays, setOperatingDays] = useState(7);
  const [address, setAddress] = useState('');

  // NGO fields
  const [ngoName, setNgoName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [radiusKm, setRadiusKm] = useState(12);
  const [capacity, setCapacity] = useState(400);

  // Common
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    switchRole(activeTab);

    setTimeout(() => {
      if (activeTab === 'hotel') router.push('/hotel/post');
      else if (activeTab === 'ngo') router.push('/ngo/map');
      else if (activeTab === 'volunteer') router.push('/volunteer/active');
      else router.push('/');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-neutral-text">
          {authMode === 'signup' ? 'Join the FoodRescue Network' : 'Welcome Back'}
        </h1>
        <p className="text-xs text-neutral-muted mt-2">
          Hospitals, banquets, and restaurants diverting food to verified community kitchens.
        </p>

        {/* Auth mode toggle */}
        <div className="mt-4 inline-flex items-center bg-white border border-neutral-border p-1 rounded-xl shadow-xs text-xs font-bold">
          <button
            onClick={() => setAuthMode('signup')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              authMode === 'signup' ? 'bg-primary text-white shadow-xs' : 'text-neutral-muted'
            }`}
          >
            New Organisation Registration
          </button>
          <button
            onClick={() => setAuthMode('login')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              authMode === 'login' ? 'bg-primary text-white shadow-xs' : 'text-neutral-muted'
            }`}
          >
            Sign In with Email / OTP
          </button>
        </div>
      </div>

      {submitted ? (
        <div className="bg-white rounded-card border border-emerald-200 p-8 shadow-card text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-primary border border-emerald-300 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-text">Registration Submitted!</h2>
          <p className="text-xs text-neutral-muted max-w-md mx-auto leading-relaxed">
            Status: <strong>Pending Admin Review</strong>. Per platform governance (PRD FR-A3), verified licenses are vetted by the admin team before listings can be finalized.
          </p>
          <p className="text-xs text-primary font-bold">Switching your preview to this role...</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-neutral-border p-6 sm:p-8 shadow-card">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {[
              { role: 'hotel', label: 'Hotel / Donor', icon: Building2 },
              { role: 'ngo', label: 'NGO / Shelter', icon: HeartHandshake },
              { role: 'volunteer', label: 'Volunteer', icon: Bike },
              { role: 'public', label: 'Public User', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.role}
                  type="button"
                  onClick={() => setActiveTab(tab.role as UserRole)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                    activeTab === tab.role
                      ? 'bg-primary-light border-primary text-primary font-black shadow-xs'
                      : 'border-neutral-border text-neutral-muted hover:bg-neutral-bg'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* HOTEL SPECIFIC SIZE BENCHMARK FIELDS (FR-A4) */}
            {activeTab === 'hotel' && (
              <div className="space-y-4 p-4 bg-neutral-bg rounded-xl border border-neutral-border">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Venue Profile & Benchmark Size Data</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">
                    Venue Trade Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="e.g. Royal Orchid Banquets"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">
                      Venue Type *
                    </label>
                    <select
                      value={venueType}
                      onChange={(e) => setVenueType(e.target.value as VenueType)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none"
                    >
                      <option value="hotel">Hotel / Resort</option>
                      <option value="restaurant">Restaurant / Bistro</option>
                      <option value="banquet_hall">Banquet & Wedding Hall</option>
                      <option value="hostel">Hostel / Campus Mess</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">
                      Operating Days / Week
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={operatingDays}
                      onChange={(e) => setOperatingDays(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-text mb-1">Rooms</label>
                    <input
                      type="number"
                      value={rooms}
                      onChange={(e) => setRooms(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded border border-neutral-border bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-text mb-1">Dining Seats</label>
                    <input
                      type="number"
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded border border-neutral-border bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-text mb-1">Banquet Cap</label>
                    <input
                      type="number"
                      value={banquetCap}
                      onChange={(e) => setBanquetCap(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded border border-neutral-border bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">
                    FSSAI / Food License Document (Upload Proof)
                  </label>
                  <div className="border border-dashed border-neutral-border rounded-lg p-3 bg-white text-center text-xs text-neutral-muted cursor-pointer hover:border-primary">
                    <Upload className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <span>Upload PDF or Image Proof</span>
                  </div>
                </div>
              </div>
            )}

            {/* NGO SPECIFIC FIELDS (FR-A3) */}
            {activeTab === 'ngo' && (
              <div className="space-y-4 p-4 bg-neutral-bg rounded-xl border border-neutral-border">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>NGO / Shelter Profile</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ngoName}
                    onChange={(e) => setNgoName(e.target.value)}
                    placeholder="e.g. Care & Share Food Alliance"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">
                      Daily Portion Capacity
                    </label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-text mb-1">
                      Service Radius (km)
                    </label>
                    <input
                      type="number"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Common Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Phone Number (SMS / OTP)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Terms & Food Safety Confirmation */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary rounded border-gray-300"
              />
              <label htmlFor="terms" className="text-xs text-neutral-muted leading-relaxed cursor-pointer select-none">
                I agree to the FoodRescue Platform Terms of Use and comply with the FSSAI Surplus Cooked Food Redistribution Guidelines.
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-primary text-white font-black text-sm shadow-card hover:bg-primary-hover shadow-soft transition-all flex items-center justify-center gap-2"
            >
              <span>Continue as {activeTab.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
