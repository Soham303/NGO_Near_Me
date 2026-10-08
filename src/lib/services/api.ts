import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
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
  VenueType,
  FoodDiet
} from '@/types';

// ==========================================
// Authentication & User Profile Service
// ==========================================

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  hotelData?: {
    name: string;
    venueType: VenueType;
    address: string;
    lat?: number;
    lng?: number;
    rooms?: number;
    seats?: number;
    banquetCapacity?: number;
    eventsPerMonth?: number;
    operatingDaysPerWeek?: number;
  };
  ngoData?: {
    name: string;
    registrationNo?: string;
    address: string;
    lat?: number;
    lng?: number;
    capacityPortions?: number;
    serviceRadiusKm?: number;
  };
  volunteerData?: {
    ngoId?: string;
    vehicle?: string;
  };
}

export const authService = {
  async getCurrentSession() {
    if (!isSupabaseConfigured()) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  },

  async getCurrentUserProfile(userId: string): Promise<{
    profile: Profile | null;
    hotel: Hotel | null;
    ngo: NGO | null;
    volunteer: Volunteer | null;
  }> {
    if (!isSupabaseConfigured()) {
      return { profile: null, hotel: null, ngo: null, volunteer: null };
    }

    try {
      // 1. Fetch profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr || !profileData) {
        return { profile: null, hotel: null, ngo: null, volunteer: null };
      }

      const profile: Profile = {
        id: profileData.id,
        role: profileData.role,
        full_name: profileData.full_name,
        email: profileData.email || '',
        phone: profileData.phone || undefined,
        avatar_url: profileData.avatar_url || undefined,
        created_at: profileData.created_at,
      };

      // 2. Fetch associated role entity
      let hotel: Hotel | null = null;
      let ngo: NGO | null = null;
      let volunteer: Volunteer | null = null;

      if (profile.role === 'hotel') {
        const { data: hData } = await supabase
          .from('hotels')
          .select('*')
          .eq('owner_id', userId)
          .maybeSingle();
        if (hData) {
          hotel = {
            id: hData.id,
            owner_id: hData.owner_id,
            name: hData.name,
            slug: hData.slug,
            venue_type: hData.venue_type,
            address: hData.address,
            lat: hData.lat || 12.9716,
            lng: hData.lng || 77.5946,
            rooms: hData.rooms || 0,
            seats: hData.seats || 0,
            banquet_capacity: hData.banquet_capacity || 0,
            events_per_month: hData.events_per_month || 0,
            operating_days_per_week: hData.operating_days_per_week || 7,
            status: hData.status || 'approved',
            public_listing: hData.public_listing ?? true,
            verification_doc_path: hData.verification_doc_path,
            created_at: hData.created_at,
          };
        }
      } else if (profile.role === 'ngo') {
        const { data: nData } = await supabase
          .from('ngos')
          .select('*')
          .eq('owner_id', userId)
          .maybeSingle();
        if (nData) {
          ngo = {
            id: nData.id,
            owner_id: nData.owner_id,
            name: nData.name,
            registration_no: nData.registration_no,
            address: nData.address,
            lat: nData.lat || 12.9716,
            lng: nData.lng || 77.5946,
            capacity_portions: nData.capacity_portions || 0,
            service_radius_km: nData.service_radius_km || 10,
            trust_score: nData.trust_score ?? 1.0,
            status: nData.status || 'approved',
            verification_doc_path: nData.verification_doc_path,
            created_at: nData.created_at,
          };
        }
      } else if (profile.role === 'volunteer') {
        const { data: vData } = await supabase
          .from('volunteers')
          .select('*')
          .eq('profile_id', userId)
          .maybeSingle();
        if (vData) {
          volunteer = {
            id: vData.id,
            profile_id: vData.profile_id,
            ngo_id: vData.ngo_id,
            name: vData.name || profile.full_name,
            phone: vData.phone || profile.phone || '',
            vehicle: vData.vehicle,
            active: vData.active ?? true,
          };
        }
      }

      return { profile, hotel, ngo, volunteer };
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return { profile: null, hotel: null, ngo: null, volunteer: null };
    }
  },

  async signUp(params: SignUpParams) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please supply your API keys.');
    }

    // 1. Sign up user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName,
          phone: params.phone,
          role: params.role,
        },
      },
    });

    if (authError || !authData.user) {
      throw authError || new Error('Signup failed');
    }

    const userId = authData.user.id;

    // 2. Upsert profile record
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      role: params.role,
      full_name: params.fullName,
      email: params.email,
      phone: params.phone,
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('Profile upsert warning:', profileError);
    }

    // 3. Create role specific record
    let hotel: Hotel | null = null;
    let ngo: NGO | null = null;
    let volunteer: Volunteer | null = null;

    if (params.role === 'hotel' && params.hotelData) {
      const slug = params.hotelData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

      const newHotel = {
        owner_id: userId,
        name: params.hotelData.name,
        slug,
        venue_type: params.hotelData.venueType || 'hotel',
        address: params.hotelData.address,
        lat: params.hotelData.lat || 12.9716,
        lng: params.hotelData.lng || 77.5946,
        rooms: params.hotelData.rooms || 0,
        seats: params.hotelData.seats || 0,
        banquet_capacity: params.hotelData.banquetCapacity || 0,
        events_per_month: params.hotelData.eventsPerMonth || 0,
        operating_days_per_week: params.hotelData.operatingDaysPerWeek || 7,
        status: 'approved',
        public_listing: true,
      };

      const { data: insertedHotel, error: hErr } = await supabase
        .from('hotels')
        .insert(newHotel)
        .select()
        .single();

      if (!hErr && insertedHotel) {
        hotel = insertedHotel as Hotel;
      }
    } else if (params.role === 'ngo' && params.ngoData) {
      const newNgo = {
        owner_id: userId,
        name: params.ngoData.name,
        registration_no: params.ngoData.registrationNo,
        address: params.ngoData.address,
        lat: params.ngoData.lat || 12.9716,
        lng: params.ngoData.lng || 77.5946,
        capacity_portions: params.ngoData.capacityPortions || 400,
        service_radius_km: params.ngoData.serviceRadiusKm || 12,
        trust_score: 1.0,
        status: 'approved',
      };

      const { data: insertedNgo, error: nErr } = await supabase
        .from('ngos')
        .insert(newNgo)
        .select()
        .single();

      if (!nErr && insertedNgo) {
        ngo = insertedNgo as NGO;
      }
    } else if (params.role === 'volunteer') {
      const newVol = {
        profile_id: userId,
        ngo_id: params.volunteerData?.ngoId || null,
        name: params.fullName,
        phone: params.phone || '',
        vehicle: params.volunteerData?.vehicle || 'Two-wheeler',
        active: true,
      };

      const { data: insertedVol, error: vErr } = await supabase
        .from('volunteers')
        .insert(newVol)
        .select()
        .single();

      if (!vErr && insertedVol) {
        volunteer = insertedVol as Volunteer;
      }
    }

    const profile: Profile = {
      id: userId,
      role: params.role,
      full_name: params.fullName,
      email: params.email,
      phone: params.phone,
      created_at: new Date().toISOString(),
    };

    return { user: authData.user, session: authData.session, profile, hotel, ngo, volunteer };
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please supply your API keys.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw error || new Error('Invalid email or password');
    }

    const profileData = await this.getCurrentUserProfile(data.user.id);
    return { user: data.user, session: data.session, ...profileData };
  },

  async signOut() {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  },
};

