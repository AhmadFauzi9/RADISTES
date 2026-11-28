# Pedoman pengembangan RADISTES

- Gunakan [Master Plan Backend Go](master%20plan.md) untuk menentukan batas pekerjaan, tahapan, dan kriteria selesai.
- Gunakan frontend pada commit `5ba399b2af6671929c16e09043408645287e6a60` dan [panduan perilaku](docs/perilaku-frontend-radistes.md) sebagai acuan sampai pemilik menyetujui acuan baru.
- Minta persetujuan pemilik sebelum mengubah tampilan atau perilaku frontend. Sebutkan halaman, peran, kondisi saat ini, usulan, dan alasannya. Lanjutkan pekerjaan backend yang tidak bergantung pada perubahan tersebut sambil menunggu.
- Integrasi API atau pemetaan data internal boleh dilakukan selama cara pengguna memakai aplikasi dan hasil yang terlihat sesuai acuan.
- Selesaikan RADISTES mandiri untuk satu rombel dan satu periode STS terlebih dahulu. Pekerjaan di luar ruang lingkup memerlukan persetujuan pemilik. Integrasi SI-MATSAMA mengikuti tahap lanjutan dalam Master Plan.
- Jalankan `pnpm build` hanya jika diminta.
