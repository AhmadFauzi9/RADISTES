'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function PengaturanPage() {
  const { schoolSettings, setSchoolSettings, showToast } = useApp();

  const [formData, setFormData] = useState({ ...schoolSettings });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSchoolSettings(formData);
    showToast('Pengaturan lembaga & format raport STS berhasil diperbarui!', 'success');
  };

  return (
    <div className="space-y-4">
      
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 rounded-lg bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase tracking-wider">
              Konfigurasi Raport
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
              PENGATURAN IDENTITAS LEMBAGA & RAPORT STS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi di halaman ini akan langsung tercetak pada Kop Surat, Titimangsa, dan Tanda Tangan seluruh Raport STS siswa.
          </p>
        </div>
      </div>

      {/* Form Pengaturan */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
        
        {/* Identitas Kop Surat */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b pb-2 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-school text-brand-600"></i> Kop Surat Resmi Lembaga
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Yayasan / Naungan:</label>
              <input
                type="text"
                name="yayasan"
                value={formData.yayasan}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Madrasah / Sekolah:</label>
              <input
                type="text"
                name="namaMadrasah"
                value={formData.namaMadrasah}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Statistik Madrasah (NSM):</label>
              <input
                type="text"
                name="nsm"
                value={formData.nsm}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Pokok Sekolah Nasional (NPSN):</label>
              <input
                type="text"
                name="npsn"
                value={formData.npsn}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Alamat Singkat Kop:</label>
              <input
                type="text"
                name="alamatKop"
                value={formData.alamatKop}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Alamat Lengkap & Kontak:</label>
              <textarea
                name="alamatLengkap"
                rows="2"
                value={formData.alamatLengkap}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tahun Pelajaran:</label>
              <input
                type="text"
                name="tahunAjaran"
                value={formData.tahunAjaran}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Semester:</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white focus:ring-2 focus:ring-brand-500 outline-none"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="AHMADI, M.Pd.I"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span>Simpan Pengaturan Raport</span>
          </button>
        </div>

      </form>

    </div>
  );
}
