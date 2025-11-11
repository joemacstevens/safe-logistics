import { getSafes } from '@/lib/supabase/queries';
import SafesView from '@/components/safes/SafesView';

export default async function SafesPage() {
  const safes = await getSafes();

  // Calculate statistics
  const total = safes.length;
  const assigned = safes.filter((s) => s.show_id !== null).length;
  const inTransit = safes.filter((s) => s.status === 'in_transit').length;
  const stored = safes.filter((s) => s.status === 'stored' || s.status === 'available').length;

  return (
    <SafesView
      safes={safes}
      stats={{
        total,
        assigned,
        inTransit,
        stored,
      }}
    />
  );
}

