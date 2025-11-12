import { getShowsWithVendors } from '@/lib/supabase/queries';
import TimelineView from '@/components/timeline/TimelineView';
import { haversineDistanceWithTime } from '@/lib/utils/distance';
import { REGION_OPTIONS, stateToRegion } from '@/lib/utils/regions';

type RegionFilter = (typeof REGION_OPTIONS)[number] | 'All';

export default async function TimelinePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = (await searchParams) || {};
  const regionParam = resolvedParams.region;
  const selectedRegion = Array.isArray(regionParam)
    ? regionParam[0]
    : regionParam;
  const normalizedRegion: RegionFilter = REGION_OPTIONS.includes(
    selectedRegion as RegionFilter
  )
    ? (selectedRegion as RegionFilter)
    : 'All';

  const shows = await getShowsWithVendors();

  const filteredShows =
    normalizedRegion !== 'All'
      ? shows.filter((show) => stateToRegion(show.state) === normalizedRegion)
      : shows;

  // Calculate gaps between shows
  const showsWithGaps = filteredShows.map((show, index) => {
    if (index === shows.length - 1) {
      return {
        ...show,
        distance_gap: undefined,
        time_gap: undefined,
        travel_time_minutes: undefined,
      };
    }

    const nextShow = shows[index + 1];
    if (!show.start_date || !nextShow.start_date) {
      return {
        ...show,
        distance_gap: undefined,
        time_gap: undefined,
        travel_time_minutes: undefined,
      };
    }

    // Calculate time gap in days
    const startDate = new Date(show.start_date);
    const nextStartDate = new Date(nextShow.start_date);
    const timeGap = Math.ceil(
      (nextStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let distanceGap: number | undefined;
    let travelTimeMinutes: number | undefined;

    const hasCoordinates =
      typeof show.latitude === 'number' &&
      typeof show.longitude === 'number' &&
      typeof nextShow.latitude === 'number' &&
      typeof nextShow.longitude === 'number';

    if (hasCoordinates) {
      const { distanceMiles, minutes } = haversineDistanceWithTime(
        show.latitude as number,
        show.longitude as number,
        nextShow.latitude as number,
        nextShow.longitude as number
      );
      distanceGap = distanceMiles;
      travelTimeMinutes = minutes;
    }

    return {
      ...show,
      time_gap: timeGap,
      distance_gap: distanceGap,
      travel_time_minutes: travelTimeMinutes,
    };
  });

  return (
    <TimelineView
      shows={showsWithGaps}
      selectedRegion={normalizedRegion}
    />
  );
}
