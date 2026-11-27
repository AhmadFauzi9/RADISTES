export default function RaportMetadata({ schoolSettings, classLabel = 'Kelas & Wali Kelas', classValue }) {
  return (
    <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs sm:grid-cols-4">
      <div className="min-w-0">
        <dt className="text-[10px] text-slate-400">{classLabel}</dt>
        <dd className="font-bold text-slate-800">{classValue}</dd>
      </div>
      <div>
        <dt className="text-[10px] text-slate-400">Tahun Pelajaran</dt>
        <dd className="font-bold text-slate-800">{schoolSettings.tahunAjaran}</dd>
      </div>
      <div>
        <dt className="text-[10px] text-slate-400">Ujian / Semester</dt>
        <dd className="font-bold text-brand-700">{schoolSettings.ujian} {schoolSettings.semester}</dd>
      </div>
      <div>
        <dt className="text-[10px] text-slate-400">Tgl Pembagian Raport</dt>
        <dd className="font-bold text-slate-800">{schoolSettings.tglRaport || 'Belum ditetapkan'}</dd>
      </div>
    </dl>
  );
}
