-- ============================================================================
-- DATABASE SQL DUMP UNTUK XAMPP (MySQL / MariaDB - phpMyAdmin)
-- Sistem Pelayanan Terpadu Satu Pintu (PTSP) Bawaslu Kabupaten Subang
-- Cara Import di XAMPP:
-- 1. Jalankan Apache & MySQL di XAMPP Control Panel
-- 2. Buka http://localhost/phpmyadmin
-- 3. Klik tab "Import" lalu pilih file database_xampp_ptsp_bawaslu_subang.sql ini
-- 4. Klik "Go" / "Kirim"
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `db_ptsp_bawaslu_subang`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_ptsp_bawaslu_subang`;

-- 1. Tabel Permohonan Pelayanan PTSP (Formulir 1 s.d. 4 & Buku Register Harian)
CREATE TABLE IF NOT EXISTS `ptsp_records` (
  `id` VARCHAR(64) NOT NULL,
  `registration_number` VARCHAR(100) NOT NULL,
  `received_date` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `nik_or_identity` VARCHAR(64) NOT NULL,
  `institution` VARCHAR(150) DEFAULT '',
  `phone` VARCHAR(50) DEFAULT '',
  `email` VARCHAR(120) DEFAULT '',
  `service_types` TEXT NOT NULL,
  `purpose_summary` TEXT NOT NULL,
  `completion_status` VARCHAR(64) NOT NULL DEFAULT 'menunggu_verifikasi',
  `ptsp_officer_name` VARCHAR(150) DEFAULT '',
  `handling_unit` VARCHAR(150) DEFAULT '',
  `record_json` LONGTEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_registration_number` (`registration_number`),
  INDEX `idx_completion_status` (`completion_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Survei Kepuasan Masyarakat / Indeks Kinerja Sistem (SKM - Tanpa No. Registrasi)
CREATE TABLE IF NOT EXISTS `ptsp_surveys` (
  `id` VARCHAR(64) NOT NULL,
  `respondent_name` VARCHAR(150) NOT NULL,
  `survey_date` VARCHAR(50) NOT NULL,
  `service_type` VARCHAR(80) NOT NULL,
  `overall_satisfaction` VARCHAR(40) NOT NULL,
  `q1_prosedur` TINYINT NOT NULL DEFAULT 4,
  `q2_persyaratan` TINYINT NOT NULL DEFAULT 4,
  `q3_kecepatan` TINYINT NOT NULL DEFAULT 4,
  `q4_kompetensi` TINYINT NOT NULL DEFAULT 4,
  `q5_sikap` TINYINT NOT NULL DEFAULT 4,
  `q6_kesesuaian` TINYINT NOT NULL DEFAULT 4,
  `q7_sarana` TINYINT NOT NULL DEFAULT 4,
  `q8_pengaduan` TINYINT NOT NULL DEFAULT 4,
  `survey_feedback` TEXT,
  `survey_json` LONGTEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Akun Petugas Meja PTSP
CREATE TABLE IF NOT EXISTS `ptsp_officers` (
  `id` VARCHAR(64) NOT NULL,
  `username` VARCHAR(64) NOT NULL,
  `nip_nik` VARCHAR(64) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role_title` VARCHAR(200) NOT NULL,
  `access_level` VARCHAR(50) NOT NULL,
  `salt` VARCHAR(128) NOT NULL,
  `password_hash` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
