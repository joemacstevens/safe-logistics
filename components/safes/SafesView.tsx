'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Safe } from '@/lib/types';
import { getVendor } from '@/lib/supabase/queries';
import { getShow } from '@/lib/supabase/queries';

interface SafesViewProps {
  safes: Safe[];
  stats: {
    total: number;
    assigned: number;
    inTransit: number;
    stored: number;
  };
}

function getStatusDisplay(status: string | null): { label: string; icon: string; color: string } {
  switch (status) {
    case 'in_transit':
      return {
        label: 'In Transit',
        icon: 'local_shipping',
        color: 'text-blue-600 dark:text-blue-400',
      };
    case 'at_venue':
      return {
        label: 'At Venue',
        icon: 'location_on',
        color: 'text-green-600 dark:text-green-400',
      };
    case 'delivered':
      return {
        label: 'Delivered',
        icon: 'check_circle',
        color: 'text-green-600 dark:text-green-400',
      };
    case 'stored':
    case 'available':
      return {
        label: 'Stored',
        icon: 'inventory_2',
        color: 'text-slate-600 dark:text-slate-400',
      };
    default:
      return {
        label: status || 'Unknown',
        icon: 'help',
        color: 'text-slate-600 dark:text-slate-400',
      };
  }
}

export default function SafesView({ safes, stats }: SafesViewProps) {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredSafes = filter
    ? safes.filter((safe) => safe.status === filter)
    : safes;

  return (
    <main className="flex-1 space-y-6 p-4 pb-24">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-white/5 p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Total Safes
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {stats.total}
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-white/5 p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Assigned
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {stats.assigned}
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-white/5 p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            In Transit
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {stats.inTransit}
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-2 rounded-xl bg-white dark:bg-white/5 p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Stored
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {stats.stored}
          </p>
        </div>
      </div>

      {/* Filter and List Header */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-lg font-bold tracking-[-0.015em] text-gray-900 dark:text-white">
          All Safes
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === null
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('in_transit')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'in_transit'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            In Transit
          </button>
          <button
            onClick={() => setFilter('stored')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'stored'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Stored
          </button>
        </div>
      </div>

      {/* Safes List */}
      <div className="space-y-3">
        {filteredSafes.map((safe) => {
          const statusDisplay = getStatusDisplay(safe.status);
          const safeName = safe.safe_name || safe.safe_serial || `Safe ${safe.id.slice(0, 8)}`;

          return (
            <Link
              key={safe.id}
              href={`/safe/${safe.id}`}
              className="flex items-center gap-4 rounded-xl bg-white dark:bg-white/5 p-4 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex flex-1 flex-col justify-center gap-2.5">
                <div className="flex items-start justify-between">
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {safeName}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`material-symbols-outlined text-base ${statusDisplay.color}`}>
                      {statusDisplay.icon}
                    </span>
                    <span className={statusDisplay.color}>{statusDisplay.label}</span>
                  </div>
                </div>
                {(safe.show_id || safe.vendor_id) && (
                  <div className="space-y-1.5 border-t border-gray-200 dark:border-gray-700 pt-2.5">
                    {safe.show_id && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Next:
                        </span>{' '}
                        Show #{safe.show_id}
                      </p>
                    )}
                    {safe.vendor_id && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Vendor:
                        </p>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-900/50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 dark:text-teal-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                          Vendor ID: {safe.vendor_id.slice(0, 8)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">
                chevron_right
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

