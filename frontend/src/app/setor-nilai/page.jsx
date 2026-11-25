'use client';

import ModuleHeading from '@/components/common/ModuleHeading';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { teachingAssignments } from '@/lib/teaching';
import SubmissionTable from '@/components/grades/SubmissionTable';
import { useApp } from '@/context/AppContext';
import ImportDknModal from '@/components/import/ImportDknModal';

export default function SetorNilaiPage() {
  const { currentUser, isSuperAdmin, allClasses, allMapel, legerByClass, schoolSettings, classStatus, importDknScores, showToast, recordSubmission } = useApp();
  const [classChoice, setTargetClassId] = useState('');
  const [subjectChoice, setSelectedMapelKey] = useState('');
  const [quickScoreInput, setQuickScoreInput] = useState('');
  const [isDknModalOpen, setIsDknModalOpen] = useState(false);
  const [drafts, setDrafts] = useState({});
  const assignments = teachingAssignments(currentUser, allMapel);
  const eligibleClasses = isSuperAdmin ? allClasses : allClasses.filter(item => assignments.some(assignment => assignment.classId === item.id));
  const targetClassId = eligibleClasses.some(item => item.id === classChoice) ? classChoice : eligibleClasses[0]?.id;
  const eligibleSubjects = isSuperAdmin ? allMapel : allMapel.filter(item => assignments.some(assignment => assignment.classId === targetClassId && assignment.subjectKey === item.key));
  const selectedMapelKey = eligibleSubjects.some(item => item.key === subjectChoice) ? subjectChoice : eligibleSubjects[0]?.key;
  const activeMapel = allMapel.find(m => m.key === selectedMapelKey);
  const currentLeger = legerByClass[targetClassId] || [];
  const draftKey = targetClassId + ':' + selectedMapelKey;
  const gradesDraft = drafts[draftKey] || {};
  const locked = classStatus[targetClassId]?.isLocked;
  const scoreFor = student => gradesDraft[student.nis] ?? student.grades[selectedMapelKey] ?? '';
  const averageFor = student => {
    const sts = scoreFor(student);
    if (sts === '') return '';
    const scores = [sts, gradesDraft[student.nis + ':uh1'], gradesDraft[student.nis + ':uh2']]
      .filter(value => value !== undefined && value !== '').map(Number);
    if (scores.some(value => !Number.isFinite(value) || value < 0 || value > 100)) return '';
    return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  };
  const handleScoreChange = (nis, value) => {
    recordSubmission(targetClassId, selectedMapelKey);
    setDrafts(prev => ({ ...prev, [draftKey]: { ...prev[draftKey], [nis]: value } }));
  };
  const handleSubmitGrades = () => {
    const scores = currentLeger.filter(student => averageFor(student) !== '')
      .map(student => ({ nis: student.nis, score: averageFor(student) }))
      .filter(item => Number.isFinite(item.score) && item.score >= 0 && item.score <= 100);
    if (locked || !scores.length || currentLeger.some(student => scoreFor(student) === '') || scores.length !== currentLeger.length) {
      showToast('Lengkapi nilai 0–100. Leger yang terkunci tidak dapat diubah.', 'warning');
      return;
    }
    importDknScores(targetClassId, selectedMapelKey, scores, 'Nilai telah dikirim ke leger wali kelas.');
  };
  const handleQuickFill = () => {
    const value = Number(quickScoreInput);
    if (quickScoreInput.trim() === '' || !Number.isFinite(value) || value < 0 || value > 100) {
      showToast('Masukkan nilai valid antara 0–100.', 'warning');
      return;
    }
    setDrafts(prev => ({ ...prev, [draftKey]: Object.fromEntries(currentLeger.map(student => [student.nis, value])) }));
    if (currentLeger.length) recordSubmission(targetClassId, selectedMapelKey);
  };
  const downloadTemplate = () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      [`DAFTAR NILAI STS ${String(schoolSettings.semester || 'GANJIL').toUpperCase()} MTs AL AMIRIYYAH BLOKAGUNG TAHUN PELAJARAN ${schoolSettings.tahunAjaran}`],
      [`KELAS : ${targetClassId} | MAPEL : ${activeMapel.name} | KKM : ${activeMapel.kkm}`],
      ['NO', 'NO INDUK', 'NAMA LENGKAP', 'UH 1', 'UH 2', 'NILAI STS', 'NILAI RATA-RATA', 'KETERCAPAIAN'],
      ...currentLeger.map((student, index) => [index + 1, student.nis, student.nama]),
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'DKN');
    XLSX.writeFile(workbook, `DKN-${targetClassId}-${selectedMapelKey}.xlsx`);
  };

  if (isSuperAdmin) return <SubmissionTable />;
  if (!activeMapel) return <p className="text-sm">Belum ada penugasan mengajar. Hubungi admin.</p>;

  return (
    <div className="space-y-4">
      
      {/* Header Info */}
      <div className="module-panel space-y-3">
        <ModuleHeading label="Portal Guru Mapel" title="Setor Nilai STS" description="Isi nilai siswa secara manual atau impor dari Excel DKN." />

      </div>
      <div className="module-toolbar" aria-label="Kontrol Setor Nilai">
        <select aria-label="Kelas" value={targetClassId?.slice(0, 1) || ''} onChange={event => {
          const level = event.target.value;
          const firstClass = eligibleClasses.find(c => c.tingkat === level);
          if (firstClass) setTargetClassId(firstClass.id);
        }} className="module-control">
          {['7', '8', '9']
            .filter(level => eligibleClasses.some(c => c.tingkat === level))
            .map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
        </select>
        <select aria-label="Bagian" value={targetClassId} onChange={event => setTargetClassId(event.target.value)} className="module-control">
          {eligibleClasses
            .filter(c => c.tingkat === targetClassId?.slice(0, 1))
            .map(c => (
              <option key={c.id} value={c.id}>{c.id.slice(1)}</option>
            ))}
        </select>
        <select aria-label="Mata Pelajaran yang Diampu" value={selectedMapelKey} onChange={event => setSelectedMapelKey(event.target.value)}
          className="module-control min-w-0 max-w-full">
        {eligibleSubjects.map(m => (
          <option key={m.key} value={m.key}>
            {m.code}. {m.name} (KKM: {m.kkm})
          </option>
        ))}
        </select>
        <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
          <button data-module-action data-action-tone="success" type="button" onClick={downloadTemplate} title="Unduh Template DKN" aria-label="Unduh Template DKN">
            <i aria-hidden="true" className="fa-solid fa-file-arrow-down" />
          </button>
          <button data-module-action data-action-tone="success" type="button" disabled={locked || !currentLeger.length} onClick={() => setIsDknModalOpen(true)}
            title="Impor Nilai DKN" aria-label="Impor Nilai DKN">
            <i aria-hidden="true" className="fa-solid fa-file-import" />
          </button>
          <input type="number" min="0" max="100" aria-label="Isi Nilai Cepat" value={quickScoreInput} onChange={event => setQuickScoreInput(event.target.value)}
            placeholder="Isi nilai" className="module-control w-24 text-center font-mono" disabled={locked || !currentLeger.length} />
          <button data-module-action type="button" disabled={locked || !currentLeger.length} onClick={handleQuickFill}
            title="Terapkan Nilai ke Semua Siswa" aria-label="Terapkan Nilai ke Semua Siswa">
            <i aria-hidden="true" className="fa-solid fa-wand-magic-sparkles" />
          </button>
          <button data-module-action data-action-tone="primary" type="button" disabled={locked || !currentLeger.length} onClick={handleSubmitGrades}
            title="Kirim Nilai ke Wali Kelas" aria-label="Kirim Nilai ke Wali Kelas">
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
          <span className="text-slate-400 font-mono text-[11px]">KKM Mapel: {activeMapel.kkm}</span>
        </div>

        <div className="module-table max-h-[550px] custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold sticky top-0 z-10 border-b border-slate-300">
              <tr>
                <th className="py-2 px-3 text-center w-12">No</th>
                <th className="py-2 px-3 w-28">NO INDUK</th>
                <th className="py-2 px-4">NAMA LENGKAP</th>
                <th className="py-2 px-2 text-center w-12">L/P</th>
                <th className="py-2 px-4 text-center">UH 1</th>
                <th className="py-2 px-4 text-center">UH 2</th>
                <th className="py-2 px-4 text-center w-36">NILAI STS</th>
                <th className="py-2 px-4 text-center">NILAI RATA-RATA</th>
                <th className="py-2 px-4 text-center w-36">Ketercapaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentLeger.map((student) => {
                const val = scoreFor(student);
                const average = averageFor(student);
                const isTuntas = average !== '' && average >= activeMapel.kkm;

                return (
                  <tr key={student.nis} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-center font-mono font-semibold">{student.no}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{student.nis}</td>
                    <td className="py-2 px-4 font-bold text-slate-800">{student.nama}</td>
                    <td className="py-2 px-2 text-center text-slate-500 font-mono">{student.lp}</td>
                    {['uh1', 'uh2'].map(field => (
                      <td key={field} className="py-2 px-2 text-center">
                        <input type="number" min="0" max="100" aria-label={field.toUpperCase() + ' ' + student.nama}
                          value={gradesDraft[student.nis + ':' + field] ?? ''}
                          onChange={event => handleScoreChange(student.nis + ':' + field, event.target.value)}
                          className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center" />
                      </td>
                    ))}
                    <td className="py-2 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) => handleScoreChange(student.nis, e.target.value)}
                        className={`w-28 py-1 px-2 rounded-lg border text-center font-mono font-bold text-xs focus:ring-2 focus:ring-brand-500 outline-none transition ${
                          average !== '' && !isTuntas ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-800'
                        }`}
                      />
                    </td>
                    <td className="py-2 px-4 text-center font-mono">{average === '' ? '–' : average}</td>
                    <td className="py-2 px-4 text-center font-semibold">
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

      </div>

      {/* Modal Import DKN Excel */}
      <ImportDknModal
        key={draftKey}
        fixedTarget
        onImport={items => {
          const imported = Object.fromEntries(items.filter(item => item.nis).map(item => [item.nis, item.score]));
          if (currentLeger.some(student => Object.hasOwn(imported, student.nis))) recordSubmission(targetClassId, selectedMapelKey);
          setDrafts(prev => ({ ...prev, [draftKey]: { ...prev[draftKey], ...imported } }));
        }}
        isOpen={isDknModalOpen}
        onClose={() => setIsDknModalOpen(false)}
        targetClass={targetClassId}
        targetMapel={selectedMapelKey}
      />

    </div>
  );
}
