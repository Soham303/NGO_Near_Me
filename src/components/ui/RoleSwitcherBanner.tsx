'use client';

import React from 'react';
import { useFoodRescue } from '@/lib/store';
import { UserRole } from '@/types';
import { Building2, HeartHandshake, Bike, Users, ShieldAlert, Sparkles } from 'lucide-react';

export function RoleSwitcherBanner() {
  const { currentUser, switchRole, isSimulatingTrip, toggleTripSimulation } = useFoodRescue();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'hotel',
      label: 'Hotel / Donor',
      icon: <Building2 className="w-3.5 h-3.5" />,
      desc: 'Post surplus <30s, live ETA map, impact passport',
    },
    {
      role: 'ngo',
      label: 'NGO Coordinator',
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      desc: 'Map discovery, 1-tap claim, assign collector',
    },
    {
      role: 'volunteer',
      label: 'Volunteer Collector',
      icon: <Bike className="w-3.5 h-3.5" />,
      desc: 'Live trip GPS, geofenced handoff, report',
    },
    {
      role: 'public',
      label: 'Public Supporter',
      icon: <Users className="w-3.5 h-3.5" />,
      desc: 'City counter, leaderboard, follow & kudos',
    },
    {
      role: 'admin',
      label: 'Platform Admin',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      desc: 'Approvals queue, auto-flags, score settings',
    },
  ];

  return (
    <aside aria-label="Demo Role Switcher" className="bg-neutral-text text-white text-xs px-4 py-2 border-b border-gray-700 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Interactive Demo Mode</span>
          </span>
          <span className="text-gray-300 hidden sm:inline">
            Active Persona: <strong className="text-white">{currentUser.full_name}</strong> ({currentUser.role.toUpperCase()})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-gray-400 text-[11px] mr-1">Switch View:</span>
          {roles.map((r) => {
            const isActive = currentUser.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                title={r.desc}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm ring-1 ring-white/30 font-bold'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}

          <button
            onClick={toggleTripSimulation}
            title="Toggle simulated GPS route updates"
            className={`ml-2 px-2 py-1 rounded-md text-[11px] font-semibold border ${
              isSimulatingTrip
                ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300'
                : 'bg-gray-800 border-gray-600 text-gray-400'
            }`}
          >
            {isSimulatingTrip ? '● GPS Sim: Active' : '○ GPS Sim: Paused'}
          </button>
        </div>
      </div>
    </aside>
  );
}
