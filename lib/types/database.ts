// Database types based on Supabase schema

export type Show = {
  id: number;
  show_name: string;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
  state: string | null;
  start_date: string | null; // date
  end_date: string | null; // date
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  geocode_confidence: number | null;
  notes: string | null;
};

export type Vendor = {
  iid: string; // uuid
  name: string;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  coverage_radius_miles: number | null;
  preferred: boolean | null;
  created_at: string | null;
  address: string | null;
  place_id: string | null;
  rating: number | null;
  reviews: number | null;
};

export type Safe = {
  id: string; // uuid
  safe_name: string | null;
  safe_serial: string | null;
  vendor_id: string | null; // uuid (references vendors.iid)
  show_id: number | null; // references shows.id
  current_location: string | null;
  status: string | null; // 'available', 'in_transit', 'at_venue', 'delivered', etc.
  estimated_arrival: string | null;
  last_moved: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Assignment = {
  id: number;
  show_id: number | null;
  vendor_id: number | null;
  assigned_by: string | null;
  status: string | null; // 'pending', etc.
  created_at: string | null;
  vendor_uuid: string | null; // uuid (references vendors.iid)
};

export type Distance = {
  id: string; // uuid
  vendor_id: string | null; // uuid (references vendors.iid)
  show_id: number | null;
  distance_miles: number;
  drive_estimate_miles: number | null;
  travel_time_minutes: number | null;
  calculated_at: string | null;
  route_summary: Record<string, unknown> | null; // jsonb
  notes: string | null;
  travel_time_minutes_est: number | null;
};

export type SafeMovement = {
  id: string; // uuid
  safe_id: string | null; // uuid
  from_vendor_id: string | null; // uuid
  to_vendor_id: string | null; // uuid
  from_show_id: number | null;
  to_show_id: number | null;
  movement_date: string | null;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  distance_miles: number | null;
  travel_time_minutes: number | null;
  transport_vendor: string | null;
  movement_status: string | null; // 'in_transit', etc.
  notes: string | null;
  created_at: string | null;
};

// Extended types with joins for UI
export type ShowWithVendor = Show & {
  vendor?: Vendor;
  safes?: Safe[];
  distance_gap?: number; // miles to next show
  time_gap?: number; // days to next show
};

export type VendorWithMetrics = Vendor & {
  shows_assigned?: number;
  safes_handled?: number;
  total_miles?: number;
  capacity_utilization?: number;
};

export type SafeWithDetails = Safe & {
  vendor?: Vendor;
  show?: Show;
  movements?: SafeMovement[];
};
