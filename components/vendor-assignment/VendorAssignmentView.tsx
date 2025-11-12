'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Show, Vendor, Distance, Safe } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { calculateVendorCapacity } from '@/lib/utils/vendor-capacity';

interface VendorAssignmentViewProps {
  show: Show;
  vendorsWithDistances: Array<{
    vendor: Vendor;
    distance: Distance | null;
  }>;
  allSafes: Safe[];
}

const capacityBadgeByStatus: Record<
  ReturnType<typeof calculateVendorCapacity>['status'],
  string
> = {
  available: 'bg-emerald-500/15 text-emerald-200',
  'near-capacity': 'bg-amber-500/20 text-amber-200',
  full: 'bg-rose-500/15 text-rose-200',
};

const viewTabs: Array<{ id: 'list' | 'map'; label: string }> = [
  { id: 'list', label: 'List View' },
  { id: 'map', label: 'Map View' },
];

export default function VendorAssignmentView({
  show,
  vendorsWithDistances,
  allSafes,
}: VendorAssignmentViewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(15);

  // Reset display count when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setDisplayCount(15);
  };

  // Sort vendors by distance (closest first), then filter
  const sortedAndFilteredVendors = useMemo(() => {
    let vendors = [...vendorsWithDistances];
    
    // Sort by distance (closest first, vendors without distance go to end)
    vendors.sort((a, b) => {
      const distA = a.distance?.distance_miles;
      const distB = b.distance?.distance_miles;
      
      // If both have distances, sort by distance
      if (distA !== undefined && distB !== undefined) {
        return distA - distB;
      }
      // If only A has distance, A comes first
      if (distA !== undefined && distB === undefined) return -1;
      // If only B has distance, B comes first
      if (distA === undefined && distB !== undefined) return 1;
      // If neither has distance, maintain original order
      return 0;
    });
    
    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      vendors = vendors.filter(({ vendor }) => {
        return (
          vendor.name.toLowerCase().includes(query) ||
          vendor.city?.toLowerCase().includes(query) ||
          vendor.state?.toLowerCase().includes(query)
        );
      });
    }
    
    return vendors;
  }, [vendorsWithDistances, searchQuery]);

  // Get vendors to display (paginated)
  const displayedVendors = useMemo(() => {
    return sortedAndFilteredVendors.slice(0, displayCount);
  }, [sortedAndFilteredVendors, displayCount]);

  const hasMore = sortedAndFilteredVendors.length > displayCount;

  const handleAssignVendor = async () => {
    if (!selectedVendor) return;

    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error: assignmentError } = await supabase
        .from('assignments')
        .upsert({
          show_id: show.id,
          vendor_uuid: selectedVendor,
          assigned_by: user.email || user.id,
          status: 'active',
        });

      if (assignmentError) throw assignmentError;

      const vendorData = sortedAndFilteredVendors.find(
        (entry) => entry.vendor.iid === selectedVendor
      );

      if (
        vendorData &&
        !vendorData.distance &&
        show.latitude &&
        show.longitude
      ) {
        try {
          const response = await fetch('/api/calculate-distance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vendorId: selectedVendor,
              showId: show.id,
            }),
          });

          if (response.ok) {
            const routeResult = await response.json();
            await fetch('/api/create-distance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                vendor_id: selectedVendor,
                show_id: show.id,
                distance_miles: routeResult.distance_miles,
                travel_time_minutes: routeResult.travel_time_minutes,
                route_summary: routeResult.route_summary,
              }),
            });
          }
        } catch (error) {
          console.error('Error calculating distance:', error);
        }
      }

      router.push(`/show/${show.id}`);
    } catch (error) {
      console.error('Error assigning vendor:', error);
      alert('Failed to assign vendor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (start: string | null, end: string | null) => {
    if (!start) return 'Date TBD';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;
    if (endDate && startDate.getTime() !== endDate.getTime()) {
      return `${startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} – ${endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
    return startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDistance = (distance: Distance | null) => {
    if (!distance) return null;
    const totalMinutes =
      distance.travel_time_minutes ?? distance.travel_time_minutes_est ?? 0;
    return {
      miles: Math.round(distance.distance_miles),
      minutes: totalMinutes,
      hours: Math.floor(totalMinutes / 60),
      remainingMinutes: totalMinutes % 60,
    };
  };

  const heroLocation =
    (show.city && show.state && `${show.city}, ${show.state}`) ||
    show.venue_address ||
    'Location TBD';

  const selectedVendorEntry = selectedVendor
    ? sortedAndFilteredVendors.find(
        (entry) => entry.vendor.iid === selectedVendor
      )
    : undefined;
  const selectedVendorDistance = selectedVendorEntry
    ? formatDistance(selectedVendorEntry.distance ?? null)
    : null;
  const hasSelection = Boolean(selectedVendor);

  return (
    <div className="flex h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#212529] dark:text-gray-200">
      {/* Header / Hero */}
      <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 px-4 pb-5 pt-5 bg-background-light dark:bg-background-dark">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex size-12 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500 dark:text-gray-400">
              Assign Vendor
            </p>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {show.show_name || show.venue_name}
            </h1>
          </div>
          <div className="flex size-12 items-center justify-center rounded-full">
            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">more_horiz</span>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{formatDateRange(show.start_date, show.end_date)}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{heroLocation}</p>
          {show.venue_name && (
            <p className="mt-1 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500">
              {show.venue_name}
            </p>
          )}
        </div>
      </header>

      {/* View toggle */}
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-background-light dark:bg-background-dark">
        <div className="flex rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-white/5 p-1">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                viewMode === tab.id
                  ? 'bg-primary text-white shadow-[0_5px_20px_rgba(19,126,236,0.4)]'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search (list view) */}
      {viewMode === 'list' && (
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-4 bg-background-light dark:bg-background-dark">
          <label className="flex h-12 items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 px-4 text-sm">
            <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">
              search
            </span>
            <input
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none"
              placeholder="Search vendor name or city..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <span className="material-symbols-outlined text-gray-500 dark:text-gray-500">
              swap_vert
            </span>
          </label>
        </div>
      )}

      {/* Map view */}
      {viewMode === 'map' && (
        <main
          className={`flex-1 overflow-y-auto ${
            hasSelection ? 'pb-32' : ''
          }`}
        >
          <div className="relative h-[60vh]">
            <div className="absolute inset-0 flex items-center justify-center rounded-b-3xl border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              Interactive map coming soon
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark py-4">
            <div className="flex snap-x gap-4 overflow-x-auto px-4 pb-2">
              {displayedVendors.map(({ vendor, distance }) => {
                const isSelected = selectedVendor === vendor.iid;
                const dist = formatDistance(distance);
                const capacity = calculateVendorCapacity(vendor, allSafes);
                return (
                  <div
                    key={vendor.iid}
                    className={`flex min-w-[18rem] snap-start flex-col rounded-2xl border bg-white dark:bg-white/5 p-4 ${
                      isSelected
                        ? 'border-primary/60 ring-2 ring-primary/40'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{vendor.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {vendor.city && vendor.state
                        ? `${vendor.city}, ${vendor.state}`
                        : vendor.address || 'Location TBD'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {dist
                        ? `${dist.miles} miles • ${dist.minutes} min`
                        : 'Distance pending'}
                    </p>
                    <span
                      className={`mt-3 inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${capacityBadgeByStatus[capacity.status]}`}
                    >
                      Capacity {capacity.currentSafes}/{capacity.maxCapacity}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedVendor(isSelected ? null : vendor.iid)
                      }
                      className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <main
          className={`flex-1 space-y-4 overflow-y-auto bg-background-light dark:bg-background-dark px-4 pt-4 ${
            hasSelection ? 'pb-32' : 'pb-24'
          }`}
        >
          {displayedVendors.map(({ vendor, distance }) => {
            const isSelected = selectedVendor === vendor.iid;
            const dist = formatDistance(distance);
            const capacity = calculateVendorCapacity(vendor, allSafes);

            return (
              <div
                key={vendor.iid}
                className={`flex flex-col gap-3 rounded-2xl border bg-white dark:bg-white/5 p-4 transition ${
                  isSelected
                    ? 'border-primary/60 shadow-[0_12px_40px_rgba(19,126,236,0.25)]'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{vendor.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {vendor.city && vendor.state
                      ? `${vendor.city}, ${vendor.state}`
                      : vendor.address || 'Location TBD'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                  {dist && (
                    <>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-white/5 px-3 py-1">
                        <span className="material-symbols-outlined text-sm">
                          distance
                        </span>
                        {dist.miles} miles
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-white/5 px-3 py-1">
                        <span className="material-symbols-outlined text-sm">
                          schedule
                        </span>
                        {dist.hours > 0 && `${dist.hours}h `}
                        {dist.remainingMinutes}m
                      </span>
                    </>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${capacityBadgeByStatus[capacity.status]}`}
                  >
                    Capacity {capacity.currentSafes}/{capacity.maxCapacity}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSelectedVendor(isSelected ? null : vendor.iid)
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    isSelected ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Assign Vendor'}
                </button>
              </div>
            );
          })}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setDisplayCount(displayCount + 15)}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-white/5 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-base">expand_more</span>
                Load More ({sortedAndFilteredVendors.length - displayCount} remaining)
              </button>
            </div>
          )}
        </main>
      )}

      <footer
        className={`fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-4 transition-all duration-300 ease-out backdrop-blur dark:border-gray-800 dark:bg-[#050e1a]/95 ${
          hasSelection
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
          <div className="flex flex-col text-sm text-gray-600 dark:text-gray-300">
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              {selectedVendorEntry?.vendor.name || 'Select a vendor'}
            </span>
            <span>
              {selectedVendorDistance
                ? `${selectedVendorDistance.miles} miles • ${
                    selectedVendorDistance.hours
                      ? `${selectedVendorDistance.hours}h `
                      : ''
                  }${selectedVendorDistance.remainingMinutes}m`
                : hasSelection
                ? 'Distance pending'
                : 'Choose a vendor to continue'}
            </span>
          </div>
          <button
            onClick={handleAssignVendor}
            disabled={!hasSelection || loading}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-[0_10px_30px_rgba(19,126,236,0.35)] transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Assigning...'
              : hasSelection
              ? `Assign ${selectedVendorEntry?.vendor.name || 'Vendor'}`
              : 'Assign Vendor'}
          </button>
        </div>
      </footer>
    </div>
  );
}
