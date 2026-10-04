'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFoodRescue } from '@/lib/store';
import {
  MapPin,
  PlusCircle,
  Trophy,
  Newspaper,
  ShieldCheck,
  Bike,
  UtensilsCrossed
} from 'lucide-react';

export function MobileTabBar() {
  const pathname = usePathname();
  const { currentUser } = useFoodRescue();

  const getMobileTabs = () => {
    switch (currentUser.role) {
      case 'hotel':
        return [
          { href: '/hotel/post', label: 'Post', icon: PlusCircle },
          { href: '/hotel/listings', label: 'Listings', icon: UtensilsCrossed },
          { href: '/hotel/impact', label: 'Impact', icon: Trophy },
          { href: '/news', label: 'News', icon: Newspaper },
        ];
      case 'ngo':
        return [
          { href: '/ngo/map', label: 'Map', icon: MapPin },
          { href: '/ngo/pickups', label: 'Pickups', icon: UtensilsCrossed },
          { href: '/leaderboard', label: 'Board', icon: Trophy },
          { href: '/ngo/volunteers', label: 'Team', icon: Bike },
        ];
      case 'volunteer':
        return [
          { href: '/volunteer/active', label: 'Active', icon: Bike },
          { href: '/ngo/map', label: 'Map', icon: MapPin },
          { href: '/leaderboard', label: 'Board', icon: Trophy },
          { href: '/news', label: 'News', icon: Newspaper },
        ];
      case 'admin':
        return [
          { href: '/admin', label: 'Metrics', icon: ShieldCheck },
          { href: '/admin/approvals', label: 'Approvals', icon: UtensilsCrossed },
          { href: '/admin/flags', label: 'Flags', icon: ShieldCheck },
          { href: '/admin/settings', label: 'Settings', icon: Trophy },
        ];
      case 'public':
      default:
        return [
          { href: '/', label: 'Home', icon: UtensilsCrossed },
          { href: '/ngo/map', label: 'Map', icon: MapPin },
          { href: '/leaderboard', label: 'Board', icon: Trophy },
          { href: '/news', label: 'News', icon: Newspaper },
        ];
    }
  };

  const tabs = getMobileTabs();

  return (
    <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-border shadow-floating pb-safe">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
                isActive ? 'text-primary font-bold' : 'text-neutral-muted hover:text-neutral-text'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
