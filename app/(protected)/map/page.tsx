import MapView from '@/components/map/MapView';
import { getShow } from '@/lib/supabase/queries';
import { getSafe } from '@/lib/supabase/queries';
import { getVendor } from '@/lib/supabase/queries';

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; safe?: string; vendor?: string }>;
}) {
  const params = await searchParams;
  let show = null;
  let safe = null;
  let vendor = null;

  if (params.show) {
    const showId = parseInt(params.show);
    if (!isNaN(showId)) {
      show = await getShow(showId);
    }
  }

  if (params.safe) {
    safe = await getSafe(params.safe);
  }

  if (params.vendor) {
    vendor = await getVendor(params.vendor);
  }

  return <MapView show={show} safe={safe} vendor={vendor} />;
}

