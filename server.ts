import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_PTSP_RECORDS,
  INITIAL_PTSP_SURVEYS,
  PTSP_SERVICE_TYPE_LABELS,
} from './src/types/ptsp.ts';
import type { PtspRecord, PtspSurveyEntry } from './src/types/ptsp.ts';
import { BAWASLU_LOGO_DATA_URI } from './src/assets/bawasluLogo.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StoredOfficerAccount {
  id: string;
  username: string;
  nipNik: string;
  fullName: string;
  roleTitle: string;
  accessLevel: 'petugas_penerima' | 'ketua_pelaksana';
  salt: string;
  passwordHash: string;
}

interface PublicOfficerProfile {
  id: string;
  username: string;
  nipNik: string;
  fullName: string;
  roleTitle: string;
  accessLevel: 'petugas_penerima' | 'ketua_pelaksana';
}

interface StoreData {
  officers: StoredOfficerAccount[];
  ptspRecords: PtspRecord[];
  ptspSurveys: PtspSurveyEntry[];
}

const DATA_DIR = path.join(__dirname, '.data');
const STORE_PATH = path.join(DATA_DIR, 'ptsp_store.json');

// XAMPP MySQL / MariaDB Configuration
const MYSQL_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_ptsp_bawaslu_subang',
};

let mysqlPool: Pool | null = null;
let mysqlInitAttempted = false;

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string
): boolean {
  const actualBuffer = Buffer.from(hashPassword(password, salt), 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  if (actualBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function createInitialOfficers(): StoredOfficerAccount[] {
  const salt1 = crypto.randomBytes(16).toString('hex');
  const salt2 = crypto.randomBytes(16).toString('hex');

  return [
    {
      id: 'off-1',
      username: 'petugas',
      nipNik: '19910412 201902 2 004',
      fullName: 'Rina Kartika, S.I.P.',
      roleTitle: 'Petugas Penerima Layanan PTSP Bawaslu Kabupaten Subang',
      accessLevel: 'petugas_penerima',
      salt: salt1,
      passwordHash: hashPassword('bawaslu2026', salt1),
    },
    {
      id: 'off-2',
      username: 'ketua',
      nipNik: '19840817 201101 1 002',
      fullName: 'H. Imanudin, S.H., M.H.',
      roleTitle: 'Koordinator Sekretariat / Penanggung Jawab PTSP',
      accessLevel: 'ketua_pelaksana',
      salt: salt2,
      passwordHash: hashPassword('subang2026', salt2),
    },
  ];
}

function loadStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<StoreData>;
      if (
        Array.isArray(parsed.officers) &&
        Array.isArray(parsed.ptspRecords) &&
        Array.isArray(parsed.ptspSurveys)
      ) {
        return {
          officers: parsed.officers,
          ptspRecords: parsed.ptspRecords,
          ptspSurveys: parsed.ptspSurveys,
        };
      }
    }
  } catch (err) {
    console.error('Failed to read store, initializing default store:', err);
  }

  const initial: StoreData = {
    officers: createInitialOfficers(),
    ptspRecords: INITIAL_PTSP_RECORDS,
    ptspSurveys: INITIAL_PTSP_SURVEYS,
  };
  saveStore(initial);
  return initial;
}

function saveStore(data: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store:', err);
  }
}

const store: StoreData = loadStore();

async function upsertRecordToMySql(pool: Pool, rec: PtspRecord): Promise<void> {
  const serviceText = rec.serviceTypes
    .map((s) => PTSP_SERVICE_TYPE_LABELS[s] || s)
    .join(', ');
  await pool.execute(
    `INSERT INTO ptsp_records (
      id, registration_number, received_date, full_name, nik_or_identity,
      institution, phone, email, service_types, purpose_summary,
      completion_status, ptsp_officer_name, handling_unit, record_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      registration_number = VALUES(registration_number),
      received_date = VALUES(received_date),
      full_name = VALUES(full_name),
      nik_or_identity = VALUES(nik_or_identity),
      institution = VALUES(institution),
      phone = VALUES(phone),
      email = VALUES(email),
      service_types = VALUES(service_types),
      purpose_summary = VALUES(purpose_summary),
      completion_status = VALUES(completion_status),
      ptsp_officer_name = VALUES(ptsp_officer_name),
      handling_unit = VALUES(handling_unit),
      record_json = VALUES(record_json)`,
    [
      rec.id,
      rec.registrationNumber,
      rec.receivedDate || rec.dayAndDate,
      rec.fullName,
      rec.nikOrIdentity,
      rec.institution || '',
      rec.phoneWhatsapp || '',
      rec.email || '',
      serviceText,
      rec.purposeSummary || '',
      rec.completionStatus,
      rec.ptspOfficerName || '',
      rec.handlingUnit || '',
      JSON.stringify(rec),
      new Date(rec.createdAt || Date.now()),
    ]
  );
}

