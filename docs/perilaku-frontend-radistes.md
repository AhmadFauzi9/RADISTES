# Cara Kerja Frontend RADISTES dan Panduan Uji

Gunakan dokumen ini saat membuat dan menguji backend Go. Ikuti langkah di setiap bagian untuk melihat tindakan pengguna dan hasil yang diharapkan. Untuk panduan penggunaan sehari-hari atau rancangan database, buka dokumen terkait. [Alur Penggunaan RADISTES](workflow-radistes.md) · [Master Plan RADISTES](../master%20plan.md)

## 1. Masuk dan periksa akses akun

1. Masuk sebagai **Admin**. Buka **Data Siswa**, **Data Master**, **Setor Nilai**, **Leger**, dan **Raport**. Admin mengelola data lintas rombel. Pilihan rombel di Leger berlaku di halaman itu. Data Siswa dan Raport memiliki filter sendiri.
2. Masuk sebagai **Wali Kelas**. Pada **Data Siswa**, **Leger**, dan **Raport**, periksa bahwa yang tampil adalah rombel asuhnya. Pada **Setor Nilai** dan **Nilai Terbaik**, pilihan mengikuti penugasan mengajarnya.
3. Masuk sebagai **Guru Mapel**. Periksa bahwa pilihan rombel dan mata pelajaran sesuai penugasannya.
4. Saat membuat backend Go, ambil peran dan izin dari ID akun, ID guru, penugasan, serta periode. Cek izin setiap kali pengguna membaca, mengubah, mengimpor, mengunci, atau mengunduh data. Login demo saat ini memakai nama pengguna dan mencocokkan nama guru dengan penugasan wali. Kolom sandi sudah tampil, tetapi sandi belum diperiksa.

Rujukan kode. [Login](../frontend/src/components/auth/LoginScreen.jsx) · [Peran dan data aplikasi](../frontend/src/context/AppContext.jsx) · [Menu per peran](../frontend/src/components/layout/Sidebar.jsx)

## 2. Periksa data siswa dan penugasan

### A. Edit dan impor biodata

1. Masuk sebagai Admin dan buka **Data Siswa**. Edit informasi siswa dan simpan. Coba juga saat Leger terkunci. Nama, jenis kelamin, dan keterangan terkunci bersama Leger, sedangkan tempat lahir, tanggal lahir, dan nama orang tua masih dapat diubah.
2. Klik **Impor Biodata Excel**, lalu unduh template. Pastikan kolom **NIS**, **Rombel**, dan **Nama Siswa** berisi daftar siswa dari seluruh hasil filter. Nama dipakai sebagai referensi. Aplikasi mencari siswa terdaftar dari pasangan NIS dan rombel. Simpan NIS sebagai teks agar nol di awal tetap ada.
3. Isi **Tempat Lahir**, **Tanggal Lahir**, atau **Nama Orang Tua**. Gunakan tanggal `DD/MM/YYYY`, `YYYY-MM-DD`, atau sel tanggal Excel. Sisakan salah satu kolom kosong dan pastikan isian lama pada kolom itu tetap ada setelah impor.
4. Coba impor file dengan baris duplikat, tanggal tidak valid, atau siswa yang tidak ditemukan. Aplikasi harus menampilkan nomor baris dan membatalkan seluruh impor.
5. Masuk sebagai Wali Kelas dan buka **Data Siswa**. Pastikan biodata yang sama tampil untuk rombelnya dan dapat diedit satu per satu. Periksa nama orang tua di **Pratinjau Raport**. Pada versi sekarang, kedua peran membaca data yang sama dari penyimpanan browser.

### B. Atur Wali Kelas

1. Buka **Data Master → Wali Kelas**. Edit nama, nomor telepon, atau rombel tujuan melalui pilihan **Kelas** dan **Bagian**.
2. Pindahkan wali ke rombel yang sudah memiliki wali. Periksa bahwa penugasan keduanya ditukar.
3. Jika memakai impor Excel, isi kelas, nama wali, dan nomor telepon. File diterapkan pada baris yang cocok dengan rombel terdaftar. Jika memakai **Pilih Semua** pada tabel, periksa bahwa pilihan berlaku pada halaman yang sedang terbuka.

### C. Atur penugasan Guru Mapel

