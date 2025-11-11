'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/timeline`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col items-center bg-background-light dark:bg-background-dark overflow-x-hidden p-4">
      <div className="flex w-full max-w-md flex-col items-center justify-center pt-12 sm:pt-20">
        <div className="flex flex-col items-center gap-2 pb-10">
          <svg
            fill="none"
            height="48"
            viewBox="0 0 48 48"
            width="48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 6L8 14V34L24 42L40 34V14L24 6Z"
              stroke="#137cec"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            <path
              d="M8 14L24 22L40 14"
              stroke="#137cec"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            <path
              d="M24 42V22"
              stroke="#137cec"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          </svg>
          <h1 className="text-slate-800 dark:text-white tracking-light text-2xl sm:text-3xl font-bold leading-tight text-center">
            SafeLogistics
          </h1>
        </div>
        <h2 className="text-slate-800 dark:text-white tracking-light text-2xl sm:text-[28px] font-bold leading-tight px-4 text-center pb-8">
          {getGreeting()}, Kelly
        </h2>
        <div className="w-full space-y-6 pt-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 gap-3 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-base font-bold leading-normal tracking-[0.015em] border border-slate-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              height="24"
              viewBox="0 0 48 48"
              width="24"
              x="0px"
              xmlns="http://www.w3.org/2000/svg"
              y="0px"
            >
              <path
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                fill="#FFC107"
              />
              <path
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                fill="#FF3D00"
              />
              <path
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                fill="#4CAF50"
              />
              <path
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.61,44,30.453,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                fill="#1976D2"
              />
            </svg>
            <span className="truncate">
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

