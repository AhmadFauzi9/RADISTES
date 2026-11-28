# Master Plan Backend Go RADISTES

Bangun backend Go untuk menjalankan alur RADISTES yang sudah disetujui. Selesaikan RADISTES sebagai aplikasi mandiri terlebih dahulu. Target pertama adalah **satu rombel dan satu periode STS**, dari penyiapan data sampai cetak raport A4.

Gunakan dokumen ini untuk menentukan pekerjaan backend. Untuk mengetahui apa yang dilakukan pengguna dan hasil yang harus terlihat, baca panduan frontend. [Alur Penggunaan RADISTES](docs/workflow-radistes.md) · [Cara Kerja Frontend dan Panduan Uji](docs/perilaku-frontend-radistes.md)

## 1. Kunci tampilan dan perilaku frontend

**Acuan frontend** adalah commit Git `5ba399b2af6671929c16e09043408645287e6a60`. Saat menguji integrasi, bandingkan hasilnya dengan commit ini dan panduan frontend. Jika ada perbedaan antara panduan dan aplikasi, catat perbedaannya dan periksa kode pada commit acuan.

Bagian yang dilindungi meliputi tampilan halaman, menu dan rute, nama dan urutan tombol, warna, tabel, filter, pagination, modal, pesan dan status, hak akses yang terlihat, aturan nilai, format Excel, serta pratinjau, cetak, dan unduh raport. Perubahan internal untuk membaca API, mengirim data, atau memetakan respons boleh dilakukan selama cara pengguna memakai aplikasi dan hasil yang diharapkan tetap sama.

### Jika frontend perlu berubah

1. Catat halaman dan peran yang terdampak. Tunjukkan perilaku saat ini, perubahan yang diusulkan, dan alasan backend membutuhkannya.
2. Jelaskan dampaknya dengan contoh langkah, tangkapan layar, atau contoh data. Jika memungkinkan, jelaskan juga cara mempertahankan alur yang ada.
3. Minta persetujuan pemilik RADISTES **sebelum** mengubah tampilan atau perilaku tersebut. Lanjutkan bagian backend yang mandiri sambil menunggu jawaban.
4. Setelah disetujui, catat keputusan di perubahan atau pull request. Perbarui panduan dan skenario uji untuk perubahan tersebut. Jadikan commit hasil perubahan yang disetujui sebagai acuan berikutnya.

## 2. Tetapkan batas versi pertama

| Masuk ruang lingkup | Dikerjakan setelah versi mandiri siap atau lewat persetujuan terpisah |
| --- | --- |
| API Go, sesi dan hak akses untuk Admin, Wali Kelas, dan Guru Mapel. | Integrasi akun dan data siswa dengan SI-MATSAMA. |
| Data siswa, rombel, periode, mapel, dan penugasan yang dibutuhkan oleh alur saat ini. | Menu, fitur, atau peran baru di frontend. |
| Draft, impor, kirim, koreksi, peringkat, dan penguncian Leger. | Perubahan rumus, kewajiban baru untuk mengunci Leger, atau pembatasan berdasarkan tenggat. |
| Pengaturan raport, logo, tanda tangan, dan data yang dibutuhkan template A4 saat ini. | Tanda tangan elektronik, layanan cetak PDF baru, dan aturan penerbitan resmi yang belum disepakati. |
| Migrasi data uji, verifikasi satu rombel, dan persiapan migrasi data sekolah. | Migrasi data sekolah secara langsung sebelum pencocokan dan pemulihan selesai diuji. |

Jika muncul usulan fitur di luar tabel, catat di daftar pekerjaan lanjutan. Kerjakan hanya setelah pemilik menyetujui perubahan ruang lingkup.

## 3. Gunakan satu layanan Go

1. Letakkan layanan Go baru di `backend-go/`. Gunakan satu API dengan rute `/api/v1`.
2. Gunakan satu database SQL lokal yang sesuai lingkungan XAMPP. Periksa apakah lingkungan memakai MySQL atau MariaDB, catat mesin dan versinya, lalu pakai pilihan itu untuk menguji migrasi. Pilihan mesin produksi bisa ditetapkan setelah lingkungan produksi diketahui.
3. Pertahankan Next.js untuk portal, formulir, template Excel, dan render raport A4. Go mengelola sesi, izin, validasi, transaksi, perhitungan resmi, dan penyimpanan. Hubungkan melalui asal yang sama bila praktis, misalnya dengan meneruskan `/api/v1` dari Next.js ke Go.
4. Pakai [skema SQL lama](backend/database/schema.sql) dan [gateway PHP](backend/Router.php) sebagai bahan audit. Skema lama memiliki satu kelas per siswa dan penghapusan berantai pada nilai. Buat migrasi Go berversi dan uji pada database kosong sebelum memasukkan data lama.
5. Pakai data contoh untuk pengembangan. Petakan data di memori frontend dan penyimpanan browser saat merencanakan migrasi. Simpan pengaturan koneksi di konfigurasi lingkungan dan pisahkan dari repository. [Sumber data frontend](frontend/src/context/AppContext.jsx) · [Penyimpanan draft](frontend/src/lib/gradeDraftStorage.js)

