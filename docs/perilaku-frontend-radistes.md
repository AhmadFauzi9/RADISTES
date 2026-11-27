# Dokumentasi Perilaku Frontend RADISTES

Dokumen ini menjadi acuan perilaku saat frontend dihubungkan ke Go, termasuk pembaruan edit dan impor biodata siswa. [Workflow RADISTES](workflow-radistes.md) memuat alur operator, sedangkan [Master Plan RADISTES](../master%20plan.md) memuat rancangan sistem dan tahapan pembangunan.

## 1. Login, peran, dan jangkauan data

- Frontend menentukan Admin dari identitas akun demo. Untuk guru, frontend mencari kecocokan nama dengan penugasan wali kelas, lalu menetapkan peran Wali Kelas atau Guru Mapel. Form menyediakan kolom sandi, tetapi fungsi masuk saat ini hanya menerima nama pengguna.
- Wali Kelas bekerja pada rombel asuh di Data Siswa, Leger, dan Raport. Untuk Setor Nilai dan Nilai Terbaik, cakupannya berasal dari penugasan mengajar. Guru Mapel bekerja pada kombinasi mapel dan rombel yang ditugaskan. Admin memantau dan mengelola data lintas rombel.
- Di Dashboard Admin, header menampilkan identitas madrasah. Pilihan rombel di Leger dipakai untuk Leger. Data Siswa dan Raport memiliki filter sendiri.
- Saat memindahkan perilaku ke Go, bentuk izin dari ID akun, ID guru, penugasan, dan periode. Terapkan cakupan pada setiap operasi baca, ubah, impor, kunci, dan unduh. Ganti pencocokan nama dan akun demo dengan identitas terverifikasi.

Sumber kode tersedia di [LoginScreen](../frontend/src/components/auth/LoginScreen.jsx), [AppContext](../frontend/src/context/AppContext.jsx), dan [Sidebar](../frontend/src/components/layout/Sidebar.jsx).

## 2. Data induk dan format impor

| Bagian | Perilaku frontend yang menjadi acuan |
| --- | --- |
| Data Siswa | Admin mengedit nama, L/P, keterangan, tempat lahir, tanggal lahir, dan nama orang tua. Wali mengedit tempat lahir, tanggal lahir, dan nama orang tua pada rombel sendiri. Kunci Leger mengunci identitas utama, sementara biodata tetap dapat diperbarui. Kedua peran memakai data biodata yang sama di browser. Raport mencari nama orang tua berdasarkan rombel dan NIS siswa. |
| Template dan impor biodata | Admin mengunduh template berisi NIS, Rombel, Nama Siswa, Tempat Lahir, Tanggal Lahir, dan Nama Orang Tua. NIS, rombel, dan nama diisi dari hasil filter, termasuk halaman tabel lainnya. Nama menjadi referensi, sedangkan NIS dan rombel menjadi pasangan pencocokan. Impor memperbarui kolom biodata yang terisi untuk siswa terdaftar. Tanggal teks menerima DD/MM/YYYY atau YYYY-MM-DD, serta tanggal asli Excel. Duplikat, tanggal tidak valid, atau siswa tidak ditemukan membatalkan seluruh impor dengan pesan nomor baris. |
| Wali Kelas | Edit mencakup nama, nomor telepon, dan rombel tujuan (Kelas dan Bagian). Memindahkan wali ke rombel yang sudah terisi menukar penugasan. Impor membaca kelas, nama wali, dan telepon lalu menerapkan baris yang cocok dengan rombel yang ada. Pilih semua pada tabel berlaku untuk halaman aktif. |
| Guru Mapel | Guru yang sama bisa memiliki beberapa penugasan. Edit satu penugasan mapel dapat memperbarui daftar rombel yang dicentang. Mapel nonaktif tetap terlihat pada daftar penugasan admin dan dapat diganti dengan mapel aktif. Filter **Semua Mapel** mengikuti katalog dan mencantumkan mapel nonaktif. |
| Template penugasan guru | Lembar **Penugasan** berisi Kode Guru, Nama Guru, Kelas, Bagian, Kode Mapel. Dropdown Bagian mengikuti Kelas. Dropdown mapel mengikuti kode yang aktif saat file diunduh. Impor mengecek ulang kode aktif dan rombel saat file diterapkan. Format lama dengan satu kolom Rombel atau Kelas gabungan masih dibaca. Baris kosong dilewati dan validasi dapat menampilkan nomor baris. |
| Mata Pelajaran | Kode, nama, induk, urutan, dan status diatur dalam katalog. Mapel yang aktif muncul di Leger sesuai urutan katalog. Mengaktifkan induk menonaktifkan anaknya. Mengaktifkan satu submapel menonaktifkan induknya, sementara submapel lain tetap bisa aktif. Aturan berlaku untuk relasi induk di katalog, termasuk PAI dan MULOK. |

