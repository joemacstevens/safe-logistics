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
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    show_name: show.show_name || '',
    venue_name: show.venue_name || '',
    start_date: show.start_date || '',
    end_date: show.end_date || '',
    notes: show.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openEditModal = () => {
    setFormData({
      show_name: show.show_name || '',
      venue_name: show.venue_name || '',
      start_date: show.start_date || '',
      end_date: show.end_date || '',
      notes: show.notes || '',
    });
    setErrorMessage(null);
    setEditOpen(true);
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);
      const payload = {
        showId: show.id,
        show_name: formData.show_name.trim() || show.show_name,
        venue_name: formData.venue_name || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        notes: formData.notes || null,
      };

      const response = await fetch('/api/show/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update show');
      }

      setEditOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update show:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to update show'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShow = async () => {
    if (deleting) return;
    const confirmed = confirm(
      'Delete this show and all of its assignments? This cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      setErrorMessage(null);
      const response = await fetch('/api/show/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId: show.id }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete show');
      }

      router.push('/timeline');
    } catch (error) {
      console.error('Failed to delete show:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete show'
      );
    } finally {
      setDeleting(false);
    }
  };

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

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link
              href={`/assign-vendor/${show.id}`}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-[0_8px_20px_rgba(19,126,236,0.25)] transition hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-base">local_shipping</span>
              Assign Vendor
            </Link>
            <Link
              href={`/assign-safes/${show.id}`}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/5 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              <span className="material-symbols-outlined text-base">inventory_2</span>
              Assign Safes
            </Link>
            <button
              onClick={openEditModal}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-gray-700 transition hover:bg-white/10 dark:text-gray-200"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Details
            </button>
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
      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-white px-5 py-6 shadow-2xl dark:bg-[#0f1a2a]">
            <div className="flex items-center justify-between pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  Quick Edit
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {show.show_name}
                </h3>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-slate-500 hover:bg-white/20 dark:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMessage && (
              <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
                {errorMessage}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Show Name
                </label>
                <input
                  type="text"
                  value={formData.show_name}
                  onChange={(event) => handleFieldChange('show_name', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Venue
                </label>
                <input
                  type="text"
                  value={formData.venue_name}
                  onChange={(event) => handleFieldChange('venue_name', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date ?? ''}
                    onChange={(event) => handleFieldChange('start_date', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date ?? ''}
                    onChange={(event) => handleFieldChange('end_date', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(event) => handleFieldChange('notes', event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-white text-base font-bold leading-normal transition hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-xl border border-white/20 text-sm font-semibold text-gray-600 hover:bg-white/10 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteShow}
                disabled={deleting}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-red-500/15 text-sm font-semibold text-red-500 transition hover:bg-red-500/25 disabled:opacity-50 dark:text-red-300"
              >
                {deleting ? 'Deleting…' : 'Delete Show'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
