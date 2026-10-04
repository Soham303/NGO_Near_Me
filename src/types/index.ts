export type UserRole = 'hotel' | 'ngo' | 'volunteer' | 'public' | 'admin';
export type OrgStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type VenueType = 'hotel' | 'restaurant' | 'banquet_hall' | 'hostel';
export type FoodDiet = 'veg' | 'non_veg' | 'mixed';
export type ListingStatus = 'posted' | 'claimed' | 'completed' | 'expired' | 'cancelled';
export type PickupStatus = 'claimed' | 'on_the_way' | 'collected' | 'completed' | 'cancelled';
export type TagKind = 'positive' | 'issue';
export type FlagStatus = 'open' | 'kept' | 'corrected' | 'voided';
export type NewsStatus = 'draft' | 'published' | 'hidden';
export type NewsSource = 'internal' | 'external';
export type ScoreTier = 'seed' | 'sprout' | 'canopy' | 'forest';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export interface Hotel {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  venue_type: VenueType;
  address: string;
  lat: number;
  lng: number;
  rooms: number;
  seats: number;
  banquet_capacity: number;
  events_per_month: number;
  operating_days_per_week: number;
  status: OrgStatus;
  public_listing: boolean;
  verification_doc_path?: string;
  created_at: string;
}

export interface NGO {
  id: string;
  owner_id: string;
  name: string;
  registration_no?: string;
  address: string;
  lat: number;
  lng: number;
  capacity_portions: number;
  service_radius_km: number;
  trust_score: number; // 0..1
  status: OrgStatus;
  verification_doc_path?: string;
  created_at: string;
}

export interface Volunteer {
  id: string;
  profile_id: string;
  ngo_id: string;
  name: string;
  phone: string;
  vehicle?: string;
  active: boolean;
}

export interface Listing {
  id: string;
  hotel_id: string;
  hotel_name?: string;
  hotel_address?: string;
  lat?: number;
  lng?: number;
  title: string;
  description?: string;
  diet: FoodDiet;
  portions_listed: number;
  cooked_at: string; // ISO
  pickup_by: string; // ISO
  packaging_notes?: string;
  safety_confirmed: boolean;
  status: ListingStatus;
  created_at: string;
  distance_km?: number;
}

export interface Pickup {
  id: string;
  listing_id: string;
  listing?: Listing;
  ngo_id: string;
  ngo_name?: string;
  volunteer_id?: string;
  volunteer_name?: string;
  volunteer_phone?: string;
  status: PickupStatus;
  claimed_at: string;
  started_at?: string;
  collected_at?: string;
  completed_at?: string;
  collected_in_geofence?: boolean;
  portions_received?: number;
  left_behind_portions?: number;
  photo_path?: string;
  cancel_reason?: string;
  voided: boolean;
  tags?: string[];
  created_at: string;
  current_location?: { lat: number; lng: number; accuracy_m?: number; updated_at: string };
  eta_minutes?: number;
}

export interface LocationPing {
  id: string;
  pickup_id: string;
  lat: number;
  lng: number;
  accuracy_m?: number;
  recorded_at: string;
}

export interface Tag {
  code: string;
  label: string;
  kind: TagKind;
  active: boolean;
}

export interface Flag {
  id: string;
  pickup_id: string;
  pickup?: Pickup;
  hotel_name?: string;
  ngo_name?: string;
  reason: string;
  source: 'auto' | 'admin' | 'email_complaint';
  status: FlagStatus;
  created_at: string;
  resolved_at?: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id?: string;
  reason?: string;
  before_data?: any;
  after_data?: any;
  created_at: string;
}

export interface ScoreSnapshot {
  id: string;
  hotel_id: string;
  hotel_name?: string;
  hotel_slug?: string;
  venue_type?: VenueType;
  period_start: string;
  period_end: string;
  completed_pickups: number;
  portions_rescued: number;
  rescue_rate: number; // 0..1
  participation: number; // 0..1
  listing_accuracy: number; // 0..1
  handoff_quality: number; // 0..1
  left_behind?: number | null; // 0..1
  composite: number; // 0..100
  tier: ScoreTier;
  rank_in_category: number;
  eligible: boolean;
  trend?: 'up' | 'down' | 'same';
  streak_weeks?: number;
  created_at: string;
}

export interface Certificate {
  id: string;
  hotel_id: string;
  month: string; // YYYY-MM
  pdf_path: string;
  meals: number;
  ngos_served: number;
  co2_kg_avoided: number;
  created_at: string;
}

export interface NewsItem {
  id: string;
  source_type: NewsSource;
  title: string;
  snippet: string;
  source_name?: string;
  url?: string;
  image_url?: string;
  status: NewsStatus;
  pinned: boolean;
  published_at: string;
  created_by?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'listing' | 'claim' | 'pickup' | 'collected' | 'report' | 'flag' | 'approval' | 'kudos' | 'milestone';
  read: boolean;
  created_at: string;
  data?: any;
}

export interface PlatformSettings {
  score_weights: {
    rescue_rate: number;
    participation: number;
    listing_accuracy: number;
    handoff_quality: number;
    left_behind: number;
  };
  smoothing_k: number;
  min_pickups_for_board: number;
  geofence_radius_meters: number;
  per_ngo_weight_cap: number;
  report_deadline_hours: number;
}
