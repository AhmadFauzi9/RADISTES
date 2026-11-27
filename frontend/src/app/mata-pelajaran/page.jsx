'use client';

import { useState } from 'react';
import ModuleHeading from '@/components/common/ModuleHeading';
import { useApp } from '@/context/AppContext';
import { isSubjectActive, readSubjectCatalog, setSubjectActive } from '@/lib/subjectCatalog';

export default function MataPelajaranPage() {
  const { isSuperAdmin, schoolSettings, saveSchoolSettings, showToast } = useApp();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  if (!isSuperAdmin) return <p className="module-panel text-sm text-slate-600">Menu Mata Pelajaran tersedia untuk administrator.</p>;

  const subjects = readSubjectCatalog(schoolSettings.subjectCatalog);
  const parents = new Map(subjects.map(subject => [subject.id, subject.code]));
  const hasChildren = subjects.some(subject => subject.parentId === editing?.id);

  function saveCatalog(subjectCatalog) {
    return saveSchoolSettings({ ...schoolSettings, subjectCatalog: readSubjectCatalog(subjectCatalog) });
  }

  function moveSubject(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= subjects.length) return;
    const reordered = [...subjects];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    saveCatalog(reordered);
  }

  function saveEdit(event) {
    event.preventDefault();
    const code = editing.code.trim().toUpperCase();
    const name = editing.name.trim();
    if (!code || !name) {
      showToast('Masukkan kode dan nama mata pelajaran.', 'warning');
      return;
    }
    if (subjects.some(subject => subject.id !== editing.id && subject.code.toUpperCase() === code)) {
      showToast('Kode mata pelajaran sudah digunakan.', 'warning');
      return;
    }
    const updated = subjects.map(subject => subject.id === editing.id ? { ...subject, ...editing, code, name } : subject);
    if (saveCatalog(updated)) {
      setEditing(null);
      showToast('Mata pelajaran berhasil diperbarui.', 'success');
    }
  }

  function deleteSubject(id) {
    const updated = subjects.filter(subject => subject.id !== id)
      .map(subject => subject.parentId === id ? { ...subject, parentId: '' } : subject);
    if (saveCatalog(updated)) {
      setDeleting(null);
      showToast('Mata pelajaran berhasil dihapus dari daftar.', 'success');
    }
  }

  return (
    <div className="space-y-4">
      <div className="module-panel">
        <ModuleHeading label="Data Master" title="Mata Pelajaran" compact
          description="Centang induk untuk memakai satu kolom di Leger, atau centang submapel untuk memakai kolom terpisah." />
      </div>

      <div className="module-panel">
        <div className="module-table max-h-[560px] custom-scrollbar">
          <table>
            <thead className="sticky top-0">
              <tr>
                <th scope="col" className="w-12 px-3 py-2 text-center">No</th>
                <th scope="col" className="w-24 px-3 py-2">Kode</th>
                <th scope="col" className="w-28 whitespace-nowrap px-3 py-2">Induk Mapel</th>
                <th scope="col" className="px-3 py-2">Mata Pelajaran</th>
                <th scope="col" className="w-16 px-3 py-2 text-center">Urutan</th>
                <th scope="col" className="w-28 px-3 py-2">Status</th>
                <th scope="col" className="w-44 px-3 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!subjects.length && <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-500">Belum ada mata pelajaran.</td></tr>}
              {subjects.map((subject, index) => (
                <tr key={subject.id} className="bg-white even:bg-slate-50">
                  <td className="px-3 py-2 text-center tabular-nums">{index + 1}</td>
                  <td className="px-3 py-2 font-mono font-bold text-brand-700">{subject.code}</td>
                  <td className="px-3 py-2 font-mono">{parents.get(subject.parentId) ?? '–'}</td>
                  <th scope="row" className="min-w-[190px] px-3 py-2 font-semibold">{subject.name}</th>
                  <td className="px-3 py-2 text-center tabular-nums">{index + 1}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2 whitespace-nowrap">
                      <input type="checkbox"
                        aria-label={`Aktifkan ${subject.name} di Leger`}
                        checked={isSubjectActive(subject)}
                        onChange={event => saveCatalog(setSubjectActive(subjects, subject.id, event.target.checked))}
                        className="cursor-pointer accent-brand-600" />
                      {isSubjectActive(subject) ? 'Aktif' : 'Nonaktif'}
                    </label>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <button data-module-action type="button" disabled={index === 0} onClick={() => moveSubject(index, -1)} title="Pindah ke atas" aria-label={`Pindah ${subject.code} ke atas`}>
                        <i aria-hidden="true" className="fa-solid fa-arrow-up" />
                      </button>
                      <button data-module-action type="button" disabled={index === subjects.length - 1} onClick={() => moveSubject(index, 1)} title="Pindah ke bawah" aria-label={`Pindah ${subject.code} ke bawah`}>
                        <i aria-hidden="true" className="fa-solid fa-arrow-down" />
                      </button>
                      <button data-module-action type="button" onClick={() => setEditing({ ...subject })} title="Edit mata pelajaran" aria-label={`Edit ${subject.code}`}>
                        <i aria-hidden="true" className="fa-solid fa-pen" />
                      </button>
                      <button data-module-action data-action-tone="danger" type="button" onClick={() => setDeleting(subject)} title="Hapus mata pelajaran" aria-label={`Hapus ${subject.code}`}>
                        <i aria-hidden="true" className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
          <form role="dialog" aria-modal="true" aria-labelledby="edit-subject" onSubmit={saveEdit} className="module-panel w-full max-w-md space-y-4 text-xs">
            <h2 id="edit-subject" className="text-sm font-bold text-slate-900">Edit Mata Pelajaran</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 font-semibold text-slate-700">
                <span className="block">Kode</span>
                <input required value={editing.code} onChange={event => setEditing({ ...editing, code: event.target.value })} className="module-control w-full" />
              </label>
              <label className="space-y-1 font-semibold text-slate-700">
                <span className="block">Induk Mapel</span>
                <select disabled={hasChildren} value={editing.parentId} onChange={event => setEditing({ ...editing, parentId: event.target.value })} className="module-control w-full">
                  <option value="">Tanpa induk</option>
                  {subjects.filter(subject => subject.id !== editing.id && !subject.parentId).map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.code} · {subject.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block space-y-1 font-semibold text-slate-700">
              <span className="block">Mata Pelajaran</span>
              <input required value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} className="module-control w-full" />
            </label>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setEditing(null)} className="module-control">Batal</button>
              <button type="submit" className="rounded-lg bg-brand-600 px-3 font-bold text-white hover:bg-brand-700">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-subject" className="module-panel w-full max-w-sm space-y-3 text-xs">
            <h2 id="delete-subject" className="text-sm font-bold text-slate-900">Hapus {deleting.name}?</h2>
            {subjects.some(subject => subject.parentId === deleting.id) && (
              <p className="text-slate-600">Mapel di bawah induk ini akan menjadi mapel tanpa induk.</p>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleting(null)} className="module-control">Batal</button>
              <button type="button" onClick={() => deleteSubject(deleting.id)} className="rounded-lg bg-rose-600 px-3 font-bold text-white hover:bg-rose-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
