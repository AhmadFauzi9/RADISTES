'use client';

import React from 'react';

export default function SummaryCard({ title, value, subtitle, icon, iconColor = 'text-brand-600', badge, trend }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
          <i className={`fa-solid ${icon} ${iconColor}`}></i> {title}
        </p>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {badge}
          </span>
        )}
      </div>
      
      <div className="mt-1.5 min-h-[32px] flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-800 tracking-tight">{value}</span>
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
