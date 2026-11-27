export const STUDENT_BIODATA_KEY = 'radistes_student_biodata';
export const STUDENT_BIODATA_FIELDS = [
  { key: 'tempatLahir', label: 'Tempat Lahir', type: 'text' },
  { key: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date' },
  { key: 'namaOrangTua', label: 'Nama Orang Tua', type: 'text' },
];

export function studentBiodataKey(classId, nis) {
  return JSON.stringify([classId, nis]);
}

export function readStudentBiodata(storage) {
  const value = storage.getItem(STUDENT_BIODATA_KEY);
  try {
    const data = JSON.parse(value);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

export function storeStudentBiodata(storage, entries) {
  const data = readStudentBiodata(storage);
  for (const { classId, nis, details } of entries) {
    const key = studentBiodataKey(classId, nis);
    const changes = STUDENT_BIODATA_FIELDS
      .filter(field => Object.hasOwn(details, field.key))
      .map(field => [field.key, details[field.key].trim()]);
    data[key] = { ...data[key], ...Object.fromEntries(changes) };
  }
  storage.setItem(STUDENT_BIODATA_KEY, JSON.stringify(data));
  return data;
}

const birthDateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});

export function formatStudentBirth({ tempatLahir, tanggalLahir }) {
  const date = new Date(tanggalLahir);
  const dateLabel = tanggalLahir && !Number.isNaN(date.getTime()) ? birthDateFormat.format(date) : '';
  return [tempatLahir, dateLabel].filter(Boolean).join(', ');
}
