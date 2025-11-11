import { getSafe } from '@/lib/supabase/queries';
import { getShows } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import AssignSafeToShowView from '@/components/safes/AssignSafeToShowView';

export default async function AssignSafeToShowPage({
  params,
}: {
  params: Promise<{ safeId: string }>;
}) {
  const { safeId } = await params;
  const safe = await getSafe(safeId);

  if (!safe) {
    notFound();
  }

  // Get upcoming shows (future shows or shows starting soon)
  const allShows = await getShows();
  const now = new Date();
  const upcomingShows = allShows
    .filter((show) => {
      if (!show.start_date) return true;
      const startDate = new Date(show.start_date);
      return startDate >= now || Math.abs(startDate.getTime() - now.getTime()) < 30 * 24 * 60 * 60 * 1000; // Within 30 days
    })
    .slice(0, 20); // Limit to 20 most relevant

  return (
    <AssignSafeToShowView
      safe={safe}
      shows={upcomingShows}
    />
  );
}