1. Buka **Data Master → Guru Mapel** dan beri satu guru lebih dari satu penugasan. Edit satu penugasan mapel, lalu ubah rombel yang dicentang.
2. Buka filter **Semua Mapel**. Pastikan daftar mengikuti katalog, termasuk mapel nonaktif. Penugasan lama dengan mapel nonaktif masih tampil dan bisa diganti dengan mapel aktif.
3. Unduh template dan buka lembar **Penugasan**. Isi **Kode Guru**, **Nama Guru**, **Kelas**, **Bagian**, dan **Kode Mapel**. Pilihan bagian mengikuti kelas. Pilihan kode mapel berisi mapel yang aktif ketika file diunduh.
4. Impor file. Aplikasi memeriksa lagi apakah rombel tersedia dan kode mapel masih aktif. Baris kosong dilewati. Format lama dengan kolom **Rombel** atau **Kelas** gabungan seperti `8A` masih dibaca. Kesalahan validasi dapat menampilkan nomor baris.

### D. Atur mata pelajaran

1. Buka **Data Master → Mata Pelajaran**. Atur kode, nama, mapel induk, urutan, dan status. Buka Leger untuk memastikan kolomnya mengikuti mapel aktif dan urutan katalog.
2. Aktifkan PAI, lalu periksa bahwa submapelnya menjadi nonaktif. Aktifkan salah satu submapel dan periksa bahwa PAI menjadi nonaktif. Submapel lain dapat tetap aktif. Ulangi untuk MULOK.
3. Saat membuat backend, simpan pilihan mapel per periode dan pertahankan nilai mapel yang dinonaktifkan. Hubungkan data dengan ID yang tetap agar perubahan nama atau kode tidak memutus hubungan dengan nilai lama.

Rujukan kode. [Data Siswa](../frontend/src/app/data-siswa/page.jsx) · [Template biodata](../frontend/src/lib/studentBiodataWorkbook.js) · [Wali Kelas](../frontend/src/app/wali-kelas/page.jsx) · [Guru Mapel](../frontend/src/app/guru-mapel/page.jsx) · [Template penugasan](../frontend/src/lib/teacherAssignmentWorkbook.js) · [Katalog mapel](../frontend/src/lib/subjectCatalog.js)

## 3. Isi draft, kirim nilai, dan periksa Leger

### A. Setor Nilai

1. Pilih rombel dan mapel dari penugasan guru. Aplikasi menentukan wali penerima dari rombel yang dipilih.
2. Isi **STS** untuk setiap siswa. **UH 1–5** boleh kosong. Nilai yang diterima adalah 0 sampai 100. Angka `0` dihitung sebagai nilai terisi.
3. Hitung rata-rata dari STS dan UH yang terisi, lalu bulatkan. Jika STS `80`, UH 1 `70`, dan UH 3 `85`, hasilnya `(80 + 70 + 85) ÷ 3`, dibulatkan menjadi `78`. Jika STS `0` dan semua UH kosong, hasilnya `0`.
4. Jika memakai Excel, impor DKN ke rombel dan mapel yang sudah dipilih. Aplikasi mencari siswa berdasarkan NIS di rombel itu dan memasukkan kolom STS serta UH yang dikenali ke draft. File lama dengan satu nilai akhir yang dikenali dapat mengisi STS jika rincian UH tidak tersedia. Pengenalan informasi mapel pada file lama masih terbatas.
5. Klik **Simpan Draft Nilai**. Untuk pengisian pertama, status tetap **Belum dikirim** dan Leger masih memakai nilai sebelumnya.
6. Klik **Kirim Nilai ke Wali Kelas**. Aplikasi memeriksa bahwa Leger masih terbuka dan semua siswa punya STS serta rata-rata yang valid, termasuk siswa di halaman tabel lain. Jika berhasil, Leger memakai nilai kiriman dan status menjadi **Sudah dikirim**.
7. Ubah satu nilai setelah mengirim. Status di portal guru menjadi **Perubahan belum dikirim**. Setelah dikirim ulang, Leger memakai nilai baru dan status kembali menjadi **Sudah dikirim**. Admin saat ini melihat dua status di tabel pemantauan, yaitu sudah atau belum mengirim.

### B. Leger dan peringkat

