import { downloadExcelWorkbook } from './excelTemplate';
import { subjectGrade } from './masterData';

const borderLine = { style: 'thin', color: { argb: 'FF000000' } };
const border = { top: borderLine, left: borderLine, bottom: borderLine, right: borderLine };
const fill = argb => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const font = { name: 'Calibri', size: 11 };
const headerStyle = {
  border,
  fill: fill('FF7F7F7F'),
  font: { ...font, bold: true, color: { argb: 'FFFFFFFF' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
};
const valueStyle = {
  border,
  fill: fill('FFFFFF00'),
  font: { ...font, bold: true },
  alignment: { horizontal: 'left', vertical: 'middle' },
};
const identityStyle = { ...valueStyle, fill: fill('FFBFBFBF') };
const numberStyle = {
  ...valueStyle,
  alignment: { horizontal: 'center', vertical: 'middle' },
};

export function rdmClassName(classId) {
  const romanLevels = { 7: 'VII', 8: 'VIII', 9: 'IX' };
  const match = /^([789])\s*\.?\s*([A-Z]+)$/i.exec(classId);
  return match ? `${romanLevels[match[1]]}.${match[2].toUpperCase()}` : classId;
}

function mergeHeader(sheet, row, col, lastRow, lastCol, text, style = headerStyle) {
  const cell = sheet.getCell(row, col);
  cell.value = text;
  cell.style = style;
  sheet.mergeCells(row, col, lastRow, lastCol);
}

export async function createLegerWorkbook(ExcelJS, { groups, subjects, schoolSettings }) {
  const workbook = new ExcelJS.Workbook();
  workbook.calcProperties.fullCalcOnLoad = true;
  const mainSubjects = subjects.filter(subject => subject.group !== 'Mulok');
  const mulokSubjects = subjects.filter(subject => subject.group === 'Mulok');
  const orderedSubjects = [...mainSubjects, ...mulokSubjects];
  const totalColumn = orderedSubjects.length + 6;

  for (const { classId, students } of groups) {
    const className = rdmClassName(classId);
    const sheet = workbook.addWorksheet(className, {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '6:7' },
    });
    sheet.columns = [10.3, 19.3, 18.3, 37.2, 9, ...orderedSubjects.map(() => 9.1), 9.1]
      .map(width => ({ width }));

    sheet.getRow(1).height = 25.5;
    mergeHeader(sheet, 1, 1, 1, 6, `LEGGER NILAI ${className}`, {
      font: { ...font, size: 14, bold: true },
      alignment: headerStyle.alignment,
    });
    sheet.getCell('A2').value = 'Kelas:';
    sheet.getCell('A2').style = headerStyle;
    sheet.getCell('D2').value = 'Semester:';
    sheet.getCell('D2').style = headerStyle;
    mergeHeader(sheet, 2, 2, 2, 3, className, valueStyle);
    mergeHeader(sheet, 2, 5, 2, 6, schoolSettings.semester, valueStyle);
    mergeHeader(sheet, 3, 1, 4, 1, 'Madrasah:', headerStyle);
    mergeHeader(sheet, 3, 2, 4, 3, schoolSettings.namaMadrasah, valueStyle);
    mergeHeader(sheet, 3, 4, 4, 4, 'Tahun Ajaran:', headerStyle);
    mergeHeader(sheet, 3, 5, 4, 6, schoolSettings.tahunAjaran, valueStyle);

    ['No', 'NIS', 'Nisn', 'Nama', 'JK'].forEach((label, index) => {
      mergeHeader(sheet, 6, index + 1, 7, index + 1, label);
    });
    mainSubjects.forEach(({ short }, index) => {
      mergeHeader(sheet, 6, index + 6, 7, index + 6, short);
    });
    if (mulokSubjects.length) {
      const firstMulokColumn = mainSubjects.length + 6;
      mergeHeader(sheet, 6, firstMulokColumn, 6, totalColumn - 1, 'MULOK');
      mulokSubjects.forEach(({ short }, index) => {
        const cell = sheet.getCell(7, firstMulokColumn + index);
        cell.value = short;
        cell.style = headerStyle;
      });
    }
    mergeHeader(sheet, 6, totalColumn, 7, totalColumn, 'Jumlah');

    students.forEach((student, index) => {
      const row = index + 8;
      const nisn = student.nisn == null || student.nisn === '' ? null : String(student.nisn);
      const identity = [index + 1, String(student.nis ?? ''), nisn, student.nama, student.lp];
      identity.forEach((value, i) => {
        const cell = sheet.getCell(row, i + 1);
        cell.value = value;
        cell.style = i === 1 || i === 2 ? { ...identityStyle, numFmt: '@' } : identityStyle;
      });

      const scores = orderedSubjects.map(({ key }) => {
        const score = subjectGrade(student.grades, key);
        return score === '' ? null : score;
      });
      scores.forEach((score, i) => {
        const cell = sheet.getCell(row, i + 6);
        cell.value = score;
        cell.style = { ...numberStyle, protection: { locked: false } };
      });

      const lastScoreAddress = sheet.getCell(row, totalColumn - 1).address;
      const scoreRange = `F${row}:${lastScoreAddress}`;
      const total = sheet.getCell(row, totalColumn);
      total.value = scores.length ? {
        formula: `IF(COUNT(${scoreRange})=0,"",SUM(${scoreRange}))`,
        result: scores.some(score => score !== null) ? scores.reduce((sum, score) => sum + (score ?? 0), 0) : '',
      } : null;
      total.style = numberStyle;
    });
    await sheet.protect('');
  }
  return workbook;
}

export async function downloadLegerExcel(options, showToast) {
  if (!options.groups.some(group => group.students.length)) {
    showToast('Tidak ada data siswa untuk diunduh.', 'warning');
    return;
  }
  const [first] = options.groups;
  const classSuffix = options.groups.length === 1 ? ` KELAS ${rdmClassName(first.classId)}` : '';
  const success = await downloadExcelWorkbook(
    `LEGGER NILAI${classSuffix}.xlsx`,
    ExcelJS => createLegerWorkbook(ExcelJS, options),
    showToast,
  );
  if (success) showToast('File Leger berhasil diunduh.', 'success');
}
