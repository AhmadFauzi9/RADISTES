'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import RankingCard, { RankingList } from './RankingCard';
import { topSubjectStudents } from '@/lib/teaching';

const ROTATION_DELAY = 6000;

export default function SubjectRankingCard({ assignments, subjects, legerByClass }) {
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = assignments.length;
  const activeIndex = count ? position % count : 0;
  const assignment = assignments[activeIndex];
  const rotating = count > 1 && !paused;

  useEffect(() => {
    if (!rotating) return;
    const timer = setTimeout(() => setPosition((activeIndex + 1) % count), ROTATION_DELAY);
    return () => clearTimeout(timer);
  }, [rotating, activeIndex, count]);

  const subject = subjects.find(item => item.key === assignment?.subjectKey);
  const students = assignment ? topSubjectStudents(legerByClass[assignment.classId] || [], assignment.subjectKey) : [];

  return (
    <RankingCard title="3 Nilai Terbaik" actions={
      <Link href="/nilai-terbaik" className="text-[11px] font-bold text-brand-700 hover:underline">Lihat semua</Link>
    }>
      <div aria-live={rotating ? 'off' : 'polite'} className="space-y-2">
        {assignment ? (
          <>
            <p className="text-[11px] font-semibold text-slate-600">
              {assignment.classId} · {subject?.name || assignment.subjectKey}
            </p>
            <RankingList students={students} emptyMessage="Belum ada nilai untuk mapel ini." />
          </>
        ) : <p className="text-xs text-slate-500">Belum ada penugasan mengajar.</p>}
      </div>

      {count > 1 && (
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <span className="text-[11px] tabular-nums text-slate-500">{activeIndex + 1} dari {count}</span>
          <div className="flex items-center gap-1">
            <button data-module-action type="button" title="Penugasan sebelumnya" aria-label="Penugasan sebelumnya"
              onClick={() => setPosition((activeIndex + count - 1) % count)}>
              <i aria-hidden="true" className="fa-solid fa-chevron-left" />
            </button>
            <button data-module-action type="button" onClick={() => setPaused(prev => !prev)}
              title={paused ? 'Lanjutkan pergantian otomatis' : 'Jeda pergantian otomatis'}
              aria-label={paused ? 'Lanjutkan pergantian otomatis' : 'Jeda pergantian otomatis'}>
              <i aria-hidden="true" className={`fa-solid ${paused ? 'fa-play' : 'fa-pause'}`} />
            </button>
            <button data-module-action type="button" title="Penugasan berikutnya" aria-label="Penugasan berikutnya"
              onClick={() => setPosition((activeIndex + 1) % count)}>
              <i aria-hidden="true" className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      )}
    </RankingCard>
  );
}
