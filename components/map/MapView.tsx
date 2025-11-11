'use client';

import { useRouter } from 'next/navigation';
import type { Show, SafeWithDetails, Vendor } from '@/lib/types';

interface MapViewProps {
  show: Show | null;
  safe: SafeWithDetails | null;
  vendor: Vendor | null;
}

export default function MapView({ show, safe, vendor }: MapViewProps) {
  const router = useRouter();

  // Determine what to show on map
  const locations: Array<{
    name: string;
    lat: number;
    lng: number;
    type: 'show' | 'safe' | 'vendor';
  }> = [];

  if (show && show.latitude && show.longitude) {
    locations.push({
      name: show.show_name || 'Show',
      lat: show.latitude,
      lng: show.longitude,
      type: 'show',
    });
  }

  if (safe?.show && safe.show.latitude && safe.show.longitude) {
    locations.push({
      name: safe.show.show_name || 'Show',
      lat: safe.show.latitude,
      lng: safe.show.longitude,
      type: 'show',
    });
  }

  if (vendor && vendor.latitude && vendor.longitude) {
    locations.push({
      name: vendor.name,
      lat: vendor.latitude,
      lng: vendor.longitude,
      type: 'vendor',
    });
  }

  // Generate Google Maps embed URL or use a mapping library
  const centerLat = locations.length > 0 ? locations[0].lat : 39.8283;
  const centerLng = locations.length > 0 ? locations[0].lng : -98.5795;

  // Build query string for Google Maps
  const queryString = locations
    .map((loc) => `${loc.lat},${loc.lng}`)
    .join('|');

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
          Map View
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {locations.length > 0 ? (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${centerLat},${centerLng}&output=embed`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                No location data available
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                {show && 'Show location not set'}
                {safe && 'Safe location not set'}
                {vendor && 'Vendor location not set'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

