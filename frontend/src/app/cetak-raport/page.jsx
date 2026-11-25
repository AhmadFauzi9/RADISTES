'use client';

import ModuleSearch from '@/components/common/ModuleSearch';
import ModuleHeading from '@/components/common/ModuleHeading';
import ModulePagination from '@/components/common/ModulePagination';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import * as XLSX from 'xlsx';
import { useApp } from '@/context/AppContext';
import PrintableRaport from '@/components/raport/PrintableRaport';
import { waitForRaportImages } from '@/lib/raportPrint';

export default function CetakRaportPage() {
  const {
    currentUser,
    isWaliKelas,
    isGuruMapelOnly,
    schoolSettings,
    allClasses,
    allMapel,
    legerByClass,
    classStatus,
    changeReportStudent,
    openRaportModal
  } = useApp();

  const [levelFilter, setLevelFilter] = useState(isWaliKelas ? currentUser?.kelasWali?.slice(0, 1) || '' : '');
  const [sectionFilter, setSectionFilter] = useState(isWaliKelas ? currentUser?.kelasWali?.slice(1) || '' : '');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [printJob, setPrintJob] = useState(null);
  const printRaportRef = useRef(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  if (isGuruMapelOnly) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-2xs text-center max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-xs">
          <i className="fa-solid fa-lock"></i>
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">Akses Khusus Wali Kelas & Admin</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Cetak raport hanya tersedia untuk Wali Kelas dan Administrator.
          </p>
        </div>
      </div>
    );
  }

  const effectiveLevel = isWaliKelas ? currentUser.kelasWali.slice(0, 1) : levelFilter;
  const effectiveSection = isWaliKelas ? currentUser.kelasWali.slice(1) : sectionFilter;

  const availableSections = [...new Set(
    allClasses.filter(item => !effectiveLevel || item.tingkat === effectiveLevel).map(item => item.id.slice(1))
  )];
  const targetClasses = allClasses.filter(cls => {
    if (effectiveLevel && cls.tingkat !== effectiveLevel) return false;
    if (effectiveSection && cls.id.slice(1) !== effectiveSection) return false;
    return true;
  });

  const students = targetClasses.flatMap(cls =>
    (legerByClass[cls.id] || []).map(student => ({
      ...student,
      studentClassId: student.kelas || cls.id,
      classInfo: cls,
    }))
  );

  const filtered = students.filter(student =>
    [student.nama, student.nis, student.studentClassId].join(' ').toLowerCase().includes(search.trim().toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedStudents = filtered.slice(startIndex, startIndex + pageSize);

  const activeClassId = effectiveLevel && effectiveSection ? `${effectiveLevel}${effectiveSection}` : '';
  const activeClassInfo = activeClassId ? allClasses.find(item => item.id === activeClassId) : null;
  const locked = activeClassId ? classStatus[activeClassId]?.isLocked : false;
  const titleSuffix = activeClassId ? `Kelas ${activeClassId}` : effectiveLevel ? `Kelas ${effectiveLevel}` : effectiveSection ? `Bagian ${effectiveSection}` : 'Semua Kelas';

  const headers = ['No Induk', 'Nama Lengkap', 'Kelas', ...allMapel.map(item => item.name), 'Jumlah Nilai', 'Peringkat'];
  const gradeRows = filtered.map(student => [
    student.nis, student.nama, student.studentClassId,
    ...allMapel.map(item => student.grades?.[item.key] ?? ''),
    student.totalNilai ?? '',
    student.ranking ?? ''
  ]);

  async function print(kind, student) {
    if (printJob) return;
    flushSync(() => setPrintJob({ kind, students: student ? [student] : filtered }));
    try {
      if (kind === 'raport' && schoolSettings.logoKop) {
        const printArea = printRaportRef.current;
        await waitForRaportImages(printArea);
        if (!printArea || printRaportRef.current !== printArea) return;
      }
      window.print();
    } finally {
      setPrintJob(null);
    }
  }

  function downloadLeger() {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([headers, ...gradeRows]), 'Leger');
    XLSX.writeFile(workbook, `Leger-${effectiveSection || effectiveLevel || 'Semua-Kelas'}.xlsx`);
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="module-panel space-y-3">
        <ModuleHeading
          label="Dokumen Resmi"
          title={`Raport STS – ${titleSuffix}`}
          description={
            activeClassInfo
              ? `Wali kelas ${activeClassInfo.wali} · Tahun Pelajaran ${schoolSettings.tahunAjaran}`
              : `Menampilkan seluruh raport siswa (${targetClasses.length} rombel) · Tahun Pelajaran ${schoolSettings.tahunAjaran}`
          }
        />

        {/* Metadata Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Cakupan Kelas:</span>
            <span className="font-bold text-slate-800">
              {activeClassInfo ? `${effectiveSection} • ${activeClassInfo.wali}` : `${targetClasses.length} Rombel`}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Tahun Pelajaran:</span>
            <span className="font-bold text-slate-800">{schoolSettings.tahunAjaran}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Ujian / Semester:</span>
            <span className="font-bold text-brand-700">{schoolSettings.ujian} {schoolSettings.semester}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Tgl Pembagian Raport:</span>
            <span className="font-bold text-slate-800">{schoolSettings.tglRaport}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <select
            aria-label="Jumlah baris per halaman"
            value={pageSize}
            onChange={event => { setPageSize(Number(event.target.value)); setCurrentPage(1); }}
            className="module-control"
          >
            {[10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <select
            disabled={isWaliKelas}
            aria-label="Kelas"
            className="module-control"
            value={effectiveLevel}
            onChange={event => {
              setLevelFilter(event.target.value);
              setSectionFilter('');
              setCurrentPage(1);
              setEditing(null);
              setDeleting(null);
            }}
          >
            <option value="">Kelas</option>
            {['7', '8', '9'].map(level => <option key={level} value={level}>{level}</option>)}
          </select>
          <select
            disabled={isWaliKelas}
            aria-label="Bagian"
            className="module-control"
            value={effectiveSection}
            onChange={event => {
              setSectionFilter(event.target.value);
              setCurrentPage(1);
              setEditing(null);
              setDeleting(null);
            }}
          >
            <option value="">Bagian</option>
            {availableSections.map(sec => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
          <ModuleSearch
            aria-label="Cari siswa"
            placeholder="Cari nama, nomor induk, atau kelas..."
            value={search}
            onChange={event => { setSearch(event.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 md:shrink-0 md:border-l md:border-t-0 md:pl-3 md:pt-0">
          <button
            type="button"
            disabled={!filtered.length}
            onClick={() => print('raport')}
            title="Cetak Semua Raport (PDF)"
            aria-label="Cetak Semua Raport (PDF)"
            className="module-action border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 disabled:opacity-50"
          >
            <i aria-hidden="true" className="fa-solid fa-file-pdf" />
          </button>
          <button
            type="button"
            disabled={!filtered.length}
            onClick={downloadLeger}
            title="Unduh Leger Excel"
            aria-label="Unduh Leger Excel"
            className="module-action border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            <i aria-hidden="true" className="fa-solid fa-file-excel" />
          </button>
          <button
            type="button"
            disabled={!filtered.length}
            onClick={() => print('leger')}
            title="Cetak Leger (PDF)"
            aria-label="Cetak Leger (PDF)"
            className="module-action border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            <i aria-hidden="true" className="fa-solid fa-print" />
          </button>
        </div>
      </div>

      {/* Tabel Daftar Siswa */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden no-print">
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-print text-brand-400"></i>
            <span>Daftar Siswa – {titleSuffix} ({filtered.length} siswa ditampilkan)</span>
            {locked && (
              <span className="bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Terkunci
              </span>
            )}
          </div>
          <span className="text-slate-400 text-[11px] font-mono">*Klik ikon mata untuk pratinjau raport siswa</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar max-h-[560px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold sticky top-0 z-10 border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 text-center w-10">No</th>
                <th className="py-2.5 px-3 w-28">NO INDUK</th>
                <th className="py-2.5 px-4">NAMA LENGKAP</th>
                <th className="py-2.5 px-2 text-center w-10">L/P</th>
                <th className="py-2.5 px-2 text-center w-16 bg-brand-50 text-brand-900">KELAS</th>
                <th className="py-2.5 px-3 text-center w-24 bg-indigo-50 text-indigo-900">JUMLAH</th>
                <th className="py-2.5 px-3 text-center w-20 bg-amber-50 text-amber-900">RANKING</th>
                <th className="py-2.5 px-3 text-center w-20 bg-indigo-50 text-indigo-900">RERATA</th>
                <th className="py-2.5 px-3 text-center w-32">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    <i className="fa-solid fa-inbox text-2xl mb-1 block"></i>
                    Tidak ada siswa yang sesuai.
                  </td>
                </tr>
              ) : paginatedStudents.map((student, index) => {
                const isRowLocked = classStatus[student.studentClassId]?.isLocked;
                return (
                  <tr key={`${student.studentClassId}-${student.nis}`} className="hover:bg-brand-50/40 transition group text-slate-700">
                    <td className="py-2 px-3 text-center font-mono font-semibold">{startIndex + index + 1}</td>
                    <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{student.nis}</td>
                    <td className="py-2 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {student.ranking <= 3 && (
                          <i className={`fa-solid fa-trophy text-xs ${
                            student.ranking === 1 ? 'text-amber-500' :
                            student.ranking === 2 ? 'text-slate-400' : 'text-amber-700'
                          }`}></i>
                        )}
                        <span>{student.nama}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-500 text-[11px]">{student.lp}</td>
                    <td className="py-2 px-2 text-center font-black text-brand-700 bg-brand-50/50 text-[11px]">{student.studentClassId}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 bg-indigo-50/30">
                      {student.totalNilai ?? '–'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-black text-amber-900 bg-amber-50/40">
                      <span className={`inline-block px-1.5 py-0.5 rounded-md text-xs ${
                        student.ranking === 1 ? 'bg-amber-500 text-white shadow-2xs' :
                        student.ranking === 2 ? 'bg-slate-400 text-white' :
                        student.ranking === 3 ? 'bg-amber-700 text-white' : ''
                      }`}>
                        {student.ranking ?? '–'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-brand-700 bg-indigo-50/30">
                      {student.rataRata || '–'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openRaportModal(student, student.studentClassId)}
                          title="Pratinjau Raport"
                          aria-label="Pratinjau Raport"
                          className="p-1.5 px-2.5 rounded-lg bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                        >
                          <i aria-hidden="true" className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          disabled={isRowLocked}
                          onClick={() => setEditing({ classId: student.studentClassId, nis: student.nis, nama: student.nama, lp: student.lp })}
                          title="Edit Siswa"
                          aria-label="Edit Siswa"
                          className="p-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                        >
                          <i aria-hidden="true" className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => print('raport', student)}
                          title="Simpan PDF"
                          aria-label="Simpan PDF"
                          className="p-1.5 px-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                        >
                          <i aria-hidden="true" className="fa-solid fa-download"></i>
                        </button>
                        <button
                          type="button"
                          disabled={isRowLocked}
                          onClick={() => setDeleting({ ...student, classId: student.studentClassId })}
                          title="Hapus Siswa"
                          aria-label="Hapus Siswa"
                          className="p-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                        >
                          <i aria-hidden="true" className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Konfirmasi Hapus */}
        {deleting && (
          <div role="alert" className="flex flex-wrap items-center gap-3 border-t border-rose-200 p-3 bg-rose-50 text-xs">
            <i className="fa-solid fa-triangle-exclamation text-rose-500"></i>
            <span className="font-semibold text-rose-800">Hapus <strong>{deleting.nama}</strong> beserta nilainya dari leger {deleting.classId}?</span>
            <button
              type="button"
              onClick={() => { changeReportStudent(deleting.classId, deleting.nis, null); setDeleting(null); }}
              title="Konfirmasi Hapus" aria-label="Konfirmasi Hapus"
              className="module-action border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200"
            >
              <i aria-hidden="true" className="fa-solid fa-trash" />
            </button>
            <button type="button" onClick={() => setDeleting(null)} title="Batal" aria-label="Batal"
              className="module-action border-slate-200 bg-white text-slate-600 hover:bg-slate-100">
              <i aria-hidden="true" className="fa-solid fa-xmark" />
            </button>
          </div>
        )}

        <ModulePagination
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
          currentPage={safePage}
          onPageChange={setCurrentPage}
          itemLabel="siswa"
        />
      </div>

      {/* Modal Edit Siswa */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <ModuleHeading
                compact
                label="Edit Data"
                title={`Edit Siswa (${editing.nis})`}
                description={`Kelas ${editing.classId}`}
              />
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="module-action border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                title="Tutup Modal"
                aria-label="Tutup Modal"
              >
                <i aria-hidden="true" className="fa-solid fa-xmark" />
              </button>
            </div>

            <form
              className="space-y-3 text-xs"
              onSubmit={event => {
                event.preventDefault();
                if (!editing.nama.trim()) return;
                changeReportStudent(editing.classId, editing.nis, { nama: editing.nama.trim(), lp: editing.lp });
                setEditing(null);
              }}
            >
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600">Nama Lengkap Siswa:</label>
                <input
                  required
                  aria-label="Nama lengkap"
                  className="module-control w-full"
                  placeholder="Nama lengkap siswa"
                  value={editing.nama}
                  onChange={event => setEditing({ ...editing, nama: event.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600">Jenis Kelamin (L/P):</label>
                <select
                  aria-label="Jenis kelamin"
                  className="module-control w-full"
                  value={editing.lp}
                  onChange={event => setEditing({ ...editing, lp: event.target.value })}
                >
                  <option value="L">L (Laki-laki)</option>
                  <option value="P">P (Perempuan)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <i aria-hidden="true" className="fa-solid fa-floppy-disk" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Output: Raport */}
      {printJob?.kind === 'raport' && (
        <div ref={printRaportRef} className="hidden print-only">
          {printJob.students.map((student, index) => (
            <div key={`${student.studentClassId}-${student.nis}`} className={index < printJob.students.length - 1 ? 'print-page-break' : undefined}>
              <PrintableRaport
                student={student}
                classInfo={student.classInfo || activeClassInfo}
                schoolSettings={schoolSettings}
                totalStudents={(legerByClass[student.studentClassId] || []).length}
              />
            </div>
          ))}
        </div>
      )}

      {/* Print Output: Leger */}
      {printJob?.kind === 'leger' && (
        <div className="hidden print-only">
          <h2 className="font-bold">Leger STS {titleSuffix} · {schoolSettings.tahunAjaran}</h2>
          <table className="w-full border-collapse text-[7px]">
            <thead><tr>{['No Induk', 'Nama Lengkap', 'Kelas', ...allMapel.map(item => item.short), 'Jumlah', 'Peringkat'].map((title, index) =>
              <th className="border p-0.5" key={index}>{title}</th>
            )}</tr></thead>
            <tbody>{gradeRows.map((row, index) =>
              <tr key={index}>{row.map((value, column) => <td className="border p-0.5" key={column}>{value}</td>)}</tr>
            )}</tbody>
          </table>
        </div>
      )}

    </div>
  );
}
