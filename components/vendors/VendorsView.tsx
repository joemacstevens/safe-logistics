'use client';

import Link from 'next/link';
import type { VendorWithMetrics } from '@/lib/types';

interface VendorsViewProps {
  vendors: VendorWithMetrics[];
}

export default function VendorsView({ vendors }: VendorsViewProps) {
  return (
    <main className="flex-1 space-y-6 p-4 pb-24">
      <div className="space-y-3">
        {vendors.map((vendor) => (
          <Link
            key={vendor.iid}
            href={`/vendor/${vendor.iid}`}
            className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-800/50 p-4 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
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

