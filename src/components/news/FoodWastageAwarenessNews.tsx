'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Sparkles,
  ExternalLink,
  Flame,
  Globe2,
  TrendingDown,
  Clock,
  ArrowRight,
  Share2,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  snippet: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
  category: string;
}

export function FoodWastageAwarenessNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        setLastUpdated(new Date(data.updatedAt || Date.now()).toLocaleTimeString());
      }
    } catch (err) {
      console.warn('Failed to fetch real-time news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Food Waste Awareness - FoodRescue Network',
        text: 'Join the fight against food wastage. Over 1 billion meals are wasted daily worldwide while communities face hunger.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const filtered = articles.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <section className="py-16 bg-gradient-to-b from-white via-neutral-bg to-white border-b border-neutral-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>Real-Time Awareness</span>
              <span className="text-rose-300">•</span>
              <span className="text-rose-900 font-medium">Live Feed</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-text tracking-tight">
              Food Wastage & Global Crisis Radar
            </h2>
            <p className="text-xs sm:text-sm text-neutral-muted mt-2 max-w-2xl leading-relaxed">
              Stay informed with real-time news on food surplus recovery, FSSAI regulatory compliance,
              and global zero-waste benchmarks to amplify public consciousness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchNews}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white border border-neutral-border text-neutral-text text-xs font-bold hover:bg-neutral-bg flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
              title="Refresh live news"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Feed'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-soft hover:bg-primary-hover flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Spread Awareness'}</span>
            </button>
          </div>
        </div>

        {/* Impact Awareness Infographic Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-800">India Annual Waste</p>
              <p className="text-xl font-black text-rose-950 mt-0.5">68.7M Tonnes</p>
              <p className="text-[11px] text-rose-700/80 mt-1 leading-snug">~40% of all food produced is lost before consumption.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-primary shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Carbon Avoidance</p>
              <p className="text-xl font-black text-emerald-950 mt-0.5">2.5 kg CO₂</p>
              <p className="text-[11px] text-emerald-700/80 mt-1 leading-snug">Saved from landfills per 1 cooked meal rescued.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Global Undernutrition</p>
              <p className="text-xl font-black text-amber-950 mt-0.5">783 Million</p>
              <p className="text-[11px] text-amber-700/80 mt-1 leading-snug">People lack reliable daily calories worldwide.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-800 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Redistribution SLA</p>
              <p className="text-xl font-black text-blue-950 mt-0.5">&lt; 30 Minutes</p>
              <p className="text-[11px] text-blue-700/80 mt-1 leading-snug">Average collection dispatch time in Pune city.</p>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[
            { key: 'all', label: 'All Live Stories' },
            { key: 'global', label: 'Global Crisis & UN Reports' },
            { key: 'policy', label: 'FSSAI & Government Policy' },
            { key: 'urban', label: 'Urban & Pune City Solutions' },
            { key: 'technology', label: 'Cold-Chain & Logistics' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat.key
                  ? 'bg-neutral-text text-white shadow-xs'
                  : 'bg-white border border-neutral-border text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* News Cards Grid */}
        {loading && articles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-card border border-neutral-border p-6 animate-pulse space-y-4">
                <div className="h-40 bg-neutral-bg rounded-lg" />
                <div className="h-4 bg-neutral-bg rounded w-3/4" />
                <div className="h-3 bg-neutral-bg rounded w-full" />
                <div className="h-3 bg-neutral-bg rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(0, 6).map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-card border border-neutral-border overflow-hidden shadow-card hover:shadow-floating transition-all flex flex-col justify-between group"
              >
                <div>
                  {item.imageUrl && (
                    <div className="h-48 w-full overflow-hidden relative bg-neutral-bg">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs text-neutral-text">
                        {item.category}
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2 text-[11px] font-bold text-neutral-muted uppercase tracking-wider">
                      <span className="text-primary truncate max-w-[140px]">{item.source}</span>
                      <span>•</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-base text-neutral-text leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-neutral-muted mt-2 line-clamp-3 leading-relaxed">
                      {item.snippet}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-neutral-border/70 flex items-center justify-between">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read Full Report</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <span className="text-[10px] font-semibold text-neutral-muted">
                      Live Telemetry
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Footer CTA to Full News */}
        <div className="mt-10 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-neutral-border hover:bg-neutral-bg text-neutral-text text-xs font-bold shadow-soft transition-all"
          >
            <Newspaper className="w-4 h-4 text-primary" />
            <span>Explore All News, Local Dispatches & Stories</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </div>
    </section>
  );
}