async function insertSurveyToMySql(
  pool: Pool,
  survey: PtspSurveyEntry
): Promise<void> {
  await pool.execute(
    `INSERT INTO ptsp_surveys (
      id, respondent_name, survey_date, service_type, overall_satisfaction,
      q1_prosedur, q2_persyaratan, q3_kecepatan, q4_kompetensi,
      q5_sikap, q6_kesesuaian, q7_sarana, q8_pengaduan,
      survey_feedback, survey_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      respondent_name = VALUES(respondent_name),
      survey_date = VALUES(survey_date),
      service_type = VALUES(service_type),
      overall_satisfaction = VALUES(overall_satisfaction),
      q1_prosedur = VALUES(q1_prosedur),
      q2_persyaratan = VALUES(q2_persyaratan),
      q3_kecepatan = VALUES(q3_kecepatan),
      q4_kompetensi = VALUES(q4_kompetensi),
      q5_sikap = VALUES(q5_sikap),
      q6_kesesuaian = VALUES(q6_kesesuaian),
      q7_sarana = VALUES(q7_sarana),
      q8_pengaduan = VALUES(q8_pengaduan),
      survey_feedback = VALUES(survey_feedback),
      survey_json = VALUES(survey_json)`,
    [
      survey.id,
      survey.respondentName,
      survey.surveyDate,
      survey.serviceType,
      survey.overallSatisfaction,
      survey.surveyScores.q1_prosedur,
      survey.surveyScores.q2_persyaratan,
      survey.surveyScores.q3_kecepatan,
      survey.surveyScores.q4_kompetensi,
      survey.surveyScores.q5_sikap,
      survey.surveyScores.q6_kesesuaian,
      survey.surveyScores.q7_sarana,
      survey.surveyScores.q8_pengaduan,
      survey.surveyFeedback || '',
      JSON.stringify(survey),
      new Date(survey.createdAt || Date.now()),
    ]
  );
}