// ==========================================
// Listings Service
// ==========================================

export const listingsService = {
  async fetchListings(): Promise<Listing[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          hotel_id,
          title,
          description,
          diet,
          portions_listed,
          cooked_at,
          pickup_by,
          packaging_notes,
          safety_confirmed,
          status,
          created_at,
          hotels (
            name,
            address,
            lat,
            lng
          )
        `)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        hotel_id: item.hotel_id,
        hotel_name: item.hotels?.name || 'Hotel Partner',
        hotel_address: item.hotels?.address || '',
        lat: item.hotels?.lat,
        lng: item.hotels?.lng,
        title: item.title,
        description: item.description,
        diet: item.diet,
        portions_listed: item.portions_listed,
        cooked_at: item.cooked_at,
        pickup_by: item.pickup_by,
        packaging_notes: item.packaging_notes,
        safety_confirmed: item.safety_confirmed,
        status: item.status,
        created_at: item.created_at,
      }));
    } catch (err) {
      console.error('Error fetching listings:', err);
      return [];
    }
  },

  async createListing(listing: Omit<Listing, 'id' | 'created_at' | 'status'>): Promise<Listing> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        hotel_id: listing.hotel_id,
        title: listing.title,
        description: listing.description,
        diet: listing.diet,
        portions_listed: listing.portions_listed,
        cooked_at: listing.cooked_at,
        pickup_by: listing.pickup_by,
        packaging_notes: listing.packaging_notes,
        safety_confirmed: listing.safety_confirmed,
        status: 'posted',
      })
      .select('*, hotels(name, address, lat, lng)')
      .single();

    if (error || !data) {
      throw error || new Error('Failed to create listing');
    }

    return {
      id: data.id,
      hotel_id: data.hotel_id,
      hotel_name: data.hotels?.name,
      hotel_address: data.hotels?.address,
      lat: data.hotels?.lat,
      lng: data.hotels?.lng,
      title: data.title,
      description: data.description,
      diet: data.diet,
      portions_listed: data.portions_listed,
      cooked_at: data.cooked_at,
      pickup_by: data.pickup_by,
      packaging_notes: data.packaging_notes,
      safety_confirmed: data.safety_confirmed,
      status: data.status,
      created_at: data.created_at,
    };
  },

  async cancelListing(listingId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await supabase
      .from('listings')
      .update({ status: 'cancelled' })
      .eq('id', listingId);
    return !error;
  },
};

// ==========================================
// Pickups Service
// ==========================================

export const pickupsService = {
  async fetchPickups(): Promise<Pickup[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('pickups')
        .select(`
          *,
          listings (
            *,
            hotels (
              name,
              address,
              lat,
              lng
            )
          ),
          ngos (
            name
          ),
          volunteers (
            name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        listing_id: item.listing_id,
        listing: item.listings ? {
          ...item.listings,
          hotel_name: item.listings.hotels?.name,
          hotel_address: item.listings.hotels?.address,
          lat: item.listings.hotels?.lat,
          lng: item.listings.hotels?.lng,
        } : undefined,
        ngo_id: item.ngo_id,
        ngo_name: item.ngos?.name || 'Partner NGO',
        volunteer_id: item.volunteer_id,
        volunteer_name: item.volunteers?.name,
        volunteer_phone: item.volunteers?.phone,
        status: item.status,
        claimed_at: item.claimed_at,
        started_at: item.started_at,
        collected_at: item.collected_at,
        completed_at: item.completed_at,
        collected_in_geofence: item.collected_in_geofence,
        portions_received: item.portions_received,
        left_behind_portions: item.left_behind_portions,
        photo_path: item.photo_path,
        cancel_reason: item.cancel_reason,
        voided: item.voided ?? false,
        tags: item.tags || [],
        current_location: item.current_lat && item.current_lng ? {
          lat: Number(item.current_lat),
          lng: Number(item.current_lng),
          accuracy_m: 6.5,
          updated_at: item.completed_at || item.collected_at || item.started_at || item.claimed_at,
        } : undefined,
        eta_minutes: item.eta_minutes,
        created_at: item.created_at,
      }));
    } catch (err) {
      console.error('Error fetching pickups:', err);
      return [];
    }
  },

  async claimListing(listingId: string, ngoId: string, volunteerId?: string): Promise<{ success: boolean; pickupId?: string; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      // 1. Try atomic claim stored procedure
      const { data: rpcData, error: rpcError } = await supabase.rpc('claim_listing', {
        p_listing: listingId,
        p_ngo: ngoId,
        p_volunteer: volunteerId || null,
      });

      if (!rpcError && rpcData) {
        return { success: true, pickupId: rpcData };
      }

      // 2. Direct transactional fallback
      const { error: updateError } = await supabase
        .from('listings')
        .update({ status: 'claimed' })
        .eq('id', listingId)
        .eq('status', 'posted');

      if (updateError) {
        return { success: false, error: 'Listing was already claimed or unavailable' };
      }

      const { data: newPickup, error: insertError } = await supabase
        .from('pickups')
        .insert({
          listing_id: listingId,
          ngo_id: ngoId,
          volunteer_id: volunteerId || null,
          status: 'claimed',
          claimed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError || !newPickup) {
        return { success: false, error: insertError?.message || 'Failed to create pickup' };
      }

      return { success: true, pickupId: newPickup.id };
    } catch (err: any) {
      return { success: false, error: err.message || 'Claim error' };
    }
  },

  async releaseClaim(pickupId: string, listingId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    await supabase.from('pickups').update({ status: 'cancelled', cancel_reason: 'Released by NGO' }).eq('id', pickupId);
    await supabase.from('listings').update({ status: 'posted' }).eq('id', listingId);
    return true;
  },

  async updatePickupLocation(pickupId: string, lat: number, lng: number, etaMinutes?: number) {
    if (!isSupabaseConfigured()) return;
    await supabase
      .from('pickups')
      .update({
        current_lat: lat,
        current_lng: lng,
        eta_minutes: etaMinutes,
      })
      .eq('id', pickupId);

    // Write location ping
    await supabase.from('location_pings').insert({
      pickup_id: pickupId,
      lat,
      lng,
      accuracy_m: 6.5,
    });
  },

  async startTrip(pickupId: string) {
    if (!isSupabaseConfigured()) return;
    await supabase
      .from('pickups')
      .update({
        status: 'on_the_way',
        started_at: new Date().toISOString(),
        current_lat: 12.9645,
        current_lng: 77.6321,
        eta_minutes: 8,
      })
      .eq('id', pickupId);
  },

  async recordPickupHandoff(pickupId: string, inGeofence: boolean) {
    if (!isSupabaseConfigured()) return;
    await supabase
      .from('pickups')
      .update({
        status: 'collected',
        collected_at: new Date().toISOString(),
        collected_in_geofence: inGeofence,
      })
      .eq('id', pickupId);
  },

  async submitCompletionReport(
    pickupId: string,
    listingId: string,
    data: { portionsReceived: number; leftBehind: number; photoUrl: string; tags: string[] }
  ) {
    if (!isSupabaseConfigured()) return;
    await supabase
      .from('pickups')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        portions_received: data.portionsReceived,
        left_behind_portions: data.leftBehind,
        photo_path: data.photoUrl,
        tags: data.tags,
      })
      .eq('id', pickupId);

    await supabase
      .from('listings')
      .update({ status: 'completed' })
      .eq('id', listingId);
  },
};

