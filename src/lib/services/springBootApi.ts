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
  Tag,
} from '@/types';
import { SignUpParams } from './api';

const SPRING_BOOT_BASE_URL =
  process.env.NEXT_PUBLIC_SPRING_BOOT_URL || 'http://localhost:8080/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${SPRING_BOOT_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      console.warn(`Spring Boot API error [${res.status}]: ${endpoint}`);
      return null;
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.error(`Network error connecting to Spring Boot (${endpoint}):`, err);
    return null;
  }
}

// ==========================================
// Spring Boot Auth & Profile Service
// ==========================================
export const springBootAuthService = {
  async getCurrentUserProfile(userId: string): Promise<{
    profile: Profile | null;
    hotel: Hotel | null;
    ngo: NGO | null;
    volunteer: Volunteer | null;
  }> {
    const data = await fetchJson<{
      profile: Profile;
      hotel: Hotel;
      ngo: NGO;
      volunteer: Volunteer;
    }>(`/auth/profile?userId=${encodeURIComponent(userId)}`);

    if (!data) {
      return { profile: null, hotel: null, ngo: null, volunteer: null };
    }
    return data;
  },

  async registerSync(params: SignUpParams) {
    return fetchJson(`/auth/register-sync`, {
      method: 'POST',
      body: JSON.stringify({
        email: params.email,
        fullName: params.fullName,
        phone: params.phone,
        role: params.role,
        hotelData: params.hotelData,
        ngoData: params.ngoData,
        volunteerData: params.volunteerData,
      }),
    });
  },
};

// ==========================================
// Spring Boot Listings Service
// ==========================================
export const springBootListingsService = {
  async fetchListings(): Promise<Listing[]> {
    const list = await fetchJson<Listing[]>('/listings');
    return list || [];
  },

  async fetchNearby(lat: number, lng: number, radiusKm: number = 10): Promise<Listing[]> {
    const list = await fetchJson<Listing[]>(
      `/listings/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`
    );
    return list || [];
  },

  async createListing(listing: Omit<Listing, 'id' | 'created_at' | 'status'>): Promise<Listing | null> {
    return fetchJson<Listing>('/listings', {
      method: 'POST',
      body: JSON.stringify({
        hotelId: listing.hotel_id,
        title: listing.title,
        description: listing.description,
        diet: listing.diet,
        portionsListed: listing.portions_listed,
        cookedAt: listing.cooked_at,
        pickupBy: listing.pickup_by,
        packagingNotes: listing.packaging_notes,
        safetyConfirmed: listing.safety_confirmed,
      }),
    });
  },

  async cancelListing(listingId: string): Promise<boolean> {
    const res = await fetchJson(`/listings/${listingId}/cancel`, {
      method: 'PATCH',
    });
    return res !== null;
  },
};

// ==========================================
// Spring Boot Pickups Service
// ==========================================
export const springBootPickupsService = {
  async fetchPickups(): Promise<Pickup[]> {
    const list = await fetchJson<Pickup[]>('/pickups');
    return list || [];
  },

  async claimListing(listingId: string, ngoId: string, volunteerId?: string): Promise<{ success: boolean; pickupId?: string; error?: string }> {
    const data = await fetchJson<{ id: string }>('/pickups/claim', {
      method: 'POST',
      body: JSON.stringify({
        listingId,
        ngoId,
        volunteerId: volunteerId || null,
      }),
    });

    if (data && data.id) {
      return { success: true, pickupId: data.id };
    }
    return { success: false, error: 'Failed to claim listing through Spring Boot' };
  },

  async releaseClaim(pickupId: string): Promise<boolean> {
    const res = await fetchJson(`/pickups/${pickupId}/release`, {
      method: 'POST',
    });
    return res !== null;
  },

  async startTrip(pickupId: string): Promise<boolean> {
    const res = await fetchJson(`/pickups/${pickupId}/start-trip`, {
      method: 'POST',
    });
    return res !== null;
  },

  async updateLocation(pickupId: string, lat: number, lng: number, etaMinutes?: number) {
    return fetchJson(`/pickups/${pickupId}/location`, {
      method: 'POST',
      body: JSON.stringify({ lat, lng, etaMinutes }),
    });
  },

  async recordHandoff(pickupId: string, inGeofence: boolean) {
    return fetchJson(`/pickups/${pickupId}/handoff?inGeofence=${inGeofence}`, {
      method: 'POST',
    });
  },

  async submitCompletionReport(
    pickupId: string,
    data: { portionsReceived: number; leftBehind: number; photoUrl: string; tags: string[] }
  ) {
    return fetchJson(`/pickups/${pickupId}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        portionsReceived: data.portionsReceived,
        leftBehind: data.leftBehind,
        photoUrl: data.photoUrl,
        tags: data.tags,
      }),
    });
  },
};

// ==========================================
// Spring Boot Master Data Service
// ==========================================
export const springBootMasterDataService = {
  async fetchHotels(): Promise<Hotel[]> {
    const list = await fetchJson<Hotel[]>('/hotels');
    return list || [];
  },

  async fetchNGOs(): Promise<NGO[]> {
    const list = await fetchJson<NGO[]>('/ngos');
    return list || [];
  },

  async fetchVolunteers(): Promise<Volunteer[]> {
    const list = await fetchJson<Volunteer[]>('/volunteers');
    return list || [];
  },

  async fetchTags(): Promise<Tag[]> {
    const list = await fetchJson<Tag[]>('/tags');
    return list || [];
  },

  async fetchScores(): Promise<ScoreSnapshot[]> {
    const list = await fetchJson<ScoreSnapshot[]>('/scores/leaderboard');
    return list || [];
  },

  async fetchNews(): Promise<NewsItem[]> {
    const list = await fetchJson<NewsItem[]>('/news');
    return list || [];
  },

  async fetchFlags(): Promise<Flag[]> {
    const list = await fetchJson<Flag[]>('/flags');
    return list || [];
  },
};
