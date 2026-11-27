'use client';

import ModuleHeading from '@/components/common/ModuleHeading';
import ModuleSearch from '@/components/common/ModuleSearch';
import ModulePagination from '@/components/common/ModulePagination';
import ImportStudentBiodataModal from '@/components/import/ImportStudentBiodataModal';
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatStudentBirth, studentBiodataKey, STUDENT_BIODATA_FIELDS } from '@/lib/studentBiodata';

export default function DataSiswaPage() {
  const {
    isSuperAdmin,
    isWaliKelas,
    currentUser,
    allClasses,
    legerByClass,
    studentBiodata,
    saveStudentBiodata,
    importStudentBiodata,
    classStatus,
    changeReportStudent,
    showToast
  } = useApp();

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);

  if (!isSuperAdmin && !isWaliKelas) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-2xs text-center max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-xs">
          <i className="fa-solid fa-lock"></i>
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">Akses Khusus Admin dan Wali Kelas</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Buka menu Data Siswa dengan akun admin atau wali kelas.
          </p>
        </div>
      </div>
    );
  }

  const availableSections = [...new Set(
    allClasses.filter(item => !levelFilter || item.tingkat === levelFilter).map(item => item.id.slice(1))
  )];
  const targetClasses = allClasses.filter(cls => {
    if (isWaliKelas) return cls.id === currentUser.kelasWali;
    if (levelFilter && cls.tingkat !== levelFilter) return false;
    if (sectionFilter && cls.id.slice(1) !== sectionFilter) return false;
    return true;
  });

  const allTargetStudents = targetClasses.flatMap(cls =>
    (legerByClass[cls.id] || []).map(student => ({
      ...student,
      studentClassId: cls.id,
      biodata: studentBiodata[studentBiodataKey(cls.id, student.nis)] || {},
    }))
  );

  const filteredStudents = allTargetStudents.filter(student =>
    [student.nama, student.nis, student.studentClassId, student.keterangan, student.biodata.namaOrangTua]
      .join(' ').toLowerCase().includes(search.trim().toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

  const activeClassId = isWaliKelas ? currentUser.kelasWali : levelFilter && sectionFilter ? `${levelFilter}${sectionFilter}` : '';
  const activeClassInfo = activeClassId ? allClasses.find(c => c.id === activeClassId) : null;
  const titleSuffix = activeClassId ? `Kelas ${activeClassId}` : levelFilter ? `Kelas ${levelFilter}` : sectionFilter ? `Bagian ${sectionFilter}` : 'Semua Kelas';
  const identityLocked = Boolean(classStatus[editing?.classId]?.isLocked);

  const handleSaveEdit = (event) => {
    event.preventDefault();
    if (!editing) return;
    if (isSuperAdmin && !identityLocked && !editing.nama.trim()) return;
    if (!saveStudentBiodata(editing.classId, editing.nis, editing.biodata)) return;
    if (isSuperAdmin && !identityLocked) {
      changeReportStudent(editing.classId, editing.nis, {
        nama: editing.nama.trim(),
        lp: editing.lp,
        keterangan: editing.keterangan.trim()
      });
    }
    setEditing(null);
    showToast('Data siswa berhasil diperbarui.', 'success');
  };

  const handleDeleteStudent = (classId, nis, nama) => {
    changeReportStudent(classId, nis, null);
    setDeletingKey(null);
    showToast(`Data siswa ${nama} berhasil dihapus.`, 'info');
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="module-panel space-y-3">
        <ModuleHeading
          label="Data Master"
          title={`Data Siswa – ${titleSuffix}`}
          description={
            activeClassInfo
              ? <>Wali Kelas: <strong>{activeClassInfo.wali}</strong> · Kelola daftar siswa kelas {activeClassId}</>
              : 'Menampilkan seluruh data siswa dari semua rombel kelas.'
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Cakupan Kelas:</span>
            <span className="font-bold text-slate-800">
              {activeClassInfo ? `${activeClassId} • ${activeClassInfo.wali}` : `${targetClasses.length} Rombel`}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Siswa:</span>
            <span className="font-bold text-brand-700">{allTargetStudents.length} Siswa</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Putra / Putri:</span>
            <span className="font-bold text-slate-800">
              {filteredStudents.filter(s => s.lp === 'L').length} L / {filteredStudents.filter(s => s.lp === 'P').length} P
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Ditampilkan:</span>
            <span className="font-bold text-slate-800">{filteredStudents.length} Siswa</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
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
          {isSuperAdmin && <>
          <select
            aria-label="Kelas"
            value={levelFilter}
            onChange={event => {
              setLevelFilter(event.target.value);
              setSectionFilter('');
              setCurrentPage(1);
            }}
            className="module-control"
          >
            <option value="">Kelas</option>
            {['7', '8', '9'].map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          <select
            aria-label="Bagian"
            value={sectionFilter}
            onChange={event => {
              setSectionFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="module-control"
          >
            <option value="">Bagian</option>
            {availableSections.map(sec => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
          </>}
          <ModuleSearch
            aria-label="Cari siswa"
            placeholder="Cari nama, NIS, atau kelas..."
            value={search}
            onChange={event => { setSearch(event.target.value); setCurrentPage(1); }}
          />
        </div>

        {isSuperAdmin && <div aria-label="Aksi data siswa" className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 md:shrink-0 md:border-l md:border-t-0 md:pl-3 md:pt-0">
          <button data-module-action data-action-variant="soft" data-action-tone="info" type="button" onClick={() => setImportOpen(true)}
            data-tooltip="Impor Biodata Excel" aria-label="Impor Biodata Excel">
            <i aria-hidden="true" className="fa-solid fa-file-arrow-up" />
          </button>
          <button data-module-action data-action-variant="soft" data-action-tone="primary"
            type="button"
            onClick={() => showToast('Fitur tambah siswa akan aktif ketika backend database terhubung!', 'info')}
            data-tooltip="Tambah Siswa"
            aria-label="Tambah Siswa"
          >
            <i aria-hidden="true" className="fa-solid fa-plus" />
          </button>
        </div>}
      </div>

      {/* Tabel Data Siswa */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-users text-brand-400"></i>
            <span>Daftar Siswa – {titleSuffix} ({filteredStudents.length} siswa ditampilkan)</span>
          </div>
          <span className="text-slate-400 text-[11px] font-mono">
            {activeClassInfo ? `Wali Kelas: ${activeClassInfo.wali}` : `${targetClasses.length} kelas aktif`}
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar max-h-[560px]">
          <table className="module-table-compact w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-300 sticky top-0 z-10">
              <tr>
                <th className="text-center w-10">No</th>
                <th className="w-32">NIS</th>
                <th>Nama Lengkap Siswa</th>
                <th className="text-center w-14">L/P</th>
                <th className="text-center w-16 bg-brand-50 text-brand-900">Kelas</th>
                <th className="min-w-[165px]" data-tooltip="Tempat, Tanggal Lahir">TTL</th>
                <th className="min-w-[150px]">Nama Orang Tua</th>
                <th>Keterangan</th>
                <th className="text-center w-28">Aksi</th>
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
                const rowKey = `${student.studentClassId}-${student.nis}`;
                const isDeleting = deletingKey === rowKey;

                return (
                  <tr key={rowKey} className={`hover:bg-brand-50/40 transition text-slate-700 ${isDeleting ? 'bg-rose-50' : ''}`}>
                    <td className="text-center font-mono font-semibold text-slate-500">{startIndex + index + 1}</td>
                    <td className="font-mono text-slate-500 text-[11px]">{student.nis}</td>
                    <td className="font-bold text-slate-800">{student.nama}</td>
                    <td className="text-center text-slate-500 font-mono text-[11px]">{student.lp}</td>
                    <td className="text-center font-black text-brand-700 bg-brand-50/50 text-[11px]">
                      {student.studentClassId}
                    </td>
                    <td>{formatStudentBirth(student.biodata) || '–'}</td>
                    <td>{student.biodata.namaOrangTua || '–'}</td>
                    <td className="text-slate-600 text-[11px]">
                      {student.keterangan || 'Aktif'}
                    </td>
                    <td className="text-center">
                      {isDeleting ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student.studentClassId, student.nis, student.nama)}
                            data-tooltip="Konfirmasi Hapus"
                            aria-label="Konfirmasi Hapus"
                            className="module-action border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200"
                          >
                            <i aria-hidden="true" className="fa-solid fa-trash" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingKey(null)}
                            data-tooltip="Batal"
                            aria-label="Batal"
                            className="module-action border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                          >
                            <i aria-hidden="true" className="fa-solid fa-xmark" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingKey(null);
                              setEditing({
                                classId: student.studentClassId,
                                nis: student.nis,
                                nama: student.nama,
                                lp: student.lp,
                                keterangan: student.keterangan || 'Aktif',
                                biodata: { tempatLahir: '', tanggalLahir: '', namaOrangTua: '', ...student.biodata },
                              });
                            }}
                            data-tooltip={isWaliKelas ? 'Edit Biodata' : 'Edit Siswa'}
                            aria-label={isWaliKelas ? 'Edit Biodata' : 'Edit Siswa'}
                            data-module-action data-action-tone="info"
                          >
                            <i aria-hidden="true" className="fa-solid fa-pen" />
                          </button>
                          {isSuperAdmin && <button
                            type="button"
                            onClick={() => {
                              setEditing(null);
                              setDeletingKey(rowKey);
                            }}
                            data-tooltip="Hapus Siswa"
                            aria-label="Hapus Siswa"
                            className="module-action border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          >
                            <i aria-hidden="true" className="fa-solid fa-trash" />
                          </button>}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ModulePagination
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
          currentPage={safePage}
          onPageChange={setCurrentPage}
          itemLabel="siswa"
        />
      </div>

      {/* Modal Edit Siswa */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <ModuleHeading
                compact
                label="Edit Data"
                title={`${isWaliKelas ? 'Edit Biodata' : 'Edit Siswa'} (${editing.nis})`}
                description={`${editing.nama} · Kelas ${editing.classId}`}
              />
              <button data-module-action data-action-variant="soft" data-action-tone="neutral"
                type="button"
                onClick={() => setEditing(null)}
                data-tooltip="Tutup Modal"
                aria-label="Tutup Modal"
              >
                <i aria-hidden="true" className="fa-solid fa-xmark" />
              </button>
            </div>

            <form className="space-y-3 text-xs" onSubmit={handleSaveEdit}>
              {isSuperAdmin && (
                <fieldset disabled={identityLocked} className="space-y-3 disabled:opacity-60">
                  {identityLocked && <p className="text-slate-600">Identitas utama dikunci bersama Leger. Biodata tetap dapat diperbarui.</p>}
                  <label className="block space-y-1 text-[11px] font-bold text-slate-600">
                    <span>Nama Lengkap Siswa</span>
                    <input required className="module-control w-full" value={editing.nama}
                      onChange={event => setEditing({ ...editing, nama: event.target.value })} />
                  </label>
                  <label className="block space-y-1 text-[11px] font-bold text-slate-600">
                    <span>Jenis Kelamin (L/P)</span>
                    <select className="module-control w-full" value={editing.lp}
                      onChange={event => setEditing({ ...editing, lp: event.target.value })}>
                      <option value="L">L (Laki-laki)</option>
                      <option value="P">P (Perempuan)</option>
                    </select>
                  </label>
                  <label className="block space-y-1 text-[11px] font-bold text-slate-600">
                    <span>Keterangan</span>
                    <input className="module-control w-full" value={editing.keterangan}
                      onChange={event => setEditing({ ...editing, keterangan: event.target.value })} />
                  </label>
                </fieldset>
              )}
              {STUDENT_BIODATA_FIELDS.map(({ key, label, type }) => (
                <label key={key} className="block space-y-1 font-bold text-slate-600">
                  <span className="text-[11px]">{label}</span>
                  <input type={type} name={key} className="module-control w-full" value={editing.biodata[key]}
                    onChange={event => {
                      const value = event.target.value;
                      setEditing(previous => ({ ...previous, biodata: { ...previous.biodata, [key]: value } }));
                    }} />
                </label>
              ))}

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
      {isSuperAdmin && importOpen && (
        <ImportStudentBiodataModal students={filteredStudents} onImport={importStudentBiodata}
          onClose={() => setImportOpen(false)} showToast={showToast} />
      )}
    </div>
  );
}
