'use client';

import React from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import { CounterTile } from '@/components/ui/CounterTile';
import { TierBadge } from '@/components/ui/TierBadge';
import { CountdownPill } from '@/components/ui/CountdownPill';
import {
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  Building2,
  HeartHandshake,
  Bike,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function HomePage() {
  const { listings, scores, news, switchRole } = useFoodRescue();

  // Top 3 Leaderboard
  const topPerformers = scores.slice(0, 3);

  // Active open listings count
  const openListings = listings.filter((l) => l.status === 'posted');
  const totalPortionsAvailable = openListings.reduce((sum, l) => sum + l.portions_listed, 0);

  // Total Rescued metric
  const totalRescued = scores.reduce((sum, s) => sum + s.portions_rescued, 25420);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-subtle via-white to-neutral-bg pt-12 pb-20 border-b border-neutral-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light border border-primary-border text-primary text-xs font-bold mb-6 animate-pulse">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Real-time Surplus Food Redistribution</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-text tracking-tight leading-[1.1]">
              Zero Edible Food Left Behind.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-neutral-muted leading-relaxed">
              Connecting hotels, banquets, and restaurants with surplus cooked food to verified NGOs
              and community kitchens in under 30 seconds.
            </p>

            {/* Quick Action CTA buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/hotel/post"
                onClick={() => switchRole('hotel')}
                className="px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-card hover:bg-primary-hover hover:shadow-floating transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Post Surplus (Hotels)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/ngo/map"
                onClick={() => switchRole('ngo')}
                className="px-6 py-3.5 rounded-xl bg-white text-neutral-text border border-neutral-border font-bold text-sm shadow-soft hover:bg-neutral-bg hover:border-gray-300 transition-all flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span>Explore Live Map (NGOs)</span>
              </Link>

              <Link
                href="/auth"
                className="px-5 py-3.5 rounded-xl bg-neutral-bg text-neutral-muted hover:text-neutral-text font-bold text-sm transition-all"
              >
                <span>Join Platform</span>
              </Link>
            </div>
          </div>

          {/* City Counter Grid */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CounterTile
              count={totalRescued}
              label="Meals Rescued"
              sublabel="Verified by receiving NGOs this quarter"
              variant="primary"
              icon={<UtensilsCrossed className="w-6 h-6 text-primary" />}
            />
            <CounterTile
              count={totalPortionsAvailable}
              label="Portions Live Now"
              sublabel="Ready for immediate pickup nearby"
              variant="accent"
              icon={<Clock className="w-6 h-6 text-accent" />}
            />
            <CounterTile
              count="18m"
              label="Median Claim Time"
              sublabel="From hotel posting to NGO lock"
              variant="neutral"
              icon={<Clock className="w-6 h-6 text-primary" />}
            />
            <CounterTile
              count={`${((totalRescued * 2.5) / 1000).toFixed(1)}t`}
              label="CO₂ Emissions Avoided"
              sublabel="Calculated organic diversion benchmark"
              variant="neutral"
              icon={<Sparkles className="w-6 h-6 text-emerald-600" />}
            />
          </div>
        </div>
      </section>

      {/* Live Available Food Showcase */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Live Available Surplus</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-text mt-1">
              Fresh Meals Ready for Collection
            </h2>
          </div>
          <Link
            href="/ngo/map"
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
          >
            <span>View all on live map</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-card border border-neutral-border p-5 shadow-card hover:shadow-floating transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      listing.diet === 'veg'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : listing.diet === 'non_veg'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {listing.diet.replace('_', ' ')}
                  </span>
                  <CountdownPill pickupBy={listing.pickup_by} />
                </div>

                <h3 className="font-bold text-neutral-text text-base leading-snug line-clamp-2">
                  {listing.title}
                </h3>
                <p className="text-xs text-neutral-muted mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{listing.hotel_name}</span>
                </p>

                <p className="text-xs text-neutral-muted mt-2.5 line-clamp-2 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-border flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-primary">{listing.portions_listed}</span>
                  <span className="text-xs text-neutral-muted ml-1">portions</span>
                </div>

                <Link
                  href="/ngo/map"
                  onClick={() => switchRole('ngo')}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-soft transition-all"
                >
                  Claim Food
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard Teaser Section */}
      <section className="py-16 bg-white border-y border-neutral-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Public Transparency
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-text mt-1">
                Top Food Rescue Champions
              </h2>
              <p className="text-xs text-neutral-muted mt-1">
                Verified 60-day rolling Rescue Scores computed from NGO receipt receipts.
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <span>Full Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPerformers.map((item, idx) => (
              <div
                key={item.id}
                className="bg-neutral-bg rounded-card border border-neutral-border p-6 shadow-soft flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 text-4xl font-black text-gray-200 select-none">
                  #{idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TierBadge tier={item.tier} size="sm" />
                    <span className="text-xs text-neutral-muted uppercase tracking-wider">
                      {item.venue_type}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-neutral-text">{item.hotel_name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary">{item.composite}</span>
                    <span className="text-xs text-neutral-muted">Rescue Score</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-border/60 flex items-center justify-between text-xs">
                  <span className="text-neutral-muted">
                    <strong className="text-neutral-text">{item.portions_rescued}</strong> meals rescued
                  </span>
                  <Link
                    href={`/hotel/${item.hotel_slug}`}
                    className="font-bold text-primary hover:underline"
                  >
                    View Impact &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Streamlined Protocol
          </span>
          <h2 className="text-3xl font-black text-neutral-text mt-1">
            Built for Kitchen Speed & Accountability
          </h2>
          <p className="text-sm text-neutral-muted mt-2">
            No friction for culinary teams. High transparency for donors and recipient shelters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-primary border border-emerald-200 flex items-center justify-center mb-4 shadow-sm">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-text">1. Hotel Posts in &lt;30s</h3>
            <p className="text-xs text-neutral-muted mt-2 leading-relaxed">
              Kitchen staff enter portions, diet, and packaging notes. Form auto-populates defaults.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-accent border border-amber-200 flex items-center justify-center mb-4 shadow-sm">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-text">2. 1-Tap NGO Claim</h3>
            <p className="text-xs text-neutral-muted mt-2 leading-relaxed">
              Atomic database lock ensures no double claiming. Nearest NGO coordinates pickup driver.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mb-4 shadow-sm">
              <Bike className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-text">3. Live GPS Tracking</h3>
            <p className="text-xs text-neutral-muted mt-2 leading-relaxed">
              Hotel watches collector arrive on real-time map. Geofence checks handoff at kitchen door.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary border border-primary-border flex items-center justify-center mb-4 shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-text">4. Verified Receipt Truth</h3>
            <p className="text-xs text-neutral-muted mt-2 leading-relaxed">
              NGO submits photo and verified portions count. Powers hotel&apos;s public Rescue Score.
            </p>
          </div>
        </div>
      </section>

      {/* News & Impact Stories */}
      <section className="py-16 bg-neutral-bg border-t border-neutral-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Community Voices
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-text mt-1">
                Latest News & Milestones
              </h2>
            </div>
            <Link
              href="/news"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <span>View all stories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-card border border-neutral-border overflow-hidden shadow-card hover:shadow-floating transition-all flex flex-col"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted">
                      {item.source_name || 'FoodRescue News'}
                    </span>
                    <h3 className="font-bold text-neutral-text text-base mt-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-muted mt-2 leading-relaxed line-clamp-3">
                      {item.snippet}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-border text-xs text-primary font-bold">
                    <Link href="/news">Read story &rarr;</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-text text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              FR
            </div>
            <div>
              <p className="font-bold text-sm">FoodRescue Platform</p>
              <p className="text-xs text-gray-400">Zero-Waste Hospitality Redistribution Pilot</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/auth" className="hover:text-white">Partner Sign-Up</Link>
            <Link href="/leaderboard" className="hover:text-white">Public Board</Link>
            <Link href="/hotel/impact" className="hover:text-white">Impact Passport</Link>
            <Link href="/admin" className="hover:text-white">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
