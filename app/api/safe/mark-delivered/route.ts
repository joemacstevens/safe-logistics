import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateSafe, getSafe } from '@/lib/supabase/queries';
import { createSafeMovement } from '@/lib/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    const { safeId } = await request.json();

    if (!safeId) {
      return NextResponse.json(
        { error: 'Missing safeId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current safe data
    const safe = await getSafe(safeId);
    if (!safe) {
      return NextResponse.json({ error: 'Safe not found' }, { status: 404 });
    }

    // Update safe status
    await updateSafe(safeId, {
      status: 'delivered',
      updated_at: new Date().toISOString(),
    });

    // Create movement record if there's a show
    if (safe.show_id) {
      await createSafeMovement({
        safe_id: safeId,
        from_show_id: safe.show_id,
        to_show_id: null,
        from_vendor_id: safe.vendor_id || null,
        to_vendor_id: null,
        movement_status: 'delivered',
        movement_date: new Date().toISOString(),
        estimated_arrival: null,
        actual_arrival: new Date().toISOString(),
        distance_miles: null,
        travel_time_minutes: null,
        transport_vendor: safe.vendor_id || null,
        notes: 'Marked as delivered via Copilot',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking safe as delivered:', error);
    return NextResponse.json(
      { error: 'Failed to mark safe as delivered' },
      { status: 500 }
    );
  }
}
