# Alur Penggunaan RADISTES

Ikuti alur ini dari persiapan data sampai cetak raport. **Rombel** adalah kelompok belajar seperti **8A**. Pilih **Kelas 8** dan **Bagian A** jika halamannya memakai dua pilihan.

1. **Admin** menyiapkan periode, mata pelajaran, dan penugasan.
2. **Guru Mapel** mengisi lalu mengirim nilai ke wali kelas.
3. **Wali Kelas** memeriksa Leger dan melengkapi data raport.
4. **Admin atau Wali Kelas** membuka pratinjau, lalu mengunduh atau mencetak raport.

## 1. Admin menyiapkan periode dan data

### Isi pengaturan raport

1. Buka **Pengaturan**.
2. Isi tahun pelajaran, semester, batas akhir pengiriman nilai, tempat, dan tanggal pembagian raport.
3. Lengkapi kop dan logo madrasah. Isi nama serta NIPY kepala madrasah, lalu unggah gambar tanda tangannya.
4. Klik **Simpan Pengaturan Raport**.

### Perbarui biodata siswa

1. Buka **Data Siswa**. Pilih kelas dan bagian atau cari nama atau NIS.
2. Untuk satu siswa, klik ikon **Edit Siswa** di barisnya. Isi tempat lahir, tanggal lahir, dan nama orang tua, lalu klik **Simpan**. Admin juga dapat mengubah nama, jenis kelamin, dan keterangan selama Leger kelas terbuka.
3. Untuk banyak siswa, klik **Impor Biodata Excel**, lalu **Unduh Template Biodata**. Template memuat semua siswa hasil filter, termasuk dari halaman tabel lain.
4. Buka file Excel. Isi kolom **Tempat Lahir**, **Tanggal Lahir**, atau **Nama Orang Tua**. Pakai tanggal seperti `30/12/2012` atau `2012-12-30`. Pertahankan NIS dan rombel agar aplikasi menemukan siswa yang tepat. Sel kosong mempertahankan isian lama.
5. Unggah file yang sudah diisi. Periksa jumlah baris yang siap diimpor, lalu klik **Impor Biodata**. Jika muncul pesan nomor baris, perbaiki baris tersebut di Excel dan unggah lagi.

### Atur mata pelajaran dan penugasan

1. Buka **Data Master → Mata Pelajaran**. Centang mapel yang dipakai dan atur urutannya dengan tombol naik dan turun. Leger akan memakai mapel aktif sesuai urutan ini.
2. Pilih antara PAI gabungan dan submapelnya. Lakukan hal yang sama untuk MULOK. Saat induk diaktifkan, submapelnya menjadi nonaktif. Saat submapel diaktifkan, induknya menjadi nonaktif.
3. Buka **Data Master → Wali Kelas**. Edit wali, lalu pilih **Kelas** dan **Bagian** tujuan. Jika rombel tujuan sudah memiliki wali, periksa pasangan penugasan yang akan ditukar sebelum menyimpan. Gunakan template Excel jika perlu mengisi penugasan banyak rombel.
4. Buka **Data Master → Guru Mapel**. Pilih guru dan mapelnya, lalu tentukan rombel yang diajar. Satu guru dapat memiliki beberapa penugasan. Jika memakai template Excel, isi satu baris untuk setiap kombinasi guru, rombel, dan mapel.

## 2. Guru mengisi dan mengirim nilai

Guru Mapel dan Wali Kelas yang memiliki penugasan mengajar menggunakan langkah yang sama.

1. Buka **Setor Nilai**.
2. Pilih **Kelas → Bagian → Mata Pelajaran** dari penugasan Anda.
3. Isi **STS** untuk setiap siswa. Isi **UH 1–5** jika tersedia. Anda dapat mengetik nilai, menggunakan **Isi Nilai Cepat** untuk kolom yang dipilih, atau mengimpor file **DKN** (Daftar Kumpulan Nilai) melalui tombol impor.
4. Klik **Simpan Draft Nilai** jika ingin melanjutkan nanti. Draft tersimpan di browser dan Leger masih memakai nilai sebelumnya.
5. Periksa semua siswa, termasuk halaman tabel lain. Klik **Kirim Nilai ke Wali Kelas**. RADISTES memeriksa kelengkapan nilai dan memastikan Leger kelas masih terbuka. Setelah berhasil, status menjadi **Sudah dikirim**.
6. Jika mengoreksi draft setelah mengirim, lihat status **Perubahan belum dikirim**. Klik tombol kirim lagi agar nilai terbaru muncul di Leger.
7. Admin dapat membuka **Setor Nilai** untuk memeriksa atau mengekspor status pengiriman berdasarkan guru, rombel, dan mapel.