1. Ubah satu nilai desimal. Saat disimpan, `78,49` menjadi `78` dan `78,5` menjadi `79`. Nilai kosong tetap kosong dan ditandai berbeda dari nilai di bawah KKM.
2. Periksa **Jumlah** dan **Rata-rata**. Jumlah adalah penjumlahan nilai mapel aktif. Rata-rata dihitung dari jumlah dibagi banyaknya mapel aktif, lalu dibulatkan. Jika dua mapel aktif berisi `80` dan kosong, jumlahnya `80`, rata-ratanya `40`, dan Leger belum lengkap.
3. Periksa status lengkap dan urutan peringkat. Leger lengkap jika ada minimal satu mapel aktif dan semuanya terisi. Peringkat mengurutkan jumlah tertinggi, lalu rata-rata tertinggi. Jika keduanya sama, baris mempertahankan urutan siswa semula dan tetap mendapat nomor peringkat berurutan.
4. Sebagai Admin, coba impor DKN langsung di **Leger**. Jalur ini mengubah Leger secara langsung. Aplikasi mencari siswa berdasarkan NIS jika tersedia. Jika NIS kosong, versi sekarang mencoba mencocokkan nama setelah merapikan formatnya.
5. Buka **Ekskul, Akhlak & Absensi**. Periksa kolom predikat kegiatan, akhlak, kehadiran, dan catatan wali.
6. Buka **Nilai Terbaik** pada portal guru. Pastikan setiap penugasan menampilkan maksimal tiga nilai terisi. Jika ada lebih dari satu penugasan, kartu di Dashboard Guru Mapel berpindah otomatis.

Rujukan kode. [Setor Nilai](../frontend/src/app/setor-nilai/page.jsx) · [Impor DKN](../frontend/src/components/import/ImportDknModal.jsx) · [Perhitungan DKN](../frontend/src/lib/dknScores.js) · [Pemantauan Admin](../frontend/src/components/grades/SubmissionTable.jsx) · [Leger](../frontend/src/app/leger/page.jsx) · [Statistik nilai](../frontend/src/lib/masterData.js) · [Penugasan dan nilai terbaik](../frontend/src/lib/teaching.js) · [Kartu Nilai Terbaik](../frontend/src/components/grades/SubjectRankingCard.jsx)

## 4. Simpan pengaturan dan periksa hasil raport

1. Sebagai Admin, isi data yayasan, madrasah, NSM, NPSN, alamat, logo, judul, tahun pelajaran, semester, tenggat, tempat dan tanggal raport, nama kepala madrasah, NIPY, serta tanda tangan. Simpan dan periksa hasilnya pada halaman terkait.
2. Sebagai Wali Kelas, isi NIPY dan unggah gambar tanda tangan. Form menerima PNG, JPEG, atau WebP hingga 1 MB dan menyimpan gambar pada resolusi aslinya. Ruang kosong di tepi gambar dapat dipangkas saat ditampilkan di raport. Unggah ulang file asli jika gambar lama sudah mengecil akibat pemrosesan versi sebelumnya.
3. Buka pratinjau sebagai Admin. Tanda tangan wali tampil jika nama pemilik yang tersimpan cocok dengan nama wali rombel. Pada backend, gunakan ID wali dan periode agar tanda tangan tepat saat wali berganti.
4. Periksa tanda tangan serta nama orang tua di raport. Jika nama orang tua kosong, area tanda tangan menampilkan garis titik-titik. Pratinjau dan cetak memakai template yang sama. Isi disesuaikan agar tanda tangan ikut muat pada kertas A4.
5. Unduh PDF sebagai Admin dan cetak melalui dialog sebagai Wali Kelas. PDF yang diunduh memakai gambar PNG beresolusi tinggi untuk tiap halaman agar garis tanda tangan tidak mendapat kompresi JPEG tambahan. Coba untuk satu siswa dan semua siswa hasil filter. Hasil massal membuat satu halaman per siswa.
6. Unduh **Leger Excel**. Periksa bentuk rekap RDM, nilai mapel, dan rumus jumlah. Jika halaman **Raport** memuat beberapa rombel, ekspor dapat membuat lembar terpisah sesuai hasil filter.

