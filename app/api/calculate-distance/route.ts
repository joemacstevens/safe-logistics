import { NextRequest, NextResponse } from 'next/server';
import { calculateDistanceServer } from '@/lib/services/distance-server';
import { getVendor } from '@/lib/supabase/queries';
import { getShow } from '@/lib/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    const { vendorId, showId } = await request.json();

    if (!vendorId || !showId) {
      return NextResponse.json(
        { error: 'Missing vendorId or showId' },
        { status: 400 }
      );
    }

    const vendor = await getVendor(vendorId);
    const show = await getShow(showId);

    if (!vendor || !show) {
      return NextResponse.json(
        { error: 'Vendor or show not found' },
        { status: 404 }
      );
    }

    const result = await calculateDistanceServer(vendor, show);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating distance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    );
  }
}

