'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function Toast() {
  const { toasts } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        const bgClass = isSuccess 
          ? 'bg-emerald-600 text-white' 
          : isWarning 
          ? 'bg-amber-600 text-white' 
          : isInfo 
          ? 'bg-brand-600 text-white' 
          : 'bg-rose-600 text-white';

        const icon = isSuccess 
          ? 'fa-circle-check' 
          : isWarning 
          ? 'fa-triangle-exclamation' 
          : isInfo 
          ? 'fa-circle-info' 
          : 'fa-circle-xmark';

        return (
          <div
            key={toast.id}
            className={`${bgClass} p-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold pointer-events-auto animate-in slide-in-from-bottom-2 duration-200`}
          >
            <i className={`fa-solid ${icon} text-base shrink-0`}></i>
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
