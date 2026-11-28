# Alur Penggunaan RADISTES

Ikuti panduan ini dari persiapan satu rombel sampai cetak raport STS. **Rombel** adalah kelompok belajar seperti **8A**. Jika pilihan dipisah, gunakan **Kelas 8** dan **Bagian A**.

| Urutan | Penanggung jawab | Hasil yang diperiksa sebelum lanjut |
| --- | --- | --- |
| 1 | Admin | Periode, rombel, mapel, dan penugasan sesuai. |
| 2 | Guru Mapel atau Wali Kelas yang mengajar | Setoran tiap rombel dan mapel berstatus **Sudah dikirim**. |
| 3 | Wali Kelas, dibantu Admin bila diperlukan | Nilai Leger dan data pendukung sudah diperiksa. |
| 4 | Admin atau Wali Kelas | Pratinjau sesuai dan raport A4 siap dicetak atau diunduh. |

Panduan ini mengikuti frontend pada commit `5ba399b`. Untuk rincian tiap tombol, gunakan [Cara Kerja Frontend dan Panduan Uji](perilaku-frontend-radistes.md). Untuk urutan pengembangan backend dan aturan persetujuan perubahan frontend, gunakan [Master Plan Backend Go](../master%20plan.md).

## 1. Admin menyiapkan periode dan data

### A. Isi pengaturan raport

1. Masuk sebagai **Admin**, lalu buka **Pengaturan**. Kartu **Tahun Aktif** di Dashboard juga membuka halaman ini.
2. Pada kartu **Kop Surat Resmi Lembaga**, isi identitas madrasah dan pilih file logo.
3. Pada kartu **Pengaturan Periode & Tanda Tangan**, isi tahun pelajaran, semester, batas akhir pengiriman nilai, tanggal pembagian raport, dan tempat. Isi nama serta NIPY kepala madrasah, lalu pilih gambar tanda tangan.
4. Klik **Simpan Pengaturan Raport**. Periksa tahun pelajaran, semester, dan tanggal pada halaman terkait. Periksa kop dan tanda tangan dari pratinjau raport pada tahap 4.

