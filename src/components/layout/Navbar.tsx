'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFoodRescue } from '@/lib/store';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import {
  UtensilsCrossed,
  MapPin,
  PlusCircle,
  Trophy,
  Newspaper,
  ShieldCheck,
  Bike,
  Building2,
  HeartHandshake
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, activeHotel } = useFoodRescue();

  const getNavLinks = () => {
    switch (currentUser.role) {
      case 'hotel':
        return [
          { href: '/hotel/post', label: 'Post Surplus', icon: PlusCircle },
          { href: '/hotel/listings', label: 'My Listings', icon: UtensilsCrossed },
          { href: `/hotel/impact`, label: 'Impact Passport', icon: Trophy },
          { href: `/hotel/${activeHotel.slug}`, label: 'Public View', icon: Building2 },
        ];
      case 'ngo':
        return [
          { href: '/ngo/map', label: 'Find Surplus', icon: MapPin },
          { href: '/ngo/pickups', label: 'Active Pickups', icon: HeartHandshake },
          { href: '/ngo/volunteers', label: 'Volunteers', icon: Bike },
          { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        ];
      case 'volunteer':
        return [
          { href: '/volunteer/active', label: 'Active Pickup', icon: Bike },
          { href: '/ngo/map', label: 'Surplus Map', icon: MapPin },
          { href: '/news', label: 'News Feed', icon: Newspaper },
        ];
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard & Metrics', icon: ShieldCheck },
          { href: '/admin/approvals', label: 'Approvals Queue', icon: Building2 },
          { href: '/admin/flags', label: 'Flagged Reports', icon: UtensilsCrossed },
          { href: '/admin/settings', label: 'Score Engine', icon: Trophy },
        ];
      case 'public':
      default:
        return [
          { href: '/', label: 'Home', icon: UtensilsCrossed },
          { href: '/ngo/map', label: 'Live Map', icon: MapPin },
          { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
          { href: '/news', label: 'News & Stories', icon: Newspaper },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-card group-hover:bg-primary-hover transition-all">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-neutral-text">FoodRescue</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-light text-primary px-1.5 py-0.5 rounded">
                Live
              </span>
            </div>
            <p className="text-[10px] text-neutral-muted hidden sm:block">Zero-Waste Redistribution Platform</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary-light text-primary shadow-xs'
                    : 'text-neutral-text hover:bg-neutral-bg hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification bell */}
          <NotificationCenter />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-border">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full object-cover border border-neutral-border shadow-xs"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-neutral-text truncate max-w-[120px]">
                {currentUser.full_name}
              </p>
              <p className="text-[10px] uppercase font-semibold text-primary">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
