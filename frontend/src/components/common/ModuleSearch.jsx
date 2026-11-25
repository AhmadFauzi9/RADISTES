export default function ModuleSearch({ className = '', ...props }) {
  return (
    <div className={`relative min-w-[150px] max-w-xs flex-1 ${className}`}>
      <i aria-hidden="true" className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
      <input type="search" {...props} className="module-control module-search w-full" />
    </div>
  );
}
