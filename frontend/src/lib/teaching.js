export function teachingAssignments(teacher, subjects) {
  if (!teacher) return [];
  if (Array.isArray(teacher.assignments) && teacher.assignments.length) return teacher.assignments;
  const subject = subjects.find(item => item.name === teacher.mapelNama);
  return subject && teacher.kelasWali ? [{ classId: teacher.kelasWali, subjectKey: subject.key }] : [];
}

export function gradeSummary(students, subjectKeys) {
  const grades = students.flatMap(student => subjectKeys.map(key => student.grades?.[key]))
    .filter(value => value !== '' && value != null && Number.isFinite(Number(value))).map(Number);
  const expected = students.length * subjectKeys.length;
  return {
    completion: expected ? Math.round(grades.length / expected * 100) : 0,
    average: grades.length ? (grades.reduce((sum, value) => sum + value, 0) / grades.length).toFixed(1) : '–',
    range: grades.length ? `${Math.min(...grades)}–${Math.max(...grades)}` : '–',
    ready: expected > 0 && grades.length === expected,
  };
}
