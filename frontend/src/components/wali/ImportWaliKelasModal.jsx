'use client';

import ModuleHeading from '@/components/common/ModuleHeading';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { downloadExcelTemplate } from '@/lib/excelTemplate';
import { useApp } from '@/context/AppContext';

export default function ImportWaliKelasModal({ isOpen, onClose }) {
  const { allClasses, bulkImportWaliKelas, showToast } = useApp();

  const [fileName, setFileName] = useState('');
  const [previewAssignments, setPreviewAssignments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Baca file Excel penugasan wali kelas
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Identifikasi kolom: KELAS, WALI KELAS, NO TELPON
        let colClass = 0;
        let colWali = 1;
        let colTelp = 2;

        let startRow = 0;
        for (let i = 0; i < Math.min(6, rows.length); i++) {
          const r = rows[i] || [];
          r.forEach((cell, idx) => {
            const str = String(cell || '').trim().toUpperCase();
            if (str.includes('KELAS')) { colClass = idx; startRow = i + 1; }
            if (str.includes('WALI') || str.includes('GURU')) { colWali = idx; }
            if (str.includes('TELP') || str.includes('HP') || str.includes('WA')) { colTelp = idx; }
          });
        }

        const assignments = [];
        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;
          const kls = String(row[colClass] || '').trim().toUpperCase();
          const wali = String(row[colWali] || '').trim();
          const telp = String(row[colTelp] || '').trim();

          if (kls && wali && kls.length <= 4) {
            assignments.push({
              kelas: kls,
              wali: wali,
              telp: telp || '-'
            });
          }
        }

        setPreviewAssignments(assignments);
        showToast(`Berhasil membaca ${assignments.length} penugasan wali kelas dari Excel!`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Gagal memproses file Excel: ' + err.message, 'error');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleApply = () => {
    if (previewAssignments.length === 0) {
      showToast('Tidak ada data penugasan untuk diimpor.', 'warning');
      return;
    }

    bulkImportWaliKelas(previewAssignments);
    onClose();
  };

  // Unduh Template Excel SK Penugasan Wali Kelas
  const handleDownloadTemplate = async () => {
    const wsData = [
      ['KELAS', 'WALI KELAS', 'NO TELPON'],
      ...allClasses.map(c => [c.nama, c.wali, c.telp])
    ];

    const downloaded = await downloadExcelTemplate({
      rows: wsData,
      sheetName: 'PENUGASAN WALI KELAS',
      fileName: 'TEMPLATE_PENUGASAN_WALI_KELAS_49_KELAS.xlsx',
      widths: [14, 42, 23],
      textColumns: [0, 2],
      inputColumns: [1, 2],
    }, showToast);
    if (downloaded) showToast('Template penugasan wali kelas berhasil diunduh!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <ModuleHeading compact label="Impor Excel" title="Impor Penugasan Wali Kelas" description="Unggah Excel pembagian tugas wali kelas." />
          <button data-module-action
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          title="Tutup Modal"
          aria-label="Tutup Modal"
          >
            <i aria-hidden="true" className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Upload Box */}
        <div className="module-upload">
          <input
            type="file"
            id="wali-file-input" aria-label="Impor Penugasan Wali Kelas"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="sr-only"
          />
          <label htmlFor="wali-file-input" className="cursor-pointer space-y-2 block">
            <div className="module-upload-icon">
              <i className="fa-solid fa-file-excel"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {fileName ? fileName : 'Pilih file Excel Pembagian / SK Wali Kelas'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Format kolom: KELAS | WALI KELAS | NO TELPON
              </p>
            </div>
          </label>
        </div>

        {/* Template Link */}
        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-slate-500">Gunakan template resmi untuk menghindari kesalahan kolom:</span>
          <button data-module-action data-action-tone="success"
            type="button"
            onClick={handleDownloadTemplate}
            className="text-brand-700 font-bold hover:underline cursor-pointer text-[11px]"
          title="Unduh Template 49 Kelas"
          aria-label="Unduh Template 49 Kelas"
          >
            <i aria-hidden="true" className="fa-solid fa-download"></i>
          </button>
        </div>

        {/* Preview Data */}
        {previewAssignments.length > 0 && (
          <div className="flex-1 overflow-hidden border border-slate-200 rounded-xl flex flex-col">
            <div className="module-table-caption flex flex-wrap items-center justify-between gap-2">
              <span>Preview Penugasan ({previewAssignments.length} Kelas)</span>
              <span className="text-[10px] text-emerald-300 font-bold">Siap Disimpan</span>
            </div>
            <div className="overflow-y-auto max-h-48 custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 text-[10.5px] border-b">
                  <tr>
                    <th className="py-1 px-3 w-16">Kelas</th>
                    <th className="py-1 px-4">Nama Wali Kelas</th>
                    <th className="py-1 px-4 font-mono">No. Telpon / WA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewAssignments.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1 px-3 font-black text-brand-700">{item.kelas}</td>
                      <td className="py-1 px-4 font-bold text-slate-800">{item.wali}</td>
                      <td className="py-1 px-4 font-mono text-slate-500">{item.telp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button data-module-action
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          title="Batal"
          aria-label="Batal"
          >
            <i aria-hidden="true" className="fa-solid fa-xmark" />
          </button>
          <button data-module-action data-action-tone="primary"
            type="button"
            disabled={previewAssignments.length === 0 || isProcessing}
            onClick={handleApply}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
          title="Terapkan Penugasan Wali Kelas"
          aria-label="Terapkan Penugasan Wali Kelas"
          >
            <i aria-hidden="true" className="fa-solid fa-check"></i>
          </button>
        </div>

      </div>
    </div>
  );
}
