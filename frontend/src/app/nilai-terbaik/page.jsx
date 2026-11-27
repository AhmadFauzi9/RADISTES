'use client';

import ModuleHeading from '@/components/common/ModuleHeading';
import RankingCard, { RankingList } from '@/components/grades/RankingCard';
import { useApp } from '@/context/AppContext';
import { teachingAssignments, topSubjectStudents } from '@/lib/teaching';

export default function NilaiTerbaikPage() {
  const { currentUser, allMapel, legerByClass, isSuperAdmin } = useApp();
  const assignments = teachingAssignments(currentUser, allMapel);
  if (isSuperAdmin) return <p className="text-sm">Halaman ini tersedia untuk guru.</p>;
  return (
    <section className="space-y-3">
      <div className="module-panel"><ModuleHeading label="Hasil STS" title="Tiga Nilai Terbaik" /></div>
      {!assignments.length && <p className="module-panel text-xs text-slate-500">Belum ada penugasan mengajar.</p>}
      {assignments.length > 0 && (
        <div className="grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {assignments.map(({ classId, subjectKey }) => {
            const subject = allMapel.find(item => item.key === subjectKey);
            const students = topSubjectStudents(legerByClass[classId] || [], subjectKey);
            return (
              <RankingCard key={classId + ':' + subjectKey} title={`${classId} · ${subject?.name || subjectKey}`} heading="h2">
                <RankingList students={students} emptyMessage="Belum ada nilai untuk mapel ini." />
              </RankingCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