## 3. Wali Kelas memeriksa nilai dan melengkapi raport

1. Buka **Leger**. Wali Kelas langsung bekerja pada rombelnya. Jika masuk sebagai Admin, pilih rombel dari filter.
2. Periksa nilai setiap mapel, jumlah, rata-rata, dan peringkat. Jika mengoreksi nilai desimal, tekan **Enter** atau pindah ke sel lain agar nilai dibulatkan. Admin juga dapat mengimpor DKN langsung di Leger.
3. Buka tab **Ekskul, Akhlak & Absensi**. Isi predikat kegiatan, akhlak, kehadiran, dan catatan untuk orang tua.
4. Buka **Data Siswa**. Klik **Edit Biodata** untuk melengkapi tempat lahir, tanggal lahir, dan nama orang tua. Nama orang tua akan muncul di bagian tanda tangan **Orang Tua / Wali**.
5. Buka **Pengaturan**. Isi NIPY, unggah gambar tanda tangan wali kelas, lalu klik **Simpan Pengaturan Wali Kelas**.
6. Setelah semua data diperiksa, Wali Kelas atau Admin dapat mengunci Leger. Selama terkunci, pengisian nilai dan data pendukung serta pengiriman nilai ke kelas itu akan diblokir. Buka kunci jika perlu melakukan koreksi.

## 4. Admin atau Wali Kelas mencetak raport

1. Buka **Raport**. Admin dapat menyaring rombel atau mencari siswa. Wali Kelas langsung melihat siswa di rombelnya.
2. Klik ikon mata **Pratinjau Raport** di baris siswa. Gunakan panah untuk berpindah ke siswa sebelumnya atau berikutnya.
3. Periksa kop, tanggal, nilai, kehadiran, dan catatan. Pastikan tanda tangan tersusun dari **Kepala Madrasah**, **Wali Kelas**, lalu **Orang Tua / Wali**.
4. Admin dapat memilih **Unduh Raport PDF**. Wali Kelas menggunakan dialog cetak dan dapat memilih printer atau **Save as PDF**. Raport memakai kertas **A4** dengan satu halaman per siswa.
5. Untuk semua siswa dalam hasil filter, gunakan tombol unduh atau cetak semua di toolbar. Aksi ini mencakup siswa di halaman tabel lain.
6. Untuk rekap nilai model RDM, pilih **Unduh Leger Excel**. Halaman **Raport** juga memiliki tombol cetak Leger.

## Informasi di Dashboard dan menu Nilai Terbaik

- **Admin** melihat ringkasan siswa, rombel, tahun pelajaran, dan guru yang sudah menyelesaikan semua penugasan aktif.
- **Wali Kelas** melihat ringkasan rombel dan tiga peringkat terbaik kelas. Rincian mapel yang diajar tampil jika ada penugasan mengajar.
- **Guru Mapel** melihat batas akhir pengiriman, ringkasan penugasan, dan tiga nilai terbaik pada setiap rombel dan mapel. Kartu nilai terbaik berganti otomatis jika ada lebih dari satu penugasan. Guru Mapel dan Wali Kelas yang mengajar juga dapat membuka menu **Nilai Terbaik**.

**Catatan versi saat ini.** Biodata dan draft disimpan di browser, sedangkan nilai Leger dan status pengiriman disimpan sementara selama aplikasi berjalan. Alur lintas akun dan perangkat akan memakai penyimpanan server pada backend Go. [Cara Kerja Frontend dan Panduan Uji](perilaku-frontend-radistes.md) · [Master Plan RADISTES](../master%20plan.md)
