'use client';

import ModuleHeading from '@/components/common/ModuleHeading';
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function PengaturanPage() {
  const { schoolSettings, saveSchoolSettings, showToast, isSuperAdmin } = useApp();

  const [draft, setDraft] = useState({});
  const [isReadingLogo, setIsReadingLogo] = useState(false);
  const formData = { ...schoolSettings, ...draft };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isReadingLogo || !saveSchoolSettings(formData)) return;
    setDraft({});
    showToast('Pengaturan lembaga & format raport STS berhasil diperbarui!', 'success');
  };

  if (!isSuperAdmin) return <p className="text-sm text-slate-600">Pengaturan raport hanya tersedia untuk admin.</p>;

  return (
    <div className="space-y-4">
      
      {/* Header Info */}
      <div className="module-panel space-y-3">
        <ModuleHeading label="Konfigurasi Raport" title="Pengaturan Raport STS" description="Kelola kop surat, tahun pelajaran, dan tanda tangan raport." />
      </div>

      {/* Form Pengaturan */}
      <form onSubmit={handleSave} className="module-panel space-y-5">
        
        {/* Identitas Kop Surat */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b pb-2 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-school text-brand-600"></i> Kop Surat Resmi Lembaga
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label className="space-y-1 font-semibold text-slate-700">
              <span className="block">Deadline pengiriman nilai</span>
              <input className="module-control" type="date" name="deadlineSetor" value={formData.deadlineSetor || ''} onChange={handleChange} />
            </label>
            <label className="space-y-1 font-semibold text-slate-700">
              <span className="block">Logo kop raport</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" disabled={isReadingLogo} onChange={event => {
                const file = event.target.files[0];
                if (!file) return;
                event.target.value = '';
                if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1024 * 1024) {
                  showToast('Gunakan logo PNG, JPEG, atau WebP maksimal 1 MB.', 'warning');
                  return;
                }
                const reader = new FileReader();
                setIsReadingLogo(true);
                reader.onload = () => setDraft(previous => ({ ...previous, logoKop: reader.result }));
                reader.onerror = () => showToast('Logo gagal dibaca. Pilih ulang file logo.', 'warning');
                reader.onloadend = () => setIsReadingLogo(false);
                reader.readAsDataURL(file);
              }} />
              {formData.logoKop && (
                <img src={formData.logoKop} alt="Pratinjau logo kop raport" className="h-14 w-14 object-contain" />
              )}
            </label>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Yayasan / Naungan:</label>
              <input
                type="text"
                name="yayasan"
                value={formData.yayasan}
                onChange={handleChange}
                className="module-control w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Madrasah / Sekolah:</label>
              <input
                type="text"
                name="namaMadrasah"
                value={formData.namaMadrasah}
                onChange={handleChange}
                className="module-control w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Statistik Madrasah (NSM):</label>
              <input
                type="text"
                name="nsm"
                value={formData.nsm}
                onChange={handleChange}
                className="module-control w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Pokok Sekolah Nasional (NPSN):</label>
              <input
                type="text"
                name="npsn"
                value={formData.npsn}
                onChange={handleChange}
                className="module-control w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Alamat Singkat Kop:</label>
              <input
                type="text"
                name="alamatKop"
                value={formData.alamatKop}
                onChange={handleChange}
                className="module-control w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Alamat Lengkap & Kontak:</label>
              <textarea
                name="alamatLengkap"
                rows="2"
                value={formData.alamatLengkap}
                onChange={handleChange}
                className="module-control w-full"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Konfigurasi Raport STS */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b pb-2 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-file-lines text-brand-600"></i> Pengaturan Periode & Tanda Tangan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Judul Dokumen Raport:</label>
              <input
                type="text"
                name="judulRaport"
                value={formData.judulRaport}
                onChange={handleChange}
                className="module-control w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tahun Pelajaran:</label>
              <input
                type="text"
                name="tahunAjaran"
                value={formData.tahunAjaran}
                onChange={handleChange}
                className="module-control w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Semester:</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="module-control w-full"
              >
                <option value="GANJIL">GANJIL</option>
                <option value="GENAP">GENAP</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Pembagian Raport:</label>
              <input
                type="text"
                name="tglRaport"
                value={formData.tglRaport}
                onChange={handleChange}
                className="module-control w-full"
                placeholder="09 Oktober 2025"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tempat Titimangsa:</label>
              <input
                type="text"
                name="titimangsa"
                value={formData.titimangsa}
                onChange={handleChange}
                className="module-control w-full"
                placeholder="Blokagung"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Kepala Madrasah:</label>
              <input
                type="text"
                name="kepalaMadrasah"
                value={formData.kepalaMadrasah}
                onChange={handleChange}
                className="module-control w-full"
                placeholder="AHMADI, M.Pd.I"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button data-module-action
            type="submit"
            disabled={isReadingLogo}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          title="Simpan Pengaturan Raport"
          aria-label="Simpan Pengaturan Raport"
          >
            <i aria-hidden="true" className="fa-solid fa-floppy-disk"></i>
          </button>
        </div>

      </form>

    </div>
  );
}
