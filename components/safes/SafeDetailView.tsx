'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { SafeWithDetails } from '@/lib/types';
import { useToast } from '@/components/providers/ToastProvider';

interface SafeDetailViewProps {
  safe: SafeWithDetails;
}

const statusBadgeStyles: Record<
  string,
  { label: string; classes: string }
> = {
  in_transit: { label: 'In Transit', classes: 'bg-sky-500/20 text-sky-200' },
  at_venue: { label: 'At Venue', classes: 'bg-emerald-500/20 text-emerald-200' },
  delivered: { label: 'Delivered', classes: 'bg-emerald-500/20 text-emerald-200' },
  stored: { label: 'Stored', classes: 'bg-slate-500/20 text-slate-200' },
  available: { label: 'Available', classes: 'bg-slate-500/20 text-slate-200' },
};

function formatDate(dateString: string | null): string {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SafeDetailView({ safe }: SafeDetailViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const safeName =
    safe.safe_name || safe.safe_serial || `Safe ${safe.id.slice(0, 8)}`;

  const statusStyles =
    statusBadgeStyles[safe.status ?? ''] ??
    statusBadgeStyles.available;

  const handleMarkDelivered = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/safe/mark-delivered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safeId: safe.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as delivered');
      }

      showToast('Safe marked as delivered', 'success');
      router.refresh();
    } catch (error) {
      console.error('Error marking safe as delivered:', error);
      showToast('Failed to mark safe as delivered. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-background-light dark:bg-background-dark px-4 py-6 text-text-primary-light dark:text-text-primary-dark">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-text-secondary-light dark:text-text-secondary-dark">
            Safe Detail
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {safeName}
          </h1>
        </div>
        <button
          onClick={() => router.back()}
          className="flex size-11 items-center justify-center rounded-full bg-card-light dark:bg-card-dark shadow-sm hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${statusStyles.classes}`}
        >
          <span className="material-symbols-outlined text-base">local_shipping</span>
          {statusStyles.label}
        </span>
        {safe.vendor && (
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/25 px-4 py-1.5 text-sm font-semibold text-purple-100">
            <span className="material-symbols-outlined text-base">shield</span>
            {safe.vendor.name}
          </span>
        )}
      </div>

      <section className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark px-5 py-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Journey Summary</h2>
        <div className="mt-4 space-y-4 text-sm">
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Origin</p>
            <p className="text-right text-gray-900 dark:text-white">
              {safe.current_location || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Current Location</p>
            <p className="text-right text-gray-900 dark:text-white">
              {safe.current_location
                ? `Last seen: ${formatDate(safe.last_moved)}`
                : 'Unknown'}
            </p>
          </div>
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Next Destination</p>
            <p className="text-right text-gray-900 dark:text-white">
              {safe.show
                ? `${safe.show.show_name || 'Show'} • ${
                    safe.show.venue_name || safe.show.city || 'TBD'
                  }`
                : 'No destination assigned'}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">ETA</p>
            <p className="text-right text-gray-900 dark:text-white">{formatDate(safe.estimated_arrival)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark px-5 py-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Movement History</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {safe.movements && safe.movements.length > 0 ? (
            safe.movements.map((movement) => (
              <li
                key={movement.id}
                className="flex items-start gap-4 border-t border-border-light dark:border-border-dark pt-4 first:border-t-0 first:pt-0"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-background-light dark:bg-background-dark text-primary">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {movement.movement_status === 'in_transit'
                      ? 'In transit'
                      : movement.movement_status || 'Movement'}
                  </p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {formatDate(movement.movement_date)}
                  </p>
                  {movement.notes && (
                    <p className="mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">{movement.notes}</p>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="text-sm text-text-secondary-light dark:text-text-secondary-dark">No movement history available.</li>
          )}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-border-light dark:border-border-dark bg-card-light/95 dark:bg-card-dark/95 px-4 pb-8 pt-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.2)] backdrop-blur">
        <div className="grid gap-3">
          <Link
            href={`/assign-safe-to-show/${safe.id}`}
            className="flex h-12 items-center justify-center rounded-lg bg-primary text-base font-semibold text-white hover:bg-primary/90"
          >
            {safe.show ? 'Change Show Assignment' : 'Assign to Show'}
          </Link>
          <button
            onClick={handleMarkDelivered}
            disabled={loading || safe.status === 'delivered'}
            className="flex h-12 items-center justify-center rounded-lg bg-status-delivered text-base font-semibold text-white transition hover:bg-status-delivered/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Marking...'
              : safe.status === 'delivered'
              ? 'Already Delivered'
              : 'Mark Delivered'}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/reassign-vendor-safe/${safe.id}`}
              className="flex h-11 items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/30 text-sm font-semibold text-primary hover:bg-primary/30 dark:hover:bg-primary/40"
            >
              Reassign Vendor
            </Link>
            <button
              onClick={() => router.push(`/map?safe=${safe.id}`)}
              className="flex h-11 items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/30 text-sm font-semibold text-primary hover:bg-primary/30 dark:hover:bg-primary/40"
            >
              View on Map
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
