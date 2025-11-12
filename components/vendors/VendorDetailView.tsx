'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Vendor, Show, Safe } from '@/lib/types';
import { getVendorGoogleUrl } from '@/lib/utils/google';

interface VendorDetailViewProps {
  vendor: Vendor;
  shows: Show[];
  safes: Safe[];
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate) return 'Date TBD';
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  if (end && start.getTime() !== end.getTime()) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  
  return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function VendorDetailView({
  vendor,
  shows,
  safes,
}: VendorDetailViewProps) {
  const router = useRouter();

  // Calculate capacity (assuming 10 is max for now, should come from vendor data)
  const maxCapacity = 10;
  const currentCapacity = safes.length;
  const capacityPercent = Math.round((currentCapacity / maxCapacity) * 100);

  return (
    <main className="flex-grow overflow-y-auto pb-40">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 rounded-full bg-primary"></div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            {vendor.name}
          </h1>
        </div>
        <p className="text-base font-normal leading-normal pt-1 text-gray-600 dark:text-gray-400">
          {vendor.city && vendor.state
            ? `Based in ${vendor.city}, ${vendor.state}`
            : vendor.address || 'Location TBD'}
        </p>
        <div className="flex gap-2 pt-4 flex-wrap">
          <a
            href={getVendorGoogleUrl({
              placeId: vendor.place_id,
              name: vendor.name,
              address: vendor.address,
              city: vendor.city,
              state: vendor.state,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-primary hover:bg-primary/10 dark:text-white dark:hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-base">pin_drop</span>
            View in Google Maps
          </a>
        </div>
        <div className="flex gap-2 pt-4 flex-wrap">
          <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/10 dark:bg-primary/20 px-3">
            <p className="text-sm font-medium leading-normal text-primary">
              Active | Capacity {currentCapacity}/{maxCapacity} safes
            </p>
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="p-4 flex flex-col gap-4">
        {/* Metrics Card */}
        <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] pb-3 text-gray-900 dark:text-white">
            Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 rounded-xl bg-gray-100 dark:bg-white/5 p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Shows Assigned
              </p>
              <p className="text-2xl font-bold text-primary">{shows.length}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-gray-100 dark:bg-white/5 p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Safes Assigned
              </p>
              <p className="text-2xl font-bold text-primary">{safes.length}</p>
            </div>
          </div>
        </div>

        {/* Assigned Shows Card */}
        <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] pb-3 text-gray-900 dark:text-white">
            Assigned Shows
          </h3>
          <div className="flex flex-col gap-3">
            {shows.length > 0 ? (
              shows.map((show) => (
                <Link
                  key={show.id}
                  href={`/show/${show.id}`}
                  className="flex items-center gap-4 rounded-xl bg-gray-100 dark:bg-white/5 p-4 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                    <span className="material-symbols-outlined text-primary">event</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {show.show_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {show.city && show.state
                        ? `${show.city}, ${show.state}`
                        : show.venue_name || 'Location TBD'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatDateRange(show.start_date, show.end_date)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 py-2">
                No shows assigned
              </p>
            )}
          </div>
        </div>

        {/* Safes Overview Card */}
        <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] pb-3 text-gray-900 dark:text-white">
            Safes Overview
          </h3>
          <div className="flex flex-col gap-3">
            {safes.length > 0 ? (
              safes.map((safe) => (
                <Link
                  key={safe.id}
                  href={`/safe/${safe.id}`}
                  className="flex items-center gap-4 rounded-xl bg-gray-100 dark:bg-white/5 p-4 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 dark:bg-white/10">
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 text-3xl">
                      safety_check
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {safe.safe_name || safe.safe_serial || `Safe ${safe.id.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {safe.show_id
                        ? `At Show: #${safe.show_id}`
                        : safe.status || 'Status unknown'}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {safe.status === 'in_transit'
                      ? 'In Transit'
                      : safe.status === 'at_venue'
                      ? 'At Venue'
                      : safe.status === 'delivered'
                      ? 'Delivered'
                      : 'Active'}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 py-2">
                No safes assigned
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
