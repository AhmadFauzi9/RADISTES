import { findSubject, MATA_PELAJARAN, subjectGrade } from './masterData';
import { DEFAULT_SUBJECT_CATALOG } from './subjectCatalog';

const catalogKeys = new Set(DEFAULT_SUBJECT_CATALOG.map(subject => subject.id));

export function normalizeTeacherAssignments(teacher) {
  if (!Array.isArray(teacher.assignments)) return teacher;
  const assignments = new Map();
  teacher.assignments.forEach(assignment => {
    const subjectKey = catalogKeys.has(assignment.subjectKey)
      ? assignment.subjectKey
      : findSubject(MATA_PELAJARAN, assignment.subjectKey)?.key ?? assignment.subjectKey;
    const key = `${assignment.classId}:${subjectKey}`;
    if (!assignments.has(key)) assignments.set(key, { ...assignment, subjectKey });
  });
  return { ...teacher, assignments: [...assignments.values()] };
}

export function activeTeacherAssignments(teacher, subjects) {
  if (!Array.isArray(teacher.assignments)) return [];
  return teacher.assignments.filter(assignment => subjects.some(subject => subject.key === assignment.subjectKey));
}

export function teachingAssignments(teacher, subjects) {
  if (!teacher) return [];
  if (Array.isArray(teacher.assignments) && teacher.assignments.length) return activeTeacherAssignments(teacher, subjects);
  const subject = findSubject(subjects, teacher.mapelNama);
  return subject && teacher.kelasWali ? [{ classId: teacher.kelasWali, subjectKey: subject.key }] : [];
}

export function gradeSummary(students, subjectKeys) {
  const grades = students.flatMap(student => subjectKeys.map(key => subjectGrade(student.grades, key)))
    .filter(value => value !== '' && value != null && Number.isFinite(Number(value))).map(Number);
  const expected = students.length * subjectKeys.length;
  return {
    completion: expected ? Math.round(grades.length / expected * 100) : 0,
    average: grades.length ? (grades.reduce((sum, value) => sum + value, 0) / grades.length).toFixed(1) : '–',
    range: grades.length ? `${Math.min(...grades)}–${Math.max(...grades)}` : '–',
    ready: expected > 0 && grades.length === expected,
  };
}

export function topSubjectStudents(students, subjectKey) {
  return students.map(student => ({ ...student, score: subjectGrade(student.grades, subjectKey) }))
    .filter(({ score }) => score !== '' && score != null && Number.isFinite(Number(score)))
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 3);
}
