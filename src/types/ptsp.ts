export type PtspFormCode =
  | 'formulir_1'
  | 'formulir_2'
  | 'formulir_3'
  | 'formulir_4'
  | 'formulir_5'
  | 'formulir_lampiran';

export type PtspServiceType =
  | 'ppid'
  | 'permohonan_data_dokumen'
  | 'konsultasi_kepemiluan'
  | 'pengaduan_pelayanan_publik'
  | 'aspirasi_saran_masukan'
  | 'konsultasi_bantuan_hukum'
  | 'pelaporan_dugaan_pelanggaran'
  | 'informasi_penanganan_pelanggaran'
  | 'informasi_penyelesaian_sengketa'
  | 'administrasi_persuratan'
  | 'permohonan_audiensi'
  | 'kehumasan_dokumentasi'
  | 'lainnya';

export type PtspSupportingDocType =
  | 'fotokopi_identitas'
  | 'surat_permohonan_resmi'
  | 'dokumen_pendukung'
  | 'bukti_dokumentasi'
  | 'dokumen_lainnya';

export type PtspVerificationCheck =
  | 'identitas_diperiksa'
  | 'formulir_diisi'
  | 'dokumen_tersedia'
  | 'substansi_diidentifikasi'
  | 'perlu_dilengkapi'
  | 'diteruskan_unit_terkait';

export type PtspDispositionTarget =
  | 'ketua_bawaslu'
  | 'kepala_sekretariat'
  | 'divisi_pp_datin'
  | 'divisi_pencegahan_parmas_humas'
  | 'divisi_hukum_sengketa'
  | 'ppid_bawaslu'
  | 'sekretariat_administrasi'
  | 'unit_lainnya';

export type PtspInitialStatus =
  | 'diterima'
  | 'dalam_verifikasi'
  | 'perlu_kelengkapan_dokumen'
  | 'diteruskan_unit_terkait';

export type PtspCompletionStatus =
  | 'menunggu_verifikasi'
  | 'dalam_proses'
  | 'menunggu_kelengkapan_dokumen'
  | 'telah_dikoordinasikan'
  | 'selesai'
  | 'diteruskan_instansi_berwenang'
  | 'tidak_dapat_diproses';

export type PtspOverallSatisfaction =
  | 'sangat_puas'
  | 'puas'
  | 'kurang_puas'
  | 'tidak_puas';

export interface PtspRecord {
  id: string;
  createdAt: string;

  // FORMULIR 1: PENDAFTARAN PELAYANAN PTSP
  registrationNumber: string;
  dayAndDate: string;
  fullName: string;
  nikOrIdentity: string;
  institution: string;
  position: string;
  address: string;
  phoneWhatsapp: string;
  email: string;
  serviceTypes: PtspServiceType[];
  serviceOtherText: string;
  purposeSummary: string;
  supportingDocTypes: PtspSupportingDocType[];
  supportingDocOtherText: string;
  applicantSignature?: string;

  // FORMULIR 2: LEMBAR PENERIMAAN DAN VERIFIKASI PETUGAS PTSP
  receivedDate: string;
  receivedTime: string;
  ptspOfficerName: string;
  verificationChecks: PtspVerificationCheck[];
  verificationNotes: string;
  dispositionTargets: PtspDispositionTarget[];
  dispositionOtherText: string;
  dispositionNotes: string;
  ptspOfficerSignature?: string;
  dispositionReceiverName: string;
  dispositionReceiverSignature?: string;

  // FORMULIR 3: TANDA TERIMA PERMOHONAN PELAYANAN
  initialStatus: PtspInitialStatus;
  receiptRemarks: string;
  receiptDateText: string;

  // FORMULIR 4: MONITORING DAN PENYELESAIAN PELAYANAN
  handlingUnit: string;
  forwardedDate: string;
  personInCharge: string;
  completionDate: string;
  completionStatus: PtspCompletionStatus;
  followUpResult: string;
  notesToApplicant: string;
  unitOfficerName: string;
  unitOfficerSignature?: string;

