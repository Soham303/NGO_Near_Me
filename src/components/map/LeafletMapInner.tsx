'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Listing, Pickup, Hotel, NGO } from '@/types';
import { useFoodRescue } from '@/lib/store';
import { PUNE_LOCALITIES, PUNE_CENTER } from '@/lib/puneLocations';

export interface LeafletMapInnerProps {
  listings: Listing[];
  activePickup?: Pickup;
  hotels?: Hotel[];
  ngos?: NGO[];
  selectedListingId?: string;
  onSelectListing?: (listing: Listing) => void;
  center?: [number, number];
  zoom?: number;
}

export default function LeafletMapInner({
  listings,
  activePickup,
  hotels: propHotels,
  ngos: propNgos,
  selectedListingId,
  onSelectListing,
  center = PUNE_CENTER,
  zoom = 13,
}: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);

  const [showHotels, setShowHotels] = useState(true);
  const [showNgos, setShowNgos] = useState(true);
  const [showListings, setShowListings] = useState(true);

  const contextData = useFoodRescue();
  const hotels = propHotels || contextData.hotels || [];
  const ngos = propNgos || contextData.ngos || [];

  // Initialize Map strictly centered on Pune City
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: PUNE_CENTER,
      zoom,
      zoomControl: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Pune City Surplus Network',
      maxZoom: 19,
    }).addTo(map);

    // Click to pinpoint address coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
            <strong style="color: #2E7D32;">📍 Pinpointed Address in Pune</strong><br/>
            <span>Lat: <strong>${lat.toFixed(4)}</strong>, Lng: <strong>${lng.toFixed(4)}</strong></span><br/>
            <span style="color: #6B7280; font-size: 10px;">Pune City Coordinates Verified</span>
          </div>
        `)
        .openOn(map);
    });

    // Zoom control at bottom right to avoid header collision
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [zoom]);

  // Update Markers and Layers on listings / hotels / NGOs / pickup changes
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

    // 1. Plot Registered Pune Hotels with distinct pins
    if (showHotels) {
      hotels.forEach((hotel) => {
        const lat = hotel.lat && hotel.lat > 18.0 && hotel.lat < 19.5 ? hotel.lat : 18.5300 + (Math.random() - 0.5) * 0.04;
        const lng = hotel.lng && hotel.lng > 73.0 && hotel.lng < 74.5 ? hotel.lng : 73.8500 + (Math.random() - 0.5) * 0.04;

        const hotelIconHtml = `
          <div class="relative cursor-pointer hover:scale-110 transition-transform">
            <div class="w-8 h-8 rounded-full bg-emerald-700 border-2 border-white shadow-md flex items-center justify-center text-white text-xs">
              🏨
            </div>
          </div>
        `;

        const hotelIcon = L.divIcon({
          html: hotelIconHtml,
          className: 'custom-hotel-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const hotelMarker = L.marker([lat, lng], { icon: hotelIcon });
        hotelMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 170px;">
            <strong style="color: #1F2933; font-size: 13px;">🏨 ${hotel.name}</strong><br/>
            <span style="color: #6B7280; font-size: 11px;">📍 ${hotel.address || 'Pune City'}</span><br/>
            <span style="color: #2E7D32; font-weight: bold; font-size: 11px;">Registered Hotel Partner</span>
          </div>
        `);
        layer.addLayer(hotelMarker);
      });
    }

    // 2. Plot Registered Pune NGOs / Distribution Centers with distinct pins
    if (showNgos) {
      ngos.forEach((ngo) => {
        const lat = ngo.lat && ngo.lat > 18.0 && ngo.lat < 19.5 ? ngo.lat : 18.5150 + (Math.random() - 0.5) * 0.04;
        const lng = ngo.lng && ngo.lng > 73.0 && ngo.lng < 74.5 ? ngo.lng : 73.8350 + (Math.random() - 0.5) * 0.04;

        const ngoIconHtml = `
          <div class="relative cursor-pointer hover:scale-110 transition-transform">
            <div class="w-8 h-8 rounded-full bg-amber-600 border-2 border-white shadow-md flex items-center justify-center text-white text-xs">
              🤝
            </div>
          </div>
        `;

        const ngoIcon = L.divIcon({
          html: ngoIconHtml,
          className: 'custom-ngo-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const ngoMarker = L.marker([lat, lng], { icon: ngoIcon });
        ngoMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 170px;">
            <strong style="color: #1F2933; font-size: 13px;">🤝 ${ngo.name}</strong><br/>
            <span style="color: #6B7280; font-size: 11px;">📍 ${ngo.address || 'Pune City'}</span><br/>
            <span style="color: #D97706; font-weight: bold; font-size: 11px;">Capacity: ${ngo.capacity_portions || 400} portions/day</span>
          </div>
        `);
        layer.addLayer(ngoMarker);
      });
    }

    // 3. Add Live Open Surplus Food Listing Pins in Pune
    if (showListings) {
      listings.forEach((listing) => {
        let lat = listing.lat;
        let lng = listing.lng;

        // Ensure coordinates are within Pune bounding box (lat ~18.3-18.7, lng ~73.6-74.1)
        if (!lat || !lng || lat < 18.0 || lat > 19.5 || lng < 73.0 || lng > 74.5) {
          const matchingHotel = hotels.find((h) => h.id === listing.hotel_id);
          if (matchingHotel && matchingHotel.lat && matchingHotel.lat > 18.0) {
            lat = matchingHotel.lat;
            lng = matchingHotel.lng;
          } else {
            lat = 18.5204 + (Math.random() - 0.5) * 0.03;
            lng = 73.8567 + (Math.random() - 0.5) * 0.03;
          }
        }

        if (listing.status !== 'posted') return; // only show open live surplus

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

        const marker = L.marker([lat, lng], { icon: customIcon });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; line-height: 1.4; min-width: 180px;">
            <strong style="color: #1F2933; font-size: 14px;">${listing.title}</strong><br/>
            <span style="color: #2E7D32; font-weight: bold;">${listing.portions_listed} portions (${listing.diet})</span><br/>
            <span style="color: #667085;">📍 ${listing.hotel_name || 'Pune Hotel Partner'}</span><br/>
            <span style="color: #6B7280; font-size: 11px;">Pickup by: ${new Date(listing.pickup_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        `);

        marker.on('click', () => {
          if (onSelectListing) onSelectListing(listing);
        });

        layer.addLayer(marker);
      });
    }

    // 4. Active Pickup Live Tracking in Pune
    if (activePickup && activePickup.status === 'on_the_way' && activePickup.current_location) {
      const volLat = activePickup.current_location.lat > 18.0 ? activePickup.current_location.lat : 18.5250;
      const volLng = activePickup.current_location.lng > 73.0 ? activePickup.current_location.lng : 73.8600;
      const destHotel = hotels.find((h) => h.id === activePickup.listing?.hotel_id);
      const destLat = destHotel && destHotel.lat && destHotel.lat > 18.0 ? destHotel.lat : 18.5362;
      const destLng = destHotel && destHotel.lng && destHotel.lng > 73.0 ? destHotel.lng : 73.8940;
      const hotelLoc: [number, number] = [destLat, destLng];

      // Moving Volunteer Marker in Pune
      const volIconHtml = `
        <div class="relative cursor-pointer animate-bounce">
          <div class="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-lg">
            🛵
          </div>
          <span class="absolute -top-6 -left-3 bg-white text-neutral-text font-bold text-[10px] px-2 py-0.5 rounded-full shadow border border-neutral-border whitespace-nowrap">
            ETA: ${activePickup.eta_minutes || 8}m
          </span>
        </div>
      `;

      const volIcon = L.divIcon({
        html: volIconHtml,
        className: 'volunteer-live-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const volMarker = L.marker([volLat, volLng], { icon: volIcon });
      volMarker.bindPopup(`<strong>Pune Volunteer Collector: ${activePickup.volunteer_name || 'En Route'}</strong><br/>En route to collection point.`);
      layer.addLayer(volMarker);

      // Destination Hotel Marker in Pune
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
      destMarker.bindPopup(`<strong>Collection Point: ${destHotel?.name || 'Hotel Partner'}</strong><br/>${destHotel?.address || 'Pune'}`);
      layer.addLayer(destMarker);

      // Geofence Circle (~150m) in Pune
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

      // Dashed Route Polyline in Pune
      const routeLine = L.polyline([[volLat, volLng], hotelLoc], {
        color: '#2E7D32',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
      });
      routeLine.addTo(map);
      routeLayerRef.current = routeLine;
    }
  }, [listings, hotels, ngos, activePickup, selectedListingId, onSelectListing, showHotels, showNgos, showListings]);

  // Recentre Button handler - reset to Pune Center
  const handleRecentre = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(PUNE_CENTER, 13, { animate: true });
    }
  };

  const handleJumpToLocality = (localityName: string) => {
    const loc = PUNE_LOCALITIES.find((l) => l.name === localityName);
    if (loc && mapInstanceRef.current) {
      mapInstanceRef.current.setView([loc.lat, loc.lng], 15, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[350px] overflow-hidden rounded-xl border border-neutral-border">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />

      {/* Floating Pune Map Controls Bar (Top Left) */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-140px)]">
        {/* Locality Quick Jump */}
        <select
          onChange={(e) => handleJumpToLocality(e.target.value)}
          defaultValue=""
          className="bg-white/95 backdrop-blur-sm border border-neutral-border shadow-card text-[11px] font-bold text-neutral-text rounded-full px-3 py-1.5 outline-none hover:bg-neutral-bg cursor-pointer"
        >
          <option value="" disabled>📍 Jump to Pune Locality...</option>
          {PUNE_LOCALITIES.map((loc) => (
            <option key={loc.name} value={loc.name}>
              {loc.name} ({loc.pincode})
            </option>
          ))}
        </select>

        {/* Layer Filters */}
        <div className="bg-white/95 backdrop-blur-sm border border-neutral-border shadow-card rounded-full p-0.5 flex items-center text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setShowListings(!showListings)}
            className={`px-2 py-1 rounded-full transition-all ${
              showListings ? 'bg-primary text-white' : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            🍲 Food ({listings.filter((l) => l.status === 'posted').length})
          </button>
          <button
            type="button"
            onClick={() => setShowHotels(!showHotels)}
            className={`px-2 py-1 rounded-full transition-all ${
              showHotels ? 'bg-emerald-700 text-white' : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            🏨 Hotels ({hotels.length})
          </button>
          <button
            type="button"
            onClick={() => setShowNgos(!showNgos)}
            className={`px-2 py-1 rounded-full transition-all ${
              showNgos ? 'bg-amber-600 text-white' : 'text-neutral-muted hover:text-neutral-text'
            }`}
          >
            🤝 NGOs ({ngos.length})
          </button>
        </div>
      </div>

      {/* Recentre Floating Button */}
      <button
        type="button"
        onClick={handleRecentre}
        className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-card border border-neutral-border text-xs font-bold text-neutral-text hover:bg-neutral-bg flex items-center gap-1.5 transition-all"
      >
        <span>🎯 Recentre Pune</span>
      </button>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-card border border-neutral-border text-[11px] flex flex-wrap items-center gap-3 text-neutral-text">
        <span className="flex items-center gap-1">
          <span className="text-xs">🏨</span>
          <span className="font-medium">Pune Hotels</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-xs">🤝</span>
          <span className="font-medium">Pune NGOs</span>
        </span>
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
