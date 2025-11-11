import { NextRequest, NextResponse } from 'next/server';
import { createDistance } from '@/lib/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendor_id, show_id, distance_miles, travel_time_minutes, route_summary } = body;

    if (!vendor_id || !show_id || distance_miles === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const distance = await createDistance({
      vendor_id,
      show_id,
      distance_miles,
      travel_time_minutes: travel_time_minutes || null,
      route_summary: route_summary || null,
    });

    return NextResponse.json(distance);
  } catch (error) {
    console.error('Error creating distance:', error);
    return NextResponse.json(
      { error: 'Failed to create distance' },
      { status: 500 }
    );
  }
}

