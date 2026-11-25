'use client';

import ModuleHeading from '@/components/common/ModuleHeading';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { downloadExcelTemplate } from '@/lib/excelTemplate';
import { calculateDknAverage, dknAverageFormula, dknStatusFormula, UH_COLUMNS } from '@/lib/dknScores';
import { useApp } from '@/context/AppContext';

export default function ImportDknModal({ isOpen, onClose, targetClass = '7K', targetMapel = 'tik', fixedTarget = false, onImport }) {
  const { allMapel, allClasses, importDknScores, showToast } = useApp();

  const [selectedClass, setSelectedClass] = useState(targetClass);
  const [selectedMapel, setSelectedMapel] = useState(targetMapel);
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Baca file Excel DKN (Format contoh user)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Temukan metadata dari baris header atas:
        // misal KELAS: 7K, MAPEL: INFORMATIKA
        let detectedClass = selectedClass;
        let detectedMapel = selectedMapel;

        rows.slice(0, 8).forEach(row => {
          if (!row || !Array.isArray(row)) return;
          const lineStr = row.map(c => String(c || '').toUpperCase()).join(' ');
          if (lineStr.includes('KELAS')) {
            const match = lineStr.match(/KELAS\s*[:\s]*([0-9][A-Z])/);
            if (match && match[1]) detectedClass = match[1];
          }
          if (/\b(?:INFORMATIKA|TIK)\b/.test(lineStr)) {
            detectedMapel = 'tik';
          } else if (lineStr.includes('MATEMATIKA')) {
            detectedMapel = 'mat';
          }
        });

        // Temukan baris tabel data siswa (biasanya setelah baris NO, INDUK, NAMA, ... N. R)
        let headerRowIndex = -1;
        let colIndexNama = -1;
        let colIndexNis = -1;
        let colIndexScore = -1;

        for (let i = 0; i < Math.min(15, rows.length); i++) {
          const r = rows[i];
          if (!r) continue;
          r.forEach((cell, idx) => {
            const str = String(cell || '').trim().toUpperCase();
            if (['NAMA', 'NAMA SISWA', 'NAMA LENGKAP'].includes(str)) {
              headerRowIndex = i;
              colIndexNama = idx;
            }
            if (['INDUK', 'NIS', 'NO INDUK'].includes(str)) {
              colIndexNis = idx;
            }
            if (['N. R', 'N.R', 'RAPORT', 'N.PTS', 'NILAI', 'NILAI STS', 'RATA-RATA'].includes(str)) {
              if (colIndexScore === -1 || ['N. R', 'RATA-RATA'].includes(str)) {
                colIndexScore = idx;
              }
            }
          });
          if (colIndexNama !== -1 && colIndexScore !== -1) break;
        }

        // Fallback jika header tidak standar: gunakan kolom default DKN
        if (colIndexNama === -1) colIndexNama = 2; // Kolom ke-3 biasanya nama
        if (colIndexScore === -1) colIndexScore = 6; // Kolom ke-7 biasanya N.R

        const headers = (rows[headerRowIndex] || []).map(value => String(value || '').trim().toUpperCase());
        const stsIndex = headers.indexOf('NILAI STS');
        const uhIndexes = UH_COLUMNS.map(column => headers.indexOf(column.label));
        const isSetorTemplate = wsname === 'DKN' && stsIndex !== -1 && uhIndexes.every(index => index !== -1);

        // Ekstrak baris siswa
        const parsed = [];
        const startIdx = headerRowIndex !== -1 ? headerRowIndex + 1 : 5;

        for (let i = startIdx; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const rawNama = String(row[colIndexNama] || '').trim();
          const rawNis = String(row[colIndexNis] || '').trim();
          const rawScore = row[colIndexScore];

          // Abaikan baris kosong atau baris keterangan bawah
          if (!rawNama || rawNama === '-' || rawNama.toUpperCase().includes('JUMLAH') || rawNama.toUpperCase().includes('RATA')) {
            continue;
          }

          const scoreCell = XLSX.utils.encode_cell({ r: i, c: colIndexScore });
          if (isSetorTemplate && (ws[scoreCell]?.f || rawScore == null || rawScore === '')) {
            const sts = row[stsIndex] ?? '';
            const uhScores = Object.fromEntries(UH_COLUMNS.map((column, index) => [column.key, row[uhIndexes[index]] ?? '']));
            const score = calculateDknAverage(sts, Object.values(uhScores));
            if (score !== '') {
              parsed.push({ no: parsed.length + 1, nis: rawNis !== '-' ? rawNis : '', nama: rawNama, score, sts, uhScores });
            }
            continue;
          }

          let score = null;
          if (rawScore !== undefined && rawScore !== null && rawScore !== '') {
            const num = parseFloat(String(rawScore).replace(',', '.'));
            if (!isNaN(num)) score = num;
          }

          if (score === null || score < 0 || score > 100) continue;
          parsed.push({
            no: parsed.length + 1,
            nis: rawNis !== '-' ? rawNis : '',
            nama: rawNama,
            score
          });
        }

        setParsedData(parsed);
        if (!fixedTarget) {
          setSelectedClass(detectedClass);
          setSelectedMapel(detectedMapel);
        } else if (detectedClass !== targetClass || detectedMapel !== targetMapel) {
          setParsedData([]);
          showToast('Kelas atau mapel pada file berbeda dari pilihan saat ini.', 'warning');
          return;
        }
        showToast(`Berhasil membaca ${parsed.length} siswa dari file DKN!`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Gagal memproses file Excel DKN: ' + err.message, 'error');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Simpan hasil import ke Leger
  const handleApplyImport = () => {
    if (parsedData.length === 0) {
      showToast('Belum ada data nilai yang diparsing.', 'warning');
      return;
    }

    if (onImport) onImport(parsedData);
    else importDknScores(selectedClass, selectedMapel, parsedData);
    onClose();
  };

  // Unduh contoh file DKN Excel (format contoh user)
  const handleDownloadSample = async () => {
    const kkm = 70;
    const sampleGrades = [
      ['240701', 'AINUN HIKMAWAH', 76, 75],
      ['240702', 'AMIRA HASNA HAKIMAH', 73, 72],
      ['240703', 'ARINA NAJMA AQILA', 73, 72],
      ['240704', 'ARIQAH RIZQULLOHI NUR AINI', 74, 73],
      ['240705', 'ATHAYA KHOIRUNNISA', 79, 78],
      ['240706', 'ATSNA FAIZA LIULIN NUHA', 80, 79],
      ['240707', 'AYUNDA SOFI AZZAHRA', 72, 71],
      ['240708', 'AZIKA MALIDA AGISTA', 70, 70],
      ['240709', 'AZKIYA AMALIA WIRDA', 80, 79],
      ['240710', 'AZZAHRA ANNISA US SHOLIHAH', 86, 85],
    ];
    const averages = sampleGrades.map(([, , uh1, sts]) => calculateDknAverage(sts, [uh1], false));
    const ranks = `$G$7:$G$${sampleGrades.length + 6}`;
    const wsData = [
      ['DAFTAR NILAI STS GANJIL', '', '', 'UH', ': U. Harian', 'N. R', ': Nilai Raport'],
      ['MTs AL AMRIYYAH BLOKAGUNG', '', '', 'N.PTS', ': Nilai PTS'],
      ['TAHUN PELAJARAN 2025/2026'],
      [],
      ['KELAS', '', selectedClass, 'MAPEL:', 'INFORMATIKA', '', 'KKM :', '', kkm],
      ['NO', 'INDUK', 'NAMA', 'UH 1', 'UH 2', 'N.PTS', 'N. R', 'RANK', 'KET'],
      ...sampleGrades.map(([nis, nama, uh1, sts], index) => {
        const row = index + 7;
        const average = averages[index];
        return [
          index + 1, nis, nama, uh1, null, sts,
          { formula: dknAverageFormula(`F${row}`, `D${row}:F${row}`, false), result: average },
          { formula: `IF(G${row}="","",RANK(G${row},${ranks},0))`, result: 1 + averages.filter(score => score > average).length },
          { formula: dknStatusFormula(`G${row}`, '$I$5', 'TUNTAS', 'BELUM TUNTAS'), result: average >= kkm ? 'TUNTAS' : 'BELUM TUNTAS' },
        ];
      }),
    ];

    const downloaded = await downloadExcelTemplate({
      rows: wsData,
      sheetName: 'DAFTAR NILAI STS',
      fileName: `CONTOH_FORMAT_DKN_${selectedClass}.xlsx`,
      widths: [9, 15, 36, 12, 18, 12, 17, 10, 16],
      headerRow: 5,
      titleRows: [0],
      merges: ['A1:C1', 'A2:C2', 'A3:C3'],
      textColumns: [1],
      inputColumns: [3, 4, 5],
    }, showToast);
    if (downloaded) showToast('File contoh DKN berhasil diunduh!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <ModuleHeading compact label="Impor Excel" title="Impor Nilai DKN" description="Unggah Excel daftar nilai untuk kelas dan mata pelajaran yang dipilih." />
          <button data-module-action
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          title="Tutup Modal"
          aria-label="Tutup Modal"
          >
            <i aria-hidden="true" className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Target Kelas & Mapel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Kelas:</label>
            <select
              aria-label="Target kelas"
              value={selectedClass}
              disabled={fixedTarget}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="module-control w-full"
            >
              {allClasses.map(c => (
                <option key={c.id} value={c.id}>Kelas {c.nama} ({c.wali})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Mata Pelajaran:</label>
            <select
              aria-label="Mata pelajaran"
              value={selectedMapel}
              disabled={fixedTarget}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="module-control w-full"
            >
              {allMapel.map(m => (
                <option key={m.key} value={m.key}>{m.name} ({m.short})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Area Upload File */}
        <div className="module-upload">
          <input
            type="file"
            id="dkn-file-input" aria-label="Impor Nilai DKN"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="sr-only"
          />
          <label htmlFor="dkn-file-input" className="cursor-pointer space-y-2 block">
            <div className="module-upload-icon">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {fileName ? fileName : 'Klik untuk memilih file Excel DKN'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mendukung format file .xlsx, .xls, atau .csv (Sesuai format DKN MTs Al Amiriyyah)
              </p>
            </div>
          </label>
        </div>

        {/* Tombol Unduh Template Sampel */}
        <div className="flex items-center justify-between text-xs text-slate-500 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
          <div className="flex items-center gap-1.5">
            <i className="fa-solid fa-lightbulb text-amber-600"></i>
            <span>Format kolom DKN yang dibaca: <code>NO, INDUK, NAMA, N. R</code></span>
          </div>
          <button data-module-action data-action-tone="success"
            type="button"
            onClick={handleDownloadSample}
            className="text-brand-700 hover:underline font-bold text-[11px] cursor-pointer"
          title="Unduh Contoh DKN"
          aria-label="Unduh Contoh DKN"
          >
            <i aria-hidden="true" className="fa-solid fa-download"></i>
          </button>
        </div>

        {/* Preview Hasil Parsing */}
        {parsedData.length > 0 && (
          <div className="flex-1 overflow-hidden border border-slate-200 rounded-xl flex flex-col">
            <div className="module-table-caption flex flex-wrap items-center justify-between gap-2">
              <span>Preview Data Terbaca ({parsedData.length} Siswa)</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Siap Diimpor ke Leger {selectedClass}</span>
            </div>
            <div className="overflow-y-auto max-h-48 custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 text-[10.5px] border-b">
                  <tr>
                    <th className="py-1 px-2 text-center w-8">No</th>
                    <th className="py-1 px-3">Nama Siswa</th>
                    <th className="py-1 px-2 text-center w-24">Nilai Raport</th>
                    <th className="py-1 px-2 text-center w-24">Status KKM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1 px-2 text-center font-mono text-[10px]">{item.no}</td>
                      <td className="py-1 px-3 font-semibold text-slate-800">{item.nama}</td>
                      <td className="py-1 px-2 text-center font-mono font-bold text-brand-700">{item.score}</td>
                      <td className="py-1 px-2 text-center font-bold text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded ${item.score >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {item.score >= 70 ? 'Tuntas' : 'Remidi'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button data-module-action
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          title="Batal"
          aria-label="Batal"
          >
            <i aria-hidden="true" className="fa-solid fa-xmark" />
          </button>
          <button data-module-action data-action-tone="primary"
            type="button"
            disabled={parsedData.length === 0 || isProcessing}
            onClick={handleApplyImport}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
          title={onImport ? 'Masukkan ke Draf' : 'Terapkan ke Leger'}
          aria-label={onImport ? 'Masukkan ke Draf' : 'Terapkan ke Leger'}
          >
            <i aria-hidden="true" className="fa-solid fa-check"></i>
          </button>
        </div>

      </div>
    </div>
  );
}
