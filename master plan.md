# Master Plan RADISTES

Sebelum menghubungkan UI ke Go, gunakan [Workflow RADISTES](docs/workflow-radistes.md) untuk mengikuti alur tiap portal dan [Dokumentasi Perilaku Frontend](docs/perilaku-frontend-radistes.md) untuk memeriksa aturan nilai, batas prototipe, serta skenario penerimaan backend.

## 1. Tujuan dan keputusan arsitektur

Selesaikan **RADISTES terlebih dahulu** sebagai aplikasi mandiri. Gunakan **Next.js** untuk frontend dan **Go** untuk API, autentikasi, aturan penilaian, serta penyimpanan. Gunakan **MySQL atau MariaDB** sebagai database awal agar sesuai dengan lingkungan XAMPP dan skema SQL yang sudah ada sebagai referensi. Pilih satu mesin dan versi untuk pengembangan dan pengujian migrasi sebelum menulis migrasi produksi.

Target pertama adalah alur utuh untuk satu rombel. Admin menyiapkan data siswa dan penugasan, guru mengirim nilai, wali kelas memeriksa Leger, kemudian admin atau wali kelas menghasilkan raport sesuai hak akses.

Setelah SI-MATSAMA siap, jadikan **SI-MATSAMA sebagai sumber utama identitas dan biodata siswa**, beserta data rombel jika layanan dan riwayatnya tersedia. RADISTES tetap mengelola penilaian dan raport. Menu Raport dan masuk melalui akun SI-MATSAMA dapat ditambahkan setelah kedua aplikasi siap bertukar data. Awali integrasi melalui API agar masing-masing aplikasi dapat mengelola skemanya sendiri. [Panduan kepemilikan data layanan](https://learn.microsoft.com/azure/architecture/microservices/design/data-considerations)

```text
Tahap awal   Browser → Next.js → API Go RADISTES → Database RADISTES
Tahap lanjut                         │
                                     └→ API SI-MATSAMA untuk data induk
```

Sajikan UI dan API melalui alamat aplikasi yang sama bila praktis. Reverse proxy atau rewrite Next.js dapat meneruskan `/api/v1` ke Go. Go memverifikasi sesi dan kewenangan untuk setiap operasi. [Dokumentasi rewrite Next.js 14](https://nextjs.org/docs/14/app/api-reference/next-config-js/rewrites)

## 2. Titik awal repositori

| Bagian | Kondisi saat rencana disusun |
| --- | --- |
| [Frontend Next.js](frontend/package.json) | Tampilan dan alur portal sudah tersedia sebagai dasar implementasi API. |
| [Gateway PHP](backend/Router.php) | Endpoint status dan respons placeholder. Gunakan skema PHP sebagai bahan audit saat mulai membangun layanan Go. |
| [Skema lama](backend/database/schema.sql) | Tabel `siswa` memiliki satu `kelas_id`. Tabel nilai merujuk langsung ke siswa dengan penghapusan berantai. Migrasi Go perlu memodelkan riwayat rombel dan menjaga riwayat nilai. |
| [AppContext](frontend/src/context/AppContext.jsx) dan [penyimpanan draft](frontend/src/lib/gradeDraftStorage.js) | Login masih simulasi. Nilai Leger dan status setoran berada di memori aplikasi. Sebagian pengaturan, biodata, penugasan, tanda tangan, dan draft disimpan di browser. Mulai dengan inventaris data yang perlu dipindahkan ke server. |
| [Catatan fitur](Catatan.txt) | Gunakan bersama tampilan terkini untuk memeriksa perilaku yang harus dibawa ke backend. |

Susunan kode yang diusulkan menempatkan layanan baru di `backend-go/` selama peralihan.

```text
frontend/                  UI, formulir, impor dan ekspor
backend-go/
  cmd/radistes/            konfigurasi dan startup API
  internal/httpapi/        route, sesi, validasi input, dan respons
  internal/siswa/          data induk siswa dan pencarian rombel
  internal/penilaian/      penugasan, draft, setoran, dan Leger
  internal/raport/         penguncian, penerbitan, dan metadata raport
  migrations/             migrasi SQL dengan nomor versi
```

Mulai dengan satu layanan Go. Definisikan kontrak baca data siswa di modul siswa, misalnya `AmbilSiswa(id)` dan `DaftarSiswaRombel(rombelID, periode)`. Implementasi awal membaca SQL lokal. Tambahkan adaptor SI-MATSAMA saat kontrak API dan izin aksesnya tersedia.

## 3. Model data awal

Nama tabel berikut adalah usulan untuk RADISTES. Nama, tipe ID, autentikasi, dan skema SI-MATSAMA perlu diperiksa sebelum pemetaan final.

| Entitas | Relasi dan aturan |
| --- | --- |
| `siswa` | Gunakan `id` internal yang stabil. Simpan NIS dan NISN sebagai teks agar nol di awal terjaga. Gunakan keduanya untuk pencarian dan pencocokan awal. Biodata seperti TTL dan nama orang tua berada pada data induk. |
| `tahun_ajaran`, `rombel`, `keanggotaan_rombel` | Rombel mempunyai ID dan terkait tahun ajaran. Keanggotaan menghubungkan siswa dengan rombel dan menyimpan semester atau masa berlaku. Kode seperti `7A` adalah label yang bisa berulang antartahun. Pertahankan catatan lama saat siswa pindah atau naik kelas. |
| `guru`, `akun`, `penugasan_wali`, `penugasan_mapel` | Pisahkan identitas guru dari akun. Wali kelas merujuk ke rombel dan periode. Penugasan mapel menghubungkan guru, mapel, rombel, dan periode, dengan satu baris untuk setiap kombinasi unik. |
| `mata_pelajaran`, `mapel_periode` | Simpan ID, kode, nama, induk, status aktif, dan urutan. Rekam susunan mapel yang berlaku pada periode penilaian agar perubahan katalog berikutnya dapat diterapkan pada periode yang dipilih. |
| `periode_penilaian` | Simpan tahun ajaran, semester, jenis ujian seperti STS, tenggat setor, dan tanggal pembagian. Kaitkan data penilaian dengan ID periode ini. |
| `setoran_nilai`, `setoran_nilai_detail`, `nilai_leger` | Simpan draft, versi kirim, dan sumber nilai. Pada Leger, gunakan satu nilai akhir per kombinasi siswa, mapel, dan periode, serta simpan rujukan rombel tempat nilai tersebut dicatat. |
| `nilai_pendukung`, `raport_terbit` | Simpan absensi, akhlak, kegiatan, dan catatan per siswa dan periode. Saat raport diterbitkan, simpan data yang digunakan atau PDF final beserta versi agar hasil lama dapat diakses ketika biodata, mapel, atau tanda tangan kemudian berubah. |
| `pengaturan_raport`, `aset_raport` | Simpan kop, tanggal, NIPY, dan rujukan berkas logo atau tanda tangan di server. Kaitkan tanda tangan wali dengan penugasan dan periode. |
| `identitas_eksternal` | Siapkan migrasi tabel ini saat integrasi dimulai. Petakan ID lokal ke `sistem_asal` dan `id_eksternal`. Terapkan keunikan pasangan sistem dan ID eksternal serta satu pemetaan aktif per siswa untuk setiap sistem. |

Gunakan foreign key lokal untuk relasi dalam RADISTES. Untuk arsip nilai, nonaktifkan data induk atau gunakan aturan `RESTRICT` saat masih memiliki riwayat. Kendalikan kasus pindah rombel dalam satu semester dengan masa berlaku keanggotaan dan keputusan kelas mana yang menerbitkan raport. [Dokumentasi foreign key MySQL](https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html)

## 4. Kontrak API dan aturan penilaian

| API usulan | Tanggung jawab |
| --- | --- |
| `POST /api/v1/auth/login`, `GET /api/v1/me` | Membuat sesi dan mengembalikan profil, role, serta penugasan yang berlaku. Gunakan akun server dengan sandi yang di-hash dan cookie sesi yang aman. |
| `GET /api/v1/rombel/{id}/siswa?periode_id=...` | Mengembalikan daftar siswa berdasarkan riwayat rombel dan periode. |
| `PATCH /api/v1/siswa/{id}/biodata`, `POST /api/v1/siswa/biodata/impor` | Edit manual untuk admin atau wali yang bertugas. Impor massal khusus admin mencocokkan siswa terdaftar, memvalidasi semua baris, dan mempertahankan nilai lama pada kolom kosong. |
| `GET /api/v1/mapel?periode_id=...`, `GET /api/v1/penugasan?periode_id=...` | Memuat mapel aktif berurutan dan penugasan untuk filter, modal, dan template impor. |
| `PUT /api/v1/penugasan/{id}/draft`, `POST /api/v1/penugasan/{id}/setoran` | Menyimpan draft dan mengirim versi yang telah divalidasi. |
| `GET /api/v1/rombel/{id}/leger?periode_id=...` | Mengembalikan kolom mapel, nilai, status kelengkapan, total, rata-rata, dan peringkat. |
| `POST /api/v1/rombel/{id}/leger/kunci`, `GET /api/v1/raport/{id}` | Mengunci Leger untuk periode yang dipilih dan mengambil data raport yang dapat diakses akun tersebut. |

- **Hak akses.** Admin mengelola penugasan dan pengaturan, wali kelas mengelola rombel yang ditugaskan, dan guru mapel menyetor nilai untuk kombinasi rombel, mapel, dan periode yang ditugaskan. Akses ditentukan dari sesi dan data penugasan di server.
- **Draft dan kirim.** Menyimpan draft mempertahankan status belum dikirim. Saat berhasil dikirim, simpan versi setoran dan nilai Leger dalam satu transaksi. Perubahan setelah setor menandai revisi yang perlu dikirim ulang. Gunakan identitas kiriman atau versi draft agar retry dan klik ganda menghasilkan satu kiriman. Uji persaingan antara setor dan penguncian. [Transaksi database di Go](https://go.dev/doc/database/execute-transactions)
- **Nilai.** Pertahankan UH 1–5 dan STS, bedakan sel kosong dari nol, validasi rentang 0–100, dan bulatkan sesuai aturan saat ini. Leger menghitung jumlah, rata-rata, dan peringkat dari mapel aktif. Pertahankan pilihan eksklusif antara induk dan submapel, termasuk PAI dan MULOK, serta urutan mapel dari pengaturan periode. [Perhitungan DKN](frontend/src/lib/dknScores.js) · [Katalog mapel](frontend/src/lib/subjectCatalog.js) · [Perhitungan Leger](frontend/src/lib/masterData.js)
- **Impor.** Validasi data Excel kembali di Go terhadap daftar rombel, mapel aktif, dan penugasan terbaru. Kembalikan nomor baris serta alasan jika ada data salah. Simpan batch yang valid dalam transaksi. [Template penugasan](frontend/src/lib/teacherAssignmentWorkbook.js)
- **Raport.** Gunakan template A4 yang sudah ada untuk tahap awal. Suplai data dari API Go. Periksa cetak satu siswa dan cetak massal, termasuk catatan panjang serta blok tanda tangan dan nama orang tua. [Template raport](frontend/src/components/raport/PrintableRaport.jsx)

## 5. Tahapan implementasi dan kriteria selesai

| Tahap | Pekerjaan | Lulus jika |
| --- | --- | --- |
| 1. Fondasi API | Buat layanan Go, migrasi SQL, data uji satu rombel, sesi server, dan endpoint baca siswa. | Admin dapat masuk dan melihat data dari database. Permintaan tanpa hak akses ditolak. |
| 2. Data induk dan penugasan | Hubungkan Data Siswa, pengaturan periode, Mata Pelajaran, Wali Kelas, dan Guru Mapel ke API. | Perubahan terlihat setelah muat ulang dan dari browser lain. Penugasan beberapa rombel serta urutan mapel terbaca konsisten. |
| 3. Penilaian | Hubungkan draft, impor, setor, Leger, dan penguncian. | Guru menyetor satu kelas dan wali melihat hasilnya dari sesi lain. Uji revisi, kirim ulang, tab bersamaan, nilai kosong, dan kelas terkunci. |
| 4. Raport | Pindahkan metadata, biodata yang dipakai, logo, serta tanda tangan ke server. Hubungkan preview dan unduh. | Admin melihat TTD yang diunggah wali dari perangkat lain. PDF A4 memuat satu halaman per siswa dan hasil terbit dapat diambil kembali. |
| 5. Migrasi dan uji sekolah | Inventaris data demo dan data nyata dari browser atau Excel. Petakan data, jalankan simulasi impor, dan siapkan cadangan basis data. | Jumlah siswa, penugasan, nilai, dan raport cocok dengan sumber. Tinjau konflik serta uji pemulihan cadangan sebelum beralih. |
| 6. Integrasi SI-MATSAMA | Periksa skema dan API yang tersedia. Mulai dengan baca satu rombel, pemetaan ID, dan satu arah kepemilikan biodata. Tambahkan integrasi login dan menu setelah data cocok. | Siswa duplikat ditangani, nilai lama tetap terhubung, dan siswa yang naik kelas masih dapat membuka raport sebelumnya. |

Pekerjaan pertama yang dapat langsung dimulai adalah migrasi awal Go untuk `siswa`, `tahun_ajaran`, `rombel`, dan `keanggotaan_rombel`, lalu endpoint baca satu rombel yang dipakai halaman Data Siswa. Untuk setiap tahap, uji logika dengan `go test ./...` dan uji alur terkait di browser. Ikuti arahan proyek untuk melewati `pnpm build` sampai build diminta.

## 6. Prosedur penggabungan data siswa

1. **Audit SI-MATSAMA.** Pastikan tipe ID, cakupan keunikan NIS/NISN, riwayat rombel, data orang tua, status siswa, dan metode otorisasi. Tentukan data yang dapat dibaca dan siapa yang boleh mengoreksi biodata.
2. **Cocokkan data sebelum beralih.** Gunakan NISN bila tersedia dan unik, lalu NIS dalam cakupan madrasah. Jika keduanya kosong atau hasilnya meragukan, cocokkan nama dan tanggal lahir secara manual. Simpan daftar padanan dan konflik sebelum menulis data produksi.
3. **Pertahankan relasi nilai.** Sebagai contoh, petakan siswa lokal `125` ke ID SI-MATSAMA `842`. Nilai dan raport tetap merujuk ke ID lokal RADISTES. Adaptor menggunakan pemetaan itu untuk mengambil biodata resmi. Jika kedua aplikasi nanti memakai skema terintegrasi, migrasikan foreign key setelah seluruh padanan tervalidasi.
4. **Alihkan pengelolaan biodata.** Setelah perbandingan satu rombel lulus, jadikan SI-MATSAMA sumber biodata. Jika form edit tetap tersedia di RADISTES, kirim koreksi melalui API SI-MATSAMA dengan otorisasi yang disepakati. Data minimum yang diperlukan untuk riwayat raport disimpan bersama versi raport.
5. **Siapkan peralihan dan pemulihan.** Cadangkan data dan tabel pemetaan sebelum perubahan. Uji pertukaran data saat API SI-MATSAMA lambat atau tidak dapat diakses. Raport yang sudah terbit tetap dapat diakses dari arsip RADISTES. Jika hasil pencocokan bermasalah, kembalikan sumber baca ke penyimpanan lokal sampai pemetaan selesai diperbaiki.
