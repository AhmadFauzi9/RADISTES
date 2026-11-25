const fill = argb => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const font = { name: 'Arial', size: 10, color: { argb: 'FF0F172A' } };

export async function createExcelTemplate(ExcelJS, {
  rows, sheetName, widths, headerRow = 0, textColumns = [], inputColumns = [],
  titleRows = [], fullWidthRows = [], merges = [], filter = true,
}) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = widths.map(width => ({ width }));
  if (filter && rows.length > headerRow + 1) {
    sheet.autoFilter = {
      from: { row: headerRow + 1, column: 1 },
      to: { row: rows.length, column: widths.length },
    };
  }

  let hasFormulas = false;
  for (let r = 0; r < rows.length; r += 1) {
    const row = sheet.getRow(r + 1);
    const isHeader = r === headerRow;
    const isBody = r > headerRow;
    const isTitle = titleRows.includes(r);
    const alternate = (r - headerRow) % 2 === 0;
    row.height = isHeader || isTitle ? 25 : 18;
    for (let c = 0; c < widths.length; c += 1) {
      const value = rows[r][c];
      if (!isHeader && !isBody && (value == null || value === '')) continue;

      const cell = row.getCell(c + 1);
      const isText = isBody && textColumns.includes(c);
      const isInput = isBody && inputColumns.includes(c);
      const isFormula = Boolean(value?.formula);
      hasFormulas ||= isFormula;
      cell.value = value == null || value === '' ? null : isText && !isFormula ? String(value) : value;
      cell.font = isHeader ? { ...font, bold: true, color: { argb: 'FFFFFFFF' } }
        : isTitle ? { ...font, bold: true, size: 14 } : font;
      cell.alignment = {
        vertical: 'middle',
        horizontal: isHeader || isInput || isFormula ? 'center' : typeof value === 'number' ? 'right' : 'left',
      };
      if (isHeader) cell.fill = fill('FF1E3A5F');
      if (isBody) cell.fill = fill(isInput ? (alternate ? 'FFFEF3C7' : 'FFFFFBEB') : (alternate ? 'FFF1F5F9' : 'FFFFFFFF'));
      if (isText) cell.numFmt = '@';
      if (isInput && !isFormula) cell.protection = { locked: false };
    }
  }

  for (const address of merges) sheet.mergeCells(address);
  for (const r of fullWidthRows) sheet.mergeCells(r + 1, 1, r + 1, widths.length);
  if (hasFormulas) {
    workbook.calcProperties.fullCalcOnLoad = true;
    await sheet.protect('', { autoFilter: filter });
  }
  return workbook;
}

export async function downloadExcelTemplate(options, showToast) {
  try {
    const { default: ExcelJS } = await import('exceljs');
    const workbook = await createExcelTemplate(ExcelJS, options);
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }));
    const link = document.createElement('a');
    link.href = url;
    link.download = options.fileName;
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return true;
  } catch (error) {
    console.error(error);
    showToast('Template Excel gagal dibuat.', 'warning');
    return false;
  }
}
