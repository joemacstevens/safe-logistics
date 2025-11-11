'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
      ? 'bg-red-500'
      : 'bg-primary';

  return (
    <div className="fixed bottom-24 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 transform rounded-lg bg-slate-200/95 dark:bg-slate-800/95 p-3 text-center shadow-md backdrop-blur-sm">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {message}
      </p>
    </div>
  );
}

