const signatureCrops = new Map();
export const RAPORT_PAPER = { width: 210, height: 297, marginX: 12, marginY: 10 };

function findSignatureCrop(image) {
  const scale = Math.min(1, 480 / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return 'none';

  context.drawImage(image, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const hasInk = data[offset + 3] >= 32 && Math.min(data[offset], data[offset + 1], data[offset + 2]) < 215;
      if (!hasInk) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left) return 'none';
  const padding = 3;
  const offsets = [
    [top, height],
    [width - right - 1, width],
    [height - bottom - 1, height],
    [left, width],
  ].map(([distance, size]) => `${100 * Math.max(0, distance - padding) / size}%`);
  return `inset(${offsets.join(' ')})`;
}

export function fitRaportSignature(image) {
  if (!image.naturalWidth || !CSS.supports('object-view-box', 'inset(1%)')) return;
  const source = image.currentSrc;
  if (!signatureCrops.has(source)) {
    if (signatureCrops.size >= 32) signatureCrops.clear();
    try {
      signatureCrops.set(source, findSignatureCrop(image));
    } catch {
      signatureCrops.set(source, 'none');
    }
  }
  image.style.setProperty('object-view-box', signatureCrops.get(source));
}

export async function waitForRaportImages(container) {
  const images = container?.querySelectorAll('img') ?? [];
  await Promise.allSettled(Array.from(images, async image => {
    await image.decode();
    if (image.hasAttribute('data-raport-signature')) fitRaportSignature(image);
  }));
}

export async function prepareRaportPrint(container) {
  const sheets = container?.querySelectorAll('.print-container');
  if (!sheets?.length) return;

  await Promise.all([document.fonts.ready, waitForRaportImages(container)]);

  const measuringArea = document.createElement('div');
  measuringArea.className = 'raport-export';
  measuringArea.setAttribute('aria-hidden', 'true');
  document.body.append(measuringArea);
  try {
    const availableHeight = (RAPORT_PAPER.height - RAPORT_PAPER.marginY * 2 - 1) * 96 / 25.4;
    for (const sheet of sheets) {
      const copy = sheet.cloneNode(true);
      measuringArea.replaceChildren(copy);
      await waitForRaportImages(copy);
      const height = copy.getBoundingClientRect().height;
      sheet.style.setProperty('--raport-print-scale', String(Math.min(1, availableHeight / height)));
    }
  } finally {
    measuringArea.remove();
  }
}
