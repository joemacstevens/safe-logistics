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

  const normalizedRegion: RegionFilter = REGION_OPTIONS.includes(
    selectedRegion as RegionFilter
  )
    ? (selectedRegion as RegionFilter)
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
