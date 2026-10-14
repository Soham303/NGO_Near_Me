'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Profile,
  Hotel,
  NGO,
  Volunteer,
  Listing,
  Pickup,
  Flag,
  ScoreSnapshot,
  NewsItem,
  PlatformSettings,
  AppNotification,
  UserRole,
  Certificate,
  Tag,
  FlagStatus
} from '@/types';
import {
  SEED_PROFILES,
  SEED_HOTELS,
  SEED_NGOS,
  SEED_VOLUNTEERS,
  SEED_LISTINGS,
  SEED_PICKUPS,
  SEED_FLAGS,
  SEED_SCORE_SNAPSHOTS,
  SEED_NEWS,
  SEED_SETTINGS,
  SEED_CERTIFICATES,
  SEED_TAGS
} from './seedData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  authService,
  listingsService,
  pickupsService,
  masterDataService,
} from '@/lib/services/api';

interface FoodRescueContextType {
  // Session & Authentication
  currentUser: Profile;
  setCurrentUser: (user: Profile) => void;
  switchRole: (role: UserRole) => void;
  activeHotel: Hotel;
  activeNGO: NGO;
  activeVolunteer: Volunteer;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isLoadingAuth: boolean;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Data collections
  profiles: Profile[];
  hotels: Hotel[];
  ngos: NGO[];
  volunteers: Volunteer[];
  listings: Listing[];
  pickups: Pickup[];
  flags: Flag[];
  scores: ScoreSnapshot[];
  news: NewsItem[];
  settings: PlatformSettings;
  certificates: Certificate[];
  tags: Tag[];
  notifications: AppNotification[];
  follows: { userId: string; hotelId: string }[];
  kudos: { userId: string; hotelId: string; date: string }[];

  // Core Actions
  postListing: (listingData: Omit<Listing, 'id' | 'created_at' | 'status'>) => Promise<Listing>;
  cancelListing: (listingId: string) => Promise<boolean>;
  claimListing: (listingId: string, ngoId: string, volunteerId?: string) => Promise<{ success: boolean; pickupId?: string; error?: string }>;
  releaseClaim: (pickupId: string) => Promise<boolean>;
  assignVolunteer: (pickupId: string, volunteerId: string) => Promise<void>;
  startTrip: (pickupId: string) => Promise<void>;
  recordPickupHandoff: (pickupId: string, inGeofence: boolean) => Promise<void>;
  submitCompletionReport: (pickupId: string, data: { portionsReceived: number; leftBehind: number; photoUrl: string; tags: string[] }) => Promise<void>;
  
  // Public actions
  toggleFollowHotel: (hotelId: string) => void;
  sendKudos: (hotelId: string) => { success: boolean; message: string };
  
  // Admin actions
  updateOrgStatus: (orgType: 'hotel' | 'ngo', orgId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) => void;
  resolveFlag: (flagId: string, action: 'keep' | 'correct' | 'voided', reason: string, correctedPortions?: number) => void;
  updateSettings: (newSettings: PlatformSettings) => void;
  addNewsItem: (item: Omit<NewsItem, 'id' | 'created_at'>) => void;
  togglePinNews: (newsId: string) => void;
  recomputeScores: () => void;

  // Notification management
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Tracking Simulation
  isSimulatingTrip: boolean;
  toggleTripSimulation: () => void;
}

const FoodRescueContext = createContext<FoodRescueContextType | undefined>(undefined);

const STORAGE_KEY = 'foodrescue_state_v2';

export const DEFAULT_PUBLIC_PROFILE: Profile = {
  id: 'guest-public',
  role: 'public',
  full_name: 'Public Supporter',
  email: 'guest@foodrescue.org',
  phone: '',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString(),
};

