# Cara Kerja Frontend RADISTES dan Panduan Uji

Gunakan dokumen ini saat membuat dan menguji backend Go. Acuan yang diperiksa adalah frontend pada commit `5ba399b`. Ikuti langkah di setiap bagian untuk melihat tindakan pengguna dan hasil yang diharapkan. Untuk panduan penggunaan sehari-hari atau rancangan database, buka dokumen terkait. [Alur Penggunaan RADISTES](workflow-radistes.md) · [Master Plan RADISTES](../master%20plan.md)

## Daftar Isi Kontrol Frontend

Pilih menu yang ingin diuji. Nama bercetak tebal adalah label tombol, kolom, atau petunjuk di layar. **View** berarti jumlah baris per halaman. **Urutan** mencakup tombol naik/turun dan urutan otomatis seperti peringkat.

- [Kontrol umum, login, dan navigasi](#kontrol-umum-login-dan-navigasi)
- [Dashboard dan Nilai Terbaik](#dashboard-dan-nilai-terbaik)
- [Data Siswa](#data-siswa)
- [Data Master Wali Kelas](#data-master-wali-kelas)
- [Data Master Guru Mapel](#data-master-guru-mapel)
- [Data Master Mata Pelajaran](#data-master-mata-pelajaran)
- [Setor Nilai untuk Guru](#setor-nilai-untuk-guru)
- [Setor Nilai untuk Admin](#setor-nilai-untuk-admin)
- [Leger](#leger)
- [Modal Impor DKN](#modal-impor-dkn)
- [Raport dan pratinjau](#raport-dan-pratinjau)
- [Pengaturan](#pengaturan)

## Kontrol umum, login, dan navigasi

| Kontrol | Langkah dan hasil |
| --- | --- |
| **Username**, **Password**, **Masuk ke Dashboard** | Isi username dan klik tombol atau tekan Enter. Username dipangkas spasinya, dan isian kosong tidak diproses. Kolom password menyembunyikan teks. Pada acuan demo, tombol hanya meneruskan username ke fungsi masuk. Peran mengikuti akun Admin atau kecocokan penugasan wali. Sesi memakai satu tab browser dan bertahan saat halaman dimuat ulang. Akses langsung ke `/login` mengarah ke Dashboard setelah masuk. |
| **RADISTES** dan menu samping | Klik logo untuk menuju Dashboard. Klik menu untuk membuka halamannya dan menandai menu tersebut sebagai aktif. Menu **Data Master** menampilkan tiga tautan Admin. Menu Leger dan Raport menampilkan kode rombel bagi Wali Kelas. Di layar sempit, menu dapat digulir mendatar. |
| **Informasi akun** dan **Logout** | Klik inisial dan username untuk membuka nama lengkap, peran serta tombol Logout. Klik lagi, klik di luar, atau tekan Escape untuk menutupnya. Escape mengembalikan fokus ke tombol. Logout juga tersedia di sidebar desktop dengan keterangan **Keluar dari Akun**. Keluar menghapus sesi dan perubahan draft yang belum disimpan, lalu kembali ke layar masuk. |
| Lonceng **Notifikasi Setoran Nilai Masuk** | Membuka daftar pemberitahuan berisi mapel, guru, waktu, rombel, dan jumlah siswa. **Buka Portal Setor Nilai** membuka Setor Nilai dan menutup daftar. Membuka menu akun menutup daftar notifikasi, dan sebaliknya. Angka di lonceng serta menu samping berasal dari daftar notifikasi demo, sedangkan tabel pemantauan Admin memakai status setoran aktual dalam aplikasi. |
| Tooltip melayang | Arahkan kursor atau fokuskan kontrol berlabel dengan keyboard. Setelah sekitar seperempat detik, keterangan muncul di dekat kontrol, dengan posisi yang menyesuaikan tepi layar. Geser kursor, pindahkan fokus, gulir, klik, atau tekan Escape untuk menyembunyikannya. |
| **Jumlah baris per halaman**, nomor halaman, **Halaman Sebelumnya**, **Halaman Berikutnya** | Pilih 10, 20, 50, atau 100 baris. Ukuran baru membuka halaman pertama. Nomor halaman dan panah mengganti halaman dengan filter yang sama. Panah dinonaktifkan di ujung daftar. Jika hasil menyusut, halaman yang ditampilkan dibatasi ke halaman terakhir yang masih tersedia. Pilihan ukuran pada toolbar dan footer memakai nilai yang sama. |
| Pengurutan tabel | Judul kolom di tabel acuan tidak memiliki tombol urut naik/turun. Urutan manual tersedia melalui panah pada Mata Pelajaran. Peringkat pada Leger, Dashboard, dan Nilai Terbaik dihitung otomatis. |

| Tabel | View awal | Letak pilihan ukuran |
| --- | ---: | --- |
| Data Siswa dan pemantauan Setor Nilai Admin | 10 | Toolbar dan footer. |
| Setor Nilai Guru, Wali Kelas, dan Guru Mapel | 10 | Footer. |
| Raport | 20 | Toolbar dan footer. |
| Mata Pelajaran, Leger, Peringkat 10 Besar, dan tabel tinjauan modal | — | Daftar memakai area gulir bila diperlukan. |

Rujukan kode. [Login](../frontend/src/components/auth/LoginScreen.jsx) · [Navbar](../frontend/src/components/layout/Header.jsx) · [Sidebar](../frontend/src/components/layout/Sidebar.jsx) · [Pagination](../frontend/src/components/common/ModulePagination.jsx) · [Tooltip](../frontend/src/components/common/FloatingTooltip.jsx)

## Dashboard dan Nilai Terbaik

1. Sebagai **Admin**, klik kartu **Setoran Nilai** untuk menuju pemantauan, atau **Tahun Aktif** untuk membuka Pengaturan. Kartu Total Siswa dan Total Rombel menampilkan ringkasan. Hitungan guru yang sudah setor didasarkan pada guru yang telah mengirim semua penugasan aktifnya.
2. Sebagai **Admin** atau **Wali Kelas**, klik **Cetak Raport PDF** pada judul Dashboard untuk membuka menu Raport. Sebagai **Guru Mapel**, tombol di posisi itu adalah **Setor & Import Nilai DKN** dan membuka Setor Nilai.
3. Pada alur kerja, **Coba Setor Nilai**, **Buka Halaman Leger**, dan **Lihat Template Cetak** menuju halaman masing-masing. Jika akun Guru Mapel mengikuti tautan ke Leger atau Raport, halaman menampilkan batas akses. Leger menyediakan tautan kembali ke Setor Nilai.
4. Pada Dashboard guru, kartu **Kelas yang Diampu** menampilkan persentase kelengkapan, rata-rata, dan rentang nilai dari Leger. **Siap dikirim** pada kartu menggambarkan kelengkapan nilai. Status pengiriman dibaca di menu Setor Nilai. Kartu batas akhir hanya menampilkan pengingat. Tanggal kosong ditampilkan sebagai **Belum ditetapkan**.
5. Pada Dashboard **Wali Kelas**, kartu **3 Peringkat Terbaik** berada di samping alur kerja. Klik **Lihat Leger** untuk membuka Leger atau **Pratinjau Raport Juara 1** untuk membuka raport siswa pertama jika ada.
6. Pada Dashboard **Guru Mapel**, kartu **3 Nilai Terbaik** memakai satu penugasan sekaligus. Jika ada beberapa penugasan, kartu berpindah setiap 6 detik. **Penugasan sebelumnya** dan **Penugasan berikutnya** berpindah secara manual dan berputar dari ujung ke awal. **Jeda pergantian otomatis** dan **Lanjutkan pergantian otomatis** mengubah putaran. Tombol navigasi hanya tampil jika penugasan lebih dari satu.
7. **Lihat semua** atau menu **Nilai Terbaik** menampilkan satu kartu per penugasan aktif, maksimal tiga siswa dengan nilai mapel tertinggi. Nilai nol ikut diperhitungkan. Kartu menampilkan keadaan kosong jika belum ada nilai atau penugasan. Halaman ini tidak menyediakan pencarian, filter, atau pagination.

Rujukan kode. [Dashboard](../frontend/src/app/page.jsx) · [Kartu Nilai Terbaik](../frontend/src/components/grades/SubjectRankingCard.jsx) · [Halaman Nilai Terbaik](../frontend/src/app/nilai-terbaik/page.jsx) · [Aturan penugasan dan urutan nilai](../frontend/src/lib/teaching.js)

## Data Siswa

| Kontrol | Langkah dan hasil |
| --- | --- |
| **Kelas**, **Bagian**, **Cari siswa** | Admin dapat memilih tingkat 7–9 dan bagian, misalnya A pada tingkat 8 untuk 8A. Mengganti tingkat mengosongkan bagian. Pilihan kosong berarti semua dalam cakupan. Wali hanya melihat rombel sendiri. Cari berdasarkan nama, NIS, rombel, keterangan, atau nama orang tua. Pencarian berjalan saat diketik, mengabaikan kapitalisasi, dan kembali ke halaman pertama. |
| **Tambah Siswa** | Hanya tampil untuk Admin. Saat ditekan, versi acuan memberi petunjuk sementara dan belum menyediakan formulir pendaftaran. |
| **Edit Siswa / Edit Biodata** | Admin membuka nama lengkap, jenis kelamin, keterangan, tempat lahir, tanggal lahir, dan nama orang tua. Wali membuka tiga kolom biodata terakhir. **Simpan** memperbarui tabel dan sumber nama orang tua di raport. **Batal** dan **Tutup Modal** membuang isian yang belum disimpan. Pada Leger terkunci, identitas utama Admin terkunci dan biodata tetap dapat diisi. |
| **Hapus Siswa**, **Konfirmasi Hapus**, **Batal** | Hanya Admin. Klik hapus untuk mengganti aksi baris dengan pilihan konfirmasi atau batal. Konfirmasi mengeluarkan baris siswa dari Leger aktif saat kelas terbuka. Pada kelas terkunci, fungsi data menolak perubahan, tetapi tabel saat ini masih dapat menampilkan pesan berhasil. |
| **Impor Biodata Excel** | Hanya Admin. Membuka modal untuk memperbarui biodata siswa terdaftar. Langkahnya ada di bawah. |
| **TTL** | Arahkan kursor ke judul kolom untuk melihat kepanjangannya. Isi baris menampilkan tempat dan tanggal lahir yang sudah disimpan. |

### Modal impor biodata

1. Klik **Unduh Template Biodata** untuk mengunduh `template-biodata-siswa.xlsx`. Template memuat identitas seluruh hasil filter, termasuk halaman lain. Tombol unduh nonaktif jika hasil filter kosong.
2. Pilih file `.xlsx` atau `.xls`. Modal menampilkan nama file, jumlah baris siap diproses, atau pesan kesalahan. Baris dengan tiga kolom biodata kosong dilewati.
3. Klik **Impor Biodata** untuk menerapkan semua baris yang valid secara bersamaan. Pasangan NIS dan rombel harus ditemukan. Data ganda, tanggal salah, atau siswa tidak ditemukan membatalkan impor. Sel kosong mempertahankan nilai lama. **Batal** menutup modal tanpa menerapkan file.

Rujukan kode. [Data Siswa](../frontend/src/app/data-siswa/page.jsx) · [Modal biodata](../frontend/src/components/import/ImportStudentBiodataModal.jsx) · [Format Excel biodata](../frontend/src/lib/studentBiodataWorkbook.js)

## Data Master Wali Kelas

| Kontrol | Langkah dan hasil |
| --- | --- |
| **Kelas**, **Bagian**, **Cari wali kelas** | Filter berdasarkan tingkat dan bagian, lalu ketik nama atau kode rombel, nama wali, atau nomor telepon. Mengganti tingkat mengosongkan bagian. Perubahan filter atau pencarian kembali ke halaman pertama. |
| Centang baris dan **Pilih semua wali kelas di halaman ini** | Centang baris untuk memilih satu rombel. Kotak di header memilih atau melepas rombel yang tampil di halaman aktif. Pilihan dari halaman atau filter lain dapat tetap tersimpan. |
| **Ubah Penugasan Guru** | Modal berisi **Kelas**, **Bagian**, nama wali, dan telepon. Ganti kelas untuk memuat daftar bagian baru. Pilih bagian tujuan sebelum menyimpan. Jika pindah ke rombel yang sudah punya wali, modal menunjukkan pertukaran wali. **Simpan** menerapkan perubahan. Nama wajib diisi. Telepon kosong menggunakan nomor sebelumnya jika tersedia. **Batal/Tutup Form** meninggalkan data lama. |
| **Hapus Penugasan** dan **Hapus Terpilih** | Hapus satu baris melalui **Konfirmasi Hapus** di baris atau beberapa pilihan melalui **Konfirmasi Hapus Terpilih** di toolbar. Tombol hapus terpilih nonaktif jika jumlah pilihan nol. **Batal** menutup konfirmasi. Pada acuan, konfirmasi mengeluarkan rombel dari daftar yang sedang digunakan aplikasi. |
| **Ekspor Excel** | Mengunduh seluruh daftar rombel yang ada, meskipun tabel sedang difilter atau hanya sebagian baris dicentang. Kolom berkas adalah **KELAS**, **WALI KELAS**, dan **NO TELPON**. |
| **Impor Excel Wali Kelas** | Membuka modal pilih file penugasan dan tinjauan data. |

### Modal impor Wali Kelas

1. Klik **Unduh Template 49 Kelas** untuk memperoleh template dengan daftar rombel dan data wali saat ini.
2. Klik kotak unggah, lalu pilih `.xlsx`, `.xls`, atau `.csv`. File dibaca dari lembar pertama. Modal menampilkan nama file, jumlah penugasan yang terbaca, dan tabel tinjauan. Baris yang kosong atau tanpa nama wali dilewati.
3. Klik **Terapkan Penugasan Wali Kelas** untuk memperbarui rombel yang cocok. Baris dengan rombel yang tidak dikenal tidak mengubah daftar. **Batal** dan **Tutup Modal** menutup dialog tanpa menerapkan file.
4. Saat menguji template, periksa pembacaan kolom **KELAS** dan **WALI KELAS** secara khusus. Parser prototipe memakai pencarian kata pada judul kolom, sehingga kedua judul ini dapat terbaca sebagai kolom kelas. Catat hasil aktual sebagai temuan sebelum mengubah aturan impor.

Rujukan kode. [Wali Kelas](../frontend/src/app/wali-kelas/page.jsx) · [Modal impor Wali Kelas](../frontend/src/components/wali/ImportWaliKelasModal.jsx)

## Data Master Guru Mapel

| Kontrol | Langkah dan hasil |
| --- | --- |
| **Kelas**, **Bagian**, **Semua Mapel**, **Cari guru** | Gabungkan filter tingkat, bagian, dan mapel. Daftar filter memuat mapel aktif dan nonaktif dari katalog. Cari dengan nama atau kode guru, tanpa membedakan huruf besar dan kecil. Mengubah filter atau pencarian kembali ke halaman pertama. Tanpa filter rombel/mapel, guru tanpa penugasan dapat ikut tampil. |
| **Tambah Penugasan Guru** | Isi kode guru, nama guru, pilih mapel aktif, lalu centang satu atau beberapa rombel yang dikelompokkan menurut tingkat. Jumlah rombel terpilih berubah saat kotak dicentang atau dilepas. **Simpan Penugasan** membuat atau memperbarui penugasan. Kode guru yang sama merujuk pada guru yang sama. Kombinasi rombel dan mapel yang sama tidak digandakan. |
| **Edit Penugasan** | Kode guru tetap. Ubah nama, mapel, dan daftar rombel yang dicentang. **Simpan Perubahan** mengganti penugasan untuk mapel asal dengan mapel dan rombel yang dipilih, sementara penugasan mapel lain tetap ada. Jika mapel lama nonaktif, pilih mapel aktif untuk menyimpan. |
| **Hapus Penugasan**, **Konfirmasi Hapus**, **Batal** | Konfirmasi pada baris penugasan menghapus kombinasi guru, rombel, dan mapel tersebut. Pada baris guru tanpa penugasan, konfirmasi mengeluarkan guru dari daftar. Batal menutup konfirmasi. |
| **Impor Penugasan Excel** | Membuka modal pilih file dan unduh template. |

### Modal tambah, edit, dan impor Guru Mapel

1. Pada modal tambah atau edit, pilih **Mata Pelajaran**, centang **Rombel yang Diampu**, lalu simpan. Nama, mapel aktif, dan minimal satu rombel diperlukan. Gunakan **Batal** atau X untuk menutup tanpa menyimpan.
2. Pada modal impor, klik **Unduh Template Excel**. Lembar **Penugasan** menyediakan kode guru, nama guru, kelas, bagian, dan kode mapel. Bagian mengikuti kelas. Mapel di dropdown mengikuti katalog aktif saat diunduh.
3. Klik kotak unggah untuk memilih `.xlsx` atau `.xls`. Modal menampilkan nama file dan jumlah baris terbaca. Berkas lama dengan kolom rombel gabungan masih dapat dibaca.
4. Klik **Impor Penugasan**. Tombol nonaktif sebelum ada baris terbaca. Semua baris diperiksa ulang terhadap rombel dan mapel aktif saat diterapkan. Baris salah dapat diberi nomor dalam pesan dan membatalkan penerapan file. **Batal** atau X menutup modal tanpa menerapkan file. Guru Mapel tidak menyediakan tombol ekspor daftar penugasan pada acuan.

Rujukan kode. [Guru Mapel](../frontend/src/app/guru-mapel/page.jsx) · [Pilihan mapel dan rombel](../frontend/src/components/grades/TeacherAssignmentFields.jsx) · [Template penugasan](../frontend/src/lib/teacherAssignmentWorkbook.js)

## Data Master Mata Pelajaran

1. Lihat header **Daftar Mata Pelajaran** untuk membaca jumlah mapel aktif dari total. Centang **Aktifkan … di Leger** untuk menampilkan mapel pada Leger. Perubahan diterapkan langsung. Mengaktifkan induk menonaktifkan submapelnya. Mengaktifkan submapel menonaktifkan induknya.
2. Klik **Pindah ke atas** atau **Pindah ke bawah** untuk menukar posisi mapel dengan baris tetangga. Baris pertama tidak bisa naik dan baris terakhir tidak bisa turun. Kolom **Urutan** dan Leger mengikuti susunan baru.
3. Klik **Edit mata pelajaran** untuk mengubah **Kode**, **Induk Mapel**, dan **Mata Pelajaran**. Gunakan pilihan **Tanpa induk** atau pilih mapel utama lain. Pilihan induk dinonaktifkan jika mapel yang diedit masih menjadi induk. **Simpan** memerlukan kode dan nama, menolak kode ganda, dan menyimpan kode dalam huruf kapital. **Batal** mengabaikan perubahan.
4. Klik **Hapus mata pelajaran**, lalu **Hapus** pada modal untuk mengeluarkannya dari katalog. Submapel yang sebelumnya terkait kehilangan rujukan induknya. **Batal** menutup modal. Daftar memakai gulir tanpa kontrol tambah, pencarian, filter, impor, ekspor, atau pagination pada acuan.

Rujukan kode. [Mata Pelajaran](../frontend/src/app/mata-pelajaran/page.jsx) · [Aturan katalog](../frontend/src/lib/subjectCatalog.js)

## Setor Nilai untuk Guru

Berlaku untuk Guru Mapel dan Wali Kelas yang memiliki penugasan mengajar. Tanpa penugasan aktif, halaman menampilkan petunjuk agar menghubungi Admin.

| Kontrol | Langkah dan hasil |
| --- | --- |
| **Kelas**, **Bagian**, **Mata Pelajaran yang Diampu** | Hanya pilihan dengan penugasan aktif yang tampil. Halaman menggunakan rombel/mapel valid pertama jika pilihan lama tidak berlaku. Pindah kelas atau mapel kembali ke halaman pertama dan membuka draft untuk kombinasi tersebut. Metadata di atas tabel mengikuti pilihan rombel. |
| Sel **UH 1–5** dan **Nilai STS** | Ketik angka pada sel siswa. Perubahan langsung masuk draft di memori. **Rata-rata** dan **Ketercapaian** dihitung otomatis. Jika STS kosong atau rata-rata tidak tersedia, kedua hasil belum muncul. Jika rata-rata mencapai KKM mapel, labelnya **Tercapai**, jika kurang **Perlu Bimbingan**. |
| **Kolom tujuan isi nilai cepat**, **Isi Nilai Cepat**, **Terapkan … ke Semua Siswa** | Pilihan awal adalah **Nilai STS**. Pilih STS atau satu kolom UH, masukkan angka 0–100, lalu klik ikon sekali. Hanya kolom yang dipilih yang diisi, untuk seluruh siswa rombel termasuk halaman lain. Isian kosong atau di luar rentang menampilkan peringatan. |
| **Unduh Template DKN** | Mengunduh satu template Excel untuk kelas dan mapel aktif. Template memuat semua siswa di rombel. Sel UH 1–5 dan STS dapat diisi. Kolom rumus rata-rata serta ketercapaian dikunci. |
| **Impor Nilai DKN** | Membuka modal impor dengan rombel dan mapel terkunci pada pilihan toolbar. **Masukkan ke Draf** menyalin hasil untuk NIS yang cocok. |
| **Simpan Draft Nilai** | Menyimpan perubahan ke browser untuk kombinasi akun, tahun ajaran, semester, rombel, dan mapel. Tombol aktif setelah draft dimuat dan ada perubahan. Draft yang disimpan bisa dibuka kembali. |
| **Kirim Nilai ke Wali Kelas** | Memvalidasi STS dan rata-rata seluruh rombel, menyimpan STS asli, lalu mengirim rata-rata ke Leger. Status menjadi **Sudah dikirim**. Edit berikutnya mengubah status menjadi **Perubahan belum dikirim** sampai dikirim ulang. |
| Leger terkunci | Input sel, isi cepat, impor, simpan draft, dan kirim dinonaktifkan. Template masih dapat diunduh. |

Rujukan kode. [Setor Nilai Guru](../frontend/src/app/setor-nilai/page.jsx) · [Penyimpanan draft](../frontend/src/lib/gradeDraftStorage.js)

## Setor Nilai untuk Admin

1. Gunakan **Kelas**, **Bagian**, dan **Status** untuk menyaring penugasan aktif. Status dapat dipilih antara **Sudah mengirim** dan **Belum mengirim**. Saat guru mengedit setelah kirim, tabel Admin membaca baris sebagai belum mengirim sampai kirim ulang.
2. Isi **Cari setoran** untuk mencocokkan kode, nama guru, kelas, mapel, atau status. Filter dan pencarian mengembalikan tabel ke halaman pertama. **Total Penugasan** menghitung semua penugasan aktif, sementara hitungan sudah/belum mengirim dan jumlah ditampilkan mengikuti filter.
3. Gunakan pagination untuk menelusuri hasil. Klik **Ekspor Excel** untuk mengunduh `status-setoran-nilai.xlsx` berisi seluruh hasil filter dengan kolom Kode, Guru, Kelas, Mapel, dan Status. Ekspor nonaktif jika hasil kosong. Halaman Admin ini berfungsi untuk pemantauan.

Rujukan kode. [Tabel pemantauan setoran](../frontend/src/components/grades/SubmissionTable.jsx)

## Leger

| Kontrol | Langkah dan hasil |
| --- | --- |
| **Kelas**, **Bagian**, **Cari siswa**, **Status Nilai** | Admin memilih tingkat. Pilihan tingkat membuka rombel pertama dan mengosongkan pilihan bagian. Pilih bagian untuk mengganti rombel aktif. Wali langsung berada pada rombel asuh. Cari berdasarkan nama atau NIS. Status menyaring semua, lengkap, belum lengkap, atau remidi. Opsi remidi berlabel **Nilai < 70 (Remidi)**, sedangkan pemeriksaannya memakai KKM masing-masing mapel untuk nilai yang sudah terisi. |
| **Nilai Mata Pelajaran**, **Ekskul, Akhlak & Absensi** | Tab pertama berlabel **Nilai … Mapel** sesuai jumlah mapel aktif dan tampil awal. Klik tab kedua untuk melihat data pendukung. Filter siswa dipakai pada tabel utama di kedua tab. |
| Gulir horizontal atas dan bawah | Geser salah satu bilah untuk melihat kolom di kanan. Bilah lain bergerak mengikuti. Bilah atas tersedia saat tabel lebih lebar dari area lihat. Tabel 10 Besar juga memakai pembungkus gulir yang sama bila diperlukan. |
| Sel nilai | Ketik angka, lalu tekan Enter atau pindah fokus untuk menerapkan. Desimal dibulatkan, sel yang dikosongkan menjadi kosong. Jumlah, rata-rata, kelengkapan, serta peringkat dihitung kembali. Arahkan kursor ke judul mapel untuk melihat namanya. |
| Sel data pendukung | Ketik jenis kegiatan, predikat huruf, dan catatan wali. Pilih nilai kelakuan, kerajinan, serta kerapian dari **Sangat Baik**, **Baik**, **Cukup**, dan **Kurang**. Isi angka hari sakit, izin, dan alpa. Perubahan masuk ke data siswa saat diketik atau dipilih. |
| **Impor DKN Excel** | Hanya Admin. Modal memperbolehkan memilih kelas dan mapel tujuan, kemudian menerapkan nilai langsung ke Leger. |
| **Kunci leger / Buka kunci leger** | Admin dan Wali dapat berganti antara mode edit dan baca. Saat terkunci, nilai dan data pendukung tidak bisa diedit melalui sel, serta impor atau setoran ke rombel tersebut ditolak. Pratinjau dan ekspor masih bisa dibuka. |
| **Simpan leger** | Menampilkan pesan simpan. Pada acuan, perubahan Leger berada di memori aplikasi. |
| **Ekspor leger Excel** | Mengunduh rekap model RDM untuk semua siswa pada rombel aktif. Pencarian dan filter status di tabel tidak membatasi hasil ekspor ini. |
| **Cetak raport PDF** pada toolbar dan **Cetak Raport Kelas …** pada petunjuk | Membuka halaman Raport. Tombol ini tidak langsung membuka dialog printer. |
| Ikon printer **Pratinjau dan Cetak Raport** / **Cetak Raport** di tabel | Membuka pratinjau siswa dari tabel utama atau peringkat. **Peringkat 10 Besar** memakai total nilai seluruh rombel, termasuk siswa di luar filter tabel utama. |

Rujukan kode. [Leger](../frontend/src/app/leger/page.jsx) · [Gulir tabel](../frontend/src/components/common/ScrollableTableCard.jsx) · [Ekspor Excel Leger](../frontend/src/lib/legerExcel.js)

## Modal Impor DKN

1. Buka modal dari **Setor Nilai** atau **Leger**. Pada Setor Nilai, **Target kelas** dan **Mata pelajaran** mengikuti toolbar dan dinonaktifkan. Pada Leger Admin, keduanya dapat dipilih di modal.
2. Klik kotak unggah dan pilih `.xlsx`, `.xls`, atau `.csv`. Parser membaca lembar pertama, mengenali template DKN RADISTES dan beberapa judul kolom dari file lama. Baris kosong, tanpa nama, atau dengan skor akhir tidak valid dilewati. Jika metadata kelas atau mapel berhasil dikenali, Leger dapat mengganti pilihan tujuan. Setor Nilai menolak file dengan metadata yang berbeda dari pilihan yang terkunci. Pengenalan mapel lama secara otomatis saat ini terbatas pada Informatika/TIK dan Matematika.
3. Tinjau nama file dan tabel hasil baca. **Unduh Contoh DKN** mengunduh contoh berisi beberapa baris data dan rumus. Contoh ini memakai mapel Informatika dan berbeda dari template kelas/mapel aktif di toolbar Setor Nilai.
4. Klik **Masukkan ke Draf** pada Setor Nilai atau **Terapkan ke Leger** pada Leger. Tombol aktif setelah file selesai dibaca dan ada hasil. Jalur draft mencocokkan NIS. Jalur Leger mencocokkan NIS atau nama jika NIS kosong, membulatkan nilai, dan menolak perubahan jika rombel terkunci. Kedua jalur menutup modal setelah meneruskan data.
5. Klik **Batal** atau **Tutup Modal** untuk keluar tanpa menerapkan file.

Rujukan kode. [Modal Impor DKN](../frontend/src/components/import/ImportDknModal.jsx) · [Aturan impor Leger](../frontend/src/context/AppContext.jsx)

## Raport dan pratinjau

| Kontrol | Langkah dan hasil |
| --- | --- |
| **Kelas**, **Bagian**, **Cari siswa**, view | Admin dapat menyaring tingkat dan bagian. Mengganti tingkat mengosongkan bagian. Wali memakai rombel asuh. Cari berdasarkan nama, nomor induk, atau kode kelas. Pencarian, filter, dan ukuran tampilan kembali ke halaman pertama. |
| **Unduh Semua Raport PDF / Cetak Semua Raport (PDF)** | Admin mengunduh PDF langsung. Wali membuka dialog cetak. Keduanya memakai semua siswa pada hasil pencarian dan filter, termasuk halaman lain. Tombol nonaktif jika data kosong atau proses keluaran masih berjalan. |
| **Unduh Leger Excel** dan **Cetak Leger (PDF)** | Ekspor menggunakan siswa hasil filter dan membuat lembar terpisah untuk setiap rombel yang ada pada hasil. Cetak Leger membuka dialog cetak untuk rekap hasil filter. Kedua tombol nonaktif jika hasil kosong. |
| **Pratinjau Raport** | Klik ikon mata di baris siswa untuk membuka modal. |
| **Unduh Raport PDF / Simpan PDF** di baris | Admin mengunduh satu raport. Wali membuka dialog cetak satu siswa dan dapat memilih **Save as PDF**. |
| **Edit Siswa** | Buka formulir nama lengkap serta pilihan L/P. Klik **Simpan** untuk menerapkan. **Batal** atau X menutup formulir. Tombol baris nonaktif saat kelas terkunci. |
| **Hapus Siswa** | Buka konfirmasi. **Konfirmasi Hapus** mengeluarkan siswa dari Leger aktif. **Batal** menutup konfirmasi. Tombol baris nonaktif saat kelas terkunci. |

### Modal pratinjau raport

1. Klik **Siswa Sebelumnya** atau **Siswa Berikutnya** untuk berpindah pada daftar lengkap rombel yang sama. Modal dapat mengarah ke siswa di luar hasil pencarian atau halaman tabel semula. Panah sebelumnya nonaktif di siswa pertama, dan panah berikutnya nonaktif di siswa terakhir.
2. Klik **Cetak Dokumen atau Simpan sebagai PDF**. Aplikasi menyesuaikan isi ke A4, menyiapkan gambar, lalu membuka dialog cetak browser untuk raport siswa yang sedang dibuka.
3. Klik X **Tutup Modal** untuk kembali ke halaman asal.

Rujukan kode. [Halaman Raport](../frontend/src/app/cetak-raport/page.jsx) · [Modal pratinjau](../frontend/src/components/raport/RaportPreviewModal.jsx) · [PDF langsung](../frontend/src/lib/downloadRaportPdf.js)

## Pengaturan

| Peran dan kontrol | Langkah dan hasil |
| --- | --- |
| Admin, kartu **Kop Surat Resmi Lembaga** | Isi Yayasan/Naungan, Nama Madrasah/Sekolah, NSM, NPSN, Alamat Singkat Kop, serta Alamat Lengkap & Kontak. Klik pilihan file **Logo kop raport** untuk mengganti gambar. Isian memengaruhi kop dan tampilan terkait setelah disimpan. |
| Admin, kartu **Pengaturan Periode & Tanda Tangan** | Isi Judul Dokumen Raport, Tahun Pelajaran, pilihan Semester Ganjil/Genap, tanggal **Batas Akhir Pengiriman Nilai**, teks **Tanggal Pembagian Raport**, Tempat Titimangsa, Nama Kepala Madrasah, dan NIPY. Gunakan pilihan file tanda tangan untuk mengganti gambar kepala madrasah. **Simpan Pengaturan Raport** menyimpan isian kedua kartu. |
| Wali Kelas | Isi **NIPY Wali Kelas** dan pilih gambar tanda tangan. Klik **Simpan Pengaturan Wali Kelas** untuk rombel asuh. Tanda tangan tampil di pratinjau dan keluaran raport yang dibuka oleh Wali Kelas maupun Admin pada browser yang memakai pengaturan tersebut. |
| Pilih gambar, pratinjau, **Hapus tanda tangan** | Pilih PNG, JPEG, atau WebP maksimal 1 MB. File valid ditampilkan tanpa mengurangi resolusi aslinya. File tidak valid menampilkan peringatan dan isian sebelumnya tetap ada. **Hapus tanda tangan** muncul jika ada gambar tanda tangan dan baru berlaku setelah pengaturan disimpan. Tombol simpan serta input gambar nonaktif ketika gambar sedang dibaca. |

Rujukan kode. [Pengaturan](../frontend/src/app/pengaturan/page.jsx) · [Input gambar](../frontend/src/components/raport/RaportImageInput.jsx)

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
