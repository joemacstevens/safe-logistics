'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ShowWithVendor } from '@/lib/types';
import DropdownMenu from '@/components/ui/DropdownMenu';
import { REGION_OPTIONS, stateToRegion } from '@/lib/utils/regions';
import type { Region } from '@/lib/utils/regions';

interface TimelineViewProps {
  shows: (ShowWithVendor & {
    distance_gap?: number;
    time_gap?: number;
    travel_time_minutes?: number;
  })[];
  selectedRegion?: string | null;
}

const DEFAULT_TIMELINE_COLOR = '#64748b';

const REGION_COLORS: Record<Region, string> = {
  Northeast: '#6366f1',
  Midwest: '#0ea5e9',
  South: '#f97316',
  West: '#22c55e',
};

function getTimelineColor(show: ShowWithVendor): string {
  const hasSafesAssigned = !!(show.safes && show.safes.length > 0);
  if (!hasSafesAssigned) {
    return DEFAULT_TIMELINE_COLOR;
  }

  const region = stateToRegion(show.state);
  if (!region) {
    return DEFAULT_TIMELINE_COLOR;
  }

  return REGION_COLORS[region];
}

function hexToRgb(hex: string) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate) return 'Date TBD';

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (end && start.getTime() !== end.getTime()) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  return start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTravelTime(minutes?: number): string | null {
  if (minutes === undefined) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
  }

  return `${remainingMinutes}m`;
}

export default function TimelineView({ shows, selectedRegion }: TimelineViewProps) {
  const router = useRouter();

  const handleRegionChange = (region: string) => {
    const query =
      region === 'All' ? '/timeline' : `/timeline?region=${encodeURIComponent(region)}`;
    router.push(query);
  };

  return (
    <main className="relative flex-grow bg-background-light dark:bg-background-dark px-4 pb-32 pt-6 text-slate-900 dark:text-white sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
            Timeline
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trade Shows</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-500 dark:bg-white/10 dark:text-slate-300 sm:text-sm">
          <span>Region</span>
          <div className="flex gap-1 rounded-full bg-white/10 p-1 dark:bg-white/20">
            {['All', ...REGION_OPTIONS].map((region) => (
              <button
                key={region}
                onClick={() => handleRegionChange(region)}
                className={`rounded-full px-3 py-1 font-semibold ${
                  selectedRegion === region || (!selectedRegion && region === 'All')
                    ? 'bg-primary text-white shadow'
                    : 'text-slate-300 hover:bg-white/20 dark:text-white'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl">
        <div className="absolute left-6 top-12 bottom-12 hidden w-px bg-slate-200 dark:bg-slate-800 lg:block" />

        <div className="space-y-8">
          {shows.map((show, index) => {
            const timelineColor = getTimelineColor(show);
            const nextShow = shows[index + 1];
            const hasGap =
              nextShow &&
              (show.time_gap !== undefined ||
                show.distance_gap !== undefined ||
                show.travel_time_minutes !== undefined);
            const travelTimeLabel = formatTravelTime(show.travel_time_minutes);

            return (
              <div key={show.id} className="relative">
                <div className="relative grid grid-cols-[48px_1fr] gap-4">
                  <div className="flex flex-col items-center">
                    <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background-light dark:bg-background-dark">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full shadow-inner"
                        style={{
                          backgroundColor: withAlpha(timelineColor, 0.2),
                          color: timelineColor,
                        }}
                      >
                        <span className="material-symbols-outlined text-lg">event</span>
                      </div>
                    </div>
                    {hasGap && (
                      <div
                        className="h-full w-[6px] rounded-full"
                        style={{
                          backgroundColor: timelineColor,
                          boxShadow: `0 0 18px ${withAlpha(timelineColor, 0.45)}`,
                        }}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        {show.show_name && (
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {show.show_name}
                          </h3>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDateRange(show.start_date, show.end_date)}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {show.city && show.state
                            ? `${show.city}, ${show.state}`
                            : show.venue_address || 'Location TBD'}
                          {show.venue_name && ` • ${show.venue_name}`}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {show.safes && show.safes.length > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              <span className="material-symbols-outlined text-sm">inventory_2</span>
                              {show.safes.length} Safe{show.safes.length !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              <span className="material-symbols-outlined text-sm">inventory_2</span>
                              No Safe Assigned
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu
                        trigger={<span className="material-symbols-outlined text-xl">more_vert</span>}
                        items={[
                          {
                            label: 'Assign Safes',
                            icon: 'inventory_2',
                            onClick: () => router.push(`/assign-safes/${show.id}`),
                          },
                          {
                            label: 'View Details',
                            icon: 'page_info',
                            onClick: () => router.push(`/show/${show.id}`),
                          },
                          {
                            label: 'View on Map',
                            icon: 'map',
                            onClick: () => router.push(`/map?show=${show.id}`),
                          },
                        ]}
                      />
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800"></div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/show/${show.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20"
                      >
                        <span className="material-symbols-outlined text-base">page_info</span>
                        View Details
                      </Link>
                      <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20">
                        <span className="material-symbols-outlined text-base">map</span>
                        View on Map
                      </button>
                    </div>
                  </div>
                </div>

                {hasGap && nextShow && (
                  <div className="relative mt-3 grid grid-cols-[48px_1fr] gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="h-full w-[6px] rounded-full"
                        style={{
                          backgroundColor: timelineColor,
                          boxShadow: `0 0 18px ${withAlpha(timelineColor, 0.45)}`,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3 py-3 pl-2">
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: timelineColor,
                        }}
                      />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {[
                          show.time_gap !== undefined
                            ? `🕒 ${show.time_gap} day${show.time_gap !== 1 ? 's' : ''} later`
                            : null,
                          show.distance_gap !== undefined
                            ? `🚚 ${show.distance_gap.toFixed(1)} miles`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
