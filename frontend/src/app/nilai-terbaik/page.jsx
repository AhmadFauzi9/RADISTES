'use client';

import ModuleHeading from '@/components/common/ModuleHeading';
import { useApp } from '@/context/AppContext';
import { teachingAssignments } from '@/lib/teaching';

export default function NilaiTerbaikPage() {
  const { currentUser, allMapel, legerByClass, isSuperAdmin } = useApp();
  const assignments = teachingAssignments(currentUser, allMapel);
  if (isSuperAdmin) return <p className="text-sm">Halaman ini tersedia untuk guru.</p>;
  return (
    <section className="space-y-3">
      <div className="module-panel"><ModuleHeading label="Hasil STS" title="Tiga Nilai Terbaik" /></div>
      {!assignments.length && <p className="module-panel text-xs text-slate-500">Belum ada penugasan mengajar.</p>}
      {assignments.map(({ classId, subjectKey }) => {
        const subject = allMapel.find(item => item.key === subjectKey);
        const top = (legerByClass[classId] || []).map(student => ({ ...student, score: student.grades?.[subjectKey] }))
          .filter(({ score }) => score !== '' && score != null && Number.isFinite(Number(score)))
          .sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 3);
        return (
          <article key={classId + ':' + subjectKey} className="module-table !rounded-2xl bg-white">
            <h2 className="module-table-caption flex items-center gap-2">
              <i aria-hidden="true" className="fa-solid fa-trophy text-amber-400" />
              {classId} · {subject?.name}
            </h2>
            {top.length ? <table>
              <thead><tr>
                <th scope="col" className="w-24 px-3 py-2 text-center">Peringkat</th>
                <th scope="col" className="px-3 py-2">Nama Siswa</th>
                <th scope="col" className="w-24 px-3 py-2 text-right">Nilai</th>
              </tr></thead>
              <tbody>{top.map((student, index) => <tr key={student.nis}>
                <td className="px-3 py-2 text-center"><span className="inline-flex size-6 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-700">{index + 1}</span></td>
                <td className="px-3 py-2 font-semibold">{student.nama}</td>
                <td className="px-3 py-2 text-right font-bold tabular-nums text-brand-700">{student.score}</td>
              </tr>)}</tbody>
            </table> : <p className="p-3 text-xs text-slate-500">Belum ada nilai.</p>}
          </article>
        );
      })}
    </section>
  );
}
