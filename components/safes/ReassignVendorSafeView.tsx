'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SafeWithDetails, Vendor } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/providers/ToastProvider';

interface ReassignVendorSafeViewProps {
  safe: SafeWithDetails;
  vendors: Vendor[];
  currentVendorId: string | null;
}

export default function ReassignVendorSafeView({
  safe,
  vendors,
  currentVendorId,
}: ReassignVendorSafeViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(
    currentVendorId
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const filteredVendors = vendors.filter((vendor) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.city?.toLowerCase().includes(query) ||
      vendor.state?.toLowerCase().includes(query)
    );
  });

  const safeName = safe.safe_name || safe.safe_serial || `Safe ${safe.id.slice(0, 8)}`;

  const handleReassign = async () => {
    if (!selectedVendorId) {
      showToast('Please select a vendor', 'error');
      return;
    }

    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Update safe vendor
      const { error } = await supabase
        .from('safes')
        .update({
          vendor_id: selectedVendorId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', safe.id);

      if (error) throw error;

      // Create movement record
      await supabase.from('safe_movements').insert({
        safe_id: safe.id,
        from_vendor_id: currentVendorId,
        to_vendor_id: selectedVendorId,
        movement_status: 'reassigned',
        movement_date: new Date().toISOString(),
      });

      const selectedVendor = vendors.find((v) => v.iid === selectedVendorId);
      showToast(
        `Safe reassigned to ${selectedVendor?.name || 'vendor'}`,
        'success'
      );

      router.push(`/safe/${safe.id}`);
    } catch (error) {
      console.error('Error reassigning vendor:', error);
      showToast('Failed to reassign vendor. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Header */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between shrink-0 border-b border-white/10 z-20">
        <button
          onClick={() => router.back()}
          className="flex size-12 shrink-0 items-center"
        >
          <span className="material-symbols-outlined text-zinc-500 dark:text-zinc-400" style={{ fontSize: '24px' }}>
            arrow_back
          </span>
        </button>
        <h2 className="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Reassign Vendor
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Safe Info */}
      <header className="shrink-0 bg-background-light dark:bg-background-dark p-4 border-b border-white/10 z-10">
        <div className="text-center">
          <p className="text-black dark:text-white text-base font-bold">
            {safeName}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {safe.status || 'Unknown status'}
          </p>
        </div>
      </header>

      {/* Search */}
      <div className="shrink-0 bg-background-light dark:bg-background-dark p-4 border-b border-white/10">
        <div className="relative">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            style={{ fontSize: '20px' }}
          >
            search
          </span>
          <input
            className="w-full h-12 pl-10 pr-4 rounded-lg bg-zinc-200/70 dark:bg-white/10 border-transparent focus:border-primary focus:ring-primary text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
            placeholder="Search vendors..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => {
            const isSelected = selectedVendorId === vendor.iid;
            const isCurrent = currentVendorId === vendor.iid;

            return (
              <div
                key={vendor.iid}
                onClick={() => setSelectedVendorId(vendor.iid)}
                className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-slate-100 dark:bg-white/5 border-2 border-transparent hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded border-2 ${
                  isSelected
                    ? 'bg-primary border-primary'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {isSelected && (
                    <span className="material-symbols-outlined text-white text-sm">
                      check
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {vendor.name}
                    </p>
                    {isCurrent && (
                      <span className="text-xs font-medium text-primary">
                        (Current)
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {vendor.city && vendor.state
                      ? `${vendor.city}, ${vendor.state}`
                      : vendor.address || 'Location TBD'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-slate-600 dark:text-slate-400 py-4 text-center">
            {searchQuery ? 'No vendors found matching your search' : 'No vendors available'}
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="shrink-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm p-4 border-t border-white/10 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-20">
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex flex-1 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-zinc-200 dark:bg-white/10 text-black dark:text-white text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Cancel</span>
          </button>
          <button
            onClick={handleReassign}
            disabled={!selectedVendorId || loading || selectedVendorId === currentVendorId}
            className="flex flex-1 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {loading
                ? 'Reassigning...'
                : selectedVendorId && selectedVendorId !== currentVendorId
                ? `Reassign to ${vendors.find((v) => v.iid === selectedVendorId)?.name || 'Vendor'}`
                : 'Select a Vendor'}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}

