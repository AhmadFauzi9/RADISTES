'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import ModuleHeading from '@/components/common/ModuleHeading';
import { downloadStudentBiodataTemplate, readStudentBiodataRows } from '@/lib/studentBiodataWorkbook';

export default function ImportStudentBiodataModal({ students, onImport, onClose, showToast }) {
  const [fileName, setFileName] = useState('');
  const [entries, setEntries] = useState([]);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState('');

  async function readFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = '';
    setFileName(file.name);
    setEntries([]);
    setError('');
    setIsReading(true);
    try {
      const rows = readStudentBiodataRows(XLSX, await file.arrayBuffer());
      setEntries(rows);
      if (!rows.length) setError('Belum ada kolom biodata yang diisi di file ini.');
    } catch (failure) {
      setError(failure.message || 'File Excel tidak dapat dibaca.');
    } finally {
      setIsReading(false);
    }
  }

  function applyImport(event) {
    event.preventDefault();
    if (isReading || !entries.length || !onImport(entries)) return;
    showToast(`Biodata ${entries.length} siswa berhasil diperbarui.`, 'success');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
      <form role="dialog" aria-modal="true" aria-label="Impor Biodata Siswa" onSubmit={applyImport}
        className="module-panel w-full max-w-lg space-y-4 text-xs shadow-xl">
        <ModuleHeading title="Impor Biodata Siswa" label="Excel"
          description="Perbarui tempat lahir, tanggal lahir, dan nama orang tua siswa terdaftar." />
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-slate-600">Template memuat siswa sesuai hasil filter pada tabel. Sel biodata kosong mempertahankan data lama.</p>
          <button type="button" data-module-action data-action-tone="success" disabled={!students.length}
            onClick={() => downloadStudentBiodataTemplate(students, showToast)}
            title="Unduh Template Biodata" aria-label="Unduh Template Biodata">
            <i aria-hidden="true" className="fa-solid fa-file-arrow-down" />
          </button>
        </div>
        <div className="module-upload">
          <input id="student-biodata-file" type="file" className="sr-only"
            aria-label="Pilih file Excel biodata" accept=".xlsx,.xls" disabled={isReading} onChange={readFile} />
          <label htmlFor="student-biodata-file" className="block cursor-pointer space-y-2">
            <span className="module-upload-icon mx-auto"><i aria-hidden="true" className="fa-solid fa-file-excel" /></span>
            <span className="block break-all font-bold text-slate-800">{fileName || 'Pilih file Excel biodata'}</span>
            {isReading && <span className="block text-slate-600">Membaca file…</span>}
            {!isReading && entries.length > 0 && <span className="block text-emerald-700">{entries.length} baris siap diimpor</span>}
          </label>
        </div>
        {error && <p role="alert" className="text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={onClose} className="module-control">Batal</button>
          <button type="submit" disabled={isReading || !entries.length}
            className="rounded-lg bg-brand-600 px-3 font-bold text-white hover:bg-brand-700 disabled:opacity-50">Impor Biodata</button>
        </div>
      </form>
    </div>
  );
}
