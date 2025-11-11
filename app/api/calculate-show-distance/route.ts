import { NextRequest, NextResponse } from 'next/server';
import { calculateShowToShowDistance } from '@/lib/services/show-distance';
import { getShow } from '@/lib/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    const { fromShowId, toShowId } = await request.json();

    if (!fromShowId || !toShowId) {
      return NextResponse.json(
        { error: 'Missing fromShowId or toShowId' },
        { status: 400 }
      );
    }

    const fromShow = await getShow(fromShowId);
    const toShow = await getShow(toShowId);

    if (!fromShow || !toShow) {
      return NextResponse.json(
        { error: 'Show not found' },
        { status: 404 }
      );
    }

    const result = await calculateShowToShowDistance(fromShow, toShow);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating show distance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    );
  }
}