async function initXamppMySql(): Promise<Pool | null> {
  if (mysqlPool) return mysqlPool;
  if (mysqlInitAttempted) return null;
  mysqlInitAttempted = true;
  try {
    // 1. Connect to XAMPP MySQL server to ensure database exists
    const bootstrapConn = await mysql.createConnection({
      host: MYSQL_CONFIG.host,
      port: MYSQL_CONFIG.port,
      user: MYSQL_CONFIG.user,
      password: MYSQL_CONFIG.password,
      connectTimeout: 1000,
    });

    await bootstrapConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${MYSQL_CONFIG.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await bootstrapConn.end();

    // 2. Create connection pool to the PTSP database
    const pool = mysql.createPool({
      host: MYSQL_CONFIG.host,
      port: MYSQL_CONFIG.port,
      user: MYSQL_CONFIG.user,
      password: MYSQL_CONFIG.password,
      database: MYSQL_CONFIG.database,
      waitForConnections: true,
      connectionLimit: 10,
    });

    // 3. Ensure tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ptsp_records (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        registration_number VARCHAR(100) NOT NULL,
        received_date VARCHAR(50) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        nik_or_identity VARCHAR(64) NOT NULL,
        institution VARCHAR(150) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        email VARCHAR(120) DEFAULT '',
        service_types TEXT NOT NULL,
        purpose_summary TEXT NOT NULL,
        completion_status VARCHAR(64) NOT NULL DEFAULT 'menunggu_verifikasi',
        ptsp_officer_name VARCHAR(150) DEFAULT '',
        handling_unit VARCHAR(150) DEFAULT '',
        record_json LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ptsp_surveys (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        respondent_name VARCHAR(150) NOT NULL,
        survey_date VARCHAR(50) NOT NULL,
        service_type VARCHAR(80) NOT NULL,
        overall_satisfaction VARCHAR(40) NOT NULL,
        q1_prosedur TINYINT NOT NULL DEFAULT 4,
        q2_persyaratan TINYINT NOT NULL DEFAULT 4,
        q3_kecepatan TINYINT NOT NULL DEFAULT 4,
        q4_kompetensi TINYINT NOT NULL DEFAULT 4,
        q5_sikap TINYINT NOT NULL DEFAULT 4,
        q6_kesesuaian TINYINT NOT NULL DEFAULT 4,
        q7_sarana TINYINT NOT NULL DEFAULT 4,
        q8_pengaduan TINYINT NOT NULL DEFAULT 4,
        survey_feedback TEXT,
        survey_json LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Sync / Load records from MySQL
    const [recRows] = await pool.query<RowDataPacket[]>(
      'SELECT record_json FROM ptsp_records ORDER BY created_at DESC'
    );
    if (recRows.length === 0) {
      for (const rec of store.ptspRecords) {
        await upsertRecordToMySql(pool, rec);
      }
    } else {
      store.ptspRecords = recRows.map(
        (r) => JSON.parse(String(r.record_json)) as PtspRecord
      );
    }

    // 5. Sync / Load surveys from MySQL
    const [srvRows] = await pool.query<RowDataPacket[]>(
      'SELECT survey_json FROM ptsp_surveys ORDER BY created_at DESC'
    );
    if (srvRows.length === 0) {
      for (const srv of store.ptspSurveys) {
        await insertSurveyToMySql(pool, srv);
      }
    } else {
      store.ptspSurveys = srvRows.map(
        (r) => JSON.parse(String(r.survey_json)) as PtspSurveyEntry
      );
    }

    mysqlPool = pool;
    saveStore(store);
    console.log(
      `[XAMPP MySQL] Terhubung ke database '${MYSQL_CONFIG.database}' di ${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}`
    );
    return mysqlPool;
  } catch (err) {
    mysqlPool = null;
    console.log(
      `[Penyimpanan Lokal] XAMPP MySQL (${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}) belum terhubung (${(err as Error)?.message || 'offline'}) — menggunakan penyimpanan lokal (.data/ptsp_store.json).`
    );
    return null;
  }
}

// In-memory active cryptographic session tokens & rate-limiting tracker
const activeSessions = new Map<
  string,
  { officerId: string; expiresAt: number }
>();

const loginAttempts = new Map<
  string,
  { count: number; lockedUntil: number; lastAttempt: number }
>();

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function toPublicProfile(acc: StoredOfficerAccount): PublicOfficerProfile {
  return {
    id: acc.id,
    username: acc.username,
    nipNik: acc.nipNik,
    fullName: acc.fullName,
    roleTitle: acc.roleTitle,
    accessLevel: acc.accessLevel,
  };
}

function getAuthenticatedOfficer(req: Request): StoredOfficerAccount | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  const session = activeSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }

  const officer = store.officers.find((o) => o.id === session.officerId);
  if (!officer) return null;

  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return officer;
}

function requireOfficerAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const officer = getAuthenticatedOfficer(req);
  if (!officer) {
    res.status(401).json({
      error:
        'Sesi petugas tidak valid atau telah berakhir. Silakan login kembali ke Meja Petugas.',
    });
    return;
  }
  (req as Request & { officer?: StoredOfficerAccount }).officer = officer;
  next();
}

