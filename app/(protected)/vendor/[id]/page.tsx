import { getVendor } from '@/lib/supabase/queries';
import { getAssignments } from '@/lib/supabase/queries';
import { getShows } from '@/lib/supabase/queries';
import { getSafes } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import VendorDetailView from '@/components/vendors/VendorDetailView';

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = await getVendor(id);

  if (!vendor) {
    notFound();
  }

  // Get assigned shows
  const assignments = await getAssignments();
  const vendorAssignments = assignments.filter(
    (a) => a.vendor_uuid === vendor.iid
  );
  const allShows = await getShows();
  const assignedShows = allShows.filter((show) =>
    vendorAssignments.some((a) => a.show_id === show.id)
  );

  // Get assigned safes
  const allSafes = await getSafes();
  const vendorSafes = allSafes.filter((safe) => safe.vendor_id === vendor.iid);

  return (
    <VendorDetailView
      vendor={vendor}
      shows={assignedShows}
      safes={vendorSafes}
    />
  );
}

