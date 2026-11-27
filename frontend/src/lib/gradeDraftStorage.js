export function gradeDraftKey(username, schoolYear, semester, classId, subjectKey) {
  if (!username || !classId || !subjectKey) return '';
  return 'radistes_grade_draft:' + JSON.stringify([username, schoolYear, semester, classId, subjectKey]);
}

export function readGradeDraft(storage, key) {
  const value = storage.getItem(key);
  try {
    const saved = JSON.parse(value);
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

export function saveGradeDraft(storage, key, edits) {
  const grades = { ...readGradeDraft(storage, key), ...edits };
  storage.setItem(key, JSON.stringify(grades));
  return grades;
}