function sqlEscape(val: string): string {
  return `'${String(val ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')}'`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  void initXamppMySql();

  app.use(express.json({ limit: '5mb' }));

  // Serve embedded Bawaslu logo even when /public/assets/aistudio is missing in exported ZIP
  app.get(
    '/assets/aistudio/logo_bawaslu-01_1cf173b0.png',
    (_req: Request, res: Response) => {
      const b64 = BAWASLU_LOGO_DATA_URI.replace(
        /^data:image\/png;base64,/,
        ''
      );
      const buf = Buffer.from(b64, 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(buf);
    }
  );

  // --- AUTHENTICATION API ROUTES ---

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { usernameOrNip, password } = req.body as {
      usernameOrNip?: string;
      password?: string;
    };

    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      'local';
    const normalizedInput = String(usernameOrNip || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
    const attemptKey = `${clientIp}:${normalizedInput || 'unknown'}`;

    const attemptRecord = loginAttempts.get(attemptKey);
    const now = Date.now();

    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const waitSeconds = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
      res.status(429).json({
        error: `Terlalu banyak percobaan login gagal. Akun dikunci sementara, silakan coba lagi dalam ${waitSeconds} detik.`,
      });
      return;
    }

    if (!normalizedInput || !password) {
      res.status(400).json({
        error: 'ID Pengguna/NIP dan Kata Sandi wajib diisi.',
      });
      return;
    }

    const matchedOfficer = store.officers.find((acc) => {
      const cleanNip = acc.nipNik.replace(/\s+/g, '').toLowerCase();
      return (
        acc.username.toLowerCase() === normalizedInput ||
        cleanNip === normalizedInput
      );
    });

    const isPasswordValid =
      matchedOfficer &&
      verifyPassword(
        String(password),
        matchedOfficer.salt,
        matchedOfficer.passwordHash
      );

    if (!matchedOfficer || !isPasswordValid) {
      const prevCount =
        attemptRecord && now - attemptRecord.lastAttempt < 10 * 60 * 1000
          ? attemptRecord.count
          : 0;
      const nextCount = prevCount + 1;
      const lockedUntil =
        nextCount >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_DURATION_MS : 0;

      loginAttempts.set(attemptKey, {
        count: nextCount,
        lockedUntil,
        lastAttempt: now,
      });

      const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - nextCount);
      res.status(401).json({
        error:
          remainingAttempts > 0
            ? `ID Pengguna/NIP atau Kata Sandi tidak sesuai. Sisa percobaan sebelum dikunci sementara: ${remainingAttempts} kali.`
            : 'Terlalu banyak percobaan gagal. Akses login dikunci selama 5 menit.',
      });
      return;
    }

    loginAttempts.delete(attemptKey);

    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, {
      officerId: matchedOfficer.id,
      expiresAt: now + SESSION_TTL_MS,
    });

    res.json({
      token,
      officer: toPublicProfile(matchedOfficer),
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const officer = getAuthenticatedOfficer(req);
    if (!officer) {
      res.status(401).json({ error: 'Belum terautentikasi.' });
      return;
    }
    res.json({ officer: toPublicProfile(officer) });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length).trim();
      activeSessions.delete(token);
    }
    res.json({ success: true });
  });

  app.post(
    '/api/auth/change-password',
    requireOfficerAuth,
    (req: Request, res: Response) => {
      const officer = (req as Request & { officer: StoredOfficerAccount })
        .officer;
      const { currentPassword, newPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
      };

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: 'Kata sandi saat ini dan kata sandi baru wajib diisi.',
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          error: 'Kata sandi baru minimal harus terdiri dari 8 karakter.',
        });
        return;
      }

      const validCurrent = verifyPassword(
        currentPassword,
        officer.salt,
        officer.passwordHash
      );
      if (!validCurrent) {
        res.status(401).json({
          error: 'Kata sandi saat ini tidak sesuai.',
        });
        return;
      }

      const newSalt = crypto.randomBytes(16).toString('hex');
      officer.salt = newSalt;
      officer.passwordHash = hashPassword(newPassword, newSalt);
      saveStore(store);

      res.json({
        success: true,
        message:
          'Kata sandi petugas berhasil diperbarui secara terenkripsi di server.',
      });
    }
  );

  // --- PTSP RECORDS & SURVEYS API ROUTES (XAMPP MYSQL + LOCAL FALLBACK) ---

  app.get('/api/ptsp/records', async (_req: Request, res: Response) => {
    const pool = mysqlPool || (await initXamppMySql());
    if (pool) {
      try {
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT record_json FROM ptsp_records ORDER BY created_at DESC'
        );
        const records = rows.map(
          (r) => JSON.parse(String(r.record_json)) as PtspRecord
        );
        store.ptspRecords = records;
        res.json({ records, storage: 'xampp_mysql' });
        return;
      } catch (err) {
        console.error('MySQL read records error:', err);
      }
    }
    res.json({ records: store.ptspRecords, storage: 'local_json' });
  });

  app.post('/api/ptsp/records', async (req: Request, res: Response) => {
    const incoming = req.body as PtspRecord;
    if (!incoming || !incoming.id || !incoming.registrationNumber) {
      res.status(400).json({ error: 'Data permohonan PTSP tidak lengkap.' });
      return;
    }

    store.ptspRecords = [
      incoming,
      ...store.ptspRecords.filter((r) => r.id !== incoming.id),
    ];
    saveStore(store);

    const pool = mysqlPool || (await initXamppMySql());
    if (pool) {
      try {
        await upsertRecordToMySql(pool, incoming);
      } catch (err) {
        console.error('MySQL insert record error:', err);
      }
    }

    res.status(201).json({ record: incoming });
  });

  app.put('/api/ptsp/records/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = req.body as PtspRecord;
    if (!updated || !updated.id) {
      res.status(400).json({ error: 'Data pembaruan berkas tidak valid.' });
      return;
    }

    const idx = store.ptspRecords.findIndex((r) => r.id === id);
    if (idx !== -1) {
      store.ptspRecords[idx] = updated;
    } else {
      store.ptspRecords = [updated, ...store.ptspRecords];
    }
    saveStore(store);

    const pool = mysqlPool || (await initXamppMySql());
    if (pool) {
      try {
        await upsertRecordToMySql(pool, updated);
      } catch (err) {
        console.error('MySQL update record error:', err);
      }
    }

    res.json({ record: updated });
  });

  app.get('/api/ptsp/surveys', async (_req: Request, res: Response) => {
    const pool = mysqlPool || (await initXamppMySql());
    if (pool) {
      try {
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT survey_json FROM ptsp_surveys ORDER BY created_at DESC'
        );
        const surveys = rows.map(
          (r) => JSON.parse(String(r.survey_json)) as PtspSurveyEntry
        );
        store.ptspSurveys = surveys;
        res.json({ surveys, storage: 'xampp_mysql' });
        return;
      } catch (err) {
        console.error('MySQL read surveys error:', err);
      }
    }
    res.json({ surveys: store.ptspSurveys, storage: 'local_json' });
  });

  app.post('/api/ptsp/surveys', async (req: Request, res: Response) => {
    const incoming = req.body as PtspSurveyEntry;
    if (!incoming || !incoming.id) {
      res.status(400).json({ error: 'Data survei kepuasan tidak lengkap.' });
      return;
    }

    store.ptspSurveys = [
      incoming,
      ...store.ptspSurveys.filter((s) => s.id !== incoming.id),
    ];
    saveStore(store);

    const pool = mysqlPool || (await initXamppMySql());
    if (pool) {
      try {
        await insertSurveyToMySql(pool, incoming);
      } catch (err) {
        console.error('MySQL insert survey error:', err);
      }
    }

    res.status(201).json({ survey: incoming });
  });

  // Export live SQL dump for direct import into XAMPP phpMyAdmin
  app.get('/api/ptsp/export-sql', (_req: Request, res: Response) => {
    const lines: string[] = [
      '-- ============================================================================',
      '-- DUMP SQL DATABASE PTSP BAWASLU KABUPATEN SUBANG (UNTUK XAMPP / phpMyAdmin)',
      `-- Waktu Ekspor: ${new Date().toISOString()}`,
      '-- ============================================================================',
      '',
      'CREATE DATABASE IF NOT EXISTS `db_ptsp_bawaslu_subang` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
      'USE `db_ptsp_bawaslu_subang`;',
      '',
      'CREATE TABLE IF NOT EXISTS `ptsp_records` (',
      '  `id` VARCHAR(64) NOT NULL PRIMARY KEY,',
      '  `registration_number` VARCHAR(100) NOT NULL,',
      '  `received_date` VARCHAR(50) NOT NULL,',
      '  `full_name` VARCHAR(150) NOT NULL,',
      '  `nik_or_identity` VARCHAR(64) NOT NULL,',
      '  `institution` VARCHAR(150) DEFAULT \'\',',
      '  `phone` VARCHAR(50) DEFAULT \'\',',
      '  `email` VARCHAR(120) DEFAULT \'\',',
      '  `service_types` TEXT NOT NULL,',
      '  `purpose_summary` TEXT NOT NULL,',
      '  `completion_status` VARCHAR(64) NOT NULL DEFAULT \'menunggu_verifikasi\',',
      '  `ptsp_officer_name` VARCHAR(150) DEFAULT \'\',',
      '  `handling_unit` VARCHAR(150) DEFAULT \'\',',
      '  `record_json` LONGTEXT NOT NULL,',
      '  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,',
      '  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;',
      '',
      'CREATE TABLE IF NOT EXISTS `ptsp_surveys` (',
      '  `id` VARCHAR(64) NOT NULL PRIMARY KEY,',
      '  `respondent_name` VARCHAR(150) NOT NULL,',
      '  `survey_date` VARCHAR(50) NOT NULL,',
      '  `service_type` VARCHAR(80) NOT NULL,',
      '  `overall_satisfaction` VARCHAR(40) NOT NULL,',
      '  `q1_prosedur` TINYINT NOT NULL DEFAULT 4,',
      '  `q2_persyaratan` TINYINT NOT NULL DEFAULT 4,',
      '  `q3_kecepatan` TINYINT NOT NULL DEFAULT 4,',
      '  `q4_kompetensi` TINYINT NOT NULL DEFAULT 4,',
      '  `q5_sikap` TINYINT NOT NULL DEFAULT 4,',
      '  `q6_kesesuaian` TINYINT NOT NULL DEFAULT 4,',
      '  `q7_sarana` TINYINT NOT NULL DEFAULT 4,',
      '  `q8_pengaduan` TINYINT NOT NULL DEFAULT 4,',
      '  `survey_feedback` TEXT,',
      '  `survey_json` LONGTEXT NOT NULL,',
      '  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
      ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;',
      '',
    ];

    for (const rec of store.ptspRecords) {
      const serviceText = rec.serviceTypes
        .map((s) => PTSP_SERVICE_TYPE_LABELS[s] || s)
        .join(', ');
      lines.push(
        `REPLACE INTO \`ptsp_records\` (\`id\`, \`registration_number\`, \`received_date\`, \`full_name\`, \`nik_or_identity\`, \`institution\`, \`phone\`, \`email\`, \`service_types\`, \`purpose_summary\`, \`completion_status\`, \`ptsp_officer_name\`, \`handling_unit\`, \`record_json\`) VALUES (${sqlEscape(
          rec.id
        )}, ${sqlEscape(rec.registrationNumber)}, ${sqlEscape(
          rec.receivedDate || rec.dayAndDate
        )}, ${sqlEscape(rec.fullName)}, ${sqlEscape(
          rec.nikOrIdentity
        )}, ${sqlEscape(rec.institution)}, ${sqlEscape(rec.phoneWhatsapp)}, ${sqlEscape(
          rec.email
        )}, ${sqlEscape(serviceText)}, ${sqlEscape(
          rec.purposeSummary
        )}, ${sqlEscape(rec.completionStatus)}, ${sqlEscape(
          rec.ptspOfficerName
        )}, ${sqlEscape(rec.handlingUnit)}, ${sqlEscape(
          JSON.stringify(rec)
        )});`
      );
    }

    lines.push('');

    for (const srv of store.ptspSurveys) {
      lines.push(
        `REPLACE INTO \`ptsp_surveys\` (\`id\`, \`respondent_name\`, \`survey_date\`, \`service_type\`, \`overall_satisfaction\`, \`q1_prosedur\`, \`q2_persyaratan\`, \`q3_kecepatan\`, \`q4_kompetensi\`, \`q5_sikap\`, \`q6_kesesuaian\`, \`q7_sarana\`, \`q8_pengaduan\`, \`survey_feedback\`, \`survey_json\`) VALUES (${sqlEscape(
          srv.id
        )}, ${sqlEscape(srv.respondentName)}, ${sqlEscape(
          srv.surveyDate
        )}, ${sqlEscape(srv.serviceType)}, ${sqlEscape(
          srv.overallSatisfaction
        )}, ${Number(srv.surveyScores.q1_prosedur)}, ${Number(
          srv.surveyScores.q2_persyaratan
        )}, ${Number(srv.surveyScores.q3_kecepatan)}, ${Number(
          srv.surveyScores.q4_kompetensi
        )}, ${Number(srv.surveyScores.q5_sikap)}, ${Number(
          srv.surveyScores.q6_kesesuaian
        )}, ${Number(srv.surveyScores.q7_sarana)}, ${Number(
          srv.surveyScores.q8_pengaduan
        )}, ${sqlEscape(srv.surveyFeedback)}, ${sqlEscape(
          JSON.stringify(srv)
        )});`
      );
    }

    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="db_ptsp_bawaslu_subang_xampp.sql"'
    );
    res.send(lines.join('\n'));
  });

  // Vite middleware for development vs static serving for production
  if (process.env.NODE_ENV !== 'production') {
    process.env.DISABLE_HMR = 'true';
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const startListening = (portToTry: number) => {
    const httpServer = app.listen(portToTry, '0.0.0.0', () => {
      console.log(
        `\n==================================================================`
      );
      console.log(
        `Server PTSP Bawaslu Kabupaten Subang berhasil berjalan!`
      );
      console.log(
        `Buka di Browser Anda: http://localhost:${portToTry}`
      );
      console.log(
        `==================================================================\n`
      );
    });

    httpServer.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && portToTry < 3010) {
        console.log(
          `[INFO] Port ${portToTry} sedang terpakai, mengalihkan otomatis ke port ${
            portToTry + 1
          }...`
        );
        startListening(portToTry + 1);
      } else {
        console.error('Gagal menjalankan server:', err.message);
      }
    });
  };

  startListening(PORT);
}

startServer();
