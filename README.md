# RADISTES - Raport Digital STS (Sumatif Tengah Semester)
**MTs AL AMIRIYYAH - BLOKAGUNG TEGALSARI BANYUWANGI**

Aplikasi pengelolaan Leger Nilai dan Cetak Raport STS berbasis **Next.js**, **Tailwind CSS**, dan **FontAwesome**, dirancang dengan visual dan struktur folder yang konsisten dengan **ExamLAN Pro**.

---

## 📁 Struktur Folder (Sesuai Standar ExamLAN Pro)

```
c:\xampp\htdocs\RADISTES\
├── api.php                         # API Gateway utama (seperti di ExamLAN Pro)
├── START_RADISTES.bat              # Launcher 1-klik untuk menjalankan aplikasi
├── package.json                    # Script delegasi root (npm run dev)
│
├── backend/                        # Persiapan Backend MySQL (Siap dihubungkan)
│   ├── config/
│   │   └── database.php            # Konfigurasi koneksi PDO MySQL (db_radistes)
│   ├── controllers/                # Controller modular (Leger, Raport, Siswa, Guru)
│   ├── database/
│   │   └── schema.sql              # Skema tabel MySQL lengkap (8 tabel relasional)
│   ├── helpers/
│   │   └── Response.php            # Helper JSON Response standar
│   ├── middleware/                 # Auth & role session middleware
│   ├── services/                   # Business logic & kalkulasi nilai
│   ├── bootstrap.php               # Bootstrap backend
│   └── Router.php                  # Router API PHP
│
└── frontend/                       # Aplikasi Utama Next.js + Tailwind CSS
    ├── package.json
    ├── next.config.mjs
    ├── tailwind.config.js          # Skema warna ExamLAN Pro (brand indigo, slate, status pills)
    ├── postcss.config.js
    ├── jsconfig.json
    ├── public/
    └── src/
        ├── app/
        │   ├── globals.css         # Styling global + fontawesome + CSS Print (@media print)
        │   ├── layout.jsx          # Root layout terpadu
        │   ├── page.jsx            # Dashboard ringkasan nilai, status kelas & alur kerja
        │   ├── leger/              # HALAMAN UTAMA: Leger Kumpulan Nilai STS (Spreadsheet)
        │   ├── cetak-raport/       # Template Cetak Raport STS 1:1 format Excel (A4 Print-Ready)
        │   ├── setor-nilai/        # Portal Guru Mapel menyetor nilai ke Wali Kelas
        │   ├── data-siswa/         # Master data 49 Kelas & Wali Kelas resmi MTs Al Amiriyyah
        │   └── pengaturan/         # Atur Kop Yayasan, Titimangsa, Kepala Madrasah & KKM
        ├── components/
        │   ├── layout/
        │   │   ├── Header.jsx      # Topbar ala ExamLAN Pro (Quick Class switcher, Notif bell)
        │   │   ├── Sidebar.jsx     # Modular Sidebar dengan icon FontAwesome & badge status
        │   │   └── AppLayout.jsx   # Kerangka halaman terpadu
        │   ├── common/
        │   │   ├── SummaryCard.jsx # Card metrik ringkasan (5 card ExamLAN Pro style)
        │   │   └── Toast.jsx       # Notifikasi toast mengambang
        │   └── raport/
        │       ├── PrintableRaport.jsx  # Template Raport STS 1:1 resmi Excel Al Amiriyyah
        │       └── RaportPreviewModal.jsx # Modal interaktif preview & cetak per siswa
        ├── context/
        │   └── AppContext.jsx      # State management data leger, auto-recalculate & ranking
        └── lib/
            ├── masterData.js       # Master data 49 Kelas, 13 Mapel, 29 Siswa 8A dari Excel
            └── terbilang.js        # Konverter angka ke huruf (0-100) lookup sesuai Excel
```

---

## 🚀 Cara Menjalankan Aplikasi

1. Buka folder `c:\xampp\htdocs\RADISTES`
2. Klik ganda file **`START_RADISTES.bat`**, atau buka terminal/CMD lalu jalankan:
   ```bash
   cd c:\xampp\htdocs\RADISTES\frontend
   npm run dev
   ```
3. Buka browser di: **`http://localhost:3000`**

---

## 🔄 Alur Kerja Aplikasi (Workflow STS)

```
[ Guru Mata Pelajaran ]
        │ (Input / Setor nilai per mapel di halaman /setor-nilai)
        ▼
[ Halaman Leger Nilai (/leger) ]
        │ (Wali Kelas memeriksa data, auto-sum, auto-average, ranking otomatis 1..N)
        │ (Wali kelas melengkapi ekskul, akhlak, absensi & catatan wali)
        ▼
[ Kunci Nilai Leger Fix ]
        │ (Klik "Kunci Nilai Fix" jika seluruh nilai sudah lengkap)
        ▼
[ Halaman Cetak Raport PDF (/cetak-raport) ]
        │
        ├── Cetak Per Siswa: Preview format raport resmi lengkap terbilang angka & huruf
        └── Cetak Seluruh Kelas: Sekali klik print langsung mencetak seluruh 29 siswa (A4 Page-break)
```

---

## ✨ Fitur-Fitur Unggulan

1. **Desain Visual ExamLAN Pro**:
   - Header gelap (`bg-slate-900`) dengan logo badge, quick class dropdown, bell notifikasi setoran masuk, dan profil wali kelas.
   - Modular sidebar dengan FontAwesome icons, active states, dan petunjuk ringkas alur kerja.
   - Grid 5 kartu ringkasan status kelengkapan, rata-rata kelas, dan status kunci.
2. **Spreadsheet Leger Interaktif**:
   - Input langsung pada cell tabel nilai.
   - 13 Mata Pelajaran lengkap dengan KKM 70.
   - Auto-calculate Jumlah Nilai dan Rata-rata secara instan.
   - Dynamic Auto-Ranking (1..N) dengan icon piala emas/perak/perunggu untuk Juara 1, 2, dan 3.
   - Tabel Peringkat 10 Besar sesuai dengan sheet Excel STS asli.
   - Tab beralih antara "Nilai 13 Mapel" dan "Ekskul, Akhlak & Absensi".
   - Export Leger ke Excel / CSV.
3. **Template Raport STS Siap Cetak (1:1 Excel MTs Al Amiriyyah)**:
   - Kop surat lengkap Yayasan Pondok Pesantren Darussalam & MTs Al Amiriyyah.
   - Konversi angka ke terbilang bahasa Indonesia (misal `85` -> `"Delapan Puluh Lima"`).
   - Indikator Ketercapaian Kompetensi ("Tercapai" / "Tidak Tercapai").
   - Kolom tanda tangan 3 pihak (Kepala Madrasah, Wali Kelas, Orang Tua/Wali).
   - Rule cetak `@media print` presisi kertas A4/F4 tanpa margin terpotong.
4. **Data Master Asli**:
   - 49 Daftar Wali Kelas (7A-7P, 8A-8R, 9A-9O) beserta No. Telepon lengkap dari file Excel user.
   - 29 Nama Siswa Kelas 8A asli dari data Excel user.
