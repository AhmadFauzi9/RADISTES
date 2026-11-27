import { RAPORT_PAPER, waitForRaportImages } from './raportPrint';

export async function downloadRaportPdf(container, title) {
  const sheets = container?.querySelectorAll('.print-container');
  if (!sheets?.length) throw new Error('Raport tidak tersedia.');

  const [{ toCanvas }, { jsPDF }] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
    document.fonts.ready,
    waitForRaportImages(container),
  ]);
  const { width: paperWidth, height: paperHeight, marginX, marginY } = RAPORT_PAPER;
  const paperSize = [paperWidth, paperHeight];
  const pdf = new jsPDF({ unit: 'mm', format: paperSize, compress: true });
  const availableWidth = paperWidth - marginX * 2;
  const availableHeight = paperHeight - marginY * 2;

  for (const [index, sheet] of sheets.entries()) {
    const canvas = await toCanvas(sheet, { pixelRatio: 3, skipFonts: true, backgroundColor: '#fff' });
    try {
      const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
      const width = canvas.width * scale;
      if (index > 0) pdf.addPage(paperSize);
      pdf.addImage(canvas, 'PNG', (paperWidth - width) / 2, marginY, width, canvas.height * scale);
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }

  const filename = title.replace(/[<>:"/\\|?*]/g, '-').trim().slice(0, 120);
  pdf.save(`${filename}.pdf`);
}
