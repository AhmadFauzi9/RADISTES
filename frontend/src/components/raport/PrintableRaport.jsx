'use client';

import React from 'react';
import { terbilangNilai } from '@/lib/terbilang';

export default function PrintableRaport({ student, schoolSettings, classInfo, totalStudents = 29 }) {
  if (!student) return null;

  const grades = student.grades || {};
  const fullAddress = schoolSettings.alamatLengkap?.trim();

  // Kelompokkan mapel sesuai format resmi Excel MTs Al Amiriyyah
  const agamaList = [
    { label: "a. Al-Qur'an Hadits", key: 'qurdist' },
    { label: "b. Akidah Akhlak", key: 'aqidah' },
    { label: "c. Fikih", key: 'fiqih' },
    { label: "d. Sejarah Kebudayaan Islam", key: 'ski' },
  ];

  const mapelUmum = [
    { no: '2', label: 'Pendidikan Kewarganegaraan', key: 'pkn' },
    { no: '3', label: 'Bahasa Indonesia', key: 'bindo' },
    { no: '4', label: 'Bahasa Arab', key: 'barab' },
    { no: '5', label: 'Bahasa Inggris', key: 'bing' },
    { no: '6', label: 'Matematika', key: 'mat' },
    { no: '7', label: 'Ilmu Pengetahuan Alam', key: 'ipa' },
    { no: '8', label: 'Ilmu Pengetahuan Sosial', key: 'ips' },
    { no: '9', label: 'Seni Budaya / Prakarya', key: 'seni' },
    { no: '10', label: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', key: 'penjas' },
  ];

  const pilihanList = [
    { label: 'a. Seni Budaya / Prakarya', key: 'ketrampilan' },
    { label: 'b. Teknologi Informasi dan Komunikasi', key: 'tik' }
  ];

  const mulokList = [
    { label: 'a. Bahasa Daerah', key: 'bdaerah' },
    { label: 'b. Ke-NU-an', key: 'kenuan' }
  ];

  const renderRow = (noStr, mapelName, key, isSub = false) => {
    const val = grades[key];
    const hasVal = val !== '' && val !== null && val !== undefined;
    const numVal = hasVal ? Number(val) : 0;
    const kata = hasVal ? terbilangNilai(numVal) : '-';
    const isTuntas = numVal >= 70;
    const statusText = hasVal ? (isTuntas ? 'Tercapai' : 'Tidak Tercapai') : '-';

    return (
      <tr key={key} className="border-b border-black text-[11px] leading-tight">
        <td className="border-r border-black text-center py-1 px-1 font-mono w-7">{noStr}</td>
        <td className={`border-r border-black py-1 px-2 ${isSub ? 'pl-5' : 'font-medium'}`}>{mapelName}</td>
        <td className="border-r border-black text-center py-1 px-1 font-mono w-10">70</td>
        <td className="border-r border-black text-center py-1 px-1 font-mono font-bold w-12">{hasVal ? numVal : '-'}</td>
        <td className="border-r border-black text-left py-1 px-2 text-[10px] italic capitalize w-32">{kata}</td>
        <td className={`text-center py-1 px-1.5 text-[10.5px] font-semibold w-24 ${hasVal && !isTuntas ? 'text-red-700' : ''}`}>
          {statusText}
        </td>
      </tr>
    );
  };

  return (
    <div className="print-container bg-white text-black p-6 sm:p-8 max-w-[210mm] mx-auto text-xs leading-normal select-text font-serif border border-slate-300 shadow-lg print:shadow-none print:border-none print:p-0">
      
      {/* KOP SURAT RESMI LEMBAGA */}
      <header className="mb-2 text-center">
        <div className="grid grid-cols-[14%_minmax(0,1fr)_14%] items-center gap-x-1 pb-1 sm:gap-x-2 print:gap-x-2">
          {schoolSettings.logoKop && (
            <img
              src={schoolSettings.logoKop}
              alt="Logo madrasah"
              className="col-start-1 row-start-1 mx-auto h-auto max-h-24 w-full max-w-24 object-contain"
            />
          )}
          <div className="col-start-2 row-start-1 py-1">
            <p className="font-sans text-[10px] font-bold uppercase leading-tight sm:text-[15px] print:text-[15px]">
              {schoolSettings.yayasan}
            </p>
            <h1 className="my-0.5 text-[16px] font-bold leading-tight sm:text-[24px] print:text-[24px]">
              {schoolSettings.namaMadrasah}
            </h1>
            <p className="flex flex-wrap justify-center gap-x-3 text-[10px] leading-tight sm:text-[13px] print:text-[13px]">
              <span>NSM : {schoolSettings.nsm}</span>
              <span>NPSN : {schoolSettings.npsn}</span>
            </p>
            <p className="mt-0.5 font-sans text-[11px] leading-tight sm:text-[13px] print:text-[13px]">
              {schoolSettings.alamatKop}
            </p>
          </div>
        </div>
        <p className="border-y border-black px-1 py-0.5 font-sans text-[8px] italic leading-tight sm:text-[9px] print:text-[8px]">
          {fullAddress && (/^alamat\s*:/i.test(fullAddress) ? fullAddress : `Alamat: ${fullAddress}`)}
        </p>
      </header>

      {/* JUDUL RAPORT */}
      <div className="text-center my-3">
        <h2 className="text-[13px] font-bold tracking-wide uppercase underline decoration-1 underline-offset-4">
          {schoolSettings.judulRaport}
        </h2>
      </div>

      {/* IDENTITAS SISWA (2 KOLOM RAPI) */}
      <div className="grid grid-cols-2 gap-4 mb-3 text-[11px] leading-relaxed">
        <div>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-28 font-medium">Nama Siswa</td>
                <td className="w-3">:</td>
                <td className="font-bold uppercase">{student.nama}</td>
              </tr>
              <tr>
                <td className="font-medium">Nomor Induk / NIS</td>
                <td>:</td>
                <td className="font-mono">{student.nis}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-28 font-medium">Kelas</td>
                <td className="w-3">:</td>
                <td className="font-bold">{classInfo ? classInfo.nama : student.kelas || '8A'}</td>
              </tr>
              <tr>
                <td className="font-medium">Tahun Pelajaran</td>
                <td>:</td>
                <td>{schoolSettings.tahunAjaran}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TABEL NILAI MATA PELAJARAN (17 MAPEL) */}
      <table className="w-full border border-black border-collapse mb-2.5">
        <thead>
          <tr className="border-b border-black bg-gray-50 text-[10.5px] font-bold">
            <th rowSpan="2" className="border-r border-black py-1 px-1 text-center w-7">No.</th>
            <th rowSpan="2" className="border-r border-black py-1 px-2 text-center">Mata Pelajaran</th>
            <th rowSpan="2" className="border-r border-black py-1 px-1 text-center w-10">KKM</th>
            <th colSpan="2" className="border-r border-black py-0.5 px-1 text-center">Nilai</th>
            <th rowSpan="2" className="py-1 px-1 text-center w-24">Ketercapaian Kompetensi</th>
          </tr>
          <tr className="border-b border-black bg-gray-50 text-[10px] font-bold">
            <th className="border-r border-black py-0.5 px-1 text-center w-12 font-mono">Angka</th>
            <th className="border-r border-black py-0.5 px-2 text-center">Huruf</th>
          </tr>
        </thead>
        <tbody>
          {/* 1. Pendidikan Agama Header */}
          <tr className="border-b border-black bg-gray-50/50 text-[11px] font-bold">
            <td className="border-r border-black text-center py-0.5 font-mono">1.</td>
            <td colSpan="5" className="py-0.5 px-2">Pendidikan Agama</td>
          </tr>
          {agamaList.map(item => renderRow('', item.label, item.key, true))}

          {/* 2 - 10. Mapel Umum */}
          {mapelUmum.map(item => renderRow(item.no + '.', item.label, item.key, false))}

          {/* 11. Pilihan */}
          <tr className="border-b border-black bg-gray-50/50 text-[11px] font-bold">
            <td className="border-r border-black text-center py-0.5 font-mono">11.</td>
            <td colSpan="5" className="py-0.5 px-2">Pilihan :</td>
          </tr>
          {pilihanList.map(item => renderRow('', item.label, item.key, true))}

          {/* 12. Mulok */}
          <tr className="border-b border-black bg-gray-50/50 text-[11px] font-bold">
            <td className="border-r border-black text-center py-0.5 font-mono">12.</td>
            <td colSpan="5" className="py-0.5 px-2">Mulok :</td>
          </tr>
          {mulokList.map(item => renderRow('', item.label, item.key, true))}

          {/* Jumlah & Rerata */}
          <tr className="border-b border-black font-bold text-[11px] bg-gray-50">
            <td colSpan="3" className="border-r border-black text-center py-1 px-2">Jumlah Nilai</td>
            <td className="border-r border-black text-center py-1 font-mono">{student.totalNilai || 0}</td>
            <td colSpan="2" className="py-1 px-2 text-[10px] italic">
              {student.totalNilai ? terbilangNilai(student.totalNilai) : '-'}
            </td>
          </tr>
          <tr className="border-b border-black font-bold text-[11px] bg-gray-50">
            <td colSpan="3" className="border-r border-black text-center py-1 px-2">Rata-rata</td>
            <td className="border-r border-black text-center py-1 font-mono">{student.rataRata || 0}</td>
            <td colSpan="2" className="py-1 px-2 text-[10px] italic">
              {student.rataRata ? terbilangNilai(Math.round(student.rataRata)) : '-'}
            </td>
          </tr>
          <tr className="border-b border-black font-bold text-[11px]">
            <td colSpan="2" className="border-r border-black py-1 px-2">Peringkat Kelas Ke-</td>
            <td colSpan="4" className="py-1 px-2">
              <span className="font-mono text-[12px] font-extrabold underline">{student.ranking || 1}</span> dari <span className="font-mono">{totalStudents}</span> siswa
            </td>
          </tr>
        </tbody>
      </table>

      {/* KEGIATAN PENGEMBANGAN DIRI */}
      <div className="mb-2.5">
        <p className="font-bold text-[11px] mb-1">Kegiatan Pengembangan Diri</p>
        <table className="w-full border border-black border-collapse text-[10.5px]">
          <thead>
            <tr className="border-b border-black bg-gray-50 font-bold">
              <th className="border-r border-black text-center py-0.5 px-1 w-7">No.</th>
              <th className="border-r border-black text-center py-0.5 px-2">Jenis Pengembangan Diri</th>
              <th className="border-r border-black text-center py-0.5 px-2 w-28">Nilai</th>
              <th className="text-center py-0.5 px-2">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black">
              <td className="border-r border-black text-center py-1 font-mono">1.</td>
              <td className="border-r border-black py-1 px-2">{student.pengembanganDiri?.jenis || 'Pramuka'}</td>
              <td className="border-r border-black text-center py-1 px-2 font-semibold">{student.pengembanganDiri?.nilai || 'B (Baik)'}</td>
              <td className="py-1 px-2">{student.pengembanganDiri?.keterangan || 'Mengikuti kegiatan dengan aktif'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* KETIDAKHADIRAN & AKHLAK KEPRIBADIAN (2 KOLOM BERDAMPINGAN) */}
      <div className="grid grid-cols-2 gap-3 mb-2.5 text-[10.5px]">
        {/* Kolom Kiri: Ketidakhadiran */}
        <div className="border border-black p-2 rounded-xs">
          <p className="font-bold border-b border-black pb-1 mb-1.5">Ketidakhadiran</p>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-6 font-mono">1.</td>
                <td className="w-36">Izin</td>
                <td className="w-3">:</td>
                <td className="font-mono font-bold">{student.absensi?.izin ?? 0}</td>
                <td>Hari</td>
              </tr>
              <tr>
                <td className="font-mono">2.</td>
                <td>Sakit</td>
                <td>:</td>
                <td className="font-mono font-bold">{student.absensi?.sakit ?? 0}</td>
                <td>Hari</td>
              </tr>
              <tr>
                <td className="font-mono">3.</td>
                <td>Tanpa Keterangan</td>
                <td>:</td>
                <td className="font-mono font-bold">{student.absensi?.alpa ?? 0}</td>
                <td>Hari</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Kolom Kanan: Akhlak dan Kepribadian */}
        <div className="border border-black p-2 rounded-xs">
          <p className="font-bold border-b border-black pb-1 mb-1.5">Akhlak dan Kepribadian</p>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-6 font-mono">1.</td>
                <td className="w-36">Kelakuan / Ketaatan</td>
                <td className="w-3">:</td>
                <td className="font-bold">{student.akhlak?.kelakuan?.ket || 'Baik'}</td>
              </tr>
              <tr>
                <td className="font-mono">2.</td>
                <td>Kerajinan / Disiplin</td>
                <td>:</td>
                <td className="font-bold">{student.akhlak?.kerajinan?.ket || 'Baik'}</td>
              </tr>
              <tr>
                <td className="font-mono">3.</td>
                <td>Kerapian / Kebersihan</td>
                <td>:</td>
                <td className="font-bold">{student.akhlak?.kerapian?.ket || 'Baik'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CATATAN UNTUK ORANG TUA / WALI */}
      {student.catatanWali && (
        <div className="border border-black p-2 mb-3 text-[10.5px]">
          <span className="font-bold">Catatan untuk Orang Tua / Wali : </span>
          <span className="italic">{student.catatanWali}</span>
        </div>
      )}

      {/* TITIMANGSA & TANDA TANGAN (3 KOLOM) */}
      <div className="text-[11px] mt-4 pt-1">
        <div className="text-right mb-2 pr-4">
          <p>
            Diberikan di : <span className="font-semibold">{schoolSettings.titimangsa}</span>
          </p>
          <p>
            Tanggal : <span className="font-semibold">{schoolSettings.tglRaport}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-2">
          {/* Kolom 1: Orang Tua */}
          <div className="flex flex-col justify-between h-24">
            <p>Orang Tua / Wali,</p>
            <p className="font-medium">( ........................................ )</p>
          </div>

          {/* Kolom 2: Wali Kelas */}
          <div className="flex flex-col justify-between h-24">
            <p>Wali Kelas,</p>
            <div>
              <p className="font-bold underline uppercase">{classInfo?.wali || student.waliKelas || 'Mutmaina, S.Pd, Gr.'}</p>
              <p className="text-[10px] text-gray-700">NIP. -</p>
            </div>
          </div>

          {/* Kolom 3: Kepala Madrasah */}
          <div className="flex flex-col justify-between h-24">
            <p>Mengetahui,<br />Kepala Madrasah,</p>
            <div>
              <p className="font-bold underline uppercase">{schoolSettings.kepalaMadrasah}</p>
              <p className="text-[10px] text-gray-700">NIP. {schoolSettings.nipKepala || '-'}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
