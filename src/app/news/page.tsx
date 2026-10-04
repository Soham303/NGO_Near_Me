'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFoodRescue } from '@/lib/store';
import {
  Newspaper,
  Sparkles,
  ExternalLink,
  Pin,
  Calendar,
  Building2,
  TrendingUp,
  Bookmark
} from 'lucide-react';

export default function NewsFeedPage() {
  const { news } = useFoodRescue();
  const [filter, setFilter] = useState<'all' | 'internal' | 'external'>('all');

  const filteredNews = news.filter((item) => {
    if (filter === 'all') return true;
    return item.source_type === filter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-primary text-xs font-bold mb-2">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Community Stories & News Ingestion</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-text">
            News, Milestones & Insights
          </h1>
          <p className="text-xs text-neutral-muted mt-1">
            Real stories from partner kitchens, community shelters, and sustainable urban initiatives.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-white border border-neutral-border p-1 rounded-xl shadow-xs self-start sm:self-auto">
          {[
            { key: 'all', label: 'All Stories' },
            { key: 'internal', label: 'Platform Stories' },
            { key: 'external', label: 'External Press' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab.key
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-neutral-muted hover:text-neutral-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="space-y-6">
        {filteredNews.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-card border border-neutral-border overflow-hidden shadow-card hover:shadow-floating transition-all flex flex-col md:flex-row"
          >
            {item.image_url && (
              <div className="md:w-72 h-48 md:h-auto shrink-0 relative overflow-hidden bg-neutral-bg">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.pinned && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-white" />
                    <span>Pinned</span>
                  </span>
                )}
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-[11px] font-bold text-neutral-muted uppercase tracking-wider">
                  <span className="text-primary">{item.source_name || 'FoodRescue News'}</span>
                  <span>•</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-neutral-bg border border-neutral-border">
                    {item.source_type}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-neutral-text leading-snug">
                  {item.title}
                </h2>

                <p className="text-xs text-neutral-muted mt-2.5 leading-relaxed">
                  {item.snippet}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-border/70 flex items-center justify-between text-xs">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Read on original source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="font-bold text-primary">
                    Verified Platform Milestone
                  </span>
                )}
                <span className="text-[11px] text-neutral-muted">Curated by Admin</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
