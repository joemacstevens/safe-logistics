import { getVendorsWithMetrics } from '@/lib/supabase/queries';
import VendorsView from '@/components/vendors/VendorsView';
import { REGION_OPTIONS, stateToRegion } from '@/lib/utils/regions';

type RegionFilter = (typeof REGION_OPTIONS)[number] | 'All';

export default async function VendorsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = (await searchParams) || {};
  const regionParam = resolvedParams.region;
  const selectedRegion = Array.isArray(regionParam)
    ? regionParam[0]
    : regionParam;

  const vendors = await getVendorsWithMetrics();

  const isRegion = (value: unknown): value is (typeof REGION_OPTIONS)[number] =>
    typeof value === 'string' &&
    (REGION_OPTIONS as readonly string[]).includes(value);

  const normalizedRegion: RegionFilter = isRegion(selectedRegion)
    ? selectedRegion
    : 'All';

  const filteredVendors =
    normalizedRegion !== 'All'
      ? vendors.filter((vendor) => {
          const region = stateToRegion(vendor.state);
          return region === normalizedRegion;
        })
      : vendors;

  return (
    <VendorsView vendors={filteredVendors} selectedRegion={normalizedRegion} />
  );
}
