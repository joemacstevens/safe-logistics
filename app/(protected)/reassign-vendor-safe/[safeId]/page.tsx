import { getSafe } from '@/lib/supabase/queries';
import { getVendors } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import ReassignVendorSafeView from '@/components/safes/ReassignVendorSafeView';

export default async function ReassignVendorSafePage({
  params,
}: {
  params: Promise<{ safeId: string }>;
}) {
  const { safeId } = await params;
  const safe = await getSafe(safeId);

  if (!safe) {
    notFound();
  }

  const vendors = await getVendors();

  return (
    <ReassignVendorSafeView
      safe={safe}
      vendors={vendors}
      currentVendorId={safe.vendor_id}
    />
  );
}