[Kontrol Pengaturan](perilaku-frontend-radistes.md#pengaturan)

### B. Perbarui biodata siswa

1. Buka **Data Siswa**. Pilih **Kelas** dan **Bagian**, atau ketik nama atau NIS pada **Cari siswa**. Jika daftar panjang, ubah view dari 10 baris atau gunakan panah halaman.
2. Untuk satu siswa, klik **Edit Siswa**. Isi tempat lahir, tanggal lahir, dan nama orang tua, lalu klik **Simpan**. Admin juga dapat mengubah nama, jenis kelamin, dan keterangan saat Leger kelas terbuka.
3. Untuk banyak siswa, klik **Impor Biodata Excel → Unduh Template Biodata**. Template mengambil semua siswa hasil filter, termasuk halaman lain.
4. Isi **Tempat Lahir**, **Tanggal Lahir**, atau **Nama Orang Tua** di Excel. Pakai tanggal seperti `30/12/2012` atau `2012-12-30`. Pertahankan NIS dan rombel agar siswa cocok. Sel biodata kosong mempertahankan isian lama.
5. Unggah file, periksa jumlah baris, lalu klik **Impor Biodata**. Jika muncul pesan nomor baris, perbaiki file dan unggah lagi. Cek kolom **TTL** dan **Nama Orang Tua** pada tabel.

[Kontrol Data Siswa dan impor biodata](perilaku-frontend-radistes.md#data-siswa)

### C. Atur mapel dan penugasan

1. Buka **Data Master → Mata Pelajaran**. Centang mapel yang dipakai. Untuk PAI dan MULOK, pilih induk jika ingin memakai satu kolom gabungan, atau aktifkan submapel yang dibutuhkan jika kolomnya terpisah. Gunakan panah naik dan turun untuk mengatur urutan Leger.
2. Buka **Data Master → Wali Kelas**. Cari rombel, klik **Ubah Penugasan Guru**, pilih **Kelas** dan **Bagian** tujuan, isi nama dan nomor telepon, lalu simpan. Jika tujuan sudah memiliki wali, periksa informasi pertukaran sebelum menyimpan.
3. Untuk mengisi banyak penugasan wali, gunakan **Impor Excel Wali Kelas → Unduh Template 49 Kelas**. Isi file, unggah, dan periksa bahwa kolom rombel serta nama wali terbaca dengan benar sebelum menekan **Terapkan Penugasan Wali Kelas**. Tombol **Ekspor Excel** mengambil seluruh daftar rombel.
4. Buka **Data Master → Guru Mapel → Tambah Penugasan Guru**. Isi kode dan nama guru, pilih satu mapel aktif, centang rombel yang diajar, lalu klik **Simpan Penugasan**. Gunakan **Edit Penugasan** untuk memperbarui daftar rombel pada mapel tersebut.
5. Untuk mengisi banyak penugasan guru, buka **Impor Penugasan Excel → Unduh Template Excel**. Isi satu baris untuk setiap guru, rombel, dan mapel. Pilih kelas dan bagian pada kolom terpisah. Unggah, periksa jumlah baris, lalu klik **Impor Penugasan**.
6. Cari guru berdasarkan nama atau kode dan gunakan filter **Kelas**, **Bagian**, serta **Semua Mapel** untuk memeriksa hasil. Pastikan wali kelas dan guru yang mengajar memperoleh rombel yang benar sebelum pengisian nilai dimulai.

[Kontrol Mata Pelajaran](perilaku-frontend-radistes.md#data-master-mata-pelajaran) · [Kontrol Wali Kelas](perilaku-frontend-radistes.md#data-master-wali-kelas) · [Kontrol Guru Mapel](perilaku-frontend-radistes.md#data-master-guru-mapel)

## 2. Guru mengisi dan mengirim nilai

Guru Mapel dan Wali Kelas yang memiliki penugasan mengajar memakai langkah yang sama.

1. Buka **Setor Nilai**. Pilih **Kelas**, **Bagian**, lalu **Mata Pelajaran yang Diampu**. Jika tidak ada pilihan mengajar, minta Admin memeriksa penugasan.
2. Isi **Nilai STS** untuk setiap siswa dan **UH 1–5** jika tersedia. Untuk mengisi angka yang sama, pilih kolom tujuan, ketik angka 0–100 di **Isi Nilai Cepat**, lalu klik **Terapkan … ke Semua Siswa**. Aksi ini berlaku pada kolom pilihan di seluruh rombel.
3. Jika memakai Excel, klik **Unduh Template DKN** dari toolbar. Isi UH dan STS di file. Buka **Impor Nilai DKN**, pilih file, lalu klik **Masukkan ke Draf** setelah data terbaca. Cek nama siswa dan angka pada tabel.
4. Periksa **Rata-rata** dan **Ketercapaian** di semua halaman. Klik **Simpan Draft Nilai** jika pekerjaan akan dilanjutkan nanti. Draft tersimpan di browser dan nilai Leger masih mengikuti setoran sebelumnya.
5. Klik **Kirim Nilai ke Wali Kelas** saat STS dan perhitungan sudah valid untuk seluruh siswa. Pastikan status menjadi **Sudah dikirim**. Jika kelas terkunci, hubungi pihak yang mengelola Leger untuk membuka kunci sebelum koreksi dan pengiriman.
6. Jika guru mengubah draft setelah mengirim, status menjadi **Perubahan belum dikirim**. Klik kirim lagi setelah koreksi selesai agar Leger memakai nilai terbaru.

### Periksa setoran sebagai Admin

1. Buka **Setor Nilai** di portal Admin.
2. Gunakan **Kelas**, **Bagian**, atau **Cari setoran** untuk menemukan penugasan. Pilih status **Belum mengirim** untuk melihat penugasan yang masih perlu ditindaklanjuti.
3. Klik **Ekspor Excel** bila perlu menyimpan daftar pemantauan. Berkas mengikuti seluruh hasil pencarian dan filter, termasuk halaman lain.

[Kontrol Setor Nilai Guru](perilaku-frontend-radistes.md#setor-nilai-untuk-guru) · [Pemantauan Admin](perilaku-frontend-radistes.md#setor-nilai-untuk-admin) · [Modal Impor DKN](perilaku-frontend-radistes.md#modal-impor-dkn)

## 3. Wali Kelas memeriksa Leger dan melengkapi raport

1. Buka **Leger**. Wali Kelas langsung melihat rombel asuhnya. Admin menggunakan **Kelas** dan **Bagian** untuk memilih rombel.
2. Gunakan **Cari siswa** atau **Status Nilai** untuk menemukan siswa yang perlu diperiksa. Geser bilah atas atau bawah untuk melihat mapel, jumlah, rata-rata, dan peringkat. Jika perlu koreksi, ketik di sel lalu tekan **Enter** atau pindah fokus. Nilai desimal dibulatkan.
3. Jika Admin perlu mengimpor langsung ke Leger, gunakan **Impor DKN Excel**. Periksa kelas dan mapel tujuan, unggah file, lalu pilih **Terapkan ke Leger**. Untuk memperoleh rekap Excel rombel aktif, klik **Ekspor leger Excel**. Ekspor ini mengambil seluruh siswa di rombel tersebut.
4. Buka **Ekskul, Akhlak & Absensi**. Isi jenis kegiatan dan predikat, kelakuan, kerajinan, kerapian, hari sakit/izin/alpa, serta catatan untuk orang tua.
5. Buka **Data Siswa** dan klik **Edit Biodata** jika perlu memperbaiki tempat lahir, tanggal lahir, atau nama orang tua. Buka **Pengaturan**, isi NIPY, pilih gambar asli tanda tangan, lalu klik **Simpan Pengaturan Wali Kelas**.
6. Periksa kembali kelengkapan nilai dan data pendukung. Jika hasil sudah benar, pilih **Kunci leger**. Setelah kunci aktif, sel tidak dapat diedit dan setoran ke rombel itu ditolak. Pilih **Buka kunci leger** jika masih ada koreksi yang perlu dikerjakan.

[Kontrol Leger](perilaku-frontend-radistes.md#leger) · [Pengaturan Wali Kelas](perilaku-frontend-radistes.md#pengaturan)

## 4. Admin atau Wali Kelas mencetak raport

1. Buka **Raport**. Admin dapat menyaring dengan **Kelas** dan **Bagian**. Wali Kelas langsung melihat rombelnya. Ketik nama atau NIS jika ingin menemukan satu siswa.
2. Klik **Pratinjau Raport** di baris siswa. Periksa kop, tanggal, nilai, kegiatan, kehadiran, dan catatan. Tanda tangan berurutan dari **Kepala Madrasah**, **Wali Kelas**, sampai **Orang Tua / Wali**. Panah **Siswa Sebelumnya** dan **Siswa Berikutnya** mengikuti seluruh rombel, termasuk siswa di luar filter tabel.
3. Dari pratinjau, klik **Cetak Dokumen atau Simpan sebagai PDF** untuk membuka dialog printer. Tutup modal untuk kembali ke tabel.
4. Untuk satu raport dari tabel, Admin memilih **Unduh Raport PDF**. Wali memilih **Simpan PDF** dan memakai dialog printer atau **Save as PDF**.
5. Untuk banyak raport, atur filter terlebih dahulu, lalu pilih **Unduh Semua Raport PDF** sebagai Admin atau **Cetak Semua Raport (PDF)** sebagai Wali. Periksa bahwa hasil berisi satu halaman A4 per siswa dari seluruh hasil filter.
6. Untuk rekap model RDM, pilih **Unduh Leger Excel**. Untuk mencetak rekap, pilih **Cetak Leger (PDF)**. Kedua aksi di menu Raport mengikuti hasil filter.

[Kontrol Raport dan pratinjau](perilaku-frontend-radistes.md#raport-dan-pratinjau)

## Informasi di Dashboard dan menu Nilai Terbaik

- **Admin** melihat ringkasan siswa, rombel, tahun pelajaran, dan guru yang sudah menyelesaikan semua penugasan aktif.
- **Wali Kelas** melihat ringkasan rombel dan kartu **3 Peringkat Terbaik** di samping alur kerja. Kartu menyediakan **Lihat Leger** serta pratinjau raport peringkat pertama jika ada siswa.
- **Guru Mapel** melihat batas akhir pengiriman, ringkasan penugasan, dan tiga nilai terbaik per rombel dan mapel. Jika ada lebih dari satu penugasan, gunakan panah atau tombol jeda untuk mengatur pergantian kartu. **Lihat semua** membuka menu **Nilai Terbaik**, yang juga tersedia bagi Wali Kelas yang mengajar.

[Kontrol Dashboard dan Nilai Terbaik](perilaku-frontend-radistes.md#dashboard-dan-nilai-terbaik)

## Penyimpanan pada versi frontend saat ini

Biodata, pengaturan, tanda tangan, penugasan Guru Mapel, dan draft yang disimpan berada di browser. Leger dan status pengiriman berada di memori aplikasi dan dapat hilang setelah muat ulang. Penyimpanan server untuk alur lintas akun dan perangkat menjadi bagian pengembangan backend Go. [Batas penyimpanan prototipe dan rencana peralihan](perilaku-frontend-radistes.md#5-siapkan-perubahan-saat-pindah-ke-backend-go)
