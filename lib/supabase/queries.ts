import { createClient } from './server';
import type {
  Show,
  Vendor,
  Safe,
  Assignment,
  Distance,
  SafeMovement,
  ShowWithVendor,
  VendorWithMetrics,
  SafeWithDetails,
} from '@/lib/types';

// Shows
export async function getShows(): Promise<Show[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shows')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getShow(id: number): Promise<Show | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shows')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getShowsWithVendors(): Promise<ShowWithVendor[]> {
  const supabase = await createClient();
  const shows = await getShows();
  const assignments = await getAssignments();

  // Get vendor UUIDs from assignments
  const vendorUuids = assignments
    .map((a) => a.vendor_uuid)
    .filter((uuid): uuid is string => uuid !== null);

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .in('iid', vendorUuids);

  const vendorMap = new Map(
    (vendors || []).map((v) => [v.iid, v as Vendor])
  );

  // Get safes for each show
  const { data: safes } = await supabase
    .from('safes')
    .select('*')
    .not('show_id', 'is', null);

  const safesByShow = new Map<number, Safe[]>();
  (safes || []).forEach((safe) => {
    if (safe.show_id) {
      const existing = safesByShow.get(safe.show_id) || [];
      existing.push(safe as Safe);
      safesByShow.set(safe.show_id, existing);
    }
  });

  // Combine data
  return shows.map((show) => {
    const assignment = assignments.find((a) => a.show_id === show.id);
    const vendor = assignment?.vendor_uuid
      ? vendorMap.get(assignment.vendor_uuid)
      : undefined;
    const showSafes = safesByShow.get(show.id) || [];

    return {
      ...show,
      vendor,
      safes: showSafes,
    };
  });
}

// Vendors
export async function getVendors(): Promise<Vendor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getVendor(id: string): Promise<Vendor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('iid', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getVendorsWithMetrics(): Promise<VendorWithMetrics[]> {
  const supabase = await createClient();
  const vendors = await getVendors();
  const assignments = await getAssignments();
  const safes = await getSafes();

  return vendors.map((vendor) => {
    const vendorAssignments = assignments.filter(
      (a) => a.vendor_uuid === vendor.iid
    );
    const vendorSafes = safes.filter((s) => s.vendor_id === vendor.iid);

    // Calculate total miles from distances
    const vendorDistances = assignments
      .filter((a) => a.vendor_uuid === vendor.iid)
      .map((a) => a.show_id)
      .filter((id): id is number => id !== null);

    return {
      ...vendor,
      shows_assigned: vendorAssignments.length,
      safes_handled: vendorSafes.length,
      total_miles: 0, // Will calculate from distances table if needed
      capacity_utilization: 0, // Will need capacity field or calculate
    };
  });
}

// Safes
export async function getSafes(): Promise<Safe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('safes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSafe(id: string): Promise<SafeWithDetails | null> {
  const supabase = await createClient();
  const { data: safe, error } = await supabase
    .from('safes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!safe) return null;

  // Get vendor
  const vendor = safe.vendor_id ? await getVendor(safe.vendor_id) : null;

  // Get show
  const show = safe.show_id ? await getShow(safe.show_id) : null;

  // Get movements
  const { data: movements } = await supabase
    .from('safe_movements')
    .select('*')
    .eq('safe_id', id)
    .order('movement_date', { ascending: false });

  return {
    ...(safe as Safe),
    vendor: vendor || undefined,
    show: show || undefined,
    movements: (movements || []) as SafeMovement[],
  };
}

// Assignments
export async function getAssignments(): Promise<Assignment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assignments')
    .select('*');

  if (error) throw error;
  return data || [];
}

export async function createAssignment(
  showId: number,
  vendorUuid: string,
  assignedBy: string
): Promise<Assignment> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assignments')
    .insert({
      show_id: showId,
      vendor_uuid: vendorUuid,
      assigned_by: assignedBy,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAssignment(
  id: number,
  updates: Partial<Assignment>
): Promise<Assignment> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Distances
export async function getDistance(
  vendorId: string,
  showId: number
): Promise<Distance | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('distances')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('show_id', showId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // no distance cached yet
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error(
      `Error fetching distance for vendor ${vendorId} and show ${showId}:`,
      error
    );
    return null;
  }
}

export async function createDistance(
  distance: Omit<Distance, 'id' | 'calculated_at'>
): Promise<Distance> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('distances')
    .insert({
      ...distance,
      calculated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Safe Movements
export async function createSafeMovement(
  movement: Omit<SafeMovement, 'id' | 'created_at'>
): Promise<SafeMovement> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('safe_movements')
    .insert({
      ...movement,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update safe
export async function updateSafe(
  id: string,
  updates: Partial<Safe>
): Promise<Safe> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('safes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Shows - mutations
export async function updateShow(
  id: number,
  updates: Partial<Show>
): Promise<Show> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shows')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteShow(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('shows').delete().eq('id', id);

  if (error) throw error;
}
