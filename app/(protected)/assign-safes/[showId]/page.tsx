import { getShow } from '@/lib/supabase/queries';
import { getSafes } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import AssignSafesView from '@/components/safes/AssignSafesView';

export default async function AssignSafesPage({
  params,
}: {
  params: Promise<{ showId: string }>;
}) {
  const { showId } = await params;
  const showIdNum = parseInt(showId);

  if (isNaN(showIdNum)) {
    notFound();
  }

  const show = await getShow(showIdNum);
  if (!show) {
    notFound();
  }

  const allSafes = await getSafes();
  
  // Separate assigned and unassigned safes
  const assignedSafes = allSafes.filter((safe) => safe.show_id === showIdNum);
  const unassignedSafes = allSafes.filter(
    (safe) => safe.show_id === null || safe.show_id !== showIdNum
  );

  return (
    <AssignSafesView
      show={show}
      assignedSafes={assignedSafes}
      unassignedSafes={unassignedSafes}
    />
  );
}

