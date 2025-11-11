import { getShow } from '@/lib/supabase/queries';
import { getVendors } from '@/lib/supabase/queries';
import { getSafes } from '@/lib/supabase/queries';
import { getDistance } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import VendorAssignmentView from '@/components/vendor-assignment/VendorAssignmentView';

export default async function AssignVendorPage({
  params,
}: {
  params: Promise<{ showId: string }>;
}) {
  const { showId } = await params;
  const showIdNum = parseInt(showId);

  if (isNaN(showIdNum)) {
    notFound();
  }

  const show = await getShow(showIdNum);
  if (!show) {
    notFound();
  }

  const vendors = await getVendors();
  const allSafes = await getSafes();

  // Get distances for each vendor
  const vendorsWithDistances = await Promise.all(
    vendors.map(async (vendor) => {
      const distance = await getDistance(vendor.iid, showIdNum);
      return {
        vendor,
        distance: distance || null,
      };
    })
  );

  return (
    <VendorAssignmentView
      show={show}
      vendorsWithDistances={vendorsWithDistances}
      allSafes={allSafes}
    />
  );
}

