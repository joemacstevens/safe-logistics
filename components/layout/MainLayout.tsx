'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/timeline', label: 'Timeline', icon: 'event' },
    { href: '/safes', label: 'Safes', icon: 'inventory_2' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-3 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 -ml-2"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white flex-1 text-center">
          {pathname === '/timeline' && 'Timeline View'}
          {pathname === '/safes' && 'Safes'}
          {pathname?.startsWith('/show/') && 'Show Details'}
          {pathname?.startsWith('/safe/') && 'Safe Details'}
        </h1>
        <div className="flex items-center justify-end w-10">
          {pathname === '/timeline' && (
            <button
              onClick={() => router.push('/copilot')}
              className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Open Copilot"
            >
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </button>
          )}
          {pathname !== '/timeline' && (
            <button
              onClick={() => router.push('/timeline')}
              className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Home"
            >
              <span className="material-symbols-outlined text-2xl">home</span>
            </button>
          )}
        </div>
      </header>

      {/* Sidebar Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Menu
              </h2>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left"
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-4 ${
                pathname === item.href
                  ? 'text-primary'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {item.icon}
              </span>
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Copilot FAB (Mobile) */}
      <button
        onClick={() => router.push('/copilot')}
        className="fixed bottom-24 right-6 z-20 flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg hover:bg-slate-700 dark:hover:bg-slate-300 lg:hidden"
      >
        <span className="material-symbols-outlined text-2xl">auto_awesome</span>
      </button>
    </div>
  );
}
