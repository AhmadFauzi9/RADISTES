-- ==============================================================
-- RADISTES Database Schema
-- MTs Al Amiriyyah Blokagung - MySQL 8.x / MariaDB
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `db_radistes` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_radistes`;

-- 1. Konfigurasi Lembaga & Format Raport
CREATE TABLE IF NOT EXISTS `pengaturan_sekolah` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `yayasan` VARCHAR(255) NOT NULL DEFAULT 'YAYASAN PONDOK PESANTREN DARUSSALAM',
    `nama_madrasah` VARCHAR(255) NOT NULL DEFAULT 'MTs AL AMIRIYYAH',
    `nsm` VARCHAR(50) NOT NULL DEFAULT '121235100017',
    `npsn` VARCHAR(50) NOT NULL DEFAULT '20581701',
    `alamat_kop` VARCHAR(255) NOT NULL DEFAULT 'Blokagung Tegalsari Banyuwangi',
    `alamat_lengkap` TEXT,
    `judul_raport` VARCHAR(255) NOT NULL DEFAULT 'LAPORAN HASIL (STS) SUMATIF TENGAH SEMESTER GANJIL',
    `tahun_ajaran` VARCHAR(20) NOT NULL DEFAULT '2025/2026',
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL DEFAULT 'GANJIL',
    `ujian` VARCHAR(50) NOT NULL DEFAULT 'STS',
    `tgl_raport` VARCHAR(100) NOT NULL DEFAULT '09 Oktober 2025',
    `titimangsa` VARCHAR(100) NOT NULL DEFAULT 'Blokagung',
    `kepala_madrasah` VARCHAR(255) NOT NULL DEFAULT 'AHMADI, M.Pd.I',
    `nip_kepala` VARCHAR(100) DEFAULT '-',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Master Guru & Wali Kelas (49 Kelas)
CREATE TABLE IF NOT EXISTS `guru` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nama` VARCHAR(255) NOT NULL,
    `telp` VARCHAR(30) DEFAULT NULL,
    `email` VARCHAR(100) DEFAULT NULL,
    `username` VARCHAR(50) UNIQUE DEFAULT NULL,
    `password` VARCHAR(255) DEFAULT NULL,
    `role` ENUM('admin', 'walikelas', 'gurumapel') NOT NULL DEFAULT 'walikelas',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Master Kelas (7A - 7P, 8A - 8R, 9A - 9O)
CREATE TABLE IF NOT EXISTS `kelas` (
    `id` VARCHAR(10) PRIMARY KEY, -- Misal: '8A'
    `tingkat` ENUM('7', '8', '9') NOT NULL,
    `nama` VARCHAR(20) NOT NULL,
    `walikelas_id` INT DEFAULT NULL,
    `status_lock` TINYINT(1) DEFAULT 0, -- 1 jika nilai fix & terkunci siap cetak
    FOREIGN KEY (`walikelas_id`) REFERENCES `guru`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Master 17 Mata Pelajaran
CREATE TABLE IF NOT EXISTS `mata_pelajaran` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `kode_mapel` VARCHAR(20) NOT NULL, -- 'qurdist', 'mat', dll
    `kode_urut` VARCHAR(10) NOT NULL,  -- '1.a', '6', dll
    `nama` VARCHAR(255) NOT NULL,
    `nama_singkat` VARCHAR(50) NOT NULL,
    `kelompok` VARCHAR(100) NOT NULL,  -- 'Pendidikan Agama', 'Umum', 'Pilihan', 'Mulok'
    `kkm` INT NOT NULL DEFAULT 70,
    `urutan` INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- 5. Data Siswa
CREATE TABLE IF NOT EXISTS `siswa` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nis` VARCHAR(30) UNIQUE NOT NULL,
    `nisn` VARCHAR(30) DEFAULT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `lp` ENUM('L', 'P') NOT NULL DEFAULT 'L',
    `kelas_id` VARCHAR(10) NOT NULL,
    `no_absen` INT NOT NULL,
    FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Leger Nilai Mata Pelajaran Siswa
CREATE TABLE IF NOT EXISTS `nilai_leger` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `siswa_id` INT NOT NULL,
    `mapel_id` INT NOT NULL,
    `nilai_angka` DECIMAL(5, 1) DEFAULT NULL,
    `nilai_huruf` VARCHAR(100) DEFAULT NULL,
    `ketercapaian` VARCHAR(50) DEFAULT 'Tercapai',
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL DEFAULT 'GANJIL',
    `tahun_ajaran` VARCHAR(20) NOT NULL DEFAULT '2025/2026',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `siswa_mapel_period` (`siswa_id`, `mapel_id`, `semester`, `tahun_ajaran`),
    FOREIGN KEY (`siswa_id`) REFERENCES `siswa`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Data Pendukung Raport (Ekskul, Akhlak & Kepribadian, Absensi, Catatan)
CREATE TABLE IF NOT EXISTS `nilai_pendukung` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `siswa_id` INT NOT NULL,
    `ekskul_jenis` VARCHAR(150) DEFAULT 'Pramuka',
    `ekskul_nilai` VARCHAR(50) DEFAULT 'B (Baik)',
    `ekskul_ket` VARCHAR(255) DEFAULT 'Aktif mengikuti kegiatan',
    `akhlak_kelakuan` VARCHAR(50) DEFAULT 'Baik',
    `akhlak_kerajinan` VARCHAR(50) DEFAULT 'Baik',
    `akhlak_kerapian` VARCHAR(50) DEFAULT 'Baik',
    `absen_sakit` INT DEFAULT 0,
    `absen_izin` INT DEFAULT 0,
    `absen_alpa` INT DEFAULT 0,
    `catatan_wali` TEXT,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL DEFAULT 'GANJIL',
    `tahun_ajaran` VARCHAR(20) NOT NULL DEFAULT '2025/2026',
    UNIQUE KEY `siswa_pendukung_period` (`siswa_id`, `semester`, `tahun_ajaran`),
    FOREIGN KEY (`siswa_id`) REFERENCES `siswa`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Log Setoran Nilai dari Guru Mapel ke Wali Kelas
CREATE TABLE IF NOT EXISTS `setoran_guru` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `guru_id` INT DEFAULT NULL,
    `mapel_id` INT NOT NULL,
    `kelas_id` VARCHAR(10) NOT NULL,
    `status` ENUM('draft', 'diserahkan', 'disinkronkan') DEFAULT 'diserahkan',
    `catatan` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
