import { getVendorsWithMetrics } from '@/lib/supabase/queries';
import VendorsView from '@/components/vendors/VendorsView';

export default async function VendorsPage() {
  const vendors = await getVendorsWithMetrics();

  return <VendorsView vendors={vendors} />;
}

