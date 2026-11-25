'use client';

export default function ModulePagination({
  totalItems,
  pageSize,
  onPageSizeChange,
  currentPage,
  onPageChange,
  itemLabel = 'data',
  pageSizeOptions = [10, 20, 50, 100],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;

  return (
    <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 text-slate-600">
        <select
          aria-label="Jumlah baris per halaman"
          value={pageSize}
          onChange={event => onPageSizeChange(Number(event.target.value))}
          className="module-control !h-8 !py-0 text-xs"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span>
          Menampilkan{' '}
          <strong className="text-slate-800">
            {totalItems === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, totalItems)}
          </strong>{' '}
          dari <strong className="text-slate-800">{totalItems}</strong> {itemLabel}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          title="Halaman Sebelumnya"
          aria-label="Halaman Sebelumnya"
          className="module-action border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i aria-hidden="true" className="fa-solid fa-chevron-left text-[11px]" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((item, idx) =>
            item === '...' ? (
              <span key={`dots-${idx}`} className="px-1.5 text-slate-400 font-mono">...</span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`inline-flex h-8 min-w-8 px-2 items-center justify-center rounded-xl border text-xs font-bold transition cursor-pointer ${
                  item === safePage
                    ? 'border-brand-600 bg-brand-600 text-white shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item}
              </button>
            )
          )}

        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          title="Halaman Berikutnya"
          aria-label="Halaman Berikutnya"
          className="module-action border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i aria-hidden="true" className="fa-solid fa-chevron-right text-[11px]" />
        </button>
      </div>
    </div>
  );
}
