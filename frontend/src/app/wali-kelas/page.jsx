'use client';

import ModuleHeading from '@/components/common/ModuleHeading';
import ModulePagination from '@/components/common/ModulePagination';
import ModuleSearch from '@/components/common/ModuleSearch';
import React, { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import ImportWaliKelasModal from '@/components/wali/ImportWaliKelasModal';
import * as XLSX from 'xlsx';

export default function WaliKelasPage() {
  const {
    isSuperAdmin,
    allClasses,
    setClassesList,
    updateSingleWaliKelas,
    showToast
  } = useApp();

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const tableViewportRef = useRef(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-2xs text-center max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-xs">
          <i className="fa-solid fa-lock"></i>
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">Akses Khusus Administrator</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Menu Penugasan Wali Kelas hanya tersedia untuk Administrator.
          </p>
        </div>
      </div>
    );
  }

  const availableSections = [...new Set(
    allClasses.filter(c => !levelFilter || c.tingkat === levelFilter).map(c => c.id.slice(1))
  )];
  const filteredClasses = allClasses.filter(c => {
    if (levelFilter && c.tingkat !== levelFilter) return false;
    if (sectionFilter && c.id.slice(1) !== sectionFilter) return false;
    if (search.trim() && ![c.nama, c.wali, c.telp].join(' ').toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });
  const safePage = Math.min(currentPage, Math.max(1, Math.ceil(filteredClasses.length / pageSize)));
  const startIndex = (safePage - 1) * pageSize;
  const pageClasses = filteredClasses.slice(startIndex, startIndex + pageSize);
  const targetClass = allClasses.find(c => c.id === editingClass?.targetClassId);
  const targetLevels = [...new Set(allClasses.map(c => c.tingkat))].sort();
  const targetSections = allClasses.filter(c => c.tingkat === editingClass?.targetLevel);
  const isMovingAssignment = targetClass && targetClass.id !== editingClass.id;

  function changePage(page) {
    setCurrentPage(page);
    if (tableViewportRef.current) tableViewportRef.current.scrollTop = 0;
  }

  const handleSaveEditWali = (e) => {
    e.preventDefault();
    if (!editingClass || !targetClass) return;
    const { id, wali, telp, targetClassId } = editingClass;
    if (updateSingleWaliKelas(id, wali, telp, targetClassId)) setEditingClass(null);
  };

  const handleDeleteWali = (classId) => {
    setClassesList(prev => prev.filter(c => c.id !== classId));
    setSelectedIds(prev => prev.filter(id => id !== classId));
    setDeletingId(null);
    showToast(`Penugasan Wali Kelas ${classId} berhasil dihapus.`, 'info');
  };

  const visibleIds = pageClasses.map(c => c.id);
  const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));

  const toggleSelectAll = () => {
    setConfirmBulkDelete(false);
    if (isAllVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const toggleSelectRow = (id) => {
    setConfirmBulkDelete(false);
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const handleDeleteSelected = () => {
    if (!selectedIds.length) return;
    const count = selectedIds.length;
    setClassesList(prev => prev.filter(c => !selectedIds.includes(c.id)));
    setSelectedIds([]);
    setConfirmBulkDelete(false);
    showToast(`${count} penugasan wali kelas berhasil dihapus.`, 'info');
  };

  const handleExportWaliExcel = () => {
    const wsData = [
      ['KELAS', 'WALI KELAS', 'NO TELPON'],
      ...allClasses.map(c => [c.nama, c.wali, c.telp])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PENUGASAN WALI KELAS');
    XLSX.writeFile(wb, 'DAFTAR_PENUGASAN_WALI_KELAS_49_KELAS.xlsx');
    showToast('File penugasan wali kelas berhasil diexport ke Excel!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="module-panel space-y-3">
        <ModuleHeading
          label="Data Master"
          title="Penugasan Wali Kelas"
          description="Kelola penugasan guru wali kelas untuk seluruh rombel atau impor SK pembagian tugas dari Excel."
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Total Rombel:</span>
            <span className="font-bold text-slate-800">{allClasses.length} Kelas</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Ditampilkan:</span>
            <span className="font-bold text-brand-700">{filteredClasses.length} Kelas</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Tingkat 7 / 8 / 9:</span>
            <span className="font-bold text-slate-800">
              {allClasses.filter(c => c.tingkat === '7').length} / {allClasses.filter(c => c.tingkat === '8').length} / {allClasses.filter(c => c.tingkat === '9').length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Status Data:</span>
            <span className="font-bold text-emerald-700">Sinkronisasi Aktif</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <select
            aria-label="Kelas"
            value={levelFilter}
            onChange={event => {
              setLevelFilter(event.target.value);
              setSectionFilter('');
              changePage(1);
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
              changePage(1);
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
          <ModuleSearch
            aria-label="Cari wali kelas"
            placeholder="Cari kelas, nama wali, atau no. telp..."
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              changePage(1);
            }}
          />
        </div>

        <div aria-label="Aksi wali kelas" className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 md:shrink-0 md:border-l md:border-t-0 md:pl-3 md:pt-0">
          <button data-module-action data-action-variant="soft" data-action-tone="danger"
            type="button"
            disabled={!selectedIds.length}
            onClick={() => setConfirmBulkDelete(true)}
            data-tooltip={selectedIds.length ? `Hapus Terpilih (${selectedIds.length})` : 'Pilih data untuk dihapus'}
            aria-label="Hapus Terpilih"
          >
            <i aria-hidden="true" className="fa-solid fa-trash" />
          </button>
          <button data-module-action data-action-variant="soft" data-action-tone="success"
            type="button"
            onClick={handleExportWaliExcel}
            data-tooltip="Ekspor Excel"
            aria-label="Ekspor Excel"
          >
            <i aria-hidden="true" className="fa-solid fa-file-arrow-down" />
          </button>
          <button data-module-action data-action-variant="soft" data-action-tone="info"
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            data-tooltip="Impor Excel Wali Kelas"
            aria-label="Impor Excel Wali Kelas"
          >
            <i aria-hidden="true" className="fa-solid fa-file-arrow-up" />
          </button>
        </div>
      </div>

      {/* Konfirmasi Hapus Massal */}
      {confirmBulkDelete && selectedIds.length > 0 && (
        <div role="alert" className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-rose-800">
            <i className="fa-solid fa-triangle-exclamation text-rose-500"></i>
            <span>Hapus <strong>{selectedIds.length}</strong> penugasan wali kelas yang dipilih?</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button data-module-action data-action-variant="soft" data-action-tone="danger"
              type="button"
              onClick={handleDeleteSelected}
              data-tooltip="Konfirmasi Hapus Terpilih"
              aria-label="Konfirmasi Hapus Terpilih"
            >
              <i aria-hidden="true" className="fa-solid fa-trash" />
            </button>
            <button data-module-action data-action-variant="soft" data-action-tone="neutral"
              type="button"
              onClick={() => setConfirmBulkDelete(false)}
              data-tooltip="Batal"
              aria-label="Batal"
            >
              <i aria-hidden="true" className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>
      )}

      {/* Tabel Penugasan Wali Kelas */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-user-tie text-brand-400"></i>
            <span>Daftar Penugasan Wali Kelas ({filteredClasses.length} Kelas)</span>
          </div>
          <span className="text-slate-400 text-[11px] font-mono">
            *Klik tombol edit untuk mengubah guru yang ditugaskan
          </span>
        </div>

        <div ref={tableViewportRef} className="overflow-x-auto custom-scrollbar max-h-[560px]">
          <table className="module-table-compact w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-300 sticky top-0 z-10">
              <tr>
                <th className="text-center w-10">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua wali kelas di halaman ini"
                    disabled={!visibleIds.length}
                    checked={isAllVisibleSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                </th>
                <th className="text-center w-10">No</th>
                <th className="text-center w-20 bg-brand-50 text-brand-900">Kelas</th>
                <th>Nama Lengkap Wali Kelas</th>
                <th className="font-mono">No. Telepon / WhatsApp</th>
                <th className="text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <i className="fa-solid fa-inbox text-2xl mb-1 block"></i>
                    Tidak ada kelas yang sesuai dengan filter.
                  </td>
                </tr>
              ) : pageClasses.map((cls, idx) => (
                <tr key={cls.id} className={`hover:bg-brand-50/40 transition text-slate-700 ${deletingId === cls.id ? 'bg-rose-50' : selectedIds.includes(cls.id) ? 'bg-brand-50/30' : ''}`}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      aria-label={`Pilih kelas ${cls.nama}`}
                      checked={selectedIds.includes(cls.id)}
                      onChange={() => toggleSelectRow(cls.id)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </td>
                  <td className="text-center font-mono font-semibold text-slate-500">{startIndex + idx + 1}</td>
                  <td className="text-center font-black text-brand-700 bg-brand-50/50">{cls.nama}</td>
                  <td className="font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-chalkboard-user text-slate-400 text-xs"></i>
                      <span>{cls.wali}</span>
                    </div>
                  </td>
                  <td className="font-mono text-slate-600">{cls.telp}</td>
                  <td className="text-center">
                    {deletingId === cls.id ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteWali(cls.id)}
                          data-tooltip="Konfirmasi Hapus"
                          aria-label="Konfirmasi Hapus"
                          className="module-action border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200"
                        >
                          <i aria-hidden="true" className="fa-solid fa-trash" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
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
                            setDeletingId(null);
                            setEditingClass({
                              id: cls.id,
                              targetLevel: cls.tingkat,
                              targetClassId: cls.id,
                              wali: cls.wali || '',
                              telp: cls.telp || '',
                            });
                          }}
                          data-module-action data-action-tone="info"
                          data-tooltip="Ubah Penugasan Guru"
                          aria-label="Ubah Penugasan Guru"
                        >
                          <i aria-hidden="true" className="fa-solid fa-pen" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClass(null);
                            setDeletingId(cls.id);
                          }}
                          className="module-action border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          data-tooltip="Hapus Penugasan"
                          aria-label="Hapus Penugasan"
                        >
                          <i aria-hidden="true" className="fa-solid fa-trash" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ModulePagination
          totalItems={filteredClasses.length}
          pageSize={pageSize}
          onPageSizeChange={size => {
            setPageSize(size);
            changePage(1);
          }}
          currentPage={safePage}
          onPageChange={changePage}
          itemLabel="kelas"
        />
      </div>

      {/* Modal Edit Penugasan Wali Kelas */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <ModuleHeading compact label="Edit Data" title={`Edit Wali Kelas ${editingClass.id}`} />
              <button data-module-action data-action-variant="soft" data-action-tone="neutral"
                type="button"
                onClick={() => setEditingClass(null)}
                data-tooltip="Tutup Form"
                aria-label="Tutup Form"
              >
                <i aria-hidden="true" className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSaveEditWali} className="space-y-3 text-xs">
              <fieldset>
                <legend className="text-[11px] font-bold text-slate-600 mb-2">
                  Rombel tujuan
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-[11px] font-bold text-slate-600">
                    Kelas
                    <select
                      value={editingClass.targetLevel}
                      onChange={e => setEditingClass({ ...editingClass, targetLevel: e.target.value, targetClassId: '' })}
                      className="module-control mt-1 w-full"
                      required
                    >
                      {targetLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-[11px] font-bold text-slate-600">
                    Bagian
                    <select
                      value={editingClass.targetClassId}
                      onChange={e => setEditingClass({ ...editingClass, targetClassId: e.target.value })}
                      aria-describedby={isMovingAssignment ? 'wali-move-summary' : undefined}
                      className="module-control mt-1 w-full"
                      required
                    >
                      <option value="" disabled>Pilih bagian</option>
                      {targetSections.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.id.slice(cls.tingkat.length)}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {isMovingAssignment && (
                  <p id="wali-move-summary" className="mt-1 text-slate-600">
                    {targetClass?.wali
                      ? `Jika disimpan, ${targetClass.wali} akan menjadi wali kelas ${editingClass.id}.`
                      : `Jika disimpan, rombel ${editingClass.id} akan kosong dari penugasan wali kelas.`}
                  </p>
                )}
              </fieldset>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Wali Kelas:</label>
                <input
                  type="text"
                  required
                  value={editingClass.wali}
                  onChange={(e) => setEditingClass({ ...editingClass, wali: e.target.value })}
                  className="module-control w-full"
                  placeholder="Nama guru wali kelas..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Telepon / WhatsApp:</label>
                <input
                  type="text"
                  value={editingClass.telp}
                  onChange={(e) => setEditingClass({ ...editingClass, telp: e.target.value })}
                  className="module-control w-full"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <i aria-hidden="true" className="fa-solid fa-floppy-disk" />
                  <span>{isMovingAssignment ? (targetClass?.wali ? 'Tukar Penugasan' : 'Pindahkan Penugasan') : 'Simpan'}</span>
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
