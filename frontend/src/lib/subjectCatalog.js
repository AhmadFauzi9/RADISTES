import { MATA_PELAJARAN } from './masterData';

const names = {
  pkn: 'Pendidikan Pancasila',
  penjas: 'Pendidikan Jasmani, Olahraga dan Kesehatan',
  tik: 'Informatika',
  bdaerah: 'Bahasa Daerah',
  kenuan: 'Ke-NU-An',
};

export const DEFAULT_SUBJECT_CATALOG = MATA_PELAJARAN.flatMap(({ key, name, short, group }) => {
  const subject = { id: key, name: names[key] ?? name, code: short, parentId: group === 'Mulok' ? 'mulok' : '' };

  if (key === 'pai') {
    return [
      subject,
      { id: 'aqidah', name: 'Akidah Akhlak', code: 'AA', parentId: 'pai' },
      { id: 'qurdist', name: 'Al Qur`an Hadis', code: 'QH', parentId: 'pai' },
      { id: 'fiqih', name: 'Fikih', code: 'FIK', parentId: 'pai' },
      { id: 'ski', name: 'Sejarah Kebudayaan Islam', code: 'SKI', parentId: 'pai' },
    ];
  }

  if (key === 'bdaerah') {
    return [{ id: 'mulok', name: 'Muatan Lokal', code: 'MULOK', parentId: '' }, subject];
  }

  return [subject];
});

const defaultGrades = new Map(MATA_PELAJARAN.map(subject => [subject.key, subject]));

export function readSubjectCatalog(saved) {
  if (!Array.isArray(saved)) return DEFAULT_SUBJECT_CATALOG;
  const activeIds = new Set(saved.filter(isSubjectActive).map(subject => subject.id));
  return saved.map(subject =>
    activeIds.has(subject.parentId) && isSubjectActive(subject) ? { ...subject, active: false } : subject
  );
}

export function isSubjectActive(subject) {
  return subject.active ?? defaultGrades.has(subject.id);
}

export function setSubjectActive(catalog, id, active) {
  const subject = catalog.find(item => item.id === id);
  if (!subject) return catalog;

  return catalog.map(item => {
    if (item.id === id) return { ...item, active };
    if (active && (item.id === subject.parentId || item.parentId === id)) return { ...item, active: false };
    return item;
  });
}

export function activeLegerSubjects(catalog) {
  return catalog.filter(isSubjectActive).map((subject, index) => ({
    key: subject.id,
    name: subject.name,
    short: subject.code,
    code: String(index + 1),
    group: subject.parentId === 'mulok' ? 'Mulok' : 'Umum',
    kkm: defaultGrades.get(subject.id)?.kkm ?? 70,
  }));
}
