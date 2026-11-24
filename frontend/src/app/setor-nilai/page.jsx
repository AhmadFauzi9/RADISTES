'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import ImportDknModal from '@/components/import/ImportDknModal';

export default function SetorNilaiPage() {
  const { 
    currentUser,
    isSuperAdmin,
    isWaliKelas,
    isGuruMapelOnly,
    allClasses, 
    allMapel, 
    currentLeger, 
    updateStudentGrade, 
    activeClassInfo,
    showToast 
  } = useApp();

  const [selectedMapelKey, setSelectedMapelKey] = useState(
    currentUser.mapelAjar && currentUser.mapelAjar[0] ? currentUser.mapelAjar[0] : 'mat'
  );
  const [targetClassId, setTargetClassId] = useState('7K');
  const [teacherName, setTeacherName] = useState(currentUser.nama);
  const [quickScoreInput, setQuickScoreInput] = useState('');
  const [isDknModalOpen, setIsDknModalOpen] = useState(false);

  const activeMapel = allMapel.find(m => m.key === selectedMapelKey) || allMapel[8];

  // Local draft nilai per siswa
  const [gradesDraft, setGradesDraft] = useState(() => {
    const initial = {};
    currentLeger.forEach(s => {
      initial[s.nis] = s.grades[selectedMapelKey] || 75;
    });
    return initial;
  });

  const handleScoreChange = (nis, val) => {
    setGradesDraft(prev => ({
      ...prev,
      [nis]: val
    }));
  };

  // Simulasikan pengiriman ke wali kelas
  const handleSubmitGrades = (e) => {
    e.preventDefault();

    Object.entries(gradesDraft).forEach(([nis, val]) => {
      updateStudentGrade(nis, selectedMapelKey, val);
    });

    showToast(`Nilai ${activeMapel.name} berhasil dikirim dan disinkronkan ke Leger Wali Kelas ${targetClassId}!`, 'success');
  };

  const handleQuickFill = () => {
    const val = Number(quickScoreInput);
    if (!val || val < 0 || val > 100) {
      showToast('Masukkan nilai valid antara 0 - 100', 'warning');
      return;
    }
    const updated = {};
    currentLeger.forEach(s => {
      updated[s.nis] = val;
    });
    setGradesDraft(updated);
    showToast(`Nilai seluruh siswa diset ke ${val}`, 'info');
  };

  return (
    <div className="space-y-4">
      
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider">
                Portal Guru Mapel
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                INPUT & IMPORT NILAI DKN MATA PELAJARAN
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Guru mata pelajaran dapat memasukkan nilai manual atau mengimpor file Excel DKN (Daftar Kumpulan Nilai).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Utama: Import File DKN Excel */}
            <button
              type="button"
              onClick={() => setIsDknModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <i className="fa-solid fa-file-excel"></i>
              <span>Import Nilai dari File Excel DKN</span>
            </button>

            {!isGuruMapelOnly && (
              <Link
                href="/leger"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <i className="fa-solid fa-table-list"></i>
                <span>Buka Leger</span>
              </Link>
            )}
          </div>
        </div>

        {/* Form Pilihan Mapel & Kelas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Mata Pelajaran yang Diampu:</label>
            <select
              value={selectedMapelKey}
              onChange={(e) => setSelectedMapelKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            >
              {allMapel.map(m => (
                <option key={m.key} value={m.key}>
                  {m.code}. {m.name} (KKM: {m.kkm})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Kelas:</label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            >
              <optgroup label="Kelas 7">
                {allClasses.filter(c => c.tingkat === '7').map(c => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.nama} (Wali: {c.wali})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Kelas 8">
                {allClasses.filter(c => c.tingkat === '8').map(c => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.nama} (Wali: {c.wali})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Kelas 9">
                {allClasses.filter(c => c.tingkat === '9').map(c => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.nama}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Guru Mapel:</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Nama guru pengajar..."
            />
          </div>
        </div>

        {/* Info Box Format DKN */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-check text-emerald-600 text-base shrink-0"></i>
            <div>
              <p className="font-bold">Format Excel DKN MTs Al Amiriyyah Siap Diimport:</p>
              <p className="text-[11px] text-emerald-800">
                Kolom terbaca otomatis: <code>NO, INDUK, NAMA, UH 1, UH 2, N.PTS, N. R, RANK, KET</code>. Nilai diambil dari kolom <strong>N. R (Nilai Raport)</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDknModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Buka Form Upload DKN →
          </button>
        </div>
      </div>

      {/* Toolbar Input & Quick Set */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Isi Nilai Cepat:</span>
          <input
            type="number"
            min="0"
            max="100"
            value={quickScoreInput}
            onChange={(e) => setQuickScoreInput(e.target.value)}
            placeholder="Misal: 85"
            className="w-24 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-center outline-none"
          />
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Terapkan ke Semua
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmitGrades}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
        >
          <i className="fa-solid fa-paper-plane"></i>
          <span>Kirim Nilai ke Wali Kelas</span>
        </button>
      </div>

      {/* Tabel Input Nilai Siswa */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-pen-to-square text-brand-400"></i>
            <span>Daftar Nilai Siswa {targetClassId} - Mapel: {activeMapel.name}</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">KKM Mapel: 70</span>
        </div>

        <div className="overflow-x-auto max-h-[550px] custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold sticky top-0 z-10 border-b border-slate-300">
              <tr>
                <th className="py-2 px-3 text-center w-12">No</th>
                <th className="py-2 px-3 w-28">NIS</th>
                <th className="py-2 px-4">Nama Lengkap Siswa</th>
                <th className="py-2 px-2 text-center w-12">L/P</th>
                <th className="py-2 px-4 text-center w-36">Nilai STS (0-100)</th>
                <th className="py-2 px-4 text-center w-36">Ketercapaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentLeger.map((student) => {
                const val = gradesDraft[student.nis] !== undefined ? gradesDraft[student.nis] : '';
                const numVal = Number(val);
                const isTuntas = numVal >= 70;

                return (
                  <tr key={student.nis} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-center font-mono font-semibold">{student.no}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{student.nis}</td>
                    <td className="py-2 px-4 font-bold text-slate-800">{student.nama}</td>
                    <td className="py-2 px-2 text-center text-slate-500 font-mono">{student.lp}</td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) => handleScoreChange(student.nis, e.target.value)}
                        className={`w-28 py-1 px-2 rounded-lg border text-center font-mono font-bold text-xs focus:ring-2 focus:ring-brand-500 outline-none transition ${
                          numVal < 70 ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-800'
                        }`}
                      />
                    </td>
                    <td className="py-2 px-4 text-center font-semibold">
                      {val !== '' ? (
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

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={handleSubmitGrades}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <i className="fa-solid fa-paper-plane"></i>
            <span>Simpan & Kirim Nilai ke Leger Wali Kelas</span>
          </button>
        </div>
      </div>

      {/* Modal Import DKN Excel */}
      <ImportDknModal
        isOpen={isDknModalOpen}
        onClose={() => setIsDknModalOpen(false)}
        targetClass={targetClassId}
        targetMapel={selectedMapelKey}
      />

    </div>
  );
}