Struktur awal yang disarankan. Tambahkan modul saat tahap terkait dimulai.

```text
backend-go/
  cmd/radistes/       Menjalankan API dan membaca konfigurasi
  internal/httpapi/   Rute, sesi, dan respons HTTP
  internal/siswa/     Siswa, rombel, dan riwayat keanggotaan
  internal/penilaian/ Mapel, penugasan, draft, setoran, dan Leger
  internal/raport/    Metadata dan aset raport
  migrations/        Perubahan database dengan nomor versi
```

## 4. Simpan data dengan ID yang tetap

| Data | Aturan utama |
| --- | --- |
| Siswa | Gunakan ID internal. Simpan NIS dan NISN sebagai teks agar nol di awal tetap ada. Simpan tempat lahir, tanggal lahir, serta nama orang tua sebagai biodata siswa. |
| Tahun ajaran, rombel, dan keanggotaan | Rombel punya ID. Nama seperti `8A` dapat dipakai kembali pada tahun berikutnya. Keanggotaan menghubungkan siswa dengan rombel dan masa berlaku. Riwayat tetap tersimpan saat siswa pindah kelas. |
| Akun, guru, dan penugasan | Pisahkan akun masuk dari identitas guru. Cakupan Wali Kelas berasal dari penugasan wali. Cakupan Setor Nilai berasal dari penugasan guru, mapel, rombel, dan periode. Satu guru dapat memiliki beberapa penugasan. |
| Mapel dan periode STS | Gunakan ID mapel yang tetap. Simpan kode, nama, induk, status aktif, dan urutan untuk periode yang digunakan. Nilai mapel yang dinonaktifkan tetap tersimpan. Simpan semester, tenggat, serta tanggal pembagian di periode penilaian. |
| Draft, setoran, dan Leger | Pisahkan isian yang sedang dikerjakan, versi yang dikirim, dan nilai akhir di Leger. Catat periode, rombel, mapel, serta asal nilai. Tentukan cakupan kunci unik berdasarkan keanggotaan dan periode agar siswa pindahan tetap memiliki riwayat. |
| Data pendukung dan aset raport | Kaitkan absensi, akhlak, ekskul, dan catatan dengan siswa serta periode. Simpan logo, tanda tangan, dan metadata kepala madrasah serta wali. Kaitkan tanda tangan wali dengan penugasan dan periode. Pertahankan resolusi asli unggahan. |

Penghapusan atau penonaktifan data induk harus menjaga riwayat nilai. Putuskan cara memperlakukan perpindahan rombel dalam satu semester sebelum menerbitkan raport resmi. Penyimpanan versi raport terbit disiapkan saat aturan penerbitannya sudah disetujui.

## 5. Tentukan kontrak API per tahap

Nama rute di bawah adalah usulan. Sebelum menghubungkan sebuah halaman, catat permintaan, respons, hak akses, dan contoh kesalahan yang dibutuhkan UI. Gunakan istilah dan hasil yang sama dengan panduan frontend.