  // FORMULIR 5: SURVEI KEPUASAN MASYARAKAT TERHADAP PELAYANAN PTSP
  surveyDate: string;
  surveyScores: {
    q1_prosedur: 1 | 2 | 3 | 4;
    q2_persyaratan: 1 | 2 | 3 | 4;
    q3_kecepatan: 1 | 2 | 3 | 4;
    q4_kompetensi: 1 | 2 | 3 | 4;
    q5_sikap: 1 | 2 | 3 | 4;
    q6_kesesuaian: 1 | 2 | 3 | 4;
    q7_sarana: 1 | 2 | 3 | 4;
    q8_pengaduan: 1 | 2 | 3 | 4;
  };
  surveyFeedback: string;
  overallSatisfaction: PtspOverallSatisfaction;
}

export const PTSP_FORM_LIST: {
  code: PtspFormCode;
  shortTitle: string;
  fullTitle: string;
  pagesText: string;
  officerOnlyEdit?: boolean;
}[] = [
  {
    code: 'formulir_1',
    shortTitle: 'Pendaftaran PTSP',
    fullTitle: 'Pendaftaran Pelayanan PTSP',
    pagesText: '',
  },
  {
    code: 'formulir_2',
    shortTitle: 'Verifikasi Petugas',
    fullTitle: 'Lembar Penerimaan dan Verifikasi Petugas PTSP',
    pagesText: '',
    officerOnlyEdit: true,
  },
  {
    code: 'formulir_3',
    shortTitle: 'Tanda Terima',
    fullTitle: 'Tanda Terima Permohonan Pelayanan',
    pagesText: '',
    officerOnlyEdit: true,
  },
  {
    code: 'formulir_4',
    shortTitle: 'Monitoring Pelayanan',
    fullTitle: 'Monitoring dan Penyelesaian Pelayanan',
    pagesText: '',
    officerOnlyEdit: true,
  },
  {
    code: 'formulir_5',
    shortTitle: 'Survei Kepuasan',
    fullTitle: 'Survei Kepuasan Masyarakat Terhadap Pelayanan PTSP',
    pagesText: '',
  },
  {
    code: 'formulir_lampiran',
    shortTitle: 'Pedoman & Register',
    fullTitle: 'Pedoman Pengelolaan Dokumen & Register Harian PTSP',
    pagesText: '',
  },
];

export const PTSP_SERVICE_TYPE_LABELS: Record<PtspServiceType, string> = {
  ppid: 'Pelayanan Informasi Publik (PPID)',
  permohonan_data_dokumen: 'Permohonan Data dan Dokumen',
  konsultasi_kepemiluan: 'Konsultasi Kepemiluan dan Pengawasan Pemilu',
  pengaduan_pelayanan_publik: 'Pengaduan Pelayanan Publik',
  aspirasi_saran_masukan: 'Penyampaian Aspirasi, Saran, dan Masukan',
  konsultasi_bantuan_hukum: 'Konsultasi Bantuan Hukum',
  pelaporan_dugaan_pelanggaran: 'Pelaporan Dugaan Pelanggaran Pemilu',
  informasi_penanganan_pelanggaran: 'Informasi Penanganan Pelanggaran Pemilu',
  informasi_penyelesaian_sengketa: 'Informasi Penyelesaian Sengketa Proses Pemilu',
  administrasi_persuratan: 'Pelayanan Administrasi dan Persuratan',
  permohonan_audiensi: 'Permohonan Audiensi/Koordinasi',
  kehumasan_dokumentasi: 'Layanan Kehumasan dan Dokumentasi',
  lainnya: 'Layanan Lainnya',
};

export const PTSP_SUPPORTING_DOC_LABELS: Record<PtspSupportingDocType, string> = {
  fotokopi_identitas: 'Fotokopi identitas (apabila diperlukan)',
  surat_permohonan_resmi: 'Surat permohonan resmi',
  dokumen_pendukung: 'Dokumen pendukung',
  bukti_dokumentasi: 'Bukti atau dokumentasi',
  dokumen_lainnya: 'Dokumen lainnya',
};

