'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Listing, Pickup } from '@/types';

interface LeafletMapInnerProps {
  listings: Listing[];
  activePickup?: Pickup;
  selectedListingId?: string;
  onSelectListing?: (listing: Listing) => void;
  center?: [number, number];
  zoom?: number;
}

export default function LeafletMapInner({
  listings,
  activePickup,
  selectedListingId,
  onSelectListing,
  center = [12.9716, 77.62],
  zoom = 13,
}: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom right to avoid header collision
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Layers on listings / active pickup changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.remove();
      geofenceCircleRef.current = null;
    }

    // Helper to calculate urgency
    const getUrgency = (pickupBy: string) => {
      const diffMs = new Date(pickupBy).getTime() - Date.now();
      const hours = diffMs / (1000 * 60 * 60);
      if (hours >= 2) return 'green';
      if (hours >= 1) return 'amber';
      return 'red';
    };

    // 1. Add Listing Pins
    listings.forEach((listing) => {
      if (!listing.lat || !listing.lng) return;
      if (listing.status !== 'posted') return; // only show open listings

      const urgency = getUrgency(listing.pickup_by);
      const isSelected = listing.id === selectedListingId;

      let bgColor = '#2E7D32';
      let pulseClass = '';
      if (urgency === 'amber') bgColor = '#F9A825';
      if (urgency === 'red') {
        bgColor = '#C62828';
        pulseClass = 'pulse-urgent';
      }

      const iconHtml = `
        <div class="relative cursor-pointer transition-transform transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white ${pulseClass}" style="background-color: ${bgColor};">
            <span style="font-size: 11px;">${listing.portions_listed}</span>
          </div>
          <div class="w-2.5 h-2.5 transform rotate-45 mx-auto -mt-1 shadow-sm" style="background-color: ${bgColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-listing-pin',
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([listing.lat, listing.lng], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <strong style="color: #1F2933; font-size: 14px;">${listing.title}</strong><br/>
          <span style="color: #2E7D32; font-weight: bold;">${listing.portions_listed} portions (${listing.diet})</span><br/>
          <span style="color: #667085;">${listing.hotel_name || 'Hotel'}</span>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectListing) onSelectListing(listing);
      });

      layer.addLayer(marker);
    });

    // 2. Active Pickup Live Tracking Layer
    if (activePickup && activePickup.status === 'on_the_way' && activePickup.current_location) {
      const volLoc = activePickup.current_location;
      const hotelLoc: [number, number] = [12.9756, 77.6067]; // Destination (Grand Palace)

      // Moving Volunteer Marker
      const volIconHtml = `
        <div class="relative cursor-pointer animate-bounce">
          <div class="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-lg">
            🛵
          </div>
          <span class="absolute -top-6 -left-3 bg-white text-neutral-text font-bold text-[10px] px-2 py-0.5 rounded-full shadow border border-neutral-border whitespace-nowrap">
            ETA: ${activePickup.eta_minutes || 5}m
          </span>
        </div>
      `;

      const volIcon = L.divIcon({
        html: volIconHtml,
        className: 'volunteer-live-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const volMarker = L.marker([volLoc.lat, volLoc.lng], { icon: volIcon });
      volMarker.bindPopup(`<strong>Collector: ${activePickup.volunteer_name}</strong><br/>En route to collection.`);
      layer.addLayer(volMarker);

      // Destination Hotel Marker
      const destIconHtml = `
        <div class="w-9 h-9 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center text-white text-sm">
          🏨
        </div>
      `;
      const destIcon = L.divIcon({
        html: destIconHtml,
        className: 'hotel-destination-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const destMarker = L.marker(hotelLoc, { icon: destIcon });
      destMarker.bindPopup('<strong>Collection Point: Grand Palace Hotel</strong>');
      layer.addLayer(destMarker);

      // Geofence Circle (~150m)
      const geofence = L.circle(hotelLoc, {
        radius: 150,
        color: '#2E7D32',
        fillColor: '#E8F5E9',
        fillOpacity: 0.35,
        weight: 1.5,
        dashArray: '4, 4',
      });
      geofence.addTo(map);
      geofenceCircleRef.current = geofence;

      // Dashed Route Polyline
      const routeLine = L.polyline([[volLoc.lat, volLoc.lng], hotelLoc], {
        color: '#2E7D32',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
      });
      routeLine.addTo(map);
      routeLayerRef.current = routeLine;
    }
  }, [listings, activePickup, selectedListingId, onSelectListing]);

  // Recentre Button handler
  const handleRecentre = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[350px] overflow-hidden rounded-xl border border-neutral-border">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />

      {/* Recentre Floating Button */}
      <button
        type="button"
        onClick={handleRecentre}
        className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-card border border-neutral-border text-xs font-bold text-neutral-text hover:bg-neutral-bg flex items-center gap-1.5 transition-all"
      >
        <span>🎯 Recentre</span>
      </button>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-card border border-neutral-border text-[11px] flex flex-wrap items-center gap-3 text-neutral-text">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
          <span>&gt; 2h left</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F9A825]" />
          <span>1–2h left</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C62828] pulse-urgent" />
          <span>&lt; 1h urgent</span>
        </span>
      </div>
    </div>
  );
}
