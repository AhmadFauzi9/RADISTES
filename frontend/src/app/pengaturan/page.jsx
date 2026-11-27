'use client';

import ModuleHeading from '@/components/common/ModuleHeading';
import RaportImageInput from '@/components/raport/RaportImageInput';
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getWaliReportSettings } from '@/lib/waliReportSettings';

export default function PengaturanPage() {
  const { currentUser, isSuperAdmin, isWaliKelas } = useApp();
  if (isSuperAdmin) return <SchoolSettingsForm />;
  if (isWaliKelas) return <WaliSettingsForm key={currentUser.kelasWali} />;
  return <p className="text-sm text-slate-600">Pengaturan raport hanya tersedia untuk admin dan wali kelas.</p>;
}

function WaliSettingsForm() {
  const { currentUser, allClasses, waliReportSettings, saveWaliReportSettings, showToast } = useApp();
  const [draft, setDraft] = useState({});
  const [isReadingImage, setIsReadingImage] = useState(false);
  const classInfo = allClasses.find(cls => cls.id === currentUser.kelasWali);
  const formData = { nipy: '', signature: '', ...getWaliReportSettings(waliReportSettings, classInfo), ...draft };

  function handleSave(event) {
    event.preventDefault();
    if (isReadingImage || !saveWaliReportSettings(formData)) return;
    setDraft({});
    showToast('NIPY dan tanda tangan wali kelas berhasil disimpan.', 'success');
  }

  return (
    <div className="space-y-4">
      <div className="module-panel">
        <ModuleHeading label={`Wali Kelas ${currentUser.kelasWali}`} title="Pengaturan Raport"
          description="Atur NIPY dan tanda tangan yang tampil pada raport kelas Anda." />
      </div>
      <form onSubmit={handleSave} className="module-panel space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold text-slate-700">
            <span className="block">NIPY Wali Kelas</span>
            <input type="text" name="nipy" value={formData.nipy}
              onChange={event => setDraft(previous => ({ ...previous, nipy: event.target.value }))}
              className="module-control w-full" />
          </label>
          <RaportImageInput label="Tanda tangan wali kelas" value={formData.signature} signature
            onChange={signature => setDraft(previous => ({ ...previous, signature }))}
            busy={isReadingImage} onBusyChange={setIsReadingImage} />
        </div>
        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button data-module-action data-action-tone="primary" type="submit" disabled={isReadingImage}
            title="Simpan Pengaturan Wali Kelas" aria-label="Simpan Pengaturan Wali Kelas">
            <i aria-hidden="true" className="fa-solid fa-floppy-disk" />
          </button>
        </div>
      </form>
    </div>
  );
}

function SchoolSettingsForm() {
  const { schoolSettings, saveSchoolSettings, showToast } = useApp();

  const [draft, setDraft] = useState({});
  const [isReadingImage, setIsReadingImage] = useState(false);
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
    if (isReadingImage || !saveSchoolSettings({
      ...formData,
      nipyKepala: formData.nipyKepala.trim(),
    })) return;
    setDraft({});
    showToast('Pengaturan lembaga & format raport STS berhasil diperbarui!', 'success');
  };

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
            <RaportImageInput label="Logo kop raport" value={formData.logoKop}
              onChange={logoKop => setDraft(previous => ({ ...previous, logoKop }))}
              busy={isReadingImage} onBusyChange={setIsReadingImage} />
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
            <div>
              <label htmlFor="nipy-kepala" className="block text-[11px] font-bold text-slate-600 mb-1">
                NIPY Kepala Madrasah
              </label>
              <input
                id="nipy-kepala"
                type="text"
                name="nipyKepala"
                value={formData.nipyKepala}
                onChange={handleChange}
                className="module-control w-full"
              />
            </div>
            <RaportImageInput label="Tanda tangan kepala madrasah" value={formData.ttdKepala} signature
              onChange={ttdKepala => setDraft(previous => ({ ...previous, ttdKepala }))}
              busy={isReadingImage} onBusyChange={setIsReadingImage} />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button data-module-action
            type="submit"
            disabled={isReadingImage}
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
