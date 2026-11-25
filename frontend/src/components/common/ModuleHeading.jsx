export default function ModuleHeading({ label, title, description, compact = false }) {
  return (
    <header className={compact ? undefined : 'border-b border-slate-100 pb-3'}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-indigo-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-800">{label}</span>
        <h1 className="text-base font-black uppercase tracking-tight text-slate-800 sm:text-lg">{title}</h1>
      </div>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
    </header>
  );
}
