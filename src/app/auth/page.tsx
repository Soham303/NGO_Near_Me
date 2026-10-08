'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFoodRescue } from '@/lib/store';
import { authService } from '@/lib/services/api';
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
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { switchRole, isConfigured, setCurrentUser, refreshData } = useFoodRescue();

  const [activeTab, setActiveTab] = useState<UserRole>('hotel');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Common credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);

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

  // Volunteer fields
  const [vehicle, setVehicle] = useState('Scooter with Thermal Crate (50L)');

  // Quick fill demo credentials for convenience
  const fillDemoCredentials = (role: UserRole) => {
    setActiveTab(role);
    if (role === 'hotel') {
      setEmail('kitchen@grandpalace.com');
      setPassword('RescuePass2026!');
      setFullName('Chef Rajesh Nair');
    } else if (role === 'ngo') {
      setEmail('coordinator@robinhoodkitchen.org');
      setPassword('RescuePass2026!');
      setFullName('Sister Teresa Maria');
    } else if (role === 'volunteer') {
      setEmail('arun.k@volunteer.org');
      setPassword('RescuePass2026!');
      setFullName('Arun Kumar');
    } else {
      setEmail('supporter@foodrescue.org');
      setPassword('RescuePass2026!');
      setFullName('Priya Sharma');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isConfigured) {
        const res = await authService.signIn(email, password);
        if (res.profile) {
          setCurrentUser(res.profile);
        }
        await refreshData();
        setSuccessMsg(`Welcome back, ${res.profile?.full_name || 'User'}! Redirecting...`);
        setTimeout(() => {
          const role = res.profile?.role || activeTab;
          if (role === 'hotel') router.push('/hotel/post');
          else if (role === 'ngo') router.push('/ngo/map');
          else if (role === 'volunteer') router.push('/volunteer/active');
          else if (role === 'admin') router.push('/admin');
          else router.push('/');
        }, 1200);
      } else {
        // Preview mode simulated login
        switchRole(activeTab);
        setSuccessMsg(`Preview Mode: Authenticated as ${activeTab.toUpperCase()}. Redirecting...`);
        setTimeout(() => {
          if (activeTab === 'hotel') router.push('/hotel/post');
          else if (activeTab === 'ngo') router.push('/ngo/map');
          else if (activeTab === 'volunteer') router.push('/volunteer/active');
          else router.push('/');
        }, 1000);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isConfigured) {
        const res = await authService.signUp({
          email,
          password,
          fullName: fullName || email.split('@')[0],
          phone,
          role: activeTab,
          hotelData: activeTab === 'hotel' ? {
            name: hotelName || 'My Hotel Partner',
            venueType,
            address: address || 'MG Road, Bangalore',
            rooms,
            seats,
            banquetCapacity: banquetCap,
            eventsPerMonth,
            operatingDaysPerWeek: operatingDays,
          } : undefined,
          ngoData: activeTab === 'ngo' ? {
            name: ngoName || 'My Community Kitchen',
            registrationNo: regNo,
            address: address || 'Victoria Road, Bangalore',
            capacityPortions: capacity,
            serviceRadiusKm: radiusKm,
          } : undefined,
          volunteerData: activeTab === 'volunteer' ? {
            vehicle,
          } : undefined,
        });

        if (res.session) {
          if (res.profile) {
            setCurrentUser(res.profile);
          }
          await refreshData();
          setSuccessMsg(`Registration successful! Welcome to the network.`);
          setTimeout(() => {
            if (activeTab === 'hotel') router.push('/hotel/post');
            else if (activeTab === 'ngo') router.push('/ngo/map');
            else if (activeTab === 'volunteer') router.push('/volunteer/active');
            else router.push('/');
          }, 1500);
        } else {
          setSuccessMsg(`Account created! If email confirmation is enabled in your Supabase project, check your inbox to confirm your email, or disable 'Confirm email' in Supabase Authentication settings.`);
          setAuthMode('login');
        }
      } else {
        // Preview mode simulated registration
        switchRole(activeTab);
        setSuccessMsg(`Preview Mode: Registration recorded for ${fullName || activeTab}. Redirecting...`);
        setTimeout(() => {
          if (activeTab === 'hotel') router.push('/hotel/post');
          else if (activeTab === 'ngo') router.push('/ngo/map');
          else if (activeTab === 'volunteer') router.push('/volunteer/active');
          else router.push('/');
        }, 1200);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrorMsg(err.message || 'Failed to complete registration. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6">
      {/* Backend Connection Status Banner */}
      {!isConfigured && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Supabase Backend: Awaiting API Keys</p>
            <p className="text-amber-800 leading-relaxed">
              To connect live Supabase Auth and database tables, please provide your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code>.
            </p>
          </div>
        </div>
      )}

      {isConfigured && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <p className="font-medium">
            <strong>Supabase Connected:</strong> Live database authentication is active.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-neutral-text">
          {authMode === 'signup' ? 'Join the FoodRescue Network' : 'Sign In to FoodRescue'}
        </h1>
        <p className="text-xs text-neutral-muted mt-2">
          Real-time cooked surplus food redistribution platform for hotels, caterers, and shelters.
        </p>

        {/* Auth mode toggle */}
        <div className="mt-5 inline-flex items-center bg-white border border-neutral-border p-1 rounded-xl shadow-xs text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
            className={`px-4 py-2 rounded-lg transition-all ${
              authMode === 'login' ? 'bg-primary text-white shadow-xs' : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            Sign In with Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMsg(null); }}
            className={`px-4 py-2 rounded-lg transition-all ${
              authMode === 'signup' ? 'bg-primary text-white shadow-xs' : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            New Organisation Registration
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-card border border-neutral-border p-6 sm:p-8 shadow-card">
        {/* Role Tabs */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold text-neutral-muted uppercase tracking-wider mb-2">
            Select Your Account Persona / Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { role: 'hotel', label: 'Hotel / Donor', icon: Building2 },
              { role: 'ngo', label: 'NGO Coordinator', icon: HeartHandshake },
              { role: 'volunteer', label: 'Volunteer Collector', icon: Bike },
              { role: 'public', label: 'Public Supporter', icon: Users },
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
        </div>

        {/* Quick Credentials Preset Helper */}
        <div className="mb-6 p-3 bg-neutral-bg rounded-xl border border-neutral-border flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-neutral-muted font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Fill Demo Credentials:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoCredentials('hotel')}
              className="px-2 py-1 rounded bg-white border border-neutral-border text-[11px] font-bold text-neutral-text hover:bg-neutral-bg"
            >
              Hotel
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('ngo')}
              className="px-2 py-1 rounded bg-white border border-neutral-border text-[11px] font-bold text-neutral-text hover:bg-neutral-bg"
            >
              NGO
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('volunteer')}
              className="px-2 py-1 rounded bg-white border border-neutral-border text-[11px] font-bold text-neutral-text hover:bg-neutral-bg"
            >
              Volunteer
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('public')}
              className="px-2 py-1 rounded bg-white border border-neutral-border text-[11px] font-bold text-neutral-text hover:bg-neutral-bg"
            >
              Public
            </button>
          </div>
        </div>

        {/* LOGIN FORM */}
        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary transition-all"
                />
                <Mail className="w-4 h-4 text-neutral-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-text">
                  Password *
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-neutral-muted absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-muted hover:text-neutral-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-black text-sm shadow-card hover:bg-primary-hover shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {activeTab.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTRATION / SIGNUP FORM */
          <form onSubmit={handleSignup} className="space-y-5">
            {/* HOTEL SPECIFIC FIELDS */}
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

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">
                    Physical Address (for GPS collections) *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 24 MG Road, Ashok Nagar, Bengaluru"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none"
                  />
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
              </div>
            )}

            {/* NGO SPECIFIC FIELDS */}
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
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      placeholder="NGO-BLR-2023-XXXX"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none font-bold"
                    />
                  </div>
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">
                    Distribution Kitchen Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 12 Victoria Road, Austin Town, Bengaluru"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* VOLUNTEER SPECIFIC FIELDS */}
            {activeTab === 'volunteer' && (
              <div className="space-y-4 p-4 bg-neutral-bg rounded-xl border border-neutral-border">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <Bike className="w-3.5 h-3.5" />
                  <span>Volunteer Dispatch Information</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">
                    Vehicle Type / Transport Capacity
                  </label>
                  <input
                    type="text"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="e.g. Scooter with Insulated Carrier (50L)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-border bg-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Representative Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1">
                Full Name (Representative / Contact Person) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajesh Nair"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary"
                />
                <User className="w-4 h-4 text-neutral-muted absolute left-3 top-3" />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary"
                  />
                  <Mail className="w-4 h-4 text-neutral-muted absolute left-3 top-3" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Phone Number (SMS / OTP)</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary"
                  />
                  <Phone className="w-4 h-4 text-neutral-muted absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Create Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary font-mono"
                  />
                  <Lock className="w-4 h-4 text-neutral-muted absolute left-3 top-3" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-neutral-border outline-none focus:border-primary font-mono"
                  />
                  <Lock className="w-4 h-4 text-neutral-muted absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary rounded border-gray-300"
              />
              <label htmlFor="terms" className="text-xs text-neutral-muted leading-relaxed cursor-pointer select-none">
                I agree to the FoodRescue Platform Terms of Use and confirm compliance with the FSSAI Surplus Cooked Food Redistribution Guidelines.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !termsAgreed}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-black text-sm shadow-card hover:bg-primary-hover shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account & Registering...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration as {activeTab.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
