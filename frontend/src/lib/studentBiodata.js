export const STUDENT_BIODATA_KEY = 'radistes_student_biodata';

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

export function storeStudentBiodata(storage, classId, nis, details) {
  const data = {
    ...readStudentBiodata(storage),
    [studentBiodataKey(classId, nis)]: {
      tempatLahir: details.tempatLahir.trim(),
      tanggalLahir: details.tanggalLahir.trim(),
      namaOrangTua: details.namaOrangTua.trim(),
    },
  };
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