export const PTSP_VERIFICATION_LABELS: Record<PtspVerificationCheck, string> = {
  identitas_diperiksa: 'Identitas pemohon telah diperiksa (jika dipersyaratkan)',
  formulir_diisi: 'Formulir telah diisi',
  dokumen_tersedia: 'Dokumen pendukung tersedia',
  substansi_diidentifikasi: 'Substansi permohonan telah diidentifikasi',
  perlu_dilengkapi: 'Permohonan perlu dilengkapi',
  diteruskan_unit_terkait: 'Permohonan diteruskan kepada unit kerja terkait',
};

export const PTSP_DISPOSITION_LABELS: Record<PtspDispositionTarget, string> = {
  ketua_bawaslu: 'Ketua Bawaslu Kabupaten Subang',
  kepala_sekretariat: 'Kepala Sekretariat',
  divisi_pp_datin: 'Divisi Penanganan Pelanggaran dan Data Informasi',
  divisi_pencegahan_parmas_humas:
    'Divisi Pencegahan, Partisipasi Masyarakat, dan Humas',
  divisi_hukum_sengketa: 'Divisi Hukum dan Penyelesaian Sengketa',
  ppid_bawaslu: 'PPID Bawaslu Kabupaten Subang',
  sekretariat_administrasi: 'Sekretariat/Bagian Administrasi',
  unit_lainnya: 'Unit kerja lainnya',
};

export const PTSP_INITIAL_STATUS_LABELS: Record<PtspInitialStatus, string> = {
  diterima: 'Diterima',
  dalam_verifikasi: 'Dalam verifikasi',
  perlu_kelengkapan_dokumen: 'Perlu kelengkapan dokumen',
  diteruskan_unit_terkait: 'Diteruskan kepada unit kerja terkait',
};

export const PTSP_COMPLETION_STATUS_LABELS: Record<
  PtspCompletionStatus,
  string
> = {
  menunggu_verifikasi: 'Menunggu verifikasi',
  dalam_proses: 'Dalam proses',
  menunggu_kelengkapan_dokumen: 'Menunggu kelengkapan dokumen',
  telah_dikoordinasikan: 'Telah dikoordinasikan',
  selesai: 'Selesai',
  diteruskan_instansi_berwenang: 'Diteruskan kepada instansi/unit berwenang',
  tidak_dapat_diproses: 'Tidak dapat diproses (disertai alasan)',
};

export const PTSP_SURVEY_QUESTIONS: {
  key: keyof PtspRecord['surveyScores'];
  no: number;
  label: string;
}[] = [
  { key: 'q1_prosedur', no: 1, label: 'Kemudahan prosedur pelayanan' },
  { key: 'q2_persyaratan', no: 2, label: 'Kejelasan persyaratan pelayanan' },
  { key: 'q3_kecepatan', no: 3, label: 'Kecepatan waktu pelayanan' },
  { key: 'q4_kompetensi', no: 4, label: 'Kompetensi petugas pelayanan' },
  { key: 'q5_sikap', no: 5, label: 'Sikap dan keramahan petugas' },
  {
    key: 'q6_kesesuaian',
    no: 6,
    label: 'Kesesuaian pelayanan dengan prosedur',
  },
  { key: 'q7_sarana', no: 7, label: 'Sarana dan prasarana pelayanan' },
  { key: 'q8_pengaduan', no: 8, label: 'Penanganan pengaduan dan masukan' },
];

export const PTSP_OVERALL_SATISFACTION_LABELS: Record<
  PtspOverallSatisfaction,
  string
> = {
  sangat_puas: 'Sangat Puas',
  puas: 'Puas',
  kurang_puas: 'Kurang Puas',
  tidak_puas: 'Tidak Puas',
};

