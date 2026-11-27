const rankColors = ['bg-amber-500 text-white', 'bg-slate-500 text-white', 'bg-amber-800 text-white'];

export default function RankingCard({ title, heading: Heading = 'h3', actions, children }) {
  return (
    <section className="min-w-0 space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Heading className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <i aria-hidden="true" className="fa-solid fa-trophy text-amber-600" />
          {title}
        </Heading>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function RankingList({ students, scoreTitle = 'Nilai', showTotal = false, emptyMessage }) {
  if (!students.length) return <p className="text-xs text-slate-500">{emptyMessage}</p>;

  return (
    <ol className="space-y-1">
      {students.map((student, index) => (
        <li key={student.nis} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-xs">
          <span className="flex min-w-0 items-center gap-2">
            <span className={`grid size-5 shrink-0 place-items-center rounded font-bold ${rankColors[index]}`}>{index + 1}</span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-slate-800" data-tooltip={student.nama}>{student.nama}</span>
              <span className="block font-mono text-[10px] text-slate-500">NIS {student.nis}</span>
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block font-mono font-bold text-brand-700" data-tooltip={scoreTitle}>{student.score}</span>
            {showTotal && <span className="block text-[10px] text-slate-500">Total {student.totalNilai}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