export function computeRealtimeScores(
  hotels: Hotel[],
  listings: Listing[],
  pickups: Pickup[]
): ScoreSnapshot[] {
  const computed = hotels.map((h, idx) => {
    const hotelListings = listings.filter((l) => l.hotel_id === h.id);
    const hotelPickups = pickups.filter(
      (p) =>
        (p.listing?.hotel_id === h.id || hotelListings.some((l) => l.id === p.listing_id)) &&
        p.status === 'completed' &&
        !p.voided
    );

    const portionsRescued = hotelPickups.reduce(
      (acc, p) => acc + (p.portions_received || p.listing?.portions_listed || 0),
      0
    );
    const portionsListed = hotelListings.reduce((acc, l) => acc + (l.portions_listed || 0), 0);
    const rescueRate = portionsListed > 0 ? Math.min(100, Math.round((portionsRescued / portionsListed) * 100)) : 100;
    const completedCount = hotelPickups.length;

    // Base score starts around 78 for verified partners, progressing with real donation volume
    const baseScore = 78.0;
    const pickupBonus = Math.min(12.0, completedCount * 2.5);
    const volumeBonus = Math.min(9.5, portionsRescued / 20.0);
    const composite = Number(Math.min(99.5, baseScore + pickupBonus + volumeBonus).toFixed(1));

    let tier: 'seed' | 'sprout' | 'canopy' | 'forest' = 'seed';
    if (composite >= 90) tier = 'forest';
    else if (composite >= 80) tier = 'canopy';
    else if (composite >= 60) tier = 'sprout';

    return {
      id: `score-${h.id}`,
      hotel_id: h.id,
      hotel_name: h.name,
      hotel_slug: h.slug || `hotel-${h.id.substring(0, 6)}`,
      venue_type: h.venue_type,
      period_start: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
      period_end: new Date().toISOString(),
      completed_pickups: completedCount,
      portions_rescued: portionsRescued,
      rescue_rate: rescueRate,
      participation: Math.min(100, 80 + completedCount * 3),
      listing_accuracy: 96,
      handoff_quality: 95,
      left_behind: 0,
      composite,
      tier,
      rank_in_category: idx + 1,
      eligible: true,
      streak_weeks: Math.max(1, Math.floor(completedCount / 2) + 1),
      created_at: h.created_at || new Date().toISOString(),
    };
  });

  return computed
    .sort((a, b) => b.portions_rescued - a.portions_rescued || b.composite - a.composite)
    .map((s, i) => ({
      ...s,
      rank_in_category: i + 1,
    }));
}