// ==========================================
// Organizations & Master Data Service
// ==========================================

export const masterDataService = {
  async fetchHotels(): Promise<Hotel[]> {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('hotels').select('*').order('name');
    if (!data) return [];
    return data.map((h: any) => ({
      id: h.id,
      owner_id: h.owner_id,
      name: h.name,
      slug: h.slug,
      venue_type: h.venue_type,
      address: h.address,
      lat: h.lat || 12.9716,
      lng: h.lng || 77.5946,
      rooms: h.rooms || 0,
      seats: h.seats || 0,
      banquet_capacity: h.banquet_capacity || 0,
      events_per_month: h.events_per_month || 0,
      operating_days_per_week: h.operating_days_per_week || 7,
      status: h.status,
      public_listing: h.public_listing ?? true,
      created_at: h.created_at,
    }));
  },

  async fetchNGOs(): Promise<NGO[]> {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('ngos').select('*').order('name');
    if (!data) return [];
    return data.map((n: any) => ({
      id: n.id,
      owner_id: n.owner_id,
      name: n.name,
      registration_no: n.registration_no,
      address: n.address,
      lat: n.lat || 12.9716,
      lng: n.lng || 77.5946,
      capacity_portions: n.capacity_portions || 0,
      service_radius_km: n.service_radius_km || 10,
      trust_score: n.trust_score ?? 1.0,
      status: n.status,
      created_at: n.created_at,
    }));
  },

  async fetchVolunteers(): Promise<Volunteer[]> {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase.from('volunteers').select('*').order('name');
    if (!data) return [];
    return data.map((v: any) => ({
      id: v.id,
      profile_id: v.profile_id,
      ngo_id: v.ngo_id,
      name: v.name,
      phone: v.phone,
      vehicle: v.vehicle,
      active: v.active ?? true,
    }));
  },

  async fetchScores(): Promise<ScoreSnapshot[]> {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase
      .from('score_snapshots')
      .select('*, hotels(name, slug, venue_type)')
      .order('composite', { ascending: false });

    if (!data) return [];
    return data.map((s: any) => ({
      id: s.id,
      hotel_id: s.hotel_id,
      hotel_name: s.hotels?.name || 'Hotel Partner',
      hotel_slug: s.hotels?.slug,
      venue_type: s.hotels?.venue_type,
      period_start: s.period_start,
      period_end: s.period_end,
      completed_pickups: s.completed_pickups,
      portions_rescued: s.portions_rescued,
      rescue_rate: Number(s.rescue_rate),
      participation: Number(s.participation),
      listing_accuracy: Number(s.listing_accuracy),
      handoff_quality: Number(s.handoff_quality),
      left_behind: s.left_behind !== null ? Number(s.left_behind) : null,
      composite: Number(s.composite),
      tier: s.tier,
      rank_in_category: s.rank_in_category,
      eligible: s.eligible,
      streak_weeks: s.streak_weeks,
      created_at: s.created_at,
    }));
  },

  async fetchNews(): Promise<NewsItem[]> {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase
      .from('news_items')
      .select('*')
      .order('pinned', { ascending: false })
      .order('published_at', { ascending: false });

    if (!data) return [];
    return data;
  },

  async fetchFlags(): Promise<Flag[]> {
    if (!isSupabaseConfigured()) return [];
    const { data } = await supabase
      .from('flags')
      .select('*, pickups(*, listings(*, hotels(name)), ngos(name))')
      .order('created_at', { ascending: false });

    if (!data) return [];
    return data.map((f: any) => ({
      id: f.id,
      pickup_id: f.pickup_id,
      pickup: f.pickups,
      hotel_name: f.pickups?.listings?.hotels?.name || 'Partner Hotel',
      ngo_name: f.pickups?.ngos?.name || 'Partner NGO',
      reason: f.reason,
      source: f.source,
      status: f.status,
      created_at: f.created_at,
      resolved_at: f.resolved_at,
    }));
  },
};
