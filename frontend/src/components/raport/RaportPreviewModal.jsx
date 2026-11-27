'use client';

import React, { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { prepareRaportPrint } from '@/lib/raportPrint';
import { studentBiodataKey } from '@/lib/studentBiodata';
import PrintableRaport from './PrintableRaport';

export default function RaportPreviewModal() {
  const { 
    isPreviewOpen, 
    closeRaportModal, 
    previewStudent, 
    setPreviewStudent, 
    previewClassId,
    allClasses,
    allMapel,
    legerByClass,
    studentBiodata,
    schoolSettings, 
    waliReportSettings,
  } = useApp();
  const contentRef = useRef(null);

  if (!isPreviewOpen || !previewStudent) return null;
  const activeClassInfo = allClasses.find(item => item.id === previewClassId);
  const currentLeger = legerByClass[previewClassId] || [];

  // Temukan indeks siswa saat ini untuk navigasi next/prev
  const currentIndex = currentLeger.findIndex(s => s.nis === previewStudent.nis);
  const prevStudent = currentIndex > 0 ? currentLeger[currentIndex - 1] : null;
  const nextStudent = currentIndex < currentLeger.length - 1 ? currentLeger[currentIndex + 1] : null;

  const handlePrint = async () => {
    const content = contentRef.current;
    if (!content) return;
    await prepareRaportPrint(content);
    if (contentRef.current !== content) return;
    window.print();
  };

  return (
    <div className="raport-preview-print fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      
      {/* Outer Modal Container */}
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 print:block print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Modal Toolbar (Disembunyikan saat print) */}
        <div className="no-print module-table-caption flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-t-2xl">
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
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {/* Navigasi Siswa Sebelumnya */}
            <button data-module-action data-action-variant="soft" data-action-tone="neutral"
              type="button"
              disabled={!prevStudent}
              onClick={() => prevStudent && setPreviewStudent(prevStudent)}
              data-tooltip="Siswa Sebelumnya"
            aria-label="Siswa Sebelumnya"
            >
              <i aria-hidden="true" className="fa-solid fa-arrow-left text-[10px]"></i>
            </button>

            {/* Navigasi Siswa Berikutnya */}
            <button data-module-action data-action-variant="soft" data-action-tone="info"
              type="button"
              disabled={!nextStudent}
              onClick={() => nextStudent && setPreviewStudent(nextStudent)}
              data-tooltip="Siswa Berikutnya"
            aria-label="Siswa Berikutnya"
            >
              <i aria-hidden="true" className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>

            <div className="h-5 w-px bg-slate-700 mx-1"></div>

            {/* Tombol Cetak / PDF */}
            <button data-module-action data-action-variant="soft" data-action-tone="print"
              type="button"
              onClick={handlePrint}
              data-tooltip="Cetak Dokumen atau Simpan sebagai PDF"
            aria-label="Cetak Dokumen atau Simpan sebagai PDF"
            >
              <i aria-hidden="true" className="fa-solid fa-print"></i>
            </button>

            {/* Tombol Tutup */}
            <button data-module-action data-action-variant="soft" data-action-tone="danger"
              type="button"
              onClick={closeRaportModal}
              className="ml-1"
              data-tooltip="Tutup Modal"
            aria-label="Tutup Modal"
            >
              <i aria-hidden="true" className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Modal Body / Printable Raport Container */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:overflow-visible print:bg-white print:p-0 custom-scrollbar">
          <PrintableRaport
            student={previewStudent}
            subjects={allMapel}
            schoolSettings={schoolSettings}
            classInfo={activeClassInfo}
            parentName={studentBiodata[studentBiodataKey(previewClassId, previewStudent.nis)]?.namaOrangTua}
            waliReportSettings={waliReportSettings}
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
