'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { VendorWithMetrics } from '@/lib/types';
import { REGION_OPTIONS } from '@/lib/utils/regions';
import { getVendorGoogleUrl } from '@/lib/utils/google';

interface VendorsViewProps {
  vendors: VendorWithMetrics[];
  selectedRegion?: string | null;
}

export default function VendorsView({ vendors, selectedRegion }: VendorsViewProps) {
  const router = useRouter();

  const handleRegionChange = (region: string) => {
    const target =
      region === 'All' ? '/vendors' : `/vendors?region=${encodeURIComponent(region)}`;
    router.push(target);
  };

  return (
    <main className="flex-1 space-y-6 p-4 pb-24">
      <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
            Vendors
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Logistics Partners
          </h1>
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
      <div className="space-y-3">
        {vendors.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-300">
            No vendors found for this region.
          </div>
        )}
        {vendors.map((vendor) => (
          <Link
            key={vendor.iid}
            href={getVendorGoogleUrl({
              placeId: vendor.place_id,
              name: vendor.name,
              address: vendor.address,
              city: vendor.city,
              state: vendor.state,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-800/50 p-4 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl">
                local_shipping
              </span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 dark:text-white">
                {vendor.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {vendor.city && vendor.state
                  ? `${vendor.city}, ${vendor.state}`
                  : vendor.address || 'Location TBD'}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {vendor.shows_assigned || 0} show
                  {vendor.shows_assigned !== 1 ? 's' : ''}
                </span>
                <span>
                  {vendor.safes_handled || 0} safe
                  {vendor.safes_handled !== 1 ? 's' : ''}
                </span>
                {vendor.total_miles !== undefined && vendor.total_miles > 0 && (
                  <span>{Math.round(vendor.total_miles)} miles</span>
                )}
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400">
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
