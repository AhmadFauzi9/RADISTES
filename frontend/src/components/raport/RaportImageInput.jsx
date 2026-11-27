'use client';

import { useApp } from '@/context/AppContext';

const imageTypes = ['image/png', 'image/jpeg', 'image/webp'];

function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function prepareImage(file) {
  const dataUrl = await readDataUrl(file);
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  return dataUrl;
}

export default function RaportImageInput({ label, value, onChange, busy, onBusyChange, signature = false }) {
  const { showToast } = useApp();

  async function handleFileChange(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file || busy) return;
    if (!imageTypes.includes(file.type) || file.size > 1024 * 1024) {
      showToast('Gunakan gambar PNG, JPEG, atau WebP maksimal 1 MB.', 'warning');
      return;
    }
    onBusyChange(true);
    try {
      onChange(await prepareImage(file));
    } catch {
      showToast('Gambar gagal dibaca. Pilih ulang file gambar.', 'warning');
    } finally {
      onBusyChange(false);
    }
  }

  return (
    <div className="space-y-2 text-xs">
      <label className="block space-y-1 font-semibold text-slate-700">
        <span className="block">{label}</span>
        <input type="file" accept={imageTypes.join(',')} disabled={busy} onChange={handleFileChange}
          className="block w-full text-xs text-slate-600 disabled:opacity-50" />
      </label>
      {value && (
        <div className="flex flex-wrap items-center gap-3">
          <img src={value} alt={`Pratinjau ${label.toLowerCase()}`} className="h-14 max-w-[144px] object-contain" />
          {signature && (
            <button type="button" onClick={() => onChange('')} disabled={busy}
              className="text-xs font-semibold text-rose-700 underline disabled:opacity-50">
              Hapus tanda tangan
            </button>
          )}
        </div>
      )}
    </div>
  );
}
