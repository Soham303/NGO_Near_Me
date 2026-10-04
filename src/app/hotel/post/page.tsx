'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFoodRescue } from '@/lib/store';
import { FoodDiet } from '@/types';
import {
  UtensilsCrossed,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Check,
  BookmarkCheck,
  Info
} from 'lucide-react';

export default function PostSurplusPage() {
  const router = useRouter();
  const { postListing, activeHotel } = useFoodRescue();

  // Quick defaults
  const now = new Date();
  const defaultCooked = now.toTimeString().substring(0, 5); // HH:MM
  const defaultPickup = new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().substring(0, 5); // +2 hours

  const [title, setTitle] = useState('Executive Buffet Surplus & Steamed Rice');
  const [diet, setDiet] = useState<FoodDiet>('veg');
  const [portions, setPortions] = useState<number>(35);
  const [cookedAtTime, setCookedAtTime] = useState(defaultCooked);
  const [pickupByTime, setPickupByTime] = useState(defaultPickup);
  const [packagingNotes, setPackagingNotes] = useState('Packed in clean food-grade stainless carriers. Dock B.');
  const [safetyChecked, setSafetyChecked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick portions selector chips
  const quickPortions = [10, 25, 50, 100];

  // Repost last shortcut
  const handleRepostLast = () => {
    setTitle('Continental Pastries, Sandwiches & Quiches');
    setDiet('veg');
    setPortions(50);
    setPackagingNotes('Clean bakery boxes at kitchen back counter.');
    setToastMessage('Populated from your last completed surplus listing!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Saved templates
  const handleSelectTemplate = (templateName: string) => {
    if (templateName === 'banquet') {
      setTitle('Banquet Wedding Feast Mixed Platters');
      setDiet('mixed');
      setPortions(75);
      setPackagingNotes('Large catering thermal pans, banquet loading ramp.');
    } else if (templateName === 'lunch') {
      setTitle('Lunch Thali & Lentil Curry Surplus');
      setDiet('veg');
      setPortions(30);
      setPackagingNotes('Sealed foil packs.');
    } else if (templateName === 'breakfast') {
      setTitle('Breakfast Buffet Pastries, Bread & Idlis');
      setDiet('veg');
      setPortions(25);
      setPackagingNotes('Stainless transport trays.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyChecked) {
      alert('Please confirm that food safety guidelines have been followed.');
      return;
    }

    setIsSubmitting(true);

    // Calculate ISO timestamps based on today + time inputs
    const today = new Date().toISOString().split('T')[0];
    const cookedIso = new Date(`${today}T${cookedAtTime}:00`).toISOString();
    const pickupIso = new Date(`${today}T${pickupByTime}:00`).toISOString();

    const created = postListing({
      hotel_id: activeHotel.id,
      title,
      diet,
      portions_listed: portions,
      cooked_at: cookedIso,
      pickup_by: pickupIso,
      packaging_notes: packagingNotes,
      safety_confirmed: safetyChecked,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/hotel/listings/${created.id}`);
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
      {/* Toast */}
      {toastMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <span>{activeHotel.name}</span>
            <span className="text-gray-300">•</span>
            <span>30-Second Quick Form</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-text mt-1">
            Post Surplus Cooked Food
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            Nearby verified NGOs receive an immediate alert once posted.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRepostLast}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-neutral-bg border border-neutral-border text-xs font-bold text-neutral-text hover:bg-gray-100 flex items-center gap-1.5 transition-all shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-primary" />
          <span>Repost Last Listing</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-card border border-neutral-border p-6 shadow-card">
        {/* Templates Row */}
        <div className="mb-6 p-3 bg-neutral-bg rounded-lg border border-neutral-border flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-neutral-muted flex items-center gap-1 mr-1">
            <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
            <span>Templates:</span>
          </span>
          <button
            type="button"
            onClick={() => handleSelectTemplate('banquet')}
            className="px-2.5 py-1 rounded bg-white border border-neutral-border hover:border-primary text-neutral-text font-medium transition-all"
          >
            Wedding / Banquet (75 portions)
          </button>
          <button
            type="button"
            onClick={() => handleSelectTemplate('lunch')}
            className="px-2.5 py-1 rounded bg-white border border-neutral-border hover:border-primary text-neutral-text font-medium transition-all"
          >
            Lunch Buffet (30 portions)
          </button>
          <button
            type="button"
            onClick={() => handleSelectTemplate('breakfast')}
            className="px-2.5 py-1 rounded bg-white border border-neutral-border hover:border-primary text-neutral-text font-medium transition-all"
          >
            Breakfast / Bakery (25 portions)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-text uppercase tracking-wider mb-1.5">
              Food Item Title & Details *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Vegetarian Buffet Curry, Rice & Breads"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Diet Selection & Portions in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Diet */}
            <div>
              <label className="block text-xs font-bold text-neutral-text uppercase tracking-wider mb-1.5">
                Diet Category *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'veg', label: 'Vegetarian', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                  { value: 'non_veg', label: 'Non-Veg', color: 'border-rose-500 bg-rose-50 text-rose-800' },
                  { value: 'mixed', label: 'Mixed', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                ].map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDiet(d.value as FoodDiet)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      diet === d.value
                        ? `${d.color} shadow-xs font-black`
                        : 'border-neutral-border bg-white text-neutral-muted hover:bg-neutral-bg'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Portions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-neutral-text uppercase tracking-wider">
                  Available Portions *
                </label>
                <span className="text-xs text-neutral-muted">approx. adult meals</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={portions}
                  onChange={(e) => setPortions(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-2 text-sm font-black text-center rounded-lg border border-neutral-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <div className="flex flex-1 gap-1">
                  {quickPortions.map((qp) => (
                    <button
                      key={qp}
                      type="button"
                      onClick={() => setPortions(qp)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                        portions === qp
                          ? 'bg-primary-light border-primary text-primary font-black'
                          : 'bg-neutral-bg border-neutral-border text-neutral-muted hover:text-neutral-text'
                      }`}
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timing Defaults: Cooked-at & Pickup-by */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-neutral-bg rounded-lg border border-neutral-border">
            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-muted" />
                <span>Cooked At (Approx)</span>
              </label>
              <input
                type="time"
                value={cookedAtTime}
                onChange={(e) => setCookedAtTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-neutral-border bg-white outline-none font-medium"
              />
              <span className="text-[11px] text-neutral-muted mt-1 block">
                Helps shelter calculate consumption safety window.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-text mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>Must Pickup By (Default +2 Hours) *</span>
              </label>
              <input
                type="time"
                value={pickupByTime}
                onChange={(e) => setPickupByTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-neutral-border bg-white outline-none font-bold text-accent"
              />
              <span className="text-[11px] text-neutral-muted mt-1 block">
                Auto-expires if unclaimed by this time.
              </span>
            </div>
          </div>

          {/* Packaging Notes */}
          <div>
            <label className="block text-xs font-bold text-neutral-text uppercase tracking-wider mb-1.5">
              Pickup Instructions & Packaging Notes
            </label>
            <textarea
              rows={2}
              value={packagingNotes}
              onChange={(e) => setPackagingNotes(e.target.value)}
              placeholder="e.g. Bring thermal insulated crates. Collect from back kitchen loading ramp."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Food-Safety Checklist (Mandatory per PRD FR-S1) */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="foodSafetyCheck"
                checked={safetyChecked}
                onChange={(e) => setSafetyChecked(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="foodSafetyCheck" className="text-xs text-neutral-text leading-relaxed cursor-pointer select-none">
                <strong className="font-bold text-emerald-900 block mb-0.5">
                  Food Safety & Hygiene Confirmation (FR-S1)
                </strong>
                I confirm this food was freshly prepared under hygienic conditions, has been kept at safe temperature, is unadulterated cooked or sealed surplus, and is safe for consumption within 4 hours.
              </label>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-black text-sm shadow-card hover:bg-primary-hover hover:shadow-floating transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Broadcasting to Nearby NGOs...</span>
                </>
              ) : (
                <>
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Post Surplus Listing ({portions} portions)</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-neutral-muted mt-2">
              Hotel role is read-only after posting. NGOs manage live collection and report verification.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