export const INITIAL_PTSP_RECORDS: PtspRecord[] = [
  {
    id: 'PTSP-2026-001',
    createdAt: '2026-11-02T09:00:00+07:00',
    registrationNumber: '001/PTSP/686138/XI/2026',
    dayAndDate: 'Senin, 2 November 2026',
    fullName: 'H. Dedi Kurniawan, S.H.',
    nikOrIdentity: '3213031405780002',
    institution: 'DPD Partai Persatuan Demokrasi Kabupaten Subang',
    position: 'Wakil Ketua Bidang Hukum & Advokasi',
    address:
      'Jl. Otto Iskandardinata No. 114, Kel. Karanganyar, Kec. Subang, Kabupaten Subang',
    phoneWhatsapp: '0812-2345-6789',
    email: 'hukum.dpdsubang@parpol.or.id',
    serviceTypes: [
      'konsultasi_kepemiluan',
      'informasi_penyelesaian_sengketa',
    ],
    serviceOtherText: '',
    purposeSummary:
      'Permohonan konsultasi kepemiluan dan informasi prosedur penyelesaian sengketa proses Pemilu terkait tahapan pemutakhiran data partai politik berkelanjutan.',
    supportingDocTypes: [
      'fotokopi_identitas',
      'surat_permohonan_resmi',
      'dokumen_pendukung',
    ],
    supportingDocOtherText: '',
    receivedDate: '2 November 2026',
    receivedTime: '09.15 WIB',
    ptspOfficerName: 'Rina Kartika, S.I.P.',
    verificationChecks: [
      'identitas_diperiksa',
      'formulir_diisi',
      'dokumen_tersedia',
      'substansi_diidentifikasi',
      'diteruskan_unit_terkait',
    ],
    verificationNotes:
      'Berkas permohonan lengkap beserta surat tugas instansi dan fotokopi KTP-el.',
    dispositionTargets: ['divisi_hukum_sengketa'],
    dispositionOtherText: '',
    dispositionNotes:
      'Diteruskan ke Divisi Hukum dan Penyelesaian Sengketa untuk fasilitasi konsultasi.',
    dispositionReceiverName: 'H. Imanudin, S.H., M.H.',
    initialStatus: 'diteruskan_unit_terkait',
    receiptRemarks:
      'Berkas telah diterima lengkap dan diteruskan kepada Divisi Hukum dan Penyelesaian Sengketa.',
    receiptDateText: '2 November 2026',
    handlingUnit: 'Divisi Hukum dan Penyelesaian Sengketa',
    forwardedDate: '2 November 2026',
    personInCharge: 'H. Imanudin, S.H., M.H.',
    completionDate: '3 November 2026',
    completionStatus: 'selesai',
    followUpResult:
      'Telah dilaksanakan layanan konsultasi dan pemberian penjelasan teknis terkait mekanisme penyelesaian sengketa proses Pemilu.',
    notesToApplicant:
      'Pemohon dapat mengajukan permohonan informasi lanjutan melalui PTSP apabila diperlukan.',
    unitOfficerName: 'H. Imanudin, S.H., M.H.',
    surveyDate: '3 November 2026',
    surveyScores: {
      q1_prosedur: 4,
      q2_persyaratan: 4,
      q3_kecepatan: 4,
      q4_kompetensi: 4,
      q5_sikap: 4,
      q6_kesesuaian: 4,
      q7_sarana: 4,
      q8_pengaduan: 4,
    },
    surveyFeedback:
      'Pelayanan PTSP Bawaslu Kabupaten Subang sangat tertib, cepat, dan informatif.',
    overallSatisfaction: 'sangat_puas',
  },
  {
    id: 'PTSP-2026-002',
    createdAt: '2026-11-04T10:20:00+07:00',
    registrationNumber: '002/PTSP/686138/XI/2026',
    dayAndDate: 'Rabu, 4 November 2026',
    fullName: 'Nadia Putri Lestari, S.I.Kom.',
    nikOrIdentity: '3213014809960004',
    institution: 'Jaringan Pemantau Demokrasi Subang',
    position: 'Koordinator Riset & Data',
    address:
      'Jl. Darmodiharjo No. 18, Kel. Sukamelang, Kec. Subang, Kabupaten Subang',
    phoneWhatsapp: '0857-2233-4455',
    email: 'nadia.lestari@jpds-subang.or.id',
    serviceTypes: ['ppid', 'permohonan_data_dokumen'],
    serviceOtherText: '',
    purposeSummary:
      'Permohonan informasi publik dan salinan data rekapitulasi kegiatan pencegahan serta sosialisasi pengawasan partisipatif tahun berjalan.',
    supportingDocTypes: ['fotokopi_identitas', 'surat_permohonan_resmi'],
    supportingDocOtherText: '',
    receivedDate: '4 November 2026',
    receivedTime: '10.30 WIB',
    ptspOfficerName: 'Rina Kartika, S.I.P.',
    verificationChecks: [
      'identitas_diperiksa',
      'formulir_diisi',
      'dokumen_tersedia',
      'substansi_diidentifikasi',
      'diteruskan_unit_terkait',
    ],
    verificationNotes:
      'Identitas pemohon dan surat permohonan resmi organisasi telah diverifikasi.',
    dispositionTargets: [
      'ppid_bawaslu',
      'divisi_pencegahan_parmas_humas',
    ],
    dispositionOtherText: '',
    dispositionNotes:
      'Mohon PPID bersama Divisi Pencegahan, Parmas, dan Humas menyiapkan dokumen informasi yang dimohonkan sesuai ketentuan Perbawaslu PPID.',
    dispositionReceiverName: 'Petugas Layanan PPID',
    initialStatus: 'dalam_verifikasi',
    receiptRemarks:
      'Permohonan sedang dikoordinasikan bersama Pejabat Pengelola Informasi dan Dokumentasi (PPID).',
    receiptDateText: '4 November 2026',
    handlingUnit: 'PPID Bawaslu Kabupaten Subang',
    forwardedDate: '4 November 2026',
    personInCharge: 'Koordinator PPID Bawaslu Kabupaten Subang',
    completionDate: '-',
    completionStatus: 'dalam_proses',
    followUpResult:
      'Sedang dalam tahap penyiapan salinan dokumen informasi publik yang dimohonkan.',
    notesToApplicant:
      'Pemberitahuan tertulis akan disampaikan sesuai jangka waktu pelayanan informasi publik.',
    unitOfficerName: 'Staf Pelaksana PPID',
    surveyDate: '4 November 2026',
    surveyScores: {
      q1_prosedur: 4,
      q2_persyaratan: 4,
      q3_kecepatan: 3,
      q4_kompetensi: 4,
      q5_sikap: 4,
      q6_kesesuaian: 4,
      q7_sarana: 4,
      q8_pengaduan: 4,
    },
    surveyFeedback:
      'Alur penerimaan di meja PTSP sangat jelas dan petugas ramah.',
    overallSatisfaction: 'puas',
  },
  {
    id: 'PTSP-2026-003',
    createdAt: '2026-11-06T08:45:00+07:00',
    registrationNumber: '003/PTSP/686138/XI/2026',
    dayAndDate: 'Jumat, 6 November 2026',
    fullName: 'Drs. Bambang Suryono, M.Si.',
    nikOrIdentity: '3213071904710001',
    institution: 'Fakultas Ilmu Sosial & Ilmu Politik Universitas Subang',
    position: 'Dosen & Peneliti Kepemiluan',
    address:
      'Jl. R.A. Kartini KM 3, Desa Nyimplung, Kec. Pasirkareumbi, Kabupaten Subang',
    phoneWhatsapp: '0813-9876-5432',
    email: 'bambang.suryono@unsub.ac.id',
    serviceTypes: ['permohonan_audiensi', 'permohonan_data_dokumen'],
    serviceOtherText: '',
    purposeSummary:
      'Permohonan audiensi akademik dan permintaan narasumber terkait pengawasan partisipatif mahasiswa pada Pemilihan Umum.',
    supportingDocTypes: ['fotokopi_identitas', 'surat_permohonan_resmi'],
    supportingDocOtherText: '',
    receivedDate: '6 November 2026',
    receivedTime: '08.50 WIB',
    ptspOfficerName: 'Rina Kartika, S.I.P.',
    verificationChecks: ['identitas_diperiksa', 'formulir_diisi'],
    verificationNotes:
      'Berkas baru diterima di meja PTSP dan menunggu disposisi pimpinan.',
    dispositionTargets: [
      'ketua_bawaslu',
      'divisi_pencegahan_parmas_humas',
    ],
    dispositionOtherText: '',
    dispositionNotes: '',
    dispositionReceiverName: '',
    initialStatus: 'diterima',
    receiptRemarks: 'Menunggu jadwal audiensi dari pimpinan Bawaslu Kabupaten Subang.',
    receiptDateText: '6 November 2026',
    handlingUnit: 'Divisi Pencegahan, Parmas, dan Humas',
    forwardedDate: '6 November 2026',
    personInCharge: 'Koordinator Divisi Pencegahan, Parmas, dan Humas',
    completionDate: '-',
    completionStatus: 'menunggu_verifikasi',
    followUpResult: '',
    notesToApplicant: '',
    unitOfficerName: '',
    surveyDate: '6 November 2026',
    surveyScores: {
      q1_prosedur: 4,
      q2_persyaratan: 4,
      q3_kecepatan: 4,
      q4_kompetensi: 4,
      q5_sikap: 4,
      q6_kesesuaian: 4,
      q7_sarana: 4,
      q8_pengaduan: 4,
    },
    surveyFeedback: 'Pendaftaran melalui PTSP mudah dipahami.',
    overallSatisfaction: 'sangat_puas',
  },
  {
    id: 'PTSP-2026-004',
    createdAt: '2026-11-07T13:30:00+07:00',
    registrationNumber: '004/PTSP/686138/XI/2026',
    dayAndDate: 'Sabtu, 7 November 2026',
    fullName: 'Rizky Pratama Putra',
    nikOrIdentity: '3213120511990003',
    institution: 'Forum Warga Peduli Pemilu Pamanukan',
    position: 'Koordinator Lapangan',
    address: 'Dusun Krajan RT 003/RW 001, Desa Pamanukan, Kec. Pamanukan, Kabupaten Subang',
    phoneWhatsapp: '0821-1122-3344',
    email: 'rizky.pamanukan@gmail.com',
    serviceTypes: [
      'informasi_penanganan_pelanggaran',
      'aspirasi_saran_masukan',
    ],
    serviceOtherText: '',
    purposeSummary:
      'Permohonan informasi tata cara penyampaian laporan dugaan pelanggaran serta penyampaian saran pengawasan di wilayah Kecamatan Pamanukan.',
    supportingDocTypes: [
      'fotokopi_identitas',
      'dokumen_pendukung',
      'bukti_dokumentasi',
    ],
    supportingDocOtherText: '',
    receivedDate: '7 November 2026',
    receivedTime: '13.40 WIB',
    ptspOfficerName: 'Rina Kartika, S.I.P.',
    verificationChecks: [
      'identitas_diperiksa',
      'formulir_diisi',
      'dokumen_tersedia',
      'substansi_diidentifikasi',
      'diteruskan_unit_terkait',
    ],
    verificationNotes:
      'Telah diverifikasi lengkap dan diteruskan ke Divisi Penanganan Pelanggaran dan Data/Informasi.',
    dispositionTargets: ['divisi_pp_datin'],
    dispositionOtherText: '',
    dispositionNotes:
      'Berikan layanan informasi alur penanganan pelanggaran sesuai Perbawaslu.',
    dispositionReceiverName: 'Staf Divisi PP dan Datin',
    initialStatus: 'diteruskan_unit_terkait',
    receiptRemarks: 'Layanan informasi telah diberikan pada hari yang sama.',
    receiptDateText: '7 November 2026',
    handlingUnit: 'Divisi Penanganan Pelanggaran dan Data/Informasi',
    forwardedDate: '7 November 2026',
    personInCharge: 'Koordinator Divisi PP dan Datin',
    completionDate: '7 November 2026',
    completionStatus: 'selesai',
    followUpResult:
      'Pemohon telah memperoleh penjelasan lengkap mengenai syarat formil dan materiil laporan dugaan pelanggaran Pemilu.',
    notesToApplicant: 'Terima kasih atas partisipasi pengawasan masyarakat.',
    unitOfficerName: 'Staf Teknis Divisi PP dan Datin',
    surveyDate: '7 November 2026',
    surveyScores: {
      q1_prosedur: 4,
      q2_persyaratan: 4,
      q3_kecepatan: 4,
      q4_kompetensi: 4,
      q5_sikap: 4,
      q6_kesesuaian: 4,
      q7_sarana: 4,
      q8_pengaduan: 4,
    },
    surveyFeedback: 'Sangat terbantu dengan penjelasan petugas PTSP.',
    overallSatisfaction: 'sangat_puas',
  },
];