Pertahankan nilai ketika mapel dinonaktifkan. Karena katalog juga menentukan komponen statistik, Go perlu menyimpan pilihan mapel per periode sebagaimana dirancang dalam Master Plan. Nama dan kode tampil sebagai label, sedangkan relasi pada backend memakai ID yang stabil.

Sumber kode tersedia di [Data Siswa](../frontend/src/app/data-siswa/page.jsx), [template biodata](../frontend/src/lib/studentBiodataWorkbook.js), [Wali Kelas](../frontend/src/app/wali-kelas/page.jsx), [Guru Mapel](../frontend/src/app/guru-mapel/page.jsx), [template penugasan](../frontend/src/lib/teacherAssignmentWorkbook.js), dan [katalog mapel](../frontend/src/lib/subjectCatalog.js).

## 3. Aturan draft, setoran, dan nilai

### Setor Nilai

- Target adalah rombel dan mapel yang dipilih dari penugasan guru. Wali penerima ditentukan oleh rombel. Form tidak meminta guru memilih nama penerima.
- UH 1–5 bersifat opsional. STS wajib terisi untuk menghitung rata-rata dan untuk setiap siswa saat mengirim. Angka nol adalah nilai yang terisi. Sel kosong tidak ikut menjadi pembagi DKN. Rentang nilai valid adalah 0–100.
- Nilai akhir DKN adalah pembulatan rata-rata dari STS dan UH yang terisi. Contoh STS `80`, UH 1 `70`, UH 3 `85`, dan UH lainnya kosong menghasilkan `round((80 + 70 + 85) / 3) = 78`. Dengan STS `0` dan semua UH kosong, hasilnya `0`.
- Impor DKN ke Setor Nilai memasukkan skor dan komponen yang tersedia ke draft. Template aplikasi mengenali kolom STS dan UH 1–5. File lama dengan satu nilai akhir yang dikenali bisa dipakai sebagai isian STS saat komponen UH tidak tersedia. Pencocokan pada halaman Setor Nilai memakai NIS siswa di rombel yang dipilih. Metadata mapel pada file lama yang dikenali masih terbatas pada aturan parser saat ini.
- **Simpan Draft Nilai** menyimpan isian. **Kirim Nilai ke Wali Kelas** memperbarui Leger jika kelas terbuka dan skor semua siswa valid. Kelengkapan dicek untuk seluruh rombel, termasuk siswa di halaman tabel lain.
- Guru melihat **Belum dikirim**, **Sudah dikirim**, atau **Perubahan belum dikirim** berdasarkan catatan versi terakhir. Edit setelah kirim mengubah status, sementara Leger masih memuat setoran terakhir sampai kirim ulang. Tabel pemantauan Admin saat ini menampilkan dua status, sudah atau belum mengirim.

| Peristiwa | Status guru | Nilai di Leger |
| --- | --- | --- |
| Isi atau simpan draft pertama | Belum dikirim | Berdasarkan data sebelumnya |
| Kirim berhasil | Sudah dikirim | Menggunakan nilai kiriman |
| Koreksi draft setelah kirim | Perubahan belum dikirim | Menggunakan nilai kiriman terakhir |
| Kirim ulang berhasil | Sudah dikirim | Menggunakan kiriman terbaru |

Sumber kode tersedia di [Setor Nilai](../frontend/src/app/setor-nilai/page.jsx), [impor DKN](../frontend/src/components/import/ImportDknModal.jsx), [perhitungan DKN](../frontend/src/lib/dknScores.js), dan [pemantauan Admin](../frontend/src/components/grades/SubmissionTable.jsx).

### Leger dan peringkat

