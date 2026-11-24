'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import ImportWaliKelasModal from '@/components/wali/ImportWaliKelasModal';
import * as XLSX from 'xlsx';

export default function DataSiswaPage() {
  const { 
    currentUser,
    isSuperAdmin,
    isWaliKelas,
    allClasses, 
    selectedClassId, 
    setSelectedClassId, 
    activeClassInfo, 
    currentLeger,
    updateSingleWaliKelas,
    openRaportModal,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState(isWaliKelas ? 'siswa' : 'walikelas'); // 'siswa' | 'walikelas'
  const [filterTingkat, setFilterTingkat] = useState('all'); // 'all' | '7' | '8' | '9'
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null); // { id, wali, telp }

  const filteredClasses = allClasses.filter(c => {
    if (filterTingkat === 'all') return true;
    return c.tingkat === filterTingkat;
  });

  const handleSaveEditWali = (e) => {
    e.preventDefault();
    if (!editingClass) return;
    updateSingleWaliKelas(editingClass.id, editingClass.wali, editingClass.telp);
    setEditingClass(null);
  };

  const handleExportWaliExcel = () => {
    const wsData = [
      ['KELAS', 'WALI KELAS', 'NO TELPON'],
      ...allClasses.map(c => [c.nama, c.wali, c.telp])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PENUGASAN WALI KELAS");
    XLSX.writeFile(wb, "DAFTAR_PENUGASAN_WALI_KELAS_49_KELAS.xlsx");
    showToast('File penugasan wali kelas berhasil diexport ke Excel!', 'success');
  };

  return (
    <div className="space-y-4">
      
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded-lg bg-brand-100 text-brand-800 font-extrabold text-[10px] uppercase tracking-wider">
                Master Data MTs Al Amiriyyah
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                DATA SISWA & PENUGASAN 49 WALI KELAS
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur penugasan wali kelas untuk 49 kelas (7A-7P, 8A-8R, 9A-9O), import SK dari Excel, dan kelola data siswa.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('walikelas')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'walikelas' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-user-tie mr-1"></i> Penugasan 49 Wali Kelas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('siswa')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'siswa' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-users mr-1"></i> Data Siswa ({selectedClassId})
            </button>
          </div>
        </div>

        {/* Toolbar Sesuai Tab Aktif */}
        {activeTab === 'walikelas' ? (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Filter Tingkat:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFilterTingkat('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${filterTingkat === 'all' ? 'bg-brand-600 text-white' : 'bg-white border text-slate-700'}`}
                >
                  Semua (49)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTingkat('7')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${filterTingkat === '7' ? 'bg-brand-600 text-white' : 'bg-white border text-slate-700'}`}
                >
                  Kelas 7 (16)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTingkat('8')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${filterTingkat === '8' ? 'bg-brand-600 text-white' : 'bg-white border text-slate-700'}`}
                >
                  Kelas 8 (18)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTingkat('9')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${filterTingkat === '9' ? 'bg-brand-600 text-white' : 'bg-white border text-slate-700'}`}
                >
                  Kelas 9 (15)
                </button>
              </div>
            </div>

            {/* Action Buttons: Import Excel SK Wali Kelas */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportWaliExcel}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-file-excel text-emerald-600"></i>
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <span>Import Excel Pengusulan / SK Wali Kelas</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Pilih Kelas:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 font-bold bg-white text-slate-800 focus:outline-none"
              >
                {allClasses.map(c => (
                  <option key={c.id} value={c.id}>Kelas {c.nama} ({c.wali})</option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-slate-400">Total Siswa:</span>{' '}
              <strong className="text-slate-800">{currentLeger.length} Siswa</strong>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'walikelas' ? (
        /* TABEL 49 PENUGASAN WALI KELAS */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-user-tie text-brand-400"></i>
              <span>Daftar 49 Penugasan Wali Kelas MTs Al Amiriyyah ({filteredClasses.length} Kelas Ditampilkan)</span>
            </div>
            <span className="text-slate-400 text-[11px] font-mono">
              *Klik tombol edit untuk mengubah guru yang ditugaskan
            </span>
          </div>

          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-300 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">No</th>
                  <th className="py-2.5 px-3 text-center w-20">Tingkat</th>
                  <th className="py-2.5 px-3 text-center w-20">Kelas</th>
                  <th className="py-2.5 px-4">Nama Lengkap Wali Kelas</th>
                  <th className="py-2.5 px-4 font-mono">No. Telepon / WhatsApp</th>
                  <th className="py-2.5 px-3 text-center w-36">Aksi Penugasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClasses.map((cls, idx) => (
                  <tr key={cls.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-center font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 text-center font-semibold text-slate-600">Kelas {cls.tingkat}</td>
                    <td className="py-2 px-3 text-center font-black text-brand-700 bg-brand-50/50">{cls.nama}</td>
                    <td className="py-2 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-chalkboard-user text-slate-400 text-xs"></i>
                        <span>{cls.wali}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 font-mono text-slate-600">{cls.telp}</td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingClass({ id: cls.id, wali: cls.wali, telp: cls.telp })}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                          title="Ubah Penugasan Guru"
                        >
                          <i className="fa-solid fa-pen-to-square text-brand-600"></i>
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClassId(cls.id);
                            showToast(`Beralih ke Leger Kelas ${cls.id} (Wali: ${cls.wali})`, 'info');
                          }}
                          className="px-2.5 py-1 bg-brand-50 hover:bg-brand-600 hover:text-white text-brand-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Buka Leger
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TABEL DATA SISWA */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
            <span>Daftar Siswa Kelas {selectedClassId} (Wali: {activeClassInfo?.wali})</span>
            <button
              type="button"
              onClick={() => showToast('Fitur tambah siswa akan aktif ketika backend database terhubung!', 'info')}
              className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition"
            >
              <i className="fa-solid fa-plus mr-1"></i> Tambah Siswa
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">No</th>
                  <th className="py-2.5 px-3 w-32">NIS</th>
                  <th className="py-2.5 px-4">Nama Lengkap Siswa</th>
                  <th className="py-2.5 px-2 text-center w-16">L/P</th>
                  <th className="py-2.5 px-3 text-center w-24">Ranking</th>
                  <th className="py-2.5 px-3 text-center w-28">Rata-rata</th>
                  <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentLeger.map((student) => (
                  <tr key={student.nis} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-center font-mono font-semibold">{student.no}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{student.nis}</td>
                    <td className="py-2 px-4 font-bold text-slate-800">{student.nama}</td>
                    <td className="py-2 px-2 text-center text-slate-500 font-mono">{student.lp}</td>
                    <td className="py-2 px-3 text-center font-bold text-amber-700">#{student.ranking}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-brand-700">{student.rataRata}</td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => openRaportModal(student)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        <i className="fa-solid fa-print mr-1"></i> Raport
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Edit Penugasan Wali Kelas */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i className="fa-solid fa-user-pen text-brand-600"></i>
                Edit Penugasan Wali Kelas {editingClass.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveEditWali} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Wali Kelas:</label>
                <input
                  type="text"
                  required
                  value={editingClass.wali}
                  onChange={(e) => setEditingClass({ ...editingClass, wali: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Nama guru wali kelas..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Telepon / WhatsApp:</label>
                <input
                  type="text"
                  value={editingClass.telp}
                  onChange={(e) => setEditingClass({ ...editingClass, telp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Simpan Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bulk Import SK Penugasan Wali Kelas */}
      <ImportWaliKelasModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

    </div>
  );
}
