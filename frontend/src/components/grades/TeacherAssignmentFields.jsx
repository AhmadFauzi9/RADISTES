export default function TeacherAssignmentFields({ classes, subjects, value, onChange }) {
  const levels = [...new Set(classes.map(item => item.tingkat))].sort();
  const { mapel, classIds } = value;

  function toggleClass(classId) {
    const nextClassIds = classIds.includes(classId)
      ? classIds.filter(id => id !== classId)
      : [...classIds, classId];
    onChange({ ...value, classIds: nextClassIds });
  }

  return (
    <div className="space-y-3">
      <label className="block space-y-1 text-[11px] font-bold text-slate-600">
        <span>Mata Pelajaran</span>
        <select
          required
          className="module-control w-full"
          value={mapel}
          onChange={event => onChange({ ...value, mapel: event.target.value })}
        >
          <option value="">Pilih Mata Pelajaran</option>
          {subjects.map(item => <option key={item.key} value={item.key}>{item.code}. {item.name}</option>)}
        </select>
      </label>

      <fieldset className="space-y-2">
        <legend className="text-[11px] font-bold text-slate-600">Rombel yang Diampu</legend>
        <div className="custom-scrollbar max-h-52 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
          {levels.map(level => (
            <div key={level}>
              <p className="mb-1 text-[11px] font-semibold text-slate-600">Kelas {level}</p>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                {classes.filter(item => item.tingkat === level).map(item => (
                  <label key={item.id} className="flex cursor-pointer items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={classIds.includes(item.id)}
                      onChange={() => toggleClass(item.id)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    {item.id}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {!levels.length && <p className="text-xs text-slate-500">Belum ada rombel.</p>}
        </div>
        <p aria-live="polite" className="text-[11px] text-slate-500">{classIds.length} rombel dipilih</p>
      </fieldset>
    </div>
  );
}
