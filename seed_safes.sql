-- Seed data for safes table
-- This inserts 5 safes with various statuses and assignments

INSERT INTO public.safes (
  safe_name,
  safe_serial,
  vendor_id,
  show_id,
  current_location,
  status,
  estimated_arrival,
  last_moved,
  notes,
  created_at,
  updated_at
) VALUES
  (
    'Safe SL-001',
    'SL-001',
    NULL, -- Not assigned to vendor yet
    NULL, -- Not assigned to show yet
    'Main Warehouse, Los Angeles, CA',
    'available',
    NULL,
    NOW(),
    'Primary safe unit, ready for assignment',
    NOW(),
    NOW()
  ),
  (
    'Safe SL-002',
    'SL-002',
    NULL, -- Will need vendor_id if you have vendors
    NULL, -- Will need show_id if you have shows
    'Distribution Center, Las Vegas, NV',
    'stored',
    NULL,
    NOW() - INTERVAL '5 days',
    'Recently serviced and inspected',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'Safe SL-003',
    'SL-003',
    NULL,
    NULL,
    'In Transit - Highway 101',
    'in_transit',
    NOW() + INTERVAL '2 days',
    NOW() - INTERVAL '1 day',
    'En route to next show location',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'Safe SL-004',
    'SL-004',
    NULL,
    NULL,
    'Convention Center, San Francisco, CA',
    'at_venue',
    NULL,
    NOW() - INTERVAL '3 days',
    'Currently at active trade show',
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'Safe SL-005',
    'SL-005',
    NULL,
    NULL,
    'Storage Facility, Phoenix, AZ',
    'stored',
    NULL,
    NOW() - INTERVAL '10 days',
    'Long-term storage, available for assignment',
    NOW() - INTERVAL '120 days',
    NOW() - INTERVAL '10 days'
  )
ON CONFLICT (safe_serial) DO NOTHING;

-- Note: If you have existing vendors or shows, you can update the vendor_id and show_id fields
-- Example to assign a safe to a vendor (replace with actual vendor UUID):
-- UPDATE public.safes SET vendor_id = 'your-vendor-uuid-here' WHERE safe_serial = 'SL-001';

-- Example to assign a safe to a show (replace with actual show ID):
-- UPDATE public.safes SET show_id = 1 WHERE safe_serial = 'SL-001';