export function FoodRescueProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = useMemo(() => isSupabaseConfigured(), []);

  // Auth & Session state - restore cached user synchronously to prevent profile switching glitches
  const [currentUser, setCurrentUser] = useState<Profile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('foodrescue_active_user');
        if (cached) return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return DEFAULT_PUBLIC_PROFILE;
  });
  const [activeHotelOverride, setActiveHotelOverride] = useState<Hotel | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('foodrescue_active_hotel');
        if (cached) return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return null;
  });
  const [activeNGOOverride, setActiveNGOOverride] = useState<NGO | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('foodrescue_active_ngo');
        if (cached) return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return null;
  });
  const [activeVolunteerOverride, setActiveVolunteerOverride] = useState<Volunteer | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('foodrescue_active_volunteer');
        if (cached) return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Data collections
  const [profiles, setProfiles] = useState<Profile[]>(SEED_PROFILES);
  const [hotels, setHotels] = useState<Hotel[]>(SEED_HOTELS);
  const [ngos, setNgos] = useState<NGO[]>(SEED_NGOS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(SEED_VOLUNTEERS);
  const [listings, setListings] = useState<Listing[]>(SEED_LISTINGS);
  const [pickups, setPickups] = useState<Pickup[]>(SEED_PICKUPS);
  const [flags, setFlags] = useState<Flag[]>(SEED_FLAGS);
  const [scores, setScores] = useState<ScoreSnapshot[]>(SEED_SCORE_SNAPSHOTS);
  const [news, setNews] = useState<NewsItem[]>(SEED_NEWS);
  const [settings, setSettings] = useState<PlatformSettings>(SEED_SETTINGS);
  const [certificates, setCertificates] = useState<Certificate[]>(SEED_CERTIFICATES);
  const [tags] = useState<Tag[]>(SEED_TAGS);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      user_id: 'user-hotel-1',
      title: 'Volunteer On The Way',
      message: 'Arun Kumar from Robin Hood Community Kitchen is en route to collect your listing.',
      type: 'pickup',
      read: false,
      created_at: new Date().toISOString(),
    }
  ]);
  const [follows, setFollows] = useState<{ userId: string; hotelId: string }[]>([
    { userId: 'user-public-1', hotelId: 'hotel-1' }
  ]);
  const [kudos, setKudos] = useState<{ userId: string; hotelId: string; date: string }[]>([]);
  const [isSimulatingTrip, setIsSimulatingTrip] = useState(true);

  // Determine active entities cleanly without leaking other profiles
  const activeHotel = useMemo(() => {
    if (activeHotelOverride) return activeHotelOverride;
    const owned = hotels.find((h) => h.owner_id === currentUser.id);
    if (owned) return owned;
    if (currentUser.role === 'hotel') {
      return {
        id: 'hotel-' + currentUser.id,
        owner_id: currentUser.id,
        name: currentUser.full_name ? `${currentUser.full_name}'s Kitchen` : 'Registered Kitchen Partner',
        slug: 'hotel-' + currentUser.id.substring(0, 6),
        venue_type: 'hotel' as const,
        address: 'Pune, Maharashtra',
        lat: 18.5204,
        lng: 73.8567,
        rooms: 50,
        seats: 100,
        banquet_capacity: 300,
        events_per_month: 4,
        operating_days_per_week: 7,
        status: 'approved' as const,
        public_listing: true,
        created_at: new Date().toISOString(),
      };
    }
    return hotels[0] || SEED_HOTELS[0];
  }, [activeHotelOverride, hotels, currentUser]);

  const activeNGO = useMemo(() => {
    if (activeNGOOverride) return activeNGOOverride;
    const owned = ngos.find((n) => n.owner_id === currentUser.id);
    if (owned) return owned;
    if (currentUser.role === 'ngo') {
      return {
        id: 'ngo-' + currentUser.id,
        owner_id: currentUser.id,
        name: currentUser.full_name ? `${currentUser.full_name}'s NGO` : 'Community Food Bank Pune',
        registration_no: 'NGO-PUN-' + currentUser.id.substring(0, 4).toUpperCase(),
        address: 'Pune, Maharashtra',
        lat: 18.5204,
        lng: 73.8567,
        capacity_portions: 400,
        service_radius_km: 15,
        trust_score: 1.0,
        status: 'approved' as const,
        created_at: new Date().toISOString(),
      };
    }
    return ngos[0] || SEED_NGOS[0];
  }, [activeNGOOverride, ngos, currentUser]);

  const activeVolunteer = useMemo(() => {
    if (activeVolunteerOverride) return activeVolunteerOverride;
    const owned = volunteers.find((v) => v.profile_id === currentUser.id);
    if (owned) return owned;
    if (currentUser.role === 'volunteer') {
      return {
        id: 'vol-' + currentUser.id,
        profile_id: currentUser.id,
        ngo_id: activeNGO.id || 'ngo-1',
        name: currentUser.full_name,
        phone: currentUser.phone || '',
        vehicle: 'Two-wheeler with Thermal Box',
        active: true,
      };
    }
    return volunteers[0] || SEED_VOLUNTEERS[0];
  }, [activeVolunteerOverride, volunteers, currentUser]);

  // Notification helper
  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'created_at' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now() + Math.random().toString(36).substring(2, 6),
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // Fetch all backend data from Supabase
  const refreshData = useCallback(async () => {
    if (!isConfigured) return;

    try {
      const [fetchedProfiles, fetchedListings, fetchedPickups, fetchedHotels, fetchedNGOs, fetchedVols, fetchedScores, fetchedNews, fetchedFlags] = await Promise.all([
        masterDataService.fetchProfiles(),
        listingsService.fetchListings(),
        pickupsService.fetchPickups(),
        masterDataService.fetchHotels(),
        masterDataService.fetchNGOs(),
        masterDataService.fetchVolunteers(),
        masterDataService.fetchScores(),
        masterDataService.fetchNews(),
        masterDataService.fetchFlags(),
      ]);

      if (fetchedProfiles.length > 0) setProfiles(fetchedProfiles);
      if (fetchedListings.length > 0) setListings(fetchedListings);
      if (fetchedPickups.length > 0) setPickups(fetchedPickups);
      if (fetchedHotels.length > 0) setHotels(fetchedHotels);
      if (fetchedNGOs.length > 0) setNgos(fetchedNGOs);
      if (fetchedVols.length > 0) setVolunteers(fetchedVols);
      if (fetchedScores.length > 0) {
        setScores(fetchedScores);
      } else if (fetchedHotels.length > 0) {
        setScores(computeRealtimeScores(fetchedHotels, fetchedListings, fetchedPickups));
      }
      if (fetchedNews.length > 0) setNews(fetchedNews);
      if (fetchedFlags.length > 0) setFlags(fetchedFlags);
    } catch (err) {
      console.warn('Backend tables query fallback:', err);
    }
  }, [isConfigured]);

  // Auth Session Initialization
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isConfigured) {
        setIsLoadingAuth(false);
        return;
      }

      try {
        const session = await authService.getCurrentSession();
        if (session?.user && isMounted) {
          setIsAuthenticated(true);
          const userData = await authService.getCurrentUserProfile(session.user.id);
          if (userData.profile && isMounted) {
            setCurrentUser(userData.profile);
            if (typeof window !== 'undefined') {
              localStorage.setItem('foodrescue_active_user', JSON.stringify(userData.profile));
            }
            if (userData.hotel) {
              setActiveHotelOverride(userData.hotel);
              if (typeof window !== 'undefined') localStorage.setItem('foodrescue_active_hotel', JSON.stringify(userData.hotel));
            }
            if (userData.ngo) {
              setActiveNGOOverride(userData.ngo);
              if (typeof window !== 'undefined') localStorage.setItem('foodrescue_active_ngo', JSON.stringify(userData.ngo));
            }
            if (userData.volunteer) {
              setActiveVolunteerOverride(userData.volunteer);
              if (typeof window !== 'undefined') localStorage.setItem('foodrescue_active_volunteer', JSON.stringify(userData.volunteer));
            }
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }

      // Supabase Auth listener
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session?.user) {
          setIsAuthenticated(true);
          const userData = await authService.getCurrentUserProfile(session.user.id);
          if (userData.profile) {
            setCurrentUser(userData.profile);
            if (typeof window !== 'undefined') {
              localStorage.setItem('foodrescue_active_user', JSON.stringify(userData.profile));
            }
            if (userData.hotel) {
              setActiveHotelOverride(userData.hotel);
              if (typeof window !== 'undefined') localStorage.setItem('foodrescue_active_hotel', JSON.stringify(userData.hotel));
            }
            if (userData.ngo) {
              setActiveNGOOverride(userData.ngo);
              if (typeof window !== 'undefined') localStorage.setItem('foodrescue_active_ngo', JSON.stringify(userData.ngo));
            }
            if (userData.volunteer) {
              setActiveVolunteerOverride(userData.volunteer);
              if (typeof window !== 'undefined') localStorage.setItem('foodrescue_active_volunteer', JSON.stringify(userData.volunteer));
            }
          }
          await refreshData();
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setActiveHotelOverride(null);
          setActiveNGOOverride(null);
          setActiveVolunteerOverride(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('foodrescue_active_user');
            localStorage.removeItem('foodrescue_active_hotel');
            localStorage.removeItem('foodrescue_active_ngo');
            localStorage.removeItem('foodrescue_active_volunteer');
          }
          setCurrentUser(DEFAULT_PUBLIC_PROFILE);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }

    initAuth();
    refreshData();

    return () => {
      isMounted = false;
    };
  }, [isConfigured, refreshData]);

  // Setup Supabase Realtime Channels for Live Cross-Client Sync
  useEffect(() => {
    if (!isConfigured) return;

    const channel = supabase
      .channel('foodrescue-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listings' },
        () => {
          listingsService.fetchListings().then((data) => {
            if (data.length > 0) setListings(data);
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pickups' },
        () => {
          pickupsService.fetchPickups().then((data) => {
            if (data.length > 0) setPickups(data);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConfigured]);

  // Local Storage fallback backup
  useEffect(() => {
    if (!isConfigured) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.listings) setListings(parsed.listings);
          if (parsed.pickups) setPickups(parsed.pickups);
          if (parsed.flags) setFlags(parsed.flags);
          if (parsed.hotels) setHotels(parsed.hotels);
          if (parsed.ngos) setNgos(parsed.ngos);
          if (parsed.scores) setScores(parsed.scores);
          if (parsed.follows) setFollows(parsed.follows);
          if (parsed.kudos) setKudos(parsed.kudos);
        }
      } catch {
        // ignore
      }
    }
  }, [isConfigured]);

  // Save to local storage when not using live backend
  useEffect(() => {
    if (!isConfigured) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ listings, pickups, flags, hotels, ngos, scores, follows, kudos })
        );
      } catch {
        // ignore
      }
    }
  }, [isConfigured, listings, pickups, flags, hotels, ngos, scores, follows, kudos]);

  // Role switcher helper (for preview & demo persona switching)
  const switchRole = useCallback((role: UserRole) => {
    if (isAuthenticated) {
      addNotification({
        user_id: currentUser.id,
        title: 'Active Session Locked',
        message: `You are signed in as ${currentUser.full_name} (${currentUser.role}). Please sign out if you want to test another account.`,
        type: 'approval',
      });
      return;
    }
    const match = profiles.find((p) => p.role === role);
    if (match) {
      setCurrentUser(match);
      addNotification({
        user_id: match.id,
        title: `Switched View: ${role.toUpperCase()}`,
        message: `Previewing view as ${match.full_name}`,
        type: 'approval',
      });
    }
  }, [isAuthenticated, currentUser, profiles, addNotification]);

  // Sign out helper
  const signOut = useCallback(async () => {
    if (isConfigured) {
      await authService.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foodrescue_active_user');
      localStorage.removeItem('foodrescue_active_hotel');
      localStorage.removeItem('foodrescue_active_ngo');
      localStorage.removeItem('foodrescue_active_volunteer');
    }
    setIsAuthenticated(false);
    setActiveHotelOverride(null);
    setActiveNGOOverride(null);
    setActiveVolunteerOverride(null);
    setCurrentUser(DEFAULT_PUBLIC_PROFILE);
  }, [isConfigured]);

  // Real-time volunteer movement simulator (for testing active trip GPS)
  useEffect(() => {
    if (!isSimulatingTrip) return;
    const interval = setInterval(() => {
      setPickups((prev) => {
        let changed = false;
        const updated = prev.map((pickup) => {
          if (pickup.status === 'on_the_way' && pickup.current_location) {
            changed = true;
            const targetLat = 18.5362;
            const targetLng = 73.8940;
            const curLat = pickup.current_location.lat;
            const curLng = pickup.current_location.lng;

            const dLat = (targetLat - curLat) * 0.12;
            const dLng = (targetLng - curLng) * 0.12;
            const newLat = curLat + dLat;
            const newLng = curLng + dLng;

            const distKm = Math.sqrt(Math.pow((targetLat - newLat) * 111, 2) + Math.pow((targetLng - newLng) * 111, 2));
            const newEta = Math.max(1, Math.round(distKm * 3.5));

            return {
              ...pickup,
              current_location: {
                lat: Number(newLat.toFixed(5)),
                lng: Number(newLng.toFixed(5)),
                accuracy_m: 6.5,
                updated_at: new Date().toISOString(),
              },
              eta_minutes: newEta,
            };
          }
          return pickup;
        });
        return changed ? updated : prev;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulatingTrip]);

  // Hotel post surplus action
  const postListing = useCallback(async (listingData: Omit<Listing, 'id' | 'created_at' | 'status'>): Promise<Listing> => {
    if (isConfigured) {
      try {
        const created = await listingsService.createListing(listingData);
        setListings((prev) => [created, ...prev]);
        addNotification({
          user_id: activeHotel.owner_id,
          title: '🚨 Surplus Food Posted Live!',
          message: `Your listing for ${listingData.portions_listed} portions of ${listingData.diet} food is live for verified NGOs.`,
          type: 'listing',
        });
        return created;
      } catch (err) {
        console.warn('Backend create listing error, falling back locally:', err);
      }
    }

    const newId = 'listing-' + Date.now();
    const newListing: Listing = {
      ...listingData,
      id: newId,
      status: 'posted',
      created_at: new Date().toISOString(),
      lat: (listingData as any).lat || activeHotel.lat,
      lng: (listingData as any).lng || activeHotel.lng,
      hotel_name: activeHotel.name,
      hotel_address: (listingData as any).hotel_address || activeHotel.address,
    };

    setListings((prev) => [newListing, ...prev]);

    addNotification({
      user_id: 'user-ngo-1',
      title: '🚨 New Surplus Food Available Nearby!',
      message: `${activeHotel.name} just posted ${listingData.portions_listed} portions of ${listingData.diet} food.`,
      type: 'listing',
    });

    return newListing;
  }, [isConfigured, activeHotel, addNotification]);

  // Cancel listing
  const cancelListing = useCallback(async (listingId: string): Promise<boolean> => {
    if (isConfigured) {
      await listingsService.cancelListing(listingId);
    }

    let success = false;
    setListings((prev) =>
      prev.map((l) => {
        if (l.id === listingId && l.status === 'posted') {
          success = true;
          return { ...l, status: 'cancelled' };
        }
        return l;
      })
    );
    return success;
  }, [isConfigured]);

  // Atomic Claim procedure
  const claimListing = useCallback(async (listingId: string, ngoId: string, volunteerId?: string) => {
    if (isConfigured) {
      try {
        const res = await pickupsService.claimListing(listingId, ngoId, volunteerId);
        if (res.success) {
          await refreshData();
          return res;
        }
      } catch (err) {
        console.warn('Backend claim error, using client transaction:', err);
      }
    }

    const target = listings.find((l) => l.id === listingId);
    if (!target) return { success: false, error: 'Listing not found' };
    if (target.status !== 'posted') {
      return { success: false, error: 'Another NGO just claimed this surplus a moment ago!' };
    }
    if (new Date(target.pickup_by).getTime() < Date.now()) {
      return { success: false, error: 'This listing has expired' };
    }

    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: 'claimed' } : l))
    );

    const ngo = ngos.find((n) => n.id === ngoId) || ngos[0];
    const vol = volunteers.find((v) => v.id === volunteerId) || volunteers[0];
    const pickupId = 'pickup-' + Date.now();

    const newPickup: Pickup = {
      id: pickupId,
      listing_id: listingId,
      listing: target,
      ngo_id: ngoId,
      ngo_name: ngo.name,
      volunteer_id: vol.id,
      volunteer_name: vol.name,
      volunteer_phone: vol.phone,
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      voided: false,
      created_at: new Date().toISOString(),
    };

    setPickups((prev) => [newPickup, ...prev]);

    addNotification({
      user_id: target.hotel_id,
      title: '✅ Listing Claimed!',
      message: `${ngo.name} claimed "${target.title}". Assigned volunteer: ${vol.name}.`,
      type: 'claim',
    });

    return { success: true, pickupId };
  }, [isConfigured, listings, ngos, volunteers, refreshData, addNotification]);

  // Release claim (re-opens listing)
  const releaseClaim = useCallback(async (pickupId: string): Promise<boolean> => {
    const pickup = pickups.find((p) => p.id === pickupId);
    if (!pickup) return false;

    if (isConfigured) {
      await pickupsService.releaseClaim(pickupId, pickup.listing_id);
    }

    setPickups((prev) =>
      prev.map((p) => (p.id === pickupId ? { ...p, status: 'cancelled', cancel_reason: 'Released by NGO' } : p))
    );

    setListings((prev) =>
      prev.map((l) => (l.id === pickup.listing_id ? { ...l, status: 'posted' } : l))
    );

    addNotification({
      user_id: 'user-hotel-1',
      title: 'Claim Released',
      message: 'NGO released their claim. Your listing is open for nearby organisations again.',
      type: 'listing',
    });

    return true;
  }, [isConfigured, pickups, addNotification]);

  // Assign Volunteer
  const assignVolunteer = useCallback(async (pickupId: string, volunteerId: string) => {
    const vol = volunteers.find((v) => v.id === volunteerId);
    if (!vol) return;

    setPickups((prev) =>
      prev.map((p) =>
        p.id === pickupId
          ? {
              ...p,
              volunteer_id: vol.id,
              volunteer_name: vol.name,
              volunteer_phone: vol.phone,
            }
          : p
      )
    );

    addNotification({
      user_id: vol.profile_id,
      title: 'New Pickup Assigned',
      message: `You have been assigned to collect surplus food. Open your active pickup to start.`,
      type: 'pickup',
    });
  }, [volunteers, addNotification]);

  // Volunteer starts trip
  const startTrip = useCallback(async (pickupId: string) => {
    if (isConfigured) {
      await pickupsService.startTrip(pickupId);
    }

    setPickups((prev) =>
      prev.map((p) =>
        p.id === pickupId
          ? {
              ...p,
              status: 'on_the_way',
              started_at: new Date().toISOString(),
              current_location: {
                lat: 18.5204,
                lng: 73.8567,
                accuracy_m: 8.5,
                updated_at: new Date().toISOString(),
              },
              eta_minutes: 8,
            }
          : p
      )
    );

    addNotification({
      user_id: 'user-hotel-1',
      title: '🚚 Volunteer Is On The Way',
      message: 'Collector Arun Kumar has started their trip. Track live coordinates on your dashboard.',
      type: 'pickup',
    });
  }, [isConfigured, addNotification]);

  // Record Pickup Handoff
  const recordPickupHandoff = useCallback(async (pickupId: string, inGeofence: boolean) => {
    if (isConfigured) {
      await pickupsService.recordPickupHandoff(pickupId, inGeofence);
    }

    setPickups((prev) =>
      prev.map((p) =>
        p.id === pickupId
          ? {
              ...p,
              status: 'collected',
              collected_at: new Date().toISOString(),
              collected_in_geofence: inGeofence,
            }
          : p
      )
    );

    addNotification({
      user_id: 'user-hotel-1',
      title: '📦 Surplus Food Collected',
      message: 'Food has been verified and collected from your kitchen. Tracking complete.',
      type: 'collected',
    });
  }, [isConfigured, addNotification]);

  // Submit Completion Report
  const submitCompletionReport = useCallback(async (
    pickupId: string,
    data: { portionsReceived: number; leftBehind: number; photoUrl: string; tags: string[] }
  ) => {
    const pickup = pickups.find((p) => p.id === pickupId);
    if (!pickup) return;

    const listing = listings.find((l) => l.id === pickup.listing_id);
    const listedPortions = listing ? listing.portions_listed : data.portionsReceived;

    if (isConfigured) {
      await pickupsService.submitCompletionReport(pickupId, pickup.listing_id, data);
    }

    setPickups((prev) =>
      prev.map((p) =>
        p.id === pickupId
          ? {
              ...p,
              status: 'completed',
              completed_at: new Date().toISOString(),
              portions_received: data.portionsReceived,
              left_behind_portions: data.leftBehind,
              photo_path: data.photoUrl,
              tags: data.tags,
            }
          : p
      )
    );

    if (listing) {
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, status: 'completed' } : l))
      );
    }

    // Auto-Flagging rules per Section 7.5 & 8
    const isMismatch = Math.abs(listedPortions - data.portionsReceived) / (listedPortions || 1) > 0.40;
    const isMissingPhoto = !data.photoUrl || data.photoUrl.trim() === '';
    const isOutGeofence = pickup.collected_in_geofence === false;

    if (isMismatch || isMissingPhoto || isOutGeofence) {
      const reasons = [];
      if (isMismatch) reasons.push(`Quantity mismatch: listed ${listedPortions} vs reported ${data.portionsReceived}`);
      if (isMissingPhoto) reasons.push('Photo proof missing');
      if (isOutGeofence) reasons.push('Collection marked outside 150m geofence');

      const newFlag: Flag = {
        id: 'flag-' + Date.now(),
        pickup_id: pickupId,
        pickup: { ...pickup, portions_received: data.portionsReceived, photo_path: data.photoUrl, tags: data.tags },
        hotel_name: listing?.hotel_name || 'Partner Hotel',
        ngo_name: pickup.ngo_name || 'Partner NGO',
        reason: reasons.join('; '),
        source: 'auto',
        status: 'open',
        created_at: new Date().toISOString(),
      };
      setFlags((prev) => [newFlag, ...prev]);

      addNotification({
        user_id: 'user-admin-1',
        title: '⚠️ Auto-Flag Created',
        message: `Pickup for ${listing?.hotel_name} flagged for review: ${reasons[0]}`,
        type: 'flag',
      });
    }

    recomputeScores();
  }, [isConfigured, pickups, listings, addNotification]);

  // Social: Follow Hotel
  const toggleFollowHotel = useCallback((hotelId: string) => {
    setFollows((prev) => {
      const exists = prev.some((f) => f.userId === currentUser.id && f.hotelId === hotelId);
      if (exists) {
        return prev.filter((f) => !(f.userId === currentUser.id && f.hotelId === hotelId));
      } else {
        return [...prev, { userId: currentUser.id, hotelId }];
      }
    });
  }, [currentUser.id]);

  // Social: Send Kudos
  const sendKudos = useCallback((hotelId: string) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recent = kudos.find((k) => k.userId === currentUser.id && k.hotelId === hotelId && k.date > oneWeekAgo);

    if (recent) {
      return { success: false, message: 'You have already sent kudos to this hotel this week. Thanks for your support!' };
    }

    setKudos((prev) => [...prev, { userId: currentUser.id, hotelId, date: new Date().toISOString() }]);

    addNotification({
      user_id: 'user-hotel-1',
      title: '❤️ You Received Kudos!',
      message: `${currentUser.full_name} sent positive kudos for your food rescue commitment.`,
      type: 'kudos',
    });

    return { success: true, message: 'Kudos sent! Thank you for cheering on our sustainable partners!' };
  }, [kudos, currentUser, addNotification]);

  // Admin: Update Org Status (approve / reject / suspend)
  const updateOrgStatus = useCallback((orgType: 'hotel' | 'ngo', orgId: string, status: 'approved' | 'rejected' | 'suspended') => {
    if (orgType === 'hotel') {
      setHotels((prev) =>
        prev.map((h) => (h.id === orgId ? { ...h, status } : h))
      );
    } else {
      setNgos((prev) =>
        prev.map((n) => (n.id === orgId ? { ...n, status } : n))
      );
    }

    addNotification({
      user_id: 'user-admin-1',
      title: `Org Status Updated: ${status.toUpperCase()}`,
      message: `${orgType.toUpperCase()} #${orgId} marked as ${status}.`,
      type: 'approval',
    });
  }, [addNotification]);

  // Admin: Resolve Flag (keep / correct / voided)
  const resolveFlag = useCallback((flagId: string, action: 'keep' | 'correct' | 'voided', reason: string, correctedPortions?: number) => {
    const flag = flags.find((f) => f.id === flagId);
    if (!flag) return;

    const statusMap: Record<string, FlagStatus> = {
      keep: 'kept',
      correct: 'corrected',
      voided: 'voided',
    };
    const newStatus: FlagStatus = statusMap[action] || 'kept';

    setFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, status: newStatus, resolved_at: new Date().toISOString() } : f))
    );

    if (action === 'voided') {
      setPickups((prev) =>
        prev.map((p) => (p.id === flag.pickup_id ? { ...p, voided: true, cancel_reason: `Admin void: ${reason}` } : p))
      );
    } else if (action === 'correct' && correctedPortions !== undefined) {
      setPickups((prev) =>
        prev.map((p) => (p.id === flag.pickup_id ? { ...p, portions_received: correctedPortions } : p))
      );
    }

    recomputeScores();

    addNotification({
      user_id: 'user-admin-1',
      title: `Flag Resolved (${action.toUpperCase()})`,
      message: `Flag ${flagId} resolved. Reason: ${reason}. Scores updated.`,
      type: 'flag',
    });
  }, [flags, addNotification]);

  // Admin: Update Settings
  const updateSettings = useCallback((newSettings: PlatformSettings) => {
    setSettings(newSettings);
    recomputeScores();
  }, []);

  // Admin: News actions
  const addNewsItem = useCallback((item: Omit<NewsItem, 'id' | 'created_at'>) => {
    const newItem: NewsItem = {
      ...item,
      id: 'news-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setNews((prev) => [newItem, ...prev]);
  }, []);

  const togglePinNews = useCallback((newsId: string) => {
    setNews((prev) =>
      prev.map((n) => (n.id === newsId ? { ...n, pinned: !n.pinned } : n))
    );
  }, []);

  // Full Rescue Score recomputation per PRD Section 8
  const recomputeScores = useCallback(() => {
    setScores(computeRealtimeScores(hotels, listings, pickups));
  }, [hotels, listings, pickups]);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const toggleTripSimulation = useCallback(() => {
    setIsSimulatingTrip((prev) => !prev);
  }, []);

  return (
    <FoodRescueContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        activeHotel,
        activeNGO,
        activeVolunteer,
        isAuthenticated,
        isConfigured,
        isLoadingAuth,
        signOut,
        refreshData,
        profiles,
        hotels,
        ngos,
        volunteers,
        listings,
        pickups,
        flags,
        scores,
        news,
        settings,
        certificates,
        tags,
        notifications,
        follows,
        kudos,
        postListing,
        cancelListing,
        claimListing,
        releaseClaim,
        assignVolunteer,
        startTrip,
        recordPickupHandoff,
        submitCompletionReport,
        toggleFollowHotel,
        sendKudos,
        updateOrgStatus,
        resolveFlag,
        updateSettings,
        addNewsItem,
        togglePinNews,
        recomputeScores,
        markNotificationRead,
        clearNotifications,
        isSimulatingTrip,
        toggleTripSimulation,
      }}
    >
      {children}
    </FoodRescueContext.Provider>
  );
}

export function useFoodRescue() {
  const context = useContext(FoodRescueContext);
  if (!context) {
    throw new Error('useFoodRescue must be used within a FoodRescueProvider');
  }
  return context;
}
