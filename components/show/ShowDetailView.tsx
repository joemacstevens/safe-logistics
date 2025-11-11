'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Show, Vendor, Safe } from '@/lib/types';

interface ShowDetailViewProps {
  show: Show;
  vendor: Vendor | null;
  safes: Safe[];
  assignmentId?: number;
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate) return 'Date TBD';
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  if (end && start.getTime() !== end.getTime()) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  
  return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusLabel(status: string | null): string {
  if (!status) return 'Unknown';
  const statusMap: Record<string, string> = {
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'in_transit': 'In Transit',
    'at_venue': 'At Venue',
    'delivered': 'Delivered',
    'stored': 'Stored',
    'available': 'Available',
  };
  return statusMap[status.toLowerCase()] || status;
}

export default function ShowDetailView({
  show,
  vendor,
  safes,
  assignmentId,
}: ShowDetailViewProps) {
  const router = useRouter();
  const [notesExpanded, setNotesExpanded] = useState(true);

  return (
    <div className="fixed inset-0 flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-[#212529] dark:text-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button
          onClick={() => router.back()}
          aria-label="Close"
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Show Details
        </h2>
        <div className="flex w-10 items-center justify-end"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-40">
        {/* Show Information */}
        <div className="px-4 pt-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 rounded-full bg-primary shrink-0"></div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              {show.show_name}
            </h1>
          </div>
          <p className="text-base font-normal leading-normal pt-1 text-gray-600 dark:text-gray-400">
            {show.venue_name || 'Venue TBD'}
          </p>
          <div className="flex gap-2 pt-4 flex-wrap">
            <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/10 dark:bg-primary/20 px-3">
              <p className="text-sm font-medium leading-normal text-primary">
                {formatDateRange(show.start_date, show.end_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="p-4 flex flex-col gap-4">
          {/* Vendor Section */}
          <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] pb-2 text-gray-900 dark:text-white">
                Vendor
              </h3>
              {vendor ? (
                <Link
                  href={`/vendor/${vendor.iid}`}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{vendor.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vendor.city && vendor.state
                        ? `Based in ${vendor.city}, ${vendor.state}`
                        : vendor.address
                        ? `Based in ${vendor.address}`
                        : 'Location TBD'}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">
                    chevron_right
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5">
                    <span className="material-symbols-outlined text-gray-400">local_shipping</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-600 dark:text-gray-400">No vendor assigned</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Safes Section */}
          <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] pb-2 text-gray-900 dark:text-white">
                Assigned Safes
              </h3>
              {safes.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {safes.map((safe) => (
                    <Link
                      key={safe.id}
                      href={`/safe/${safe.id}`}
                      className="flex items-center gap-4 rounded-xl bg-gray-100 dark:bg-white/5 p-3 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                        <span className="material-symbols-outlined text-primary text-xl">safety_check</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {safe.safe_name || safe.safe_serial || `Safe #${safe.id.slice(0, 3)}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status: {getStatusLabel(safe.status)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No safes assigned to this show
                </p>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] pb-2 text-gray-900 dark:text-white">
                Actions
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    // TODO: Implement edit show functionality
                    console.log('Edit show', show.id);
                  }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary/20 text-primary text-base font-bold leading-normal transition-colors hover:bg-primary/30"
                >
                  <span className="material-symbols-outlined">edit</span>
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement delete show functionality
                    if (confirm('Are you sure you want to delete this show?')) {
                      console.log('Delete show', show.id);
                    }
                  }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500/20 text-red-500 dark:bg-red-500/20 dark:text-red-400 text-base font-bold leading-normal transition-colors hover:bg-red-500/30 dark:hover:bg-red-500/30"
                >
                  <span className="material-symbols-outlined">delete</span>
                  <span>Delete Show</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm">
            <div className="p-4">
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">
                  Notes
                </h3>
                <button
                  onClick={() => setNotesExpanded(!notesExpanded)}
                  className="text-gray-500 dark:text-gray-400"
                >
                  <span className="material-symbols-outlined">
                    {notesExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>
              {notesExpanded && (
                <p className="text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
                  {show.notes || 'No notes available for this show.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex flex-col gap-3">
          <Link
            href={`/assign-vendor/${show.id}`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-white text-base font-bold leading-normal transition-colors hover:bg-primary/90"
          >
            <span className="material-symbols-outlined">assignment_turned_in</span>
            <span>Assign to Vendor</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

