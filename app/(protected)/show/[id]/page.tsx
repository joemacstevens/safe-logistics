import { getShow } from '@/lib/supabase/queries';
import { getAssignments } from '@/lib/supabase/queries';
import { getVendor } from '@/lib/supabase/queries';
import { getSafes } from '@/lib/supabase/queries';
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

  // Get vendor assignment
  const assignments = await getAssignments();
  const assignment = assignments.find((a) => a.show_id === showId);
  const vendor = assignment?.vendor_uuid
    ? await getVendor(assignment.vendor_uuid)
    : null;

  // Get safes assigned to this show
  const allSafes = await getSafes();
  const showSafes = allSafes.filter((safe) => safe.show_id === showId);

  return (
    <ShowDetailView
      show={show}
      vendor={vendor}
      safes={showSafes}
      assignmentId={assignment?.id}
    />
  );
}

