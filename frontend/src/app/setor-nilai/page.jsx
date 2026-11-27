'use client';

import ModuleHeading from '@/components/common/ModuleHeading';
import ModulePagination from '@/components/common/ModulePagination';
import React, { useEffect, useRef, useState } from 'react';
import { downloadExcelTemplate } from '@/lib/excelTemplate';
import { calculateDknAverage, dknAverageFormula, dknStatusFormula, UH_COLUMNS } from '@/lib/dknScores';
import { subjectGrade } from '@/lib/masterData';
import { gradeDraftKey, readGradeDraft, saveGradeDraft } from '@/lib/gradeDraftStorage';
import { teachingAssignments } from '@/lib/teaching';
import SubmissionTable from '@/components/grades/SubmissionTable';
import RaportMetadata from '@/components/raport/RaportMetadata';
import { useApp } from '@/context/AppContext';
import ImportDknModal from '@/components/import/ImportDknModal';

const QUICK_FILL_COLUMNS = [
  ...UH_COLUMNS,
  { key: 'sts', label: 'Nilai STS' },
];

export default function SetorNilaiPage() {
  const {
    currentUser, isSuperAdmin, teachersList, allClasses, allMapel, legerByClass, schoolSettings,
    classStatus, importDknScores, showToast, recordSubmission, submissionRecords, gradeDraftEdits, setGradeDraftEdits,
  } = useApp();
  const [classChoice, setTargetClassId] = useState('');
  const [subjectChoice, setSelectedMapelKey] = useState('');
  const [quickScoreInput, setQuickScoreInput] = useState('');
  const [quickFillColumn, setQuickFillColumn] = useState('sts');
  const [isDknModalOpen, setIsDknModalOpen] = useState(false);
  const [savedDraft, setSavedDraft] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const tableViewportRef = useRef(null);
  const latestTeacher = teachersList.find(t => t.username === currentUser?.username || t.id === currentUser?.id);
  const activeTeacher = { ...currentUser, ...latestTeacher, kelasWali: currentUser?.kelasWali };
  const assignments = teachingAssignments(activeTeacher, allMapel);
  const eligibleClasses = isSuperAdmin ? allClasses : allClasses.filter(item => assignments.some(assignment => assignment.classId === item.id));
  const targetClassId = eligibleClasses.some(item => item.id === classChoice) ? classChoice : eligibleClasses[0]?.id;
  const targetClass = eligibleClasses.find(item => item.id === targetClassId);
  const eligibleSubjects = isSuperAdmin ? allMapel : allMapel.filter(item => assignments.some(assignment => assignment.classId === targetClassId && assignment.subjectKey === item.key));
  const selectedMapelKey = eligibleSubjects.some(item => item.key === subjectChoice) ? subjectChoice : eligibleSubjects[0]?.key;
  const activeMapel = allMapel.find(m => m.key === selectedMapelKey);
  const submission = submissionRecords[[currentUser?.username, targetClassId, selectedMapelKey].join(':')];
  const sent = submission?.sent;
  const submissionStatus = sent ? 'Sudah dikirim' : submission?.sentAt ? 'Perubahan belum dikirim' : 'Belum dikirim';
  const currentLeger = legerByClass[targetClassId] || [];
  const safePage = Math.min(currentPage, Math.max(1, Math.ceil(currentLeger.length / pageSize)));
  const startIndex = (safePage - 1) * pageSize;
  const pageStudents = currentLeger.slice(startIndex, startIndex + pageSize);
  const draftKey = gradeDraftKey(currentUser?.username, schoolSettings.tahunAjaran, schoolSettings.semester, targetClassId, selectedMapelKey);
  const draftReady = savedDraft?.key === draftKey;
  const savedGrades = draftReady ? savedDraft.grades : {};
  const pendingGrades = gradeDraftEdits[draftKey] || {};
  const gradesDraft = { ...savedGrades, ...pendingGrades };
  const hasUnsavedGrades = Object.keys(pendingGrades).length > 0;
  const locked = classStatus[targetClassId]?.isLocked;

  useEffect(() => {
    if (!draftKey || isSuperAdmin) return;
    try {
      setSavedDraft({ key: draftKey, grades: readGradeDraft(localStorage, draftKey) });
    } catch (error) {
      console.error(error);
      setSavedDraft({ key: draftKey, grades: {} });
    }
  }, [draftKey, isSuperAdmin]);
  const changePage = page => {
    setCurrentPage(page);
    if (tableViewportRef.current) tableViewportRef.current.scrollTop = 0;
  };
  const scoreFor = student => gradesDraft[student.nis] ?? subjectGrade(student.grades, selectedMapelKey) ?? '';
  const averageFor = student => calculateDknAverage(
    scoreFor(student),
    UH_COLUMNS.map(column => gradesDraft[student.nis + ':' + column.key]),
  );
  const editDraftGrades = (changes) => {
    if (locked || !draftKey || !Object.keys(changes).length) return;
    recordSubmission(targetClassId, selectedMapelKey);
    setGradeDraftEdits(prev => ({ ...prev, [draftKey]: { ...prev[draftKey], ...changes } }));
  };
  const persistDraft = (grades) => {
    if (locked || !draftKey || !draftReady) return false;
    try {
      const saved = saveGradeDraft(localStorage, draftKey, grades);
      setSavedDraft({ key: draftKey, grades: saved });
      setGradeDraftEdits(previous => {
        const next = { ...previous };
        delete next[draftKey];
        return next;
      });
      return true;
    } catch (error) {
      console.error(error);
      showToast('Draft gagal disimpan. Periksa penyimpanan browser dan coba lagi.', 'warning');
      return false;
    }
  };
  const handleSaveDraft = () => {
    if (hasUnsavedGrades && persistDraft(pendingGrades)) {
      showToast(`Draft ${activeMapel.name} kelas ${targetClassId} tersimpan di browser ini.`, 'success');
    }
  };
  const handleSubmitGrades = () => {
    if (!draftReady) return;
    const scores = currentLeger.filter(student => averageFor(student) !== '')
      .map(student => ({ nis: student.nis, score: averageFor(student) }))
      .filter(item => Number.isFinite(item.score) && item.score >= 0 && item.score <= 100);
    if (locked || !scores.length || currentLeger.some(student => scoreFor(student) === '') || scores.length !== currentLeger.length) {
      showToast('Lengkapi nilai 0–100. Leger yang terkunci tidak dapat diubah.', 'warning');
      return;
    }
    // Simpan STS asli sebelum leger menampung nilai rata-rata yang dikirim.
    const stsScores = Object.fromEntries(currentLeger.map(student => [student.nis, scoreFor(student)]));
    if (persistDraft({ ...pendingGrades, ...stsScores })) {
      importDknScores(targetClassId, selectedMapelKey, scores, 'Nilai telah dikirim ke leger wali kelas.');
    }
  };
  const handleQuickFill = () => {
    const value = Number(quickScoreInput);
    if (quickScoreInput.trim() === '' || !Number.isFinite(value) || value < 0 || value > 100) {
      showToast('Masukkan nilai valid antara 0–100.', 'warning');
      return;
    }
    const selectedColumn = QUICK_FILL_COLUMNS.find(column => column.key === quickFillColumn);
    if (!selectedColumn) return;

    const filledScores = Object.fromEntries(currentLeger.map(student => [
      quickFillColumn === 'sts' ? student.nis : student.nis + ':' + quickFillColumn,
      value,
    ]));
    editDraftGrades(filledScores);
    showToast(`Nilai ${selectedColumn.label} berhasil diterapkan ke semua siswa.`, 'success');
  };
  const downloadTemplate = () => {
    const stsColumn = String.fromCharCode(68 + UH_COLUMNS.length);
    const averageColumn = String.fromCharCode(stsColumn.charCodeAt(0) + 1);
    const rows = [
      [`DAFTAR NILAI STS ${String(schoolSettings.semester || 'GANJIL').toUpperCase()} MTs AL AMIRIYYAH BLOKAGUNG TAHUN PELAJARAN ${schoolSettings.tahunAjaran}`],
      [`KELAS : ${targetClassId} | MAPEL : ${activeMapel.name} | KKM : ${activeMapel.kkm}`],
      ['NO', 'NO INDUK', 'NAMA LENGKAP', ...UH_COLUMNS.map(column => column.label), 'NILAI STS', 'RATA-RATA', 'KETERCAPAIAN'],
      ...currentLeger.map((student, index) => {
        const row = index + 4;
        const sts = `${stsColumn}${row}`;
        return [
          index + 1, student.nis, student.nama,
          ...Array(UH_COLUMNS.length + 1).fill(null),
          { formula: dknAverageFormula(sts, `D${row}:${sts}`), result: '' },
          { formula: dknStatusFormula(`${averageColumn}${row}`, activeMapel.kkm), result: '' },
        ];
      }),
    ];
    return downloadExcelTemplate({
      rows,
      sheetName: 'DKN',
      fileName: `DKN-${targetClassId}-${selectedMapelKey}.xlsx`,
      widths: [8, 17, 40, ...UH_COLUMNS.map(() => 10), 15, 16, 20],
      headerRow: 2,
      titleRows: [0],
      fullWidthRows: [0, 1],
      textColumns: [1],
      inputColumns: UH_COLUMNS.map((_, index) => index + 3).concat(3 + UH_COLUMNS.length),
    }, showToast);
  };

  if (isSuperAdmin) return <SubmissionTable />;
  if (!activeMapel) return <p className="text-sm">Belum ada penugasan mengajar. Hubungi admin.</p>;

  return (
    <div className="space-y-4">
      
      {/* Header Info */}
      <div className="module-panel space-y-3">
        <ModuleHeading label="Portal Guru Mapel" title="Setor Nilai STS" description="Isi nilai siswa secara manual atau impor dari Excel DKN." />
        <RaportMetadata
          schoolSettings={schoolSettings}
          classValue={`${targetClass?.nama || targetClassId} • ${targetClass?.wali || 'Belum ada wali kelas'}`}
        />
      </div>
      <div className="module-toolbar" aria-label="Kontrol Setor Nilai">
        <select aria-label="Kelas" value={targetClassId?.slice(0, 1) || ''} onChange={event => {
          const level = event.target.value;
          const firstClass = eligibleClasses.find(c => c.tingkat === level);
          if (firstClass) {
            setTargetClassId(firstClass.id);
            changePage(1);
          }
        }} className="module-control">
          {['7', '8', '9']
            .filter(level => eligibleClasses.some(c => c.tingkat === level))
            .map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
        </select>
        <select aria-label="Bagian" value={targetClassId} onChange={event => {
          setTargetClassId(event.target.value);
          changePage(1);
        }} className="module-control">
          {eligibleClasses
            .filter(c => c.tingkat === targetClassId?.slice(0, 1))
            .map(c => (
              <option key={c.id} value={c.id}>{c.id.slice(1)}</option>
            ))}
        </select>
        <select aria-label="Mata Pelajaran yang Diampu" value={selectedMapelKey} onChange={event => {
          setSelectedMapelKey(event.target.value);
          changePage(1);
        }}
          className="module-control min-w-0 max-w-full">
        {eligibleSubjects.map(m => (
          <option key={m.key} value={m.key}>
            {m.code}. {m.name} (KKM: {m.kkm})
          </option>
        ))}
        </select>
        <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
          <select
            aria-label="Kolom tujuan isi nilai cepat"
            value={quickFillColumn}
            onChange={event => setQuickFillColumn(event.target.value)}
            className="module-control"
            disabled={locked || !currentLeger.length}
          >
            {QUICK_FILL_COLUMNS.map(column => (
              <option key={column.key} value={column.key}>{column.label}</option>
            ))}
          </select>
          <input type="number" min="0" max="100" aria-label="Isi Nilai Cepat" value={quickScoreInput} onChange={event => setQuickScoreInput(event.target.value)}
            placeholder="Isi nilai" className="module-control w-24 text-center font-mono" disabled={locked || !currentLeger.length} />
          <button data-module-action data-action-variant="soft" data-action-tone="warning" type="button" disabled={locked || !currentLeger.length} onClick={handleQuickFill}
            data-tooltip={`Terapkan ${QUICK_FILL_COLUMNS.find(column => column.key === quickFillColumn)?.label || 'nilai'} ke Semua Siswa`}
            aria-label={`Terapkan ${QUICK_FILL_COLUMNS.find(column => column.key === quickFillColumn)?.label || 'nilai'} ke Semua Siswa`}>
            <i aria-hidden="true" className="fa-solid fa-wand-magic-sparkles" />
          </button>
          <button data-module-action data-action-variant="soft" data-action-tone="success" type="button" onClick={downloadTemplate} data-tooltip="Unduh Template DKN" aria-label="Unduh Template DKN">
            <i aria-hidden="true" className="fa-solid fa-file-arrow-down" />
          </button>
          <button data-module-action data-action-variant="soft" data-action-tone="info" type="button" disabled={locked || !currentLeger.length} onClick={() => setIsDknModalOpen(true)}
            data-tooltip="Impor Nilai DKN" aria-label="Impor Nilai DKN">
            <i aria-hidden="true" className="fa-solid fa-file-arrow-up" />
          </button>
          <button data-module-action data-action-variant="soft" data-action-tone="primary" type="button"
            disabled={locked || !currentLeger.length || !draftReady || !hasUnsavedGrades} onClick={handleSaveDraft}
            data-tooltip="Simpan Draft Nilai" aria-label="Simpan Draft Nilai">
            <i aria-hidden="true" className="fa-solid fa-floppy-disk" />
          </button>
          <button data-module-action data-action-variant="soft" data-action-tone="send" type="button" disabled={locked || !currentLeger.length || !draftReady} onClick={handleSubmitGrades}
            data-tooltip="Kirim Nilai ke Wali Kelas" aria-label="Kirim Nilai ke Wali Kelas">
            <i aria-hidden="true" className="fa-solid fa-paper-plane" />
          </button>
        </div>
      </div>
      {!currentLeger.length && <p className="module-panel text-xs text-slate-600">Belum ada data siswa untuk kelas ini.</p>}

      {/* Tabel Input Nilai Siswa */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="module-table-caption flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-brand-400"></i>
            <span>Daftar Nilai Siswa {targetClassId} - Mapel: {activeMapel.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span role="status" className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-bold ${sent ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              <i aria-hidden="true" className={`fa-solid ${sent ? 'fa-circle-check' : 'fa-clock'}`} />
              {submissionStatus}
            </span>
            <span aria-live="polite" className={hasUnsavedGrades ? 'text-amber-300' : 'text-emerald-300'}>
              {hasUnsavedGrades ? 'Perubahan belum disimpan' : Object.keys(savedGrades).length > 0 ? 'Draft tersimpan' : ''}
            </span>
            <span className="text-slate-400 font-mono">KKM Mapel: {activeMapel.kkm}</span>
          </div>
        </div>

        <div ref={tableViewportRef} className="module-table max-h-[550px] custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold sticky top-0 z-10 border-b border-slate-300">
              <tr>
                <th className="py-2 px-3 text-center w-12">No</th>
                <th className="py-2 px-3 w-28">NO INDUK</th>
                <th className="py-2 px-4 whitespace-nowrap">NAMA LENGKAP</th>
                <th className="py-2 px-2 text-center w-12">L/P</th>
                {UH_COLUMNS.map(column => (
                  <th key={column.key} className="py-2 px-1 text-center whitespace-nowrap">{column.label}</th>
                ))}
                <th className="py-2 px-1 text-center whitespace-nowrap">NILAI STS</th>
                <th className="w-px whitespace-nowrap px-1 py-2 text-center">RATA-RATA</th>
                <th className="w-px whitespace-nowrap px-2 py-2 text-center">Ketercapaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pageStudents.map((student) => {
                const val = scoreFor(student);
                const average = averageFor(student);
                const isTuntas = average !== '' && average >= activeMapel.kkm;

                return (
                  <tr key={student.nis} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-center font-mono font-semibold">{student.no}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{student.nis}</td>
                    <td className="py-2 px-4 font-bold text-slate-800 whitespace-nowrap">{student.nama}</td>
                    <td className="py-2 px-2 text-center text-slate-500 font-mono">{student.lp}</td>
                    {UH_COLUMNS.map(column => (
                      <td key={column.key} className="py-2 px-1 text-center">
                        <input type="number" min="0" max="100" aria-label={column.label + ' ' + student.nama}
                          value={gradesDraft[student.nis + ':' + column.key] ?? ''}
                          disabled={locked}
                          onChange={event => editDraftGrades({ [student.nis + ':' + column.key]: event.target.value })}
                          className="w-14 rounded-lg border border-slate-300 px-1 py-1 text-center" />
                      </td>
                    ))}
                    <td className="py-2 px-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={locked}
                        value={val}
                        onChange={e => editDraftGrades({ [student.nis]: e.target.value })}
                        className={`w-16 py-1 px-1 rounded-lg border text-center font-mono font-bold text-xs focus:ring-2 focus:ring-brand-500 outline-none transition ${
                          average !== '' && !isTuntas ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-800'
                        }`}
                      />
                    </td>
                    <td className="px-1 py-2 text-center font-mono">{average === '' ? '–' : average}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-center font-semibold">
                      {average !== '' ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isTuntas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isTuntas ? 'Tercapai' : 'Perlu Bimbingan'}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ModulePagination
          totalItems={currentLeger.length}
          pageSize={pageSize}
          onPageSizeChange={size => {
            setPageSize(size);
            changePage(1);
          }}
          currentPage={safePage}
          onPageChange={changePage}
          itemLabel="siswa"
        />

      </div>

      {/* Modal Import DKN Excel */}
      <ImportDknModal
        key={draftKey}
        fixedTarget
        onImport={items => {
          const studentIds = new Set(currentLeger.map(student => student.nis));
          const imported = Object.fromEntries(items.filter(item => studentIds.has(item.nis)).flatMap(item => [
            [item.nis, item.sts ?? item.score],
            ...Object.entries(item.uhScores || {}).map(([key, value]) => [`${item.nis}:${key}`, value]),
          ]));
          editDraftGrades(imported);
        }}
        isOpen={isDknModalOpen}
        onClose={() => setIsDknModalOpen(false)}
        targetClass={targetClassId}
        targetMapel={selectedMapelKey}
      />

    </div>
  );
}
