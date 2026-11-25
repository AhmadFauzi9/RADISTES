'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import PrintableRaport from './PrintableRaport';

export default function RaportPreviewModal() {
  const { 
    isPreviewOpen, 
    closeRaportModal, 
    previewStudent, 
    setPreviewStudent, 
    currentLeger, 
    schoolSettings, 
    activeClassInfo 
  } = useApp();

  if (!isPreviewOpen || !previewStudent) return null;

  // Temukan indeks siswa saat ini untuk navigasi next/prev
  const currentIndex = currentLeger.findIndex(s => s.nis === previewStudent.nis);
  const prevStudent = currentIndex > 0 ? currentLeger[currentIndex - 1] : null;
  const nextStudent = currentIndex < currentLeger.length - 1 ? currentLeger[currentIndex + 1] : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Outer Modal Container */}
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Modal Toolbar (Disembunyikan saat print) */}
        <div className="no-print p-3 sm:px-6 border-b border-slate-200 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
              <i className="fa-solid fa-file-pdf"></i>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm truncate">
                Preview Raport STS - {previewStudent.nama}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                NIS: {previewStudent.nis} • Kelas {activeClassInfo?.nama || '8A'} • Rank #{previewStudent.ranking}
              </p>
            </div>
          </div>

          {/* Action Buttons: Prev, Next, Print, Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Navigasi Siswa Sebelumnya */}
            <button
              type="button"
              disabled={!prevStudent}
              onClick={() => prevStudent && setPreviewStudent(prevStudent)}
              className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Siswa Sebelumnya"
            >
              <i className="fa-solid fa-arrow-left text-[10px]"></i>
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Navigasi Siswa Berikutnya */}
            <button
              type="button"
              disabled={!nextStudent}
              onClick={() => nextStudent && setPreviewStudent(nextStudent)}
              className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Siswa Berikutnya"
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>

            <div className="h-5 w-px bg-slate-700 mx-1"></div>

            {/* Tombol Cetak / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Cetak Dokumen atau Simpan sebagai PDF"
            >
              <i className="fa-solid fa-print"></i>
              <span>Cetak / PDF</span>
            </button>

            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={closeRaportModal}
              className="p-1.5 px-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs transition cursor-pointer ml-1"
              title="Tutup Modal"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Modal Body / Printable Raport Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:bg-white print:p-0 custom-scrollbar">
          <PrintableRaport
            student={previewStudent}
            schoolSettings={schoolSettings}
            classInfo={activeClassInfo}
            totalStudents={currentLeger.length}
          />
        </div>

        {/* Modal Footer Info */}
        <div className="no-print p-2.5 px-6 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex justify-between items-center rounded-b-2xl">
          <span>
            💡 <em>Tips:</em> Pilih <strong>Save as PDF</strong> pada dialog printer untuk menyimpan file PDF raport siap dibagikan.
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            Halaman {currentIndex + 1} dari {currentLeger.length} Siswa
          </span>
        </div>

      </div>

    </div>
  );
}
