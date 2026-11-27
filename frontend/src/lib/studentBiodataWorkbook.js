import { createExcelTemplate, downloadExcelWorkbook } from './excelTemplate';
import { STUDENT_BIODATA_FIELDS } from './studentBiodata';

const sheetName = 'Biodata Siswa';
const headers = ['NIS', 'Rombel', 'Nama Siswa', ...STUDENT_BIODATA_FIELDS.map(field => field.label)];

export async function createStudentBiodataWorkbook(ExcelJS, students) {
  const workbook = await createExcelTemplate(ExcelJS, {
    sheetName,
    rows: [
      ['TEMPLATE IMPOR BIODATA SISWA'],
      ['Cocokkan NIS dan rombel dengan Data Siswa. Kolom Nama Siswa untuk referensi.'],
      ['Isi tanggal lahir dengan format DD/MM/YYYY atau YYYY-MM-DD. Kolom kosong mempertahankan data lama.'],
      headers,
      ...students.map(student => [student.nis, student.studentClassId, student.nama]),
    ],
    widths: [17, 12, 36, 24, 19, 33],
    headerRow: 3,
    titleRows: [0],
    fullWidthRows: [0, 1, 2],
    textColumns: [0, 1, 4],
    inputColumns: [3, 4, 5],
  });
  workbook.getWorksheet(sheetName).views = [{ state: 'frozen', ySplit: 4, showGridLines: false }];
  return workbook;
}

export function downloadStudentBiodataTemplate(students, showToast) {
  return downloadExcelWorkbook('template-biodata-siswa.xlsx', ExcelJS => createStudentBiodataWorkbook(ExcelJS, students), showToast);
}

function parseBirthDate(XLSX, value, date1904) {
  let parts;
  if (typeof value === 'number') {
    const excel = value >= 0 && XLSX.SSF.parse_date_code(value, { date1904 });
    if (excel) parts = [excel.y, excel.m, excel.d];
  } else {
    const text = String(value).trim();
    const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
    const local = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text);
    if (iso) parts = iso.slice(1).map(Number);
    else if (local) parts = local.slice(1).reverse().map(Number);
  }
  if (!parts) return '';
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return '';
  return date.toISOString().slice(0, 10);
}

export function readStudentBiodataRows(XLSX, buffer) {
  const workbook = XLSX.read(buffer);
  const sheet = workbook.Sheets[sheetName] ?? workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('Lembar biodata tidak ditemukan.');

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: '', blankrows: true });
  const required = headers.filter(label => label !== 'Nama Siswa').map(label => label.toLowerCase());
  const labels = rows.map(row => row.map(value => String(value).trim().toLowerCase().replace(/\s+/g, ' ')));
  const headerIndex = labels.findIndex(row => required.every(label => row.includes(label)));
  if (headerIndex < 0) throw new Error('Kolom NIS, Rombel, Tempat Lahir, Tanggal Lahir, dan Nama Orang Tua harus tersedia.');

  const columns = required.map(label => labels[headerIndex].indexOf(label));
  return rows.slice(headerIndex + 1).flatMap((row, index) => {
    const rowNumber = headerIndex + index + 2;
    const [rawNis, rombel, tempat, tanggal, orangTua] = columns.map(column => row[column] ?? '');
    const details = {};
    if (String(tempat).trim()) details.tempatLahir = String(tempat).trim();
    if (String(orangTua).trim()) details.namaOrangTua = String(orangTua).trim();
    if (String(tanggal).trim()) {
      const date = parseBirthDate(XLSX, tanggal, Boolean(workbook.Workbook?.WBProps?.date1904));
      if (!date) throw new Error(`Baris ${rowNumber}: tanggal lahir tidak valid. Gunakan DD/MM/YYYY atau YYYY-MM-DD.`);
      details.tanggalLahir = date;
    }
    if (!Object.keys(details).length) return [];

    const nisCell = sheet[XLSX.utils.encode_cell({ c: columns[0], r: rowNumber - 1 })];
    const nis = String(typeof rawNis === 'number' && nisCell ? XLSX.utils.format_cell(nisCell) : rawNis).trim();
    const classId = String(rombel).trim().toUpperCase();
    if (!nis || !classId) throw new Error(`Baris ${rowNumber}: isi NIS dan rombel siswa.`);
    return [{ classId, nis, details, rowNumber }];
  });
}
