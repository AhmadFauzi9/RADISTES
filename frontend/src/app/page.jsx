'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import SummaryCard from '@/components/common/SummaryCard';
import RankingCard, { RankingList } from '@/components/grades/RankingCard';
import SubjectRankingCard from '@/components/grades/SubjectRankingCard';
import { activeTeacherAssignments, gradeSummary, teachingAssignments } from '@/lib/teaching';
import { hitungStatistikSiswa } from '@/lib/masterData';

export default function DashboardPage() {
  const { 
    currentUser,
    isSuperAdmin,
    isWaliKelas,
    isGuruMapelOnly,
    schoolSettings, 
    selectedClassId, 
    activeClassInfo, 
    allClasses, 
    currentLeger, 
    allMapel,
    legerByClass,
    teachersList,
    submissionRecords,
    classStatus,
    openRaportModal
  } = useApp();

  // Hitung metrik ringkasan kelas aktif
  const totalSiswa = currentLeger.length;
  const siswaLengkap = currentLeger.filter(student => hitungStatistikSiswa(student.grades, allMapel).isComplete).length;

  const persenLengkap = totalSiswa > 0 ? Math.round((siswaLengkap / totalSiswa) * 100) : 0;

  // Rata-rata keseluruhan kelas
  const allAverages = currentLeger.map(s => s.rataRata || 0).filter(v => v > 0);
  const classAvg = allAverages.length > 0 
    ? (allAverages.reduce((a, b) => a + b, 0) / allAverages.length).toFixed(1) 
    : '0';

  const maxScore = allAverages.length > 0 ? Math.max(...allAverages).toFixed(1) : '0';
  const minScore = allAverages.length > 0 ? Math.min(...allAverages).toFixed(1) : '0';

  const topStudents = [...currentLeger]
    .sort((a, b) => (b.totalNilai || 0) - (a.totalNilai || 0) || (b.rataRata || 0) - (a.rataRata || 0))
    .slice(0, 3);

  const isClassLocked = classStatus[selectedClassId]?.isLocked;
  const deadline = new Date(schoolSettings.deadlineSetor);
  const deadlineLabel = schoolSettings.deadlineSetor && !Number.isNaN(deadline.getTime())
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(deadline)
    : 'Belum ditetapkan';
  const assignments = teachingAssignments(currentUser, allMapel);
  const taughtSubjectNames = allMapel
    .filter(subject => assignments.some(item => item.subjectKey === subject.key))
    .map(subject => subject.name)
    .join(', ');
  const roster = Object.values(legerByClass).flat();
  const assignedTeachers = teachersList.filter(teacher => !teacher.isAdmin)
    .map(teacher => ({ ...teacher, assignments: activeTeacherAssignments(teacher, allMapel) }))
    .filter(teacher => teacher.assignments.length);
  const sentTeachers = assignedTeachers.filter(teacher => teacher.assignments.every(item =>
    submissionRecords[[teacher.username, item.classId, item.subjectKey].join(':')]?.sent
  )).length;
  const classGenderCount = gender => allClasses.filter(item => {
    const students = legerByClass[item.id] || [];
    return students.length > 0 && students.every(student => student.lp === gender);
  }).length;

  return (
    <div className="space-y-4">
      
      {/* Welcome & Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold">
              <i className="fa-solid fa-school text-xs"></i> {schoolSettings.yayasan}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Portal Raport STS {schoolSettings.semester} {schoolSettings.tahunAjaran}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {schoolSettings.namaMadrasah}
              {isGuruMapelOnly && (
                <> • Guru Mapel: <strong>{currentUser?.nama}</strong>{taughtSubjectNames && ` (${taughtSubjectNames})`}</>
              )}
              {isWaliKelas && (
                <> • Wali Kelas Aktif: <strong>{activeClassInfo?.wali}</strong> (Kelas {selectedClassId})</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isGuruMapelOnly ? (
              <Link
                href="/cetak-raport"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <i className="fa-solid fa-print"></i>
                <span>Cetak Raport PDF</span>
              </Link>
            ) : (
              <Link
                href="/setor-nilai"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
              >
                <i className="fa-solid fa-file-excel"></i>
                <span>Setor & Import Nilai DKN Mapel</span>
              </Link>
            )}
          </div>
        </div>

        {/* Subtle decorative background icon */}
        <div className="absolute right-4 -bottom-6 text-slate-800/40 text-9xl pointer-events-none select-none">
          <i className="fa-solid fa-graduation-cap"></i>
        </div>
      </div>

      {isSuperAdmin && <section aria-label="Ringkasan Madrasah" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Siswa" value={roster.length} icon="fa-users"
          subtitle={`${roster.filter(student => student.lp === 'L').length} putra · ${roster.filter(student => student.lp === 'P').length} putri`} />
        <SummaryCard title="Total Rombel" value={allClasses.length} icon="fa-layer-group" iconColor="text-indigo-600"
          subtitle={`${classGenderCount('L')} putra · ${classGenderCount('P')} putri teridentifikasi`} />
        <Link href="/setor-nilai" className="rounded-2xl focus-visible:outline focus-visible:outline-brand-600">
          <SummaryCard title="Setoran Nilai" value={`${sentTeachers} / ${assignedTeachers.length}`} icon="fa-paper-plane" iconColor="text-emerald-600"
            subtitle={`${assignedTeachers.length - sentTeachers} guru belum selesai`} />
        </Link>
        <Link href="/pengaturan" className="rounded-2xl focus-visible:outline focus-visible:outline-brand-600">
          <SummaryCard title="Tahun Aktif" value={schoolSettings.tahunAjaran} icon="fa-calendar-days" iconColor="text-amber-600"
            subtitle="Buka pengaturan raport" />
        </Link>
      </section>}
      {!isSuperAdmin && <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Kelas yang Diampu</h2>
        {!assignments.length && <p className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">Belum ada penugasan mengajar.</p>}
        <div className={`grid gap-3 sm:grid-cols-2 ${assignments.length > 1 ? 'xl:grid-cols-3' : ''}`}>
          {assignments.map(({ classId, subjectKey }) => {
            const students = legerByClass[classId] || [];
            const summary = gradeSummary(students, [subjectKey]);
            return <SummaryCard key={classId + ':' + subjectKey}
              title={`${classId} · ${allMapel.find(item => item.key === subjectKey)?.name}`}
              value={`${summary.completion}%`} icon="fa-chalkboard-user"
              badge={summary.ready ? 'Siap dikirim' : 'Belum lengkap'}
              subtitle={`${students.length} siswa · Rata-rata ${summary.average} · Rentang ${summary.range}`} />;
          })}
          <SummaryCard title="Batas Akhir Pengiriman Nilai" value={deadlineLabel}
            icon="fa-triangle-exclamation" iconColor="text-amber-700" tone="warning"
            className={assignments.length > 1 ? 'sm:row-start-1 sm:col-start-2 xl:col-start-3'
              : assignments.length === 1 ? 'sm:row-start-1 sm:col-start-2' : 'sm:col-span-2'} />
        </div>
      </section>}
      {isWaliKelas && <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Total Siswa */}
        <SummaryCard
          title="Total Siswa"
          value={totalSiswa}
          subtitle={`Terdaftar di Kelas ${selectedClassId}`}
          icon="fa-users"
          iconColor="text-brand-600"
          badge="Kelas Aktif"
        />

        {/* 2. Status Nilai Leger */}
        <SummaryCard
          title="Kelengkapan Leger"
          value={`${persenLengkap}%`}
          subtitle={`${siswaLengkap} dari ${totalSiswa} siswa terisi`}
          icon="fa-clipboard-check"
          iconColor={persenLengkap >= 100 ? "text-emerald-600" : "text-amber-500"}
          badge={persenLengkap >= 100 ? "Lengkap" : "Proses"}
        />

        {/* 3. Rata-rata Kelas */}
        <SummaryCard
          title="Rata-rata Nilai"
          value={classAvg}
          subtitle="Skala nilai 0 - 100"
          icon="fa-chart-simple"
          iconColor="text-indigo-600"
        />

        {/* 4. Tertinggi / Terendah */}
        <SummaryCard
          title="Tertinggi / Rendah"
          value={`${maxScore} / ${minScore}`}
          subtitle="Rentang nilai siswa"
          icon="fa-award"
          iconColor="text-amber-500"
        />

        {/* 5. Status Raport */}
        <SummaryCard
          title="Kesiapan Raport"
          value={isClassLocked ? "Terkunci" : totalSiswa > 0 && siswaLengkap === totalSiswa ? "Siap Cetak" : "Belum Lengkap"}
          subtitle={isClassLocked ? "Leger sudah dikunci" : "Berdasarkan kelengkapan nilai"}
          icon="fa-file-pdf"
          iconColor={isClassLocked ? "text-indigo-600" : "text-emerald-600"}
          badge={isClassLocked ? "Locked" : "Editable"}
        />
      </div>}

      <div className={isWaliKelas || isGuruMapelOnly ? 'grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : undefined}>
          {/* Card Penjelasan Alur Kerja */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-diagram-project text-brand-600"></i>
                Alur Kerja Aplikasi Raport Tengah Semester (RADISTES)
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">Flow Interaktif</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-300 transition space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-xs text-slate-900">Setor Nilai Mapel</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Guru mata pelajaran menyetor nilai per kelas melalui portal input nilai atau import excel.
                </p>
                <Link href="/setor-nilai" className="text-[11px] font-bold text-brand-600 hover:underline block pt-1">
                  Coba Setor Nilai →
                </Link>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-brand-50/50 border border-brand-200 hover:border-brand-400 transition space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  2
                </div>
                <h4 className="font-bold text-xs text-brand-900">Validasi di Leger</h4>
                <p className="text-[11px] text-brand-800/80 leading-relaxed">
                  Wali kelas memeriksa data, mengedit jika ada koreksi, menambah ekskul & absensi, lalu hitung ranking otomatis.
                </p>
                <Link href="/leger" className="text-[11px] font-bold text-brand-700 hover:underline block pt-1">
                  Buka Halaman Leger →
                </Link>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 hover:border-emerald-400 transition space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  3
                </div>
                <h4 className="font-bold text-xs text-emerald-900">Kunci & Download PDF</h4>
                <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                  Jika leger sudah penuh & fix, wali kelas dapat mengunci nilai dan mendownload file raport PDF siap cetak 1:1.
                </p>
                <Link href="/cetak-raport" className="text-[11px] font-bold text-emerald-700 hover:underline block pt-1">
                  Lihat Template Cetak →
                </Link>
              </div>
            </div>
          </div>
          {isWaliKelas && <ClassRankingCard classId={selectedClassId} students={topStudents} onPreview={openRaportModal} />}
          {isGuruMapelOnly && <SubjectRankingCard assignments={assignments} subjects={allMapel} legerByClass={legerByClass} />}
      </div>
    </div>
  );
}

function ClassRankingCard({ classId, students, onPreview }) {
  return (
    <RankingCard title={`3 Peringkat Terbaik · ${classId}`} actions={
      <div className="flex items-center gap-2">
        <Link href="/leger" className="text-[11px] font-bold text-brand-700 hover:underline">Lihat Leger</Link>
        {students.length > 0 && (
          <button data-module-action type="button" onClick={() => onPreview(students[0])}
            title="Pratinjau Raport Juara 1" aria-label="Pratinjau Raport Juara 1">
            <i aria-hidden="true" className="fa-solid fa-file-pdf" />
          </button>
        )}
      </div>
    }>
      <RankingList students={students.map(student => ({ ...student, score: student.rataRata }))}
        scoreTitle="Rata-rata" showTotal emptyMessage="Belum ada siswa di Leger kelas ini." />
    </RankingCard>
  );
}
