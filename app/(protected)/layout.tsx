import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { ToastProvider } from '@/components/providers/ToastProvider';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <ToastProvider>
      <MainLayout>{children}</MainLayout>
    </ToastProvider>
  );
}

