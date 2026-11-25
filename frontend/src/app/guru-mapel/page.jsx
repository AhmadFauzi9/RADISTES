'use client';

import ModuleSearch from '@/components/common/ModuleSearch';
import ModuleHeading from '@/components/common/ModuleHeading';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '@/context/AppContext';

const empty = { kode: '', nama: '', kelas: '', mapel: '' };

export default function GuruMapelPage() {
  const { isSuperAdmin, teachersList, setTeachersList, allClasses, allMapel, showToast } = useApp();
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importRows, setImportRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-2xs text-center max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-xs">
          <i className="fa-solid fa-lock"></i>
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">Akses Khusus Administrator</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Halaman penugasan Guru Mapel hanya tersedia untuk Administrator Kurikulum.
          </p>
        </div>
      </div>
    );
  }

  function saveRows(rows) {
    const assignments = rows.map(row => {
      const kode = String(row.kode ?? '').trim().toLowerCase();
      const nama = String(row.nama ?? '').trim();
      const classId = String(row.kelas ?? '').trim().toUpperCase();
      const mapel = String(row.mapel ?? '').trim().toLowerCase();
      const subject = allMapel.find(item => item.key === mapel || item.name.toLowerCase() === mapel);
      if (!kode || !nama || !allClasses.some(item => item.id === classId) || !subject) return null;
      return { kode, nama, classId, subjectKey: subject.key };
    });
    if (!assignments.length || assignments.some(item => !item || teachersList.some(t => t.isAdmin && t.username === item?.kode))) {
      showToast('Periksa kode guru, nama, kelas, dan mapel pada setiap baris.', 'warning');
      return false;
    }
    setTeachersList(previous => {
      const teachers = new Map(previous.map(teacher => [teacher.username, teacher]));
      for (const { kode, nama, classId, subjectKey } of assignments) {
        const current = teachers.get(kode) || { id: 'g_' + kode, username: kode };
        const list = current.assignments || [];
        teachers.set(kode, {
          ...current, nama,
          assignments: [...list.filter(a => a.classId !== classId || a.subjectKey !== subjectKey), { classId, subjectKey }]
        });
      }
      return [...teachers.values()];
    });
    setForm(empty);
    showToast('Penugasan guru berhasil disimpan.', 'success');
    return true;
  }

  function handleRemoveAssignment(teacherUsername, classId, subjectKey) {
    setTeachersList(previous =>
      classId
        ? previous.map(teacher => {
            if (teacher.username !== teacherUsername) return teacher;
            return { ...teacher, assignments: (teacher.assignments || []).filter(a => !(a.classId === classId && a.subjectKey === subjectKey)) };
          })
        : previous.filter(teacher => teacher.username !== teacherUsername)
    );
    setDeletingKey(null);
    showToast(classId ? 'Penugasan berhasil dihapus.' : 'Data guru berhasil dihapus.', 'info');
  }

  function handleUpdateAssignment(event) {
    event.preventDefault();
    if (!editing || !editing.nama.trim() || !editing.kelas || !editing.mapel) return;
    setTeachersList(previous =>
      previous.map(teacher => {
        if (teacher.username !== editing.teacherUsername) return teacher;
        const filteredAssignments = (teacher.assignments || []).filter(
          a =>
            !(a.classId === editing.oldClassId && a.subjectKey === editing.oldSubjectKey) &&
            !(a.classId === editing.kelas && a.subjectKey === editing.mapel)
        );
        return {
          ...teacher,
          nama: editing.nama.trim(),
          assignments: [...filteredAssignments, { classId: editing.kelas, subjectKey: editing.mapel }],
        };
      })
    );
    setEditing(null);
    showToast('Penugasan guru berhasil diperbarui.', 'success');
  }

  async function importFile(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const book = XLSX.read(await file.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]]);
      const normalized = rows.map(row => Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), v])));
      setImportFileName(file.name);
      setImportRows(normalized);
      showToast(`Berhasil membaca ${normalized.length} baris dari file Excel.`, 'info');
    } catch {
      showToast('File Excel tidak dapat dibaca.', 'warning');
    }
  }

  function handleApplyImport() {
    if (!importRows.length) {
      showToast('Pilih file Excel terlebih dahulu.', 'warning');
      return;
    }
    if (saveRows(importRows)) {
      setImportFileName('');
      setImportRows([]);
      setIsImportModalOpen(false);
    }
  }

  function downloadTemplate() {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['kode', 'nama', 'kelas', 'mapel'],
      ['budi', 'Budi Santoso, S.Pd', '8A', 'mat'],
      ['hendra', 'Hendra Wijaya, S.Kom', '7K', 'tik'],
    ]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Template');
    XLSX.writeFile(book, 'template-penugasan-guru.xlsx');
  }

  const availableSections = [...new Set(
    allClasses.filter(c => !levelFilter || c.tingkat === levelFilter).map(c => c.id.slice(1))
  )];

  const visible = teachersList
    .filter(teacher => !teacher.isAdmin && [teacher.nama, teacher.username].some(v => v.toLowerCase().includes(search.toLowerCase())))
    .flatMap(teacher => {
      const matching = (teacher.assignments || []).filter(a =>
        (!levelFilter || a.classId.startsWith(levelFilter)) &&
        (!classFilter || a.classId.slice(1) === classFilter)
      );
      return matching.length
        ? matching.map(a => ({ ...a, teacher }))
        : (levelFilter || classFilter) ? [] : [{ teacher }];
    });

  const totalGuru = new Set(visible.map(r => r.teacher.username)).size;
  const totalPenugasan = visible.filter(r => r.classId).length;

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="module-panel space-y-3">
        <ModuleHeading
          label="Data Master"
          title="Penugasan Guru Mata Pelajaran"
          description="Kelola kode guru, nama, kelas, dan mata pelajaran yang diampu. Import dari Excel atau tambah satu per satu."
        />

        {/* Statistik Ringkas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Total Guru Mapel:</span>
            <span className="font-bold text-slate-800">{teachersList.filter(t => !t.isAdmin).length} Guru</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Penugasan:</span>
            <span className="font-bold text-brand-700">
              {teachersList.filter(t => !t.isAdmin).reduce((s, t) => s + (t.assignments?.length || 0), 0)} Penugasan
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Ditampilkan (Guru):</span>
            <span className="font-bold text-slate-800">{totalGuru} Guru</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Ditampilkan (Tugas):</span>
            <span className="font-bold text-slate-800">{totalPenugasan} Penugasan</span>
          </div>
        </div>
      </div>

      {/* Toolbar Filter & Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <select
            aria-label="Kelas"
            className="module-control"
            value={levelFilter}
            onChange={event => { setLevelFilter(event.target.value); setClassFilter(''); }}
          >
            <option value="">Kelas</option>
            {['7', '8', '9'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          
          <select
            aria-label="Bagian"
            className="module-control"
            value={classFilter}
            onChange={event => {
              setClassFilter(event.target.value);
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
            aria-label="Cari guru"
            placeholder="Cari nama atau kode guru..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>

        <div aria-label="Aksi penugasan guru" className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 md:shrink-0 md:border-l md:border-t-0 md:pl-3 md:pt-0">
          <button
            type="button"
            onClick={() => { setForm(empty); setIsAddModalOpen(true); }}
            title="Tambah Penugasan Guru"
            aria-label="Tambah Penugasan Guru"
            className="module-action border-brand-600 bg-brand-600 text-white hover:bg-brand-700"
          >
            <i aria-hidden="true" className="fa-solid fa-plus" />
          </button>
          <button
            type="button"
            onClick={() => { setImportFileName(''); setImportRows([]); setIsImportModalOpen(true); }}
            title="Impor Penugasan Excel"
            aria-label="Impor Penugasan Excel"
            className="module-action border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <i aria-hidden="true" className="fa-solid fa-file-import" />
          </button>
        </div>
      </div>

      {/* Tabel Penugasan */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-chalkboard-user text-brand-400"></i>
            <span>Daftar Penugasan Guru Mapel ({totalPenugasan} penugasan dari {totalGuru} guru)</span>
          </div>
          <span className="text-slate-400 text-[11px] font-mono">*Gunakan tombol + atau impor pada toolbar di atas</span>
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
                <th className="py-2.5 px-3 text-center w-28">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <i className="fa-solid fa-inbox text-2xl mb-1 block"></i>
                    Tidak ada guru yang sesuai dengan filter.
                  </td>
                </tr>
              ) : visible.map(({ teacher, classId, subjectKey }, idx) => {
                const rowKey = [teacher.id, classId, subjectKey].join(':');
                const isDeleting = deletingKey === rowKey;
                const mapelName = allMapel.find(m => m.key === subjectKey)?.name || teacher.mapelNama || '–';

                return (
                  <tr key={rowKey} className={`hover:bg-brand-50/40 transition group text-slate-700 ${isDeleting ? 'bg-rose-50' : ''}`}>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{teacher.username}</td>
                    <td className="py-2 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-chalkboard-user text-slate-400 text-xs"></i>
                        <span>{teacher.nama}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center font-black text-brand-700 bg-brand-50/50">
                      {classId || <span className="text-slate-400 font-normal">–</span>}
                    </td>
                    <td className="py-2 px-4 text-slate-700">
                      {classId ? (
                        <span className="inline-flex items-center gap-1.5">
                          <i className="fa-solid fa-book text-slate-400 text-[10px]"></i>
                          {mapelName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum ada penugasan</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isDeleting ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveAssignment(teacher.username, classId, subjectKey)}
                            title="Konfirmasi Hapus"
                            aria-label="Konfirmasi Hapus"
                            className="module-action border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200"
                          >
                            <i aria-hidden="true" className="fa-solid fa-trash" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingKey(null)}
                            title="Batal"
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
                                teacherUsername: teacher.username,
                                oldClassId: classId || '',
                                oldSubjectKey: subjectKey || '',
                                nama: teacher.nama,
                                kelas: classId || allClasses[0]?.id || '',
                                mapel: subjectKey || allMapel[0]?.key || '',
                              });
                            }}
                            title="Edit Penugasan"
                            aria-label="Edit Penugasan"
                            className="module-action border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                          >
                            <i aria-hidden="true" className="fa-solid fa-pen" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(null);
                              setDeletingKey(rowKey);
                            }}
                            title="Hapus Penugasan"
                            aria-label="Hapus Penugasan"
                            className="module-action border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          >
                            <i aria-hidden="true" className="fa-solid fa-trash" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Penugasan Guru */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <ModuleHeading
                compact
                label="Edit Data"
                title={`Edit Penugasan (${editing.teacherUsername})`}
                description="Perbarui nama guru, kelas, atau mata pelajaran yang diampu."
              />
              <button
                type="button"
                onClick={() => setEditing(null)}
                title="Tutup Modal"
                aria-label="Tutup Modal"
                className="module-action border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
              >
                <i aria-hidden="true" className="fa-solid fa-xmark" />
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleUpdateAssignment}>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Nama Lengkap Guru</label>
                <input
                  required
                  aria-label="Nama guru"
                  className="module-control w-full"
                  placeholder="Nama lengkap guru"
                  value={editing.nama}
                  onChange={event => setEditing({ ...editing, nama: event.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Kelas</label>
                  <select
                    required
                    aria-label="Kelas"
                    className="module-control w-full"
                    value={editing.kelas}
                    onChange={event => setEditing({ ...editing, kelas: event.target.value })}
                  >
                    {allClasses.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Mata Pelajaran</label>
                  <select
                    required
                    aria-label="Mata pelajaran"
                    className="module-control w-full"
                    value={editing.mapel}
                    onChange={event => setEditing({ ...editing, mapel: event.target.value })}
                  >
                    {allMapel.map(item => <option key={item.key} value={item.key}>{item.code}. {item.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <i aria-hidden="true" className="fa-solid fa-floppy-disk" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Penugasan Guru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <ModuleHeading
                compact
                label="Penugasan Baru"
                title="Tambah Penugasan Guru Mapel"
                description="Masukkan kode guru, nama lengkap, kelas, dan mata pelajaran yang diampu."
              />
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                title="Tutup Modal"
                aria-label="Tutup Modal"
                className="module-action border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
              >
                <i aria-hidden="true" className="fa-solid fa-xmark" />
              </button>
            </div>

            <form
              className="space-y-3"
              onSubmit={event => {
                event.preventDefault();
                if (saveRows([form])) setIsAddModalOpen(false);
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Kode Guru</label>
                  <input
                    required
                    aria-label="Kode guru"
                    placeholder="cth: budi"
                    className="module-control w-full"
                    value={form.kode}
                    onChange={event => setForm({ ...form, kode: event.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Kelas</label>
                  <select
                    required
                    aria-label="Kelas"
                    className="module-control w-full"
                    value={form.kelas}
                    onChange={event => setForm({ ...form, kelas: event.target.value })}
                  >
                    <option value="">Pilih Kelas</option>
                    <optgroup label="Kelas 7">
                      {allClasses.filter(c => c.tingkat === '7').map(c => <option key={c.id}>{c.id}</option>)}
                    </optgroup>
                    <optgroup label="Kelas 8">
                      {allClasses.filter(c => c.tingkat === '8').map(c => <option key={c.id}>{c.id}</option>)}
                    </optgroup>
                    <optgroup label="Kelas 9">
                      {allClasses.filter(c => c.tingkat === '9').map(c => <option key={c.id}>{c.id}</option>)}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Nama Lengkap Guru</label>
                <input
                  required
                  aria-label="Nama guru"
                  placeholder="Nama lengkap beserta gelar"
                  className="module-control w-full"
                  value={form.nama}
                  onChange={event => setForm({ ...form, nama: event.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">Mata Pelajaran</label>
                <select
                  required
                  aria-label="Mapel"
                  className="module-control w-full"
                  value={form.mapel}
                  onChange={event => setForm({ ...form, mapel: event.target.value })}
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {allMapel.map(item => <option key={item.key} value={item.key}>{item.code}. {item.name}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <i aria-hidden="true" className="fa-solid fa-floppy-disk" />
                  <span>Simpan Penugasan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel Penugasan Guru */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <ModuleHeading
                compact
                label="Impor Excel"
                title="Impor Penugasan Guru Mapel"
                description="Unggah file Excel (.xlsx) berisi daftar penugasan guru mata pelajaran."
              />
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                title="Tutup Modal"
                aria-label="Tutup Modal"
                className="module-action border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
              >
                <i aria-hidden="true" className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="module-upload">
              <input
                type="file"
                id="guru-mapel-excel-input"
                aria-label="Impor Penugasan Guru Excel"
                accept=".xlsx,.xls"
                onChange={importFile}
                className="sr-only"
              />
              <label htmlFor="guru-mapel-excel-input" className="cursor-pointer space-y-2 block">
                <div className="module-upload-icon">
                  <i className="fa-solid fa-file-excel"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {importFileName ? `${importFileName} (${importRows.length} baris)` : 'Pilih file Excel penugasan guru (.xlsx)'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Format kolom: kode | nama | kelas | mapel
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">Gunakan template resmi untuk menghindari kesalahan kolom:</span>
              <button
                type="button"
                onClick={downloadTemplate}
                title="Unduh Template Excel"
                aria-label="Unduh Template Excel"
                className="module-action border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                <i aria-hidden="true" className="fa-solid fa-file-arrow-down" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!importRows.length}
                onClick={handleApplyImport}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <i aria-hidden="true" className="fa-solid fa-file-import" />
                <span>Impor Penugasan</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