- Nilai desimal pada Leger dibulatkan ke bilangan bulat terdekat. Nilai `78,49` menjadi `78` dan `78,5` menjadi `79`. Nilai kosong tetap kosong dan ditandai berbeda dari nilai di bawah KKM.
- **Jumlah** adalah penjumlahan nilai mapel aktif. **Rata-rata Leger** adalah jumlah dibagi banyaknya mapel aktif, lalu dibulatkan. Untuk dua mapel aktif dengan nilai `80` dan kosong, jumlah `80`, rata-rata `40`, dan status belum lengkap. Ini berbeda dari rata-rata DKN yang hanya membagi dengan komponen terisi.
- Leger lengkap jika semua mapel aktif memiliki nilai dan ada setidaknya satu mapel aktif. Peringkat diurutkan dengan total menurun, lalu rata-rata menurun. Untuk nilai setara, implementasi saat ini mempertahankan urutan siswa semula saat memberi nomor peringkat berurutan.
- Admin dapat menggunakan impor DKN langsung dari Leger. Jalur ini berbeda dari impor ke draft Setor Nilai. Pencocokan jalur langsung memakai NIS jika tersedia, dengan pencocokan nama hasil normalisasi sebagai perilaku prototipe ketika NIS kosong.
- Tab **Ekskul, Akhlak & Absensi** memuat predikat pengembangan diri, akhlak, kehadiran, dan catatan wali. Untuk Nilai Terbaik per mapel, ambil maksimal tiga skor terisi dari kombinasi kelas dan mapel. Kartu pada Dashboard Guru Mapel berganti antarpenugasan secara otomatis ketika terdapat lebih dari satu penugasan.

Sumber kode tersedia di [Leger](../frontend/src/app/leger/page.jsx), [statistik nilai](../frontend/src/lib/masterData.js), [helper penugasan dan nilai terbaik](../frontend/src/lib/teaching.js), dan [kartu Nilai Terbaik](../frontend/src/components/grades/SubjectRankingCard.jsx).

## 4. Pengaturan dan keluaran raport

| Bagian | Perilaku frontend |
| --- | --- |
| Pengaturan Admin | Data yayasan dan madrasah, NSM, NPSN, alamat, logo, judul, tahun pelajaran, semester, tenggat, tempat dan tanggal raport, nama kepala, NIPY, dan gambar tanda tangan kepala dibaca oleh tampilan terkait. |
| Pengaturan Wali | NIPY dan tanda tangan disimpan untuk rombel asuh. Saat ini tanda tangan hanya tampil jika pemilik yang tersimpan cocok dengan nama wali rombel. Untuk Go, gunakan ID wali dan periode agar pergantian penugasan tidak membawa tanda tangan lama ke raport baru. |
| Gambar | Form menerima PNG, JPEG, atau WebP hingga 1 MB. Tanda tangan berupa gambar. Di raport, gambar diperbesar dan ruang kosong di tepinya dapat dipangkas saat ditampilkan. |
| Raport per siswa | Preview dan keluaran cetak memakai template yang sama. Ukuran A4 dan skala isi disesuaikan bila perlu agar blok tanda tangan ikut muat. Nama orang tua diambil dari Data Siswa atau diisi garis titik-titik jika datanya kosong. |
| Unduh dan cetak | Admin mengunduh PDF langsung untuk satu siswa atau semua hasil filter. Wali memakai dialog cetak. Keluaran massal membuat halaman per siswa. Admin juga dapat membuka preview. |
| Leger Excel | Ekspor memakai bentuk RDM, dengan nilai mapel per siswa dan rumus jumlah. Halaman Raport dapat mengekspor beberapa rombel sebagai lembar terpisah berdasarkan hasil filter. |

Sumber kode tersedia di [Pengaturan](../frontend/src/app/pengaturan/page.jsx), [unggahan gambar](../frontend/src/components/raport/RaportImageInput.jsx), [penyimpanan tanda tangan wali](../frontend/src/lib/waliReportSettings.js), [template raport](../frontend/src/components/raport/PrintableRaport.jsx), [unduhan PDF](../frontend/src/lib/downloadRaportPdf.js), dan [Leger Excel](../frontend/src/lib/legerExcel.js).

## 5. Batas prototipe dan keputusan sebelum implementasi Go

