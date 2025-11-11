import type { Vendor, Safe } from '@/lib/types';

export interface VendorCapacity {
  currentSafes: number;
  maxCapacity: number;
  utilizationPercent: number;
  status: 'available' | 'near-capacity' | 'full';
}

const DEFAULT_MAX_CAPACITY = 10;

export function calculateVendorCapacity(
  vendor: Vendor,
  allSafes: Safe[]
): VendorCapacity {
  const vendorSafes = allSafes.filter((safe) => safe.vendor_id === vendor.iid);
  const currentSafes = vendorSafes.length;
  const maxCapacity = DEFAULT_MAX_CAPACITY; // Could be stored in vendor table in future
  const utilizationPercent = Math.round((currentSafes / maxCapacity) * 100);

  let status: 'available' | 'near-capacity' | 'full';
  if (currentSafes >= maxCapacity) {
    status = 'full';
  } else if (utilizationPercent >= 80) {
    status = 'near-capacity';
  } else {
    status = 'available';
  }

  return {
    currentSafes,
    maxCapacity,
    utilizationPercent,
    status,
  };
}

export function getCapacityColor(status: VendorCapacity['status']): string {
  switch (status) {
    case 'full':
      return 'text-red-600 dark:text-red-400';
    case 'near-capacity':
      return 'text-yellow-600 dark:text-yellow-400';
    default:
      return 'text-green-600 dark:text-green-400';
  }
}

