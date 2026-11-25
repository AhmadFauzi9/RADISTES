'use client';

import ModuleSearch from '@/components/common/ModuleSearch';
import ModuleHeading from '@/components/common/ModuleHeading';
import ModulePagination from '@/components/common/ModulePagination';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '@/context/AppContext';

export default function SubmissionTable() {
  const { allClasses, allMapel, teachersList, submissionRecords } = useApp();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [classId, setClassId] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const availableSections = [...new Set(
    allClasses.filter(item => !levelFilter || item.tingkat === levelFilter).map(item => item.id.slice(1))
  )];

  // Tampilkan seluruh penugasan guru mapel dengan status dummy jika belum ada record setoran
  const allRows = teachersList
    .filter(teacher => !teacher.isAdmin)
    .flatMap(teacher =>
      (teacher.assignments || []).map((assignment, idx) => {
        const recordKey = [teacher.username, assignment.classId, assignment.subjectKey].join(':');
        const record = submissionRecords[recordKey];
        const dummySent = (teacher.username.charCodeAt(0) + assignment.classId.charCodeAt(0) + idx) % 3 !== 0;
        const isSent = record ? Boolean(record.sent) : dummySent;

        return {
          key: recordKey,
          Kode: teacher.username,
          Guru: teacher.nama,
          Kelas: assignment.classId,
          Mapel: allMapel.find(item => item.key === assignment.subjectKey)?.name || assignment.subjectKey,
          Status: isSent ? 'Sudah mengirim' : 'Belum mengirim',
          _sent: isSent,
        };
      })
    );

  const rows = allRows.filter(row =>
    (!levelFilter || row.Kelas.startsWith(levelFilter)) &&
    (!classId || row.Kelas.slice(1) === classId) &&
    (!status || row.Status === status) &&
    ['Kode', 'Guru', 'Kelas', 'Mapel', 'Status'].map(k => row[k]).join(' ').toLowerCase().includes(search.trim().toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  const sentCount = rows.filter(r => r._sent).length;
  const headers = ['Kode', 'Guru', 'Kelas', 'Mapel', 'Status'];

  function download() {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows.map(r => ({
      Kode: r.Kode, Guru: r.Guru, Kelas: r.Kelas, Mapel: r.Mapel, Status: r.Status
    })), { header: headers }), 'Setoran');
    XLSX.writeFile(book, 'status-setoran-nilai.xlsx');
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="module-panel space-y-3">
        <ModuleHeading
          label="Pemantauan Admin"
          title="Status Setor Nilai Guru Mapel"
          description="Pantau status pengiriman nilai seluruh guru mata pelajaran per kelas dan mata pelajaran."
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Total Penugasan:</span>
            <span className="font-bold text-slate-800">{allRows.length} Penugasan</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Sudah Mengirim:</span>
            <span className="font-bold text-emerald-700">{sentCount} Penugasan</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Belum Mengirim:</span>
            <span className="font-bold text-amber-700">{rows.length - sentCount} Penugasan</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Ditampilkan:</span>
            <span className="font-bold text-brand-700">{rows.length} Data</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <select
            aria-label="Jumlah baris per halaman"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="module-control"
          >
            {[10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <select
            className="module-control"
            aria-label="Kelas"
            value={levelFilter}
            onChange={e => { setLevelFilter(e.target.value); setClassId(''); setCurrentPage(1); }}
          >
            <option value="">Kelas</option>
            {['7', '8', '9'].map(level => <option key={level} value={level}>{level}</option>)}
          </select>
          <select
            className="module-control"
            aria-label="Bagian"
            value={classId}
            onChange={e => {
              setClassId(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Bagian</option>
            {availableSections.map(sec => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
          <select
            className="module-control"
            aria-label="Filter status"
            value={status}
            onChange={e => { setStatus(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Status</option>
            <option value="Sudah mengirim">Sudah mengirim</option>
            <option value="Belum mengirim">Belum mengirim</option>
          </select>
          <ModuleSearch
            aria-label="Cari setoran"
            placeholder="Cari guru, kelas, atau mapel..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2 md:shrink-0 md:border-l md:border-t-0 md:pl-3 md:pt-0">
          <button
            type="button"
            disabled={!rows.length}
            onClick={download}
            title="Ekspor Excel"
            aria-label="Ekspor Excel"
            className="module-action border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            <i aria-hidden="true" className="fa-solid fa-file-excel" />
          </button>
        </div>
      </div>

      {/* Tabel Setoran */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-paper-plane text-brand-400"></i>
            <span>Daftar Setoran Nilai Guru Mapel ({rows.length} data)</span>
          </div>
          <span className="text-slate-400 text-[11px] font-mono">*Status diperbarui otomatis setiap guru mengirim nilai</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar max-h-[560px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold sticky top-0 z-10 border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 text-center w-10">No</th>
                <th className="py-2.5 px-3 w-24">KODE</th>
                <th className="py-2.5 px-4">NAMA GURU</th>
                <th className="py-2.5 px-3 text-center w-20 bg-brand-50 text-brand-900">KELAS</th>
                <th className="py-2.5 px-4">MATA PELAJARAN</th>
                <th className="py-2.5 px-3 text-center w-36">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <i className="fa-solid fa-inbox text-2xl mb-1 block"></i>
                    Belum ada data guru mapel yang sesuai.
                  </td>
                </tr>
              ) : paginatedRows.map((row, index) => (
                <tr key={row.key} className="hover:bg-brand-50/40 transition text-slate-700">
                  <td className="py-2 px-3 text-center font-mono font-semibold text-slate-500">{startIndex + index + 1}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{row.Kode}</td>
                  <td className="py-2 px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-chalkboard-user text-slate-400 text-xs"></i>
                      <span>{row.Guru}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center font-black text-brand-700 bg-brand-50/50">{row.Kelas}</td>
                  <td className="py-2 px-4 text-slate-700">{row.Mapel}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      row._sent
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <i className={`fa-solid ${row._sent ? 'fa-circle-check' : 'fa-clock'}`}></i>
                      {row.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ModulePagination
          totalItems={rows.length}
          pageSize={pageSize}
          onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
          currentPage={safePage}
          onPageChange={setCurrentPage}
          itemLabel="data"
        />
      </div>

    </div>
  );
}