| Temuan pada frontend | Perlakuan saat membangun Go |
| --- | --- |
| Login demo memakai pencocokan nama atau nama pengguna. | Pakai akun dan penugasan resmi dengan pemeriksaan izin di server. |
| Pengaturan sekolah dan katalog, gambar tanda tangan, biodata tambahan, penugasan guru mapel, serta draft tersimpan di `localStorage`. Sesi demo memakai `sessionStorage`. | Pindahkan data operasional ke server. Buat daftar data nyata yang perlu dimigrasi dari browser atau Excel. |
| Daftar siswa dan nilai awal diisi dari data contoh. Edit nilai, perubahan rombel atau wali, status setoran dan kunci disimpan di memori frontend. | Hubungkan ke penyimpanan server dan uji dari sesi serta perangkat berbeda. Pisahkan data uji dari data sekolah. |
| Tombol **Simpan Leger** menampilkan pesan sukses. Aksi simulasi mengisi nilai kosong dengan angka acak. Notifikasi global memakai contoh setoran yang terpisah dari status setoran aktual di halaman Admin. | Hubungkan simpan dan notifikasi ke operasi server yang nyata. Gunakan fitur simulasi untuk pengujian dengan data uji. |
| Tombol **Tambah Siswa** masih berupa placeholder. Hapus penugasan wali saat ini mengeluarkan rombel dari daftar frontend. Hapus siswa di Raport menghilangkan baris dari Leger aktif. | Tambah siswa dari data induk. Definisikan tindakan hapus sebagai pembatalan penugasan atau penonaktifan keanggotaan yang menjaga riwayat nilai. |
| Tenggat sekarang ditampilkan sebagai pengingat. Tombol kunci dapat dipakai walaupun nilai belum lengkap. Preview dan cetak tersedia sebelum Leger dikunci. | Putuskan aturan tenggat, siapa yang boleh membuka kunci, syarat kelengkapan, serta perbedaan antara cetak sementara dan penerbitan resmi. |

Gunakan isi tabel ini untuk memisahkan pekerjaan migrasi dari keputusan produk. Rute, struktur database, dan urutan implementasi mengikuti Master Plan.

## 6. Skenario penerimaan untuk satu rombel

- [ ] Admin menyiapkan periode dan rombel uji, mengatur mapel aktif, lalu membuat penugasan wali dan guru. Cek bahwa daftar siswa dan penugasan bertahan setelah muat ulang.
- [ ] Admin mengedit biodata satu siswa dan mengimpor biodata siswa lain. Cek bahwa Wali Kelas dan preview raport membaca data terbaru. Uji NIS dengan nol di awal, sel kosong, tanggal tidak valid, dan baris duplikat. Pastikan wali hanya dapat mengedit manual pada rombelnya.
- [ ] Uji pindah wali ke rombel yang telah mempunyai wali. Periksa hasil pertukaran dan cakupan akses kedua akun.
- [ ] Impor dua penugasan dari template, lalu coba rombel yang tidak ada atau kode mapel nonaktif. Cek bahwa kesalahan mengacu pada baris yang tepat.
- [ ] Guru mengisi STS, UH opsional, nilai nol, dan satu nilai kosong. Simpan draft. Cek status dan pastikan Leger masih memuat nilai sebelumnya.
- [ ] Lengkapi semua siswa, kirim dua kali untuk menguji pengiriman ulang karena retry, lalu buka Leger dari sesi wali. Cek nilai, status Admin, dan satu setoran yang sah.
- [ ] Edit draft setelah kirim. Cek bahwa status berubah menjadi **Perubahan belum dikirim** dan bahwa angka di Leger baru berubah setelah kirim ulang.
- [ ] Aktifkan PAI lalu beralih ke submapel, dan ubah urutan mapel. Cek kolom, jumlah, peringkat, dan nilai yang kembali tersedia setelah mapel diaktifkan lagi.
- [ ] Uji kirim dan koreksi atas kelas terkunci, termasuk lewat permintaan API. Uji juga akses guru atau wali ke rombel di luar penugasannya.
- [ ] Wali mengisi nama orang tua dan mengunggah tanda tangan. Admin dari sesi lain melihat hasilnya di preview, lalu mengunduh satu siswa dan semua hasil filter sebagai PDF A4.
- [ ] Pindahkan siswa ke rombel atau periode berikutnya. Cek bahwa arsip raport lama masih menunjuk pada data periode dan rombel lama.
