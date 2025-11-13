import { getShow, getSafes } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import ShowDetailView from '@/components/show/ShowDetailView';

export default async function ShowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const showId = parseInt(id);

  if (isNaN(showId)) {
    notFound();
  }

  const show = await getShow(showId);
  if (!show) {
    notFound();
  }

  // Get safes assigned to this show
  const allSafes = await getSafes();
  const showSafes = allSafes.filter((safe) => safe.show_id === showId);

  return (
    <ShowDetailView
      show={show}
      safes={showSafes}
    />
  );
}
