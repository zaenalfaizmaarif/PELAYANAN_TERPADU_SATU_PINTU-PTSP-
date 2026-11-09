export type ApplicantCategory =
  | 'partai_politik'
  | 'calon_dpr_dprd'
  | 'calon_dpd'
  | 'pemangku_lainnya';

export type AttendanceType = 'pribadi' | 'mewakili';

export type IssueStage =
  | 'pendaftaran_verifikasi_parpol'
  | 'pemutakhiran_data_parpol'
  | 'pencalonan'
  | 'kampanye'
  | 'mekanisme_permohonan_sengketa'
  | 'lainnya';

export type ServiceMethod = 'tatap_muka' | 'daring' | 'telepon';

export type SubmissionStatus =
  | 'Menunggu Verifikasi'
  | 'Terjadwal'
  | 'Selesai Konsultasi';

export interface SupportingDocument {
  id: string;
  label: string;
  fileName?: string;
  fileSize?: string;
}

export interface OfficerSectionE {
  receivedDateTime: string;
  registerNumber: string;
  consultationSchedule: string;
  consultationExecutor: string;
  chairmanNotes: string;
  receivingOfficerName: string;
  receivingOfficerNipNik: string;
  receivingOfficerSignature?: string;
}

export interface MediationRequestMC01 {
  id: string;
  createdAt: string;
  status: SubmissionStatus;

  // Header
  registerNumber: string; // e.g., "001/MC/686138/XI/2026"

  // A. IDENTITAS PEMOHON
  fullName: string;
  nik: string;
  category: ApplicantCategory;
  categoryOtherText: string;
  institutionName: string;
  positionTitle: string;
  attendanceType: AttendanceType;
  mandateFileName?: string;
  address: string;
  phoneWhatsapp: string;
  email: string;

  // B. POKOK PERSOALAN YANG DIKONSULTASIKAN
  issueStages: IssueStage[];
  issueOtherText: string;
  issueSummary: string;
  disputedDecisionObject: string;
  supportingDocuments: SupportingDocument[];

  // C. METODE DAN JADWAL LAYANAN YANG DIHARAPKAN
  serviceMethod: ServiceMethod;
  expectedDate: string; // YYYY-MM-DD
  expectedTime: string; // HH:mm
  expectedScheduleFormatted: string;

  // D. PERNYATAAN PEMOHON
  statementAgreed: boolean;
  signingDateFormatted: string;
  applicantSignature?: string;

  // E. DIISI OLEH PETUGAS
  officerData: OfficerSectionE;
}

export const CATEGORY_LABELS: Record<ApplicantCategory, string> = {
  partai_politik: 'Partai politik peserta/calon peserta Pemilu',
  calon_dpr_dprd:
    'Bakal calon/calon anggota DPR, DPRD Provinsi, atau DPRD Kabupaten/Kota',
  calon_dpd: 'Bakal calon/calon anggota DPD',
  pemangku_lainnya: 'Pemangku kepentingan lainnya',
};

export const ATTENDANCE_LABELS: Record<AttendanceType, string> = {
  pribadi: 'Atas nama pribadi',
  mewakili:
    'Mewakili partai politik/lembaga (melampirkan surat tugas/mandat)',
};

export const ISSUE_STAGE_LABELS: Record<IssueStage, string> = {
  pendaftaran_verifikasi_parpol: 'Pendaftaran dan verifikasi partai politik',
  pemutakhiran_data_parpol: 'Pemutakhiran Data Partai Politik Berkelanjutan',
  pencalonan: 'Pencalonan',
  kampanye: 'Kampanye',
  mekanisme_permohonan_sengketa:
    'Mekanisme pengajuan permohonan penyelesaian sengketa',
  lainnya: 'Lainnya',
};

export const SERVICE_METHOD_LABELS: Record<ServiceMethod, string> = {
  tatap_muka: 'Tatap muka',
  daring: 'Daring',
  telepon: 'Telepon',
};

