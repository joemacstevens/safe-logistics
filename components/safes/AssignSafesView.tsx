'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Show, Safe } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/providers/ToastProvider';

interface AssignSafesViewProps {
  show: Show;
  assignedSafes: Safe[];
  unassignedSafes: Safe[];
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate) return 'Date TBD';
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  if (end && start.getTime() !== end.getTime()) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  
  return start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AssignSafesView({
  show,
  assignedSafes,
  unassignedSafes,
}: AssignSafesViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedSafes, setSelectedSafes] = useState<Set<string>>(
    new Set(assignedSafes.map((s) => s.id))
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const filteredUnassigned = unassignedSafes.filter((safe) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      safe.safe_name?.toLowerCase().includes(query) ||
      safe.safe_serial?.toLowerCase().includes(query) ||
      safe.id.toLowerCase().includes(query)
    );
  });

  const toggleSafe = (safeId: string) => {
    setSelectedSafes((prev) => {
      const next = new Set(prev);
      if (next.has(safeId)) {
        next.delete(safeId);
      } else {
        next.add(safeId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get currently assigned safes
      const currentlyAssigned = new Set(assignedSafes.map((s) => s.id));

      // Safes to assign (in selected but not currently assigned)
      const toAssign = Array.from(selectedSafes).filter(
        (id) => !currentlyAssigned.has(id)
      );

      // Safes to unassign (currently assigned but not in selected)
      const toUnassign = Array.from(currentlyAssigned).filter(
        (id) => !selectedSafes.has(id)
      );

      // Assign safes
      for (const safeId of toAssign) {
        const { error } = await supabase
          .from('safes')
          .update({
            show_id: show.id,
            status: 'assigned',
            updated_at: new Date().toISOString(),
          })
          .eq('id', safeId);

        if (error) throw error;

        // Create movement record
        await supabase.from('safe_movements').insert({
          safe_id: safeId,
          to_show_id: show.id,
          movement_status: 'assigned',
          movement_date: new Date().toISOString(),
        });
      }

      // Unassign safes
      for (const safeId of toUnassign) {
        const { error } = await supabase
          .from('safes')
          .update({
            show_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', safeId);

        if (error) throw error;
      }

      showToast(
        `Successfully ${toAssign.length > 0 ? `assigned ${toAssign.length} safe(s)` : ''} ${toUnassign.length > 0 ? `unassigned ${toUnassign.length} safe(s)` : ''}`,
        'success'
      );

      router.push(`/show/${show.id}`);
    } catch (error) {
      console.error('Error assigning safes:', error);
      showToast('Failed to assign safes. Please try again.', 'error');
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
          Assign Safes
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Show Info */}
      <header className="shrink-0 bg-background-light dark:bg-background-dark p-4 border-b border-white/10 z-10">
        <div className="text-center">
          <p className="text-black dark:text-white text-base font-bold">
            {show.show_name}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {formatDateRange(show.start_date, show.end_date)}
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
            placeholder="Search safes..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Currently Assigned */}
        {assignedSafes.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              Currently Assigned ({assignedSafes.length})
            </h3>
            <div className="space-y-2">
              {assignedSafes.map((safe) => {
                const safeName = safe.safe_name || safe.safe_serial || `Safe ${safe.id.slice(0, 8)}`;
                const isSelected = selectedSafes.has(safe.id);

                return (
                  <div
                    key={safe.id}
                    onClick={() => toggleSafe(safe.id)}
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
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {safeName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {safe.status || 'Unknown status'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Safes */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            Available Safes ({filteredUnassigned.length})
          </h3>
          {filteredUnassigned.length > 0 ? (
            <div className="space-y-2">
              {filteredUnassigned.map((safe) => {
                const safeName = safe.safe_name || safe.safe_serial || `Safe ${safe.id.slice(0, 8)}`;
                const isSelected = selectedSafes.has(safe.id);

                return (
                  <div
                    key={safe.id}
                    onClick={() => toggleSafe(safe.id)}
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
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {safeName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {safe.status || 'Unknown status'}
                        {safe.current_location && ` • ${safe.current_location}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 py-4">
              {searchQuery ? 'No safes found matching your search' : 'No available safes'}
            </p>
          )}
        </div>
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
            onClick={handleSave}
            disabled={loading}
            className="flex flex-1 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {loading
                ? 'Saving...'
                : `Save (${selectedSafes.size} selected)`}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}