| Bagian | Kontrak awal dan hasil yang harus dijaga |
| --- | --- |
| Fondasi | `GET /api/v1/health` untuk memeriksa layanan. `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, dan `GET /api/v1/me` untuk sesi dan profil. Hash sandi, kelola sesi di server, dan periksa izin pada tiap operasi. Uji terlebih dahulu lewat API sebelum menyambungkan layar login. |
| Siswa dan biodata | `GET /api/v1/rombel/{id}/siswa?periode_id=...` dan `PATCH /api/v1/siswa/{id}/biodata`. Admin mengelola lintas rombel, wali mendapat akses biodata di rombel asuh. Impor biodata khusus Admin mencocokkan NIS dan rombel, menjaga isian lama pada sel kosong, dan membatalkan seluruh batch jika ada baris salah. |
| Data master | Rute baca dan ubah periode, mapel, rombel, penugasan wali, serta penugasan guru. Pertahankan urutan mapel dan aturan induk dengan submapel, termasuk PAI dan MULOK. Untuk impor, server memvalidasi ulang rujukan dan melaporkan baris bermasalah sesuai alur masing-masing file. |
| Draft dan setoran | `PUT /api/v1/penugasan/{id}/draft` dan `POST /api/v1/penugasan/{id}/setoran`. Draft bisa disimpan dan dilanjutkan. Saat kirim berhasil, simpan versi setoran serta nilai Leger dalam satu transaksi. Klik ganda atau pengulangan permintaan yang sama menghasilkan satu versi kiriman. |
| Leger | `GET /api/v1/rombel/{id}/leger?periode_id=...`, operasi koreksi, impor DKN langsung khusus Admin, data pendukung, dan kunci atau buka kunci. Cek izin dan status kunci di server. Uji keadaan ketika setoran dan penguncian dilakukan bersamaan. |
| Raport | Rute pengaturan, unggah aset, dan baca data raport berdasarkan siswa serta periode. Next.js tetap menghasilkan pratinjau, cetak, dan unduhan memakai template yang sama. Periksa satu siswa dan hasil filter massal. [Template A4](frontend/src/components/raport/PrintableRaport.jsx) |

### Aturan yang wajib sama dengan frontend

1. **Setor Nilai.** STS wajib saat kirim dan UH 1–5 opsional. Nilai valid 0–100 dan nol dianggap terisi. Rata-rata DKN memakai STS dan UH yang terisi, lalu dibulatkan. Semua siswa dalam rombel diperiksa, termasuk yang ada di halaman tabel lain.
2. **Status kirim.** Simpan draft belum mengubah nilai Leger. Edit setelah kirim menghasilkan **Perubahan belum dikirim**. Setelah kirim ulang berhasil, Leger memakai nilai terbaru. Pertahankan ringkasan status yang terlihat pada tiap portal.
3. **Leger.** Jumlah, rata-rata, kelengkapan, dan peringkat mengikuti mapel aktif dan aturan pembulatan saat ini. Cocokkan hasil Go dengan data uji dari frontend, termasuk skor 0, sel kosong, nilai desimal, dan siswa dengan nilai seri.
4. **Impor.** Bedakan impor DKN ke draft guru dari impor DKN langsung ke Leger oleh Admin. Validasi data yang diterima di Go walaupun file Excel dibaca di frontend. Pertahankan format template dan petunjuk yang sudah digunakan.
5. **Raport.** Gunakan nama orang tua dari biodata, pengaturan periode, kop, dan tanda tangan sesuai penugasan. Pertahankan A4 dengan satu halaman per siswa, pratinjau yang sama, dan keluaran sesuai peran. Periksa catatan panjang serta ketajaman tanda tangan.

Rujukan kode. [Perhitungan DKN](frontend/src/lib/dknScores.js) · [Perhitungan Leger](frontend/src/lib/masterData.js) · [Katalog mapel](frontend/src/lib/subjectCatalog.js) · [Template penugasan](frontend/src/lib/teacherAssignmentWorkbook.js)

## 6. Kerjakan dan selesaikan satu tahap sebelum memperluas pekerjaan

| Tahap | Langkah kerja | Bukti tahap selesai |
| --- | --- | --- |
| 1. Fondasi Go | Buat modul Go, konfigurasi, rute kesehatan, migrasi awal, dan data uji satu rombel. Buat sesi server dan endpoint baca siswa sesuai izin. | Migrasi berjalan di database kosong. Uji API membuktikan data siswa terbaca dan permintaan tanpa izin ditolak. Frontend masih memakai commit acuan. |
| 2. Data induk | Mulai dari menghubungkan Data Siswa. Lanjutkan biodata, periode, katalog mapel, penugasan, dan impor sesuai urutan penggunaan. | Admin dan wali melihat data yang sesuai dari sesi berbeda. Data bertahan setelah muat ulang. Tampilan dan cara memakai halaman sesuai acuan. |
| 3. Penilaian | Hubungkan draft, kirim, status Admin, Leger, dan penguncian. Uji transaksi dan pengulangan permintaan. | Guru mengirim nilai dan wali memeriksanya dari sesi lain. Revisi, nilai kosong, nol, peringkat, dan kelas terkunci lulus uji. |
| 4. Raport | Hubungkan metadata, biodata, dan aset ke template. Uji pratinjau, unduh, dan cetak. | Raport satu siswa dan massal menghasilkan satu halaman A4 per siswa. Admin melihat tanda tangan wali dari sesi lain, dan dokumen mengikuti template acuan. |
| 5. Uji pemakaian sekolah | Audit data nyata, coba migrasi pada salinan, cocokkan hasil, lalu uji cadangan dan pemulihan sebelum peralihan. | Jumlah siswa, penugasan, nilai, dan raport cocok dengan sumber. Data dapat dipulihkan dan hasil uji satu rombel diterima. |

### Mulai dari satu pekerjaan

1. Siapkan `backend-go/` dan endpoint `GET /api/v1/health`.
2. Buat migrasi awal untuk tahun ajaran, rombel, siswa, dan keanggotaan. Isi data sintetis satu rombel.
3. Tambahkan sesi dan endpoint baca siswa yang terlindungi. Uji hak baca Admin, Wali Kelas yang bertugas, dan akun di luar rombel.
4. Setelah tahap ini lulus, sambungkan Data Siswa melalui adaptor API tanpa mengubah komponen tampilannya. Uji dari dua sesi sebelum lanjut ke impor dan penugasan.

### Pemeriksaan sebelum menutup tiap tahap

1. Jalankan `go test ./...` dan uji migrasi serta API yang berubah. Untuk perubahan integrasi, uji juga alur browser per peran. Jalankan `pnpm build` hanya jika diminta.
2. Bandingkan halaman terkait dengan commit acuan dalam kondisi data yang setara. Periksa nama tombol, posisi, pesan, status, hasil perhitungan, dan hasil berkas sesuai alur terkait.
3. Catat hasil uji, keputusan pemilik, dan bagian yang masih tertunda. Jika ada perubahan tampilan atau perilaku yang belum disetujui, selesaikan prosedur pada bagian 1 sebelum memasukkannya.

## 7. Pisahkan keputusan produk dari pekerjaan backend

Hal berikut perlu dikonfirmasi sebelum mengubah perilaku yang sudah terlihat oleh pengguna. Pengembangan teknis yang tidak bergantung pada keputusan ini bisa tetap berjalan.

| Keputusan | Acuan selama belum ada keputusan baru |
| --- | --- |
| Kapan sandi wajib dan bagaimana pesan gagal masuk tampil | Uji autentikasi nyata melalui API. Mintakan persetujuan sebelum mengubah cara atau pesan masuk di frontend demo. |
| Apakah tenggat harus menolak kiriman | Tenggat tampil sebagai pengingat. |
| Apakah Leger wajib lengkap sebelum dikunci | Frontend dapat mengunci sebelum lengkap. Gunakan petunjuk verifikasi yang ada. |
| Siapa yang boleh membuka kunci, dan kapan raport resmi terbit | Pertahankan akses dan alur saat ini. Pratinjau dan cetak tersedia sebelum penguncian. Terbit resmi dan arsip versi ditetapkan terpisah. |
| Bagaimana tombol tambah atau hapus menangani data sekolah | Tambah Siswa masih berupa contoh. Sebelum mengubah aksi yang terlihat, sepakati cara menambah, mengakhiri penugasan, atau menonaktifkan keanggotaan dengan riwayat tetap tersimpan. |

## 8. Siapkan penggabungan dengan SI-MATSAMA setelah RADISTES mandiri

1. **Buat batas modul siswa sejak awal.** Gunakan operasi baca seperti `AmbilSiswa(id)` dan `DaftarSiswaRombel(rombelID, periode)`. Untuk tahap awal, modul membaca database RADISTES. Modul nilai tetap memakai ID siswa lokal.
2. **Audit SI-MATSAMA ketika siap.** Periksa ID, cakupan unik NIS dan NISN, data orang tua, riwayat rombel, dan akses API. Mulai dengan membaca satu rombel.
3. **Cocokkan data uji.** Pakai NISN yang tersedia dan unik, lalu NIS dalam cakupan madrasah. Jika hasil meragukan, cocokkan secara manual sebelum mengubah sumber baca.
4. **Buat pemetaan ID.** Simpan pasangan ID lokal RADISTES, sistem asal, dan ID siswa di SI-MATSAMA dengan batas keunikan. Contohnya, siswa RADISTES `125` dapat menunjuk ke siswa SI-MATSAMA `842`. Nilai lama tetap memakai ID RADISTES. Pertukaran data dimulai melalui API.
5. **Alihkan sumber biodata bertahap.** Setelah hasil cocok, jadikan SI-MATSAMA sumber utama identitas dan biodata. Tentukan pemilik data rombel dan aturan koreksi setelah kedua aplikasi siap. Arsip raport yang telah diterbitkan tetap bergantung pada data periode asal.
6. **Uji cadangan dan pemulihan.** Simpan tabel pemetaan, uji jika SI-MATSAMA lambat atau tidak dapat diakses, lalu siapkan pengembalian sumber baca ke data RADISTES bila pencocokan gagal. Jadwalkan integrasi login dan menu setelah pertukaran data lulus.