export const INITIAL_MEDIATION_REQUESTS: MediationRequestMC01[] = [
  {
    id: 'MC-2026-001',
    createdAt: '2026-10-28T09:15:00+07:00',
    status: 'Selesai Konsultasi',
    registerNumber: '001/MC/686138/X/2026',
    fullName: 'H. Dedi Kurniawan, S.H.',
    nik: '3213031405780002',
    category: 'partai_politik',
    categoryOtherText: '',
    institutionName: 'DPD Partai Persatuan Demokrasi Kabupaten Subang',
    positionTitle: 'Wakil Ketua Bidang Hukum & Advokasi',
    attendanceType: 'mewakili',
    mandateFileName: 'Surat_Mandat_DPD_Subang_042.pdf',
    address:
      'Jl. Otto Iskandardinata No. 114, Kel. Karanganyar, Kec. Subang, Kabupaten Subang',
    phoneWhatsapp: '0812-2345-6789',
    email: 'hukum.dpdsubang@parpol.or.id',
    issueStages: ['pemutakhiran_data_parpol', 'mekanisme_permohonan_sengketa'],
    issueOtherText: '',
    issueSummary:
      'Konsultasi mengenai tata cara pemutakhiran data keanggotaan dan kepengurusan partai politik berkelanjutan pada aplikasi SIPOL semester II tahun 2026, serta langkah pencegahan potensi sengketa administrasi apabila terdapat perbedaan berita acara verifikasi faktual.',
    disputedDecisionObject:
      'Berita Acara Rekapitulasi Pemutakhiran Data Partai Politik Semester Berjalan',
    supportingDocuments: [
      {
        id: 'doc-1',
        label: 'Surat Tugas / Mandat Resmi DPD Partai No. 042/ST/X/2026',
        fileName: 'Surat_Mandat_DPD_Subang_042.pdf',
      },
      {
        id: 'doc-2',
        label: 'Salinan SK Kepengurusan Tingkat Kabupaten Subang',
        fileName: 'SK_Kepengurusan_Subang.pdf',
      },
      {
        id: 'doc-3',
        label: 'Tangkapan Layar Kendala Unggah Dokumen pada SIPOL',
        fileName: 'Bukti_Kendala_SIPOL.pdf',
      },
    ],
    serviceMethod: 'tatap_muka',
    expectedDate: '2026-10-29',
    expectedTime: '10:00',
    expectedScheduleFormatted: 'Kamis, 29 Oktober 2026 Pukul 10.00 WIB',
    statementAgreed: true,
    signingDateFormatted: '28 Oktober 2026',
    officerData: {
      receivedDateTime: '28 Oktober 2026, Pukul 09.30 WIB',
      registerNumber: '001/MC/686138/X/2026',
      consultationSchedule: 'Kamis, 29 Oktober 2026, Pukul 10.00 - 11.30 WIB (Ruang Mediation Clinic Bawaslu Subang)',
      consultationExecutor: 'Tim Fasilitasi Penyelesaian Sengketa — Divisi Hukum & Penyelesaian Sengketa',
      chairmanNotes:
        'Berikan penjelasan teknis sesuai Perbawaslu tentang Penyelesaian Sengketa Proses Pemilu serta panduan pencegahan kendala administrasi SIPOL.',
      receivingOfficerName: 'Rina Kartika, S.I.P.',
      receivingOfficerNipNik: '19910412 201902 2 004',
    },
  },
  {
    id: 'MC-2026-002',
    createdAt: '2026-10-30T13:40:00+07:00',
    status: 'Terjadwal',
    registerNumber: '002/MC/686138/X/2026',
    fullName: 'Irfan Maulana, S.Sos.',
    nik: '3213192208850001',
    category: 'calon_dpr_dprd',
    categoryOtherText: '',
    institutionName: 'Bakal Calon Anggota DPRD Kabupaten Subang Dapil Subang 3',
    positionTitle: 'Bakal Calon Anggota DPRD Kabupaten',
    attendanceType: 'pribadi',
    address:
      'Dusun Krajan RT 004/RW 002, Desa Pamanukan, Kec. Pamanukan, Kabupaten Subang',
    phoneWhatsapp: '0813-9876-5432',
    email: 'irfan.maulana.subang@gmail.com',
    issueStages: ['pencalonan', 'mekanisme_permohonan_sengketa'],
    issueOtherText: '',
    issueSummary:
      'Meminta penjelasan edukatif terkait kelengkapan dokumen syarat bakal calon serta batas tenggang waktu 3 (tiga) hari kerja pengajuan permohonan penyelesaian sengketa proses sejak diterbitkannya Keputusan KPU Kabupaten.',
    disputedDecisionObject: 'Belum ada (Konsultasi Pencegahan Tahap Pencalonan)',
    supportingDocuments: [
      {
        id: 'doc-2a',
        label: 'Fotokopi KTP-el Pemohon',
        fileName: 'KTP_Irfan_Maulana.pdf',
      },
      {
        id: 'doc-2b',
        label: 'Daftar Pertanyaan Pokok Konsultasi Persyaratan Pencalonan',
      },
      {
        id: 'doc-2c',
        label: '-',
      },
    ],
    serviceMethod: 'daring',
    expectedDate: '2026-11-03',
    expectedTime: '14:00',
    expectedScheduleFormatted: 'Selasa, 3 November 2026 Pukul 14.00 WIB',
    statementAgreed: true,
    signingDateFormatted: '30 Oktober 2026',
    officerData: {
      receivedDateTime: '30 Oktober 2026, Pukul 14.05 WIB',
      registerNumber: '002/MC/686138/X/2026',
      consultationSchedule: 'Selasa, 3 November 2026, Pukul 14.00 WIB (Zoom Meeting Mediation Clinic Bawaslu Subang)',
      consultationExecutor: 'Koordinator Divisi Hukum dan Penyelesaian Sengketa & Staf Teknis',
      chairmanNotes:
        'Fasilitasi secara daring dan sampaikan bahwa layanan bersifat konsultatif/edukatif serta tidak menunda tenggang waktu resmi pengajuan sengketa.',
      receivingOfficerName: 'Rina Kartika, S.I.P.',
      receivingOfficerNipNik: '19910412 201902 2 004',
    },
  },
  {
    id: 'MC-2026-003',
    createdAt: '2026-11-01T08:20:00+07:00',
    status: 'Menunggu Verifikasi',
    registerNumber: '003/MC/686138/XI/2026',
    fullName: 'Dr. Siti Nurhaliza, M.H.',
    nik: '3213015503820005',
    category: 'pemangku_lainnya',
    categoryOtherText: 'Lembaga Pemantau Pemilu & Akademisi Hukum Tata Negara',
    institutionName: 'Pusat Studi Demokrasi & Konstitusi Subang',
    positionTitle: 'Direktur Eksekutif',
    attendanceType: 'mewakili',
    mandateFileName: 'Surat_Tugas_PSDK_Subang.pdf',
    address:
      'Jl. Darmodiharjo No. 18, Kel. Sukamelang, Kec. Subang, Kabupaten Subang',
    phoneWhatsapp: '0857-1122-3344',
    email: 'sekretariat@psdk-subang.or.id',
    issueStages: ['kampanye', 'lainnya'],
    issueOtherText: 'Sosialisasi Pencegahan Sengketa Antar Peserta Pemilu (PSAP)',
    issueSummary:
      'Permohonan konsultasi terkait prosedur penyelesaian sengketa acara cepat pada tahapan kampanye (Sengketa Antar Peserta Pemilu) dan tata cara pelibatan pemantau terakreditasi dalam edukasi pencegahan sengketa.',
    disputedDecisionObject: '-',
    supportingDocuments: [
      {
        id: 'doc-3a',
        label: 'Surat Tugas Lembaga Pemantau No. 11/ST-PSDK/XI/2026',
        fileName: 'Surat_Tugas_PSDK_Subang.pdf',
      },
      {
        id: 'doc-3b',
        label: 'Kerangka Acuan Diskusi Pencegahan Sengketa Proses Pemilu',
        fileName: 'KAK_Konsultasi_MC.pdf',
      },
      {
        id: 'doc-3c',
        label: '-',
      },
    ],
    serviceMethod: 'tatap_muka',
    expectedDate: '2026-11-05',
    expectedTime: '09:30',
    expectedScheduleFormatted: 'Kamis, 5 November 2026 Pukul 09.30 WIB',
    statementAgreed: true,
    signingDateFormatted: '1 November 2026',
    officerData: {
      receivedDateTime: '',
      registerNumber: '003/MC/686138/XI/2026',
      consultationSchedule: '',
      consultationExecutor: '',
      chairmanNotes: '',
      receivingOfficerName: '',
      receivingOfficerNipNik: '',
    },
  },
];

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = Number(parts[0]);
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const d = new Date(year, monthIdx, day);
  if (isNaN(d.getTime())) return dateStr;
  return `${days[d.getDay()]}, ${day} ${months[monthIdx]} ${year}`;
}

export function formatShortIndonesianDate(dateStr: string): string {
  if (!dateStr) return '__________________ 2026';
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = Number(parts[0]);
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return `${day} ${months[monthIdx]} ${year}`;
}

export function getRomanMonth(monthNumber: number): string {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[Math.max(0, Math.min(11, monthNumber - 1))] || 'XI';
}
