'use client';

import React from 'react';

export default function SummaryCard({ title, value, subtitle, icon, iconColor = 'text-brand-600', badge, trend, tone = 'default', className = '' }) {
  const warning = tone === 'warning';
  return (
    <div className={`rounded-2xl border p-4 shadow-2xs transition hover:shadow-xs ${
      warning ? 'border-amber-300 border-l-4 border-l-amber-500 bg-amber-50' : 'border-slate-200 bg-white'
    } ${className}`}>
      <div className="flex items-center justify-between">
        <p className={`flex items-center ${warning ? 'gap-2 text-base font-extrabold text-amber-900' : 'gap-1.5 text-[11px] font-semibold text-slate-500'}`}>
          <i aria-hidden="true" className={`fa-solid ${icon} ${iconColor} ${warning ? 'shrink-0 text-xl' : ''}`}></i> {title}
        </p>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {badge}
          </span>
        )}
      </div>
      
      <div className="mt-1.5 min-h-[32px] flex items-baseline gap-2">
        <span className={`text-2xl font-black tracking-tight ${warning ? 'text-amber-950' : 'text-slate-800'}`}>{value}</span>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
            <i className="fa-solid fa-arrow-trend-up"></i> {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-400 mt-1 truncate">{subtitle}</p>
      )}
    </div>
  );
}