Rujukan kode. [Pengaturan](../frontend/src/app/pengaturan/page.jsx) · [Unggah gambar](../frontend/src/components/raport/RaportImageInput.jsx) · [Tanda tangan wali](../frontend/src/lib/waliReportSettings.js) · [Template raport](../frontend/src/components/raport/PrintableRaport.jsx) · [Unduh PDF](../frontend/src/lib/downloadRaportPdf.js) · [Leger Excel](../frontend/src/lib/legerExcel.js)

## 5. Siapkan perubahan saat pindah ke backend Go

1. **Hubungkan akun dan penugasan resmi.** Ganti login demo dengan verifikasi akun di server. Sebagian data, seperti pengaturan, katalog, tanda tangan, biodata, penugasan Guru Mapel, dan draft, saat ini tersimpan di browser.
2. **Simpan data operasional di server.** Daftar siswa dan nilai awal berasal dari data contoh. Koreksi nilai, perubahan rombel atau wali, status setoran, serta kunci Leger saat ini ada di memori frontend dan dapat hilang setelah muat ulang. Pisahkan data sekolah dari data uji dan tentukan data browser atau Excel yang perlu dipindahkan.
3. **Hubungkan tombol dengan hasil yang nyata.** Tombol **Simpan Leger** saat ini menampilkan pesan sukses. Hubungkan ke penyimpanan server. Sinkronkan notifikasi dengan setoran aktual.
4. **Lengkapi tambah dan hapus.** Tombol **Tambah Siswa** masih berupa contoh. Saat ini menghapus penugasan wali juga mengeluarkan rombel dari daftar frontend, dan menghapus siswa di **Raport** menghilangkan baris dari Leger aktif. Di backend, tentukan cara membatalkan penugasan atau menonaktifkan keanggotaan sambil menjaga riwayat nilai.
5. **Putuskan aturan penguncian dan penerbitan.** Saat ini tenggat ditampilkan sebagai pengingat, Leger dapat dikunci sebelum nilainya lengkap, dan pengguna dapat membuka pratinjau atau mencetak sebelum Leger dikunci. Sebelum menerapkan aturan di Go, tentukan batas pengiriman, hak buka kunci, syarat nilai lengkap, dan kapan raport dianggap resmi terbit.

## 6. Urutan uji backend untuk satu rombel

1. **Siapkan rombel uji.** Sebagai Admin, isi periode, aktifkan mapel, dan buat penugasan wali serta guru. Muat ulang dan periksa bahwa data masih ada.
2. **Periksa biodata.** Edit satu siswa dan impor biodata siswa lain. Uji NIS dengan nol di awal, sel kosong, tanggal tidak valid, dan duplikat. Masuk sebagai wali dan periksa biodata serta pratinjau raport. Coba edit siswa di luar rombel dan pastikan akses ditolak.
3. **Periksa penugasan.** Pindahkan wali ke rombel yang sudah punya wali, lalu periksa akses kedua akun. Impor dua penugasan Guru Mapel. Coba rombel atau kode mapel yang tidak berlaku, lalu periksa nomor baris pada pesan kesalahan.
4. **Simpan, kirim, lalu koreksi nilai.** Isi STS, UH, nilai nol, dan satu sel STS kosong. Simpan draft dan pastikan Leger masih memakai nilai lama. Lengkapi semua siswa, lalu kirim dua kali untuk mensimulasikan pengulangan permintaan. Periksa bahwa hanya ada satu setoran yang sah. Ubah draft dan cek bahwa Leger baru berubah setelah dikirim ulang.
5. **Uji urutan mapel dan penguncian.** Beralih dari PAI ke submapel, lalu ubah urutannya. Periksa kolom, jumlah, peringkat, dan nilai lama saat mapel diaktifkan kembali. Kunci rombel dan coba kirim atau koreksi nilai. Uji juga lewat API, termasuk dengan akun di luar penugasan.
6. **Uji cetak dari sesi lain.** Unggah tanda tangan sebagai wali. Sebagai Admin di sesi atau perangkat lain, buka pratinjau dan unduh satu raport serta semua hasil filter sebagai PDF A4.
7. **Uji riwayat.** Pindahkan siswa ke rombel atau periode berikutnya. Buka raport lama dan pastikan masih memakai data rombel serta periode asal.
