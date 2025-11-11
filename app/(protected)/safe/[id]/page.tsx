import { getSafe } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import SafeDetailView from '@/components/safes/SafeDetailView';

export default async function SafeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const safe = await getSafe(id);

  if (!safe) {
    notFound();
  }

  return <SafeDetailView safe={safe} />;
}

