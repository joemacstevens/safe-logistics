import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateShow } from '@/lib/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    const { showId, show_name, venue_name, start_date, end_date, notes } =
      await request.json();

    if (!showId) {
      return NextResponse.json({ error: 'Missing showId' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = {
      show_name: show_name ?? null,
      venue_name: venue_name ?? null,
      start_date: start_date ?? null,
      end_date: end_date ?? null,
      notes: notes ?? null,
    };

    const updatedShow = await updateShow(showId, payload);

    return NextResponse.json({ success: true, show: updatedShow });
  } catch (error) {
    console.error('Error updating show:', error);
    return NextResponse.json(
      { error: 'Failed to update show' },
      { status: 500 }
    );
  }
}
