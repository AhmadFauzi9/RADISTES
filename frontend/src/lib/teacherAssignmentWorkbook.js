import { createExcelTemplate, downloadExcelWorkbook } from './excelTemplate';

const inputSheetName = 'Penugasan';
const referenceSheetName = 'Referensi';
const headers = ['Kode Guru', 'Nama Guru', 'Kelas', 'Bagian', 'Kode Mapel'];
const headerAliases = new Map([['kode guru', 'kode'], ['nama guru', 'nama'], ['kode mapel', 'mapel']]);

export async function createTeacherAssignmentWorkbook(ExcelJS, { classes, subjects, schoolSettings }) {
  const workbook = await createExcelTemplate(ExcelJS, {
    sheetName: inputSheetName,
    rows: [
      ['TEMPLATE PENUGASAN GURU MAPEL'],
      [`${schoolSettings.namaMadrasah} • ${schoolSettings.tahunAjaran}`],
      ['Isi satu rombel per baris. Ulangi kode dan nama guru untuk rombel berikutnya.'],
      ['Pilih Kelas, Bagian, dan Kode Mapel. Gunakan ↑/↓ pada dropdown atau buka tab Referensi.'],
      headers,
      ...Array.from({ length: 30 }, () => []),
    ],
    widths: [17, 38, 12, 12, 19],
    headerRow: 4,
    titleRows: [0],
    fullWidthRows: [0, 1, 2, 3],
    textColumns: [0, 1, 2, 3, 4],
    inputColumns: [0, 1, 2, 3, 4],
  });
  const sheet = workbook.getWorksheet(inputSheetName);
  sheet.views = [{ state: 'frozen', ySplit: 5, showGridLines: false }];
  sheet.getRow(1).height = 31;
  sheet.getRow(2).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF475569' } };
  sheet.getColumn(2).eachCell({ includeEmpty: true }, (cell, row) => {
    if (row > 5) cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  const levels = [...new Set(classes.map(item => item.id.slice(0, 1)))].sort();
  const sectionsByLevel = levels.map(level => classes
    .filter(item => item.id.startsWith(level))
    .map(item => item.id.slice(1))
    .filter(Boolean));
  const referenceRows = Array.from({ length: Math.max(subjects.length, classes.length) }, (_, index) => [
    subjects[index]?.short, subjects[index]?.name, classes[index]?.id,
    ...sectionsByLevel.map(sections => sections[index]),
  ]);
  await createExcelTemplate(ExcelJS, {
    workbook,
    sheetName: referenceSheetName,
    rows: [
      ['REFERENSI MAPEL AKTIF DAN ROMBEL'],
      ['Daftar ini mengikuti pengaturan RADISTES saat file diunduh.'],
      ['Kode Mapel', 'Mata Pelajaran', 'Rombel', ...levels.map(level => `Bagian ${level}`)],
      ...referenceRows,
    ],
    widths: [19, 56, 14, ...levels.map(() => 12)],
    headerRow: 2,
    titleRows: [0],
    fullWidthRows: [0, 1],
    filter: false,
    textColumns: [0, 2],
  });
  workbook.getWorksheet(referenceSheetName).views = [{ state: 'frozen', ySplit: 3, showGridLines: false }];

  function addDropdown(inputColumn, formula, label) {
    sheet.dataValidations.add(`${inputColumn}6:${inputColumn}1000`, {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: `${label} tidak terdaftar`,
      error: 'Pilih kode dari daftar pada sel ini.',
      formulae: [formula],
    });
  }

  if (levels.length) {
    addDropdown('C', `"${levels.join(',')}"`, 'Kelas');
    const reference = workbook.getWorksheet(referenceSheetName);
    levels.forEach((level, index) => {
      const first = reference.getCell(4, index + 4).$col$row;
      const last = reference.getCell(sectionsByLevel[index].length + 3, index + 4).$col$row;
      workbook.definedNames.add(`${referenceSheetName}!${first}:${last}`, `BagianKelas${level}`);
    });
    workbook.definedNames.add(`${referenceSheetName}!$C$${referenceRows.length + 4}`, 'BagianKelasKosong');
    addDropdown('D', 'INDIRECT("BagianKelas"&IF($C6="","Kosong",$C6))', 'Bagian kelas');
  }
  if (subjects.length) {
    workbook.definedNames.add(`${referenceSheetName}!$A$4:$A$${subjects.length + 3}`, 'MapelAktifRADISTES');
    addDropdown('E', 'MapelAktifRADISTES', 'Kode mapel aktif');
  }
  return workbook;
}

export function downloadTeacherAssignmentTemplate(options, showToast) {
  return downloadExcelWorkbook('template-penugasan-guru.xlsx', ExcelJS => createTeacherAssignmentWorkbook(ExcelJS, options), showToast);
}

export function readTeacherAssignmentRows(XLSX, buffer) {
  const workbook = XLSX.read(buffer);
  const sheet = workbook.Sheets[inputSheetName] ?? workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('File Excel tidak berisi lembar penugasan.');

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: '', raw: false, blankrows: true });
  const headers = rows.map(row => row.map(value => {
    const text = String(value).trim().toLowerCase().replace(/\s+/g, ' ');
    return headerAliases.get(text) ?? text;
  }));
  const headerIndex = headers.findIndex(row =>
    ['kode', 'nama', 'mapel'].every(key => row.includes(key)) && (row.includes('kelas') || row.includes('rombel'))
  );
  if (headerIndex === -1) throw new Error('Kolom Kode Guru, Nama Guru, Kelas dan Bagian (atau Rombel), serta Kode Mapel tidak ditemukan.');

  const header = headers[headerIndex];
  const hasSections = header.includes('kelas') && header.includes('bagian');
  const classKey = header.includes('rombel') && !hasSections ? 'rombel' : 'kelas';
  const columns = ['kode', 'nama', classKey, 'bagian', 'mapel'].map(key => header.indexOf(key));
  const subjectCodeOnly = String(rows[headerIndex][columns[4]]).trim().toLowerCase().replace(/\s+/g, ' ') === 'kode mapel';
  return rows.slice(headerIndex + 1).flatMap((row, index) => {
    const values = columns.map(column => String(row[column] ?? '').trim());
    if (values.every(value => value === '')) return [];
    const [kode, nama, levelOrClass, section, mapel] = values;
    const validParts = /^[789]$/.test(levelOrClass) && /^[a-z]+$/i.test(section);
    const kelas = hasSections ? (validParts ? levelOrClass + section.toUpperCase() : '') : levelOrClass;
    return [{ kode, nama, kelas, mapel, subjectCodeOnly, rowNumber: headerIndex + index + 2 }];
  });
}

export function findAssignmentSubject(subjects, value, codeOnly = false) {
  const label = String(value ?? '').trim().toLowerCase();
  const byCode = subjects.find(subject => subject.short.toLowerCase() === label);
  if (codeOnly) return byCode;
  return subjects.find(subject => subject.key.toLowerCase() === label)
    ?? byCode
    ?? subjects.find(subject => subject.name.toLowerCase() === label);
}