export interface PtspSurveyEntry {
  id: string;
  createdAt: string;
  respondentName: string;
  surveyDate: string;
  serviceType: PtspServiceType;
  surveyScores: {
    q1_prosedur: 1 | 2 | 3 | 4;
    q2_persyaratan: 1 | 2 | 3 | 4;
    q3_kecepatan: 1 | 2 | 3 | 4;
    q4_kompetensi: 1 | 2 | 3 | 4;
    q5_sikap: 1 | 2 | 3 | 4;
    q6_kesesuaian: 1 | 2 | 3 | 4;
    q7_sarana: 1 | 2 | 3 | 4;
    q8_pengaduan: 1 | 2 | 3 | 4;
  };
  surveyFeedback: string;
  overallSatisfaction: PtspOverallSatisfaction;
}

export const INITIAL_PTSP_SURVEYS: PtspSurveyEntry[] = [
  {
    id: 'SKM-2026-001',
    createdAt: '2026-11-02T10:15:00+07:00',
    respondentName: 'H. Dedi Kurniawan, S.H.',
    surveyDate: '2 November 2026',
    serviceType: 'ppid',
    surveyScores: {
      q1_prosedur: 4,
      q2_persyaratan: 4,
      q3_kecepatan: 4,
      q4_kompetensi: 4,
      q5_sikap: 4,
      q6_kesesuaian: 4,
      q7_sarana: 4,
      q8_pengaduan: 4,
    },
    surveyFeedback:
      'Pelayanan informasi publik dan sistem PTSP Bawaslu Kabupaten Subang sangat cepat, transparan, dan informatif.',
    overallSatisfaction: 'sangat_puas',
  },
  {
    id: 'SKM-2026-002',
    createdAt: '2026-11-04T14:30:00+07:00',
    respondentName: 'Nadia Putri Lestari, S.I.Kom.',
    surveyDate: '4 November 2026',
    serviceType: 'konsultasi_kepemiluan',
    surveyScores: {
      q1_prosedur: 4,
      q2_persyaratan: 4,
      q3_kecepatan: 3,
      q4_kompetensi: 4,
      q5_sikap: 4,
      q6_kesesuaian: 4,
      q7_sarana: 3,
      q8_pengaduan: 4,
    },
    surveyFeedback:
      'Alur sistem pelayanan sangat rapi dan memudahkan pemohon dalam menyampaikan permohonan konsultasi.',
    overallSatisfaction: 'sangat_puas',
  },
  {
    id: 'SKM-2026-003',
    createdAt: '2026-11-06T11:20:00+07:00',
    respondentName: 'Drs. Bambang Suryono, M.Si.',
    surveyDate: '6 November 2026',
    serviceType: 'permohonan_audiensi',
    surveyScores: {
      q1_prosedur: 4,
      q2_persyaratan: 4,
      q3_kecepatan: 4,
      q4_kompetensi: 4,
      q5_sikap: 4,
      q6_kesesuaian: 4,
      q7_sarana: 4,
      q8_pengaduan: 4,
    },
    surveyFeedback: 'Pendaftaran melalui sistem PTSP mudah dipahami dan responsif.',
    overallSatisfaction: 'sangat_puas',
  },
  {
    id: 'SKM-2026-004',
    createdAt: '2026-11-07T15:00:00+07:00',
    respondentName: 'Rizky Pratama Putra',
    surveyDate: '7 November 2026',
    serviceType: 'informasi_penanganan_pelanggaran',
    surveyScores: {
      q1_prosedur: 4,
      q2_persyaratan: 3,
      q3_kecepatan: 4,
      q4_kompetensi: 4,
      q5_sikap: 4,
      q6_kesesuaian: 4,
      q7_sarana: 4,
      q8_pengaduan: 4,
    },
    surveyFeedback:
      'Sangat terbantu dengan kejelasan informasi dan kinerja petugas PTSP.',
    overallSatisfaction: 'puas',
  },
];
