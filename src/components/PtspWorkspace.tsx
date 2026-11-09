import React, { useState, useMemo } from 'react';
import {
  PtspRecord,
  PtspFormCode,
  PTSP_FORM_LIST,
  PTSP_SERVICE_TYPE_LABELS,
  PTSP_SUPPORTING_DOC_LABELS,
  PTSP_VERIFICATION_LABELS,
  PTSP_DISPOSITION_LABELS,
  PTSP_INITIAL_STATUS_LABELS,
  PTSP_COMPLETION_STATUS_LABELS,
  PTSP_SURVEY_QUESTIONS,
  PtspServiceType,
  PtspSupportingDocType,
  PtspVerificationCheck,
  PtspDispositionTarget,
  PtspInitialStatus,
  PtspCompletionStatus,
  PtspOverallSatisfaction,
  PtspSurveyEntry,
} from '../types/ptsp';
import { getRomanMonth } from '../types/mediation';
import { PtspOfficialSheets } from './PtspOfficialSheets';
import { SignaturePad } from './SignaturePad';
import { AuthenticatedOfficer } from './OfficerLoginGate';
import {
  Printer,
  Eye,
  Plus,
  CheckCircle2,
  Lock,
  Save,
  Download,
  RotateCcw,
} from 'lucide-react';

interface PtspWorkspaceProps {
  records: PtspRecord[];
  onSaveNewRecord: (rec: PtspRecord) => void;
  onUpdateRecord: (rec: PtspRecord) => void;
  authenticatedOfficer: AuthenticatedOfficer | null;
  onRequestOfficerLogin: () => void;
  externalFormCode?: PtspFormCode;
  onChangeFormCode?: (code: PtspFormCode) => void;
  workspaceRole?: 'applicant' | 'officer';
  selectedRecordIdExternal?: string;
  onChangeSelectedRecordId?: (id: string) => void;
  onSaveSurveyEntry?: (survey: PtspSurveyEntry) => void;
}

export const PtspWorkspace: React.FC<PtspWorkspaceProps> = ({
  records,
  onSaveNewRecord,
  onUpdateRecord,
  authenticatedOfficer,
  onRequestOfficerLogin,
  externalFormCode,
  onChangeFormCode,
  workspaceRole = 'applicant',
  selectedRecordIdExternal,
  onChangeSelectedRecordId,
  onSaveSurveyEntry,
}) => {
  const [internalFormCode, setInternalFormCode] = useState<PtspFormCode>(
    workspaceRole === 'officer' ? 'formulir_2' : 'formulir_1'
  );
  const activeFormCode = externalFormCode ?? internalFormCode;
  const setActiveFormCode = (code: PtspFormCode) => {
    setInternalFormCode(code);
    onChangeFormCode?.(code);
  };
  const [internalRecordId, setInternalRecordId] = useState<string>(
    workspaceRole === 'officer' ? records[0]?.id || 'NEW_DRAFT' : 'NEW_DRAFT'
  );
  const selectedRecordId = selectedRecordIdExternal ?? internalRecordId;
  const setSelectedRecordId = (id: string) => {
    setInternalRecordId(id);
    onChangeSelectedRecordId?.(id);
  };
  const [showLiveSheet, setShowLiveSheet] = useState(true);
  const [noticeText, setNoticeText] = useState<string | null>(null);

  const isRegNumberAlreadyUsed = (
    candidateReg: string,
    existingList: PtspRecord[]
  ): boolean => {
    const normalized = candidateReg.trim().toUpperCase();
    if (!normalized) return true;
    const seqMatch = normalized.match(/^(\d+)/);
    const candidateSeq = seqMatch ? parseInt(seqMatch[1], 10) : null;

    return existingList.some((r) => {
      const existingNorm = r.registrationNumber.trim().toUpperCase();
      if (existingNorm === normalized) return true;
      if (candidateSeq !== null) {
        const rMatch = existingNorm.match(/^(\d+)/);
        if (rMatch && parseInt(rMatch[1], 10) === candidateSeq) {
          return true;
        }
      }
      return false;
    });
  };

  const nextRegNumber = useMemo(() => {
    const roman = getRomanMonth(new Date().getMonth() + 1);
    let maxSeq = records.length;
    for (const r of records) {
      const match = r.registrationNumber.trim().match(/^(\d+)/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (!Number.isNaN(parsed) && parsed > maxSeq) {
          maxSeq = parsed;
        }
      }
    }
    let nextSeq = maxSeq + 1;
    let candidate = `${String(nextSeq).padStart(3, '0')}/PTSP/686138/${roman}/2026`;
    while (isRegNumberAlreadyUsed(candidate, records)) {
      nextSeq += 1;
      candidate = `${String(nextSeq).padStart(3, '0')}/PTSP/686138/${roman}/2026`;
    }
    return candidate;
  }, [records]);

  const createEmptyDraft = (customRegNumber?: string): PtspRecord => ({
    id: `PTSP-2026-${String(records.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
    registrationNumber: customRegNumber || nextRegNumber,
    dayAndDate: 'Senin, 9 November 2026',
    fullName: '',
    nikOrIdentity: '',
    institution: '',
    position: '',
    address: '',
    phoneWhatsapp: '',
    email: '',
    serviceTypes: ['ppid'],
    serviceOtherText: '',
    purposeSummary: '',
    supportingDocTypes: ['fotokopi_identitas'],
    supportingDocOtherText: '',
    receivedDate: '9 November 2026',
    receivedTime: '09.00 WIB',
    ptspOfficerName: authenticatedOfficer?.fullName || 'Rina Kartika, S.I.P.',
    verificationChecks: ['identitas_diperiksa', 'formulir_diisi'],
    verificationNotes: '',
    dispositionTargets: ['ppid_bawaslu'],
    dispositionOtherText: '',
    dispositionNotes: '',
    dispositionReceiverName: '',
    initialStatus: 'diterima',
    receiptRemarks: '',
    receiptDateText: '9 November 2026',
    handlingUnit: 'PPID Bawaslu Kabupaten Subang',
    forwardedDate: '9 November 2026',
    personInCharge: '',
    completionDate: '',
    completionStatus: 'menunggu_verifikasi',
    followUpResult: '',
    notesToApplicant: '',
    unitOfficerName: '',
    surveyDate: '9 November 2026',
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
    surveyFeedback: '',
    overallSatisfaction: 'sangat_puas',
  });

  const [draftRecord, setDraftRecord] = useState<PtspRecord>(() =>
    createEmptyDraft()
  );

  const effectiveSelectedId =
    workspaceRole === 'applicant' ? 'NEW_DRAFT' : selectedRecordId;

  const currentRecord: PtspRecord = useMemo(() => {
    if (effectiveSelectedId === 'NEW_DRAFT') {
      const shouldSyncReg =
        !draftRecord.registrationNumber ||
        isRegNumberAlreadyUsed(draftRecord.registrationNumber, records);
      return {
        ...draftRecord,
        registrationNumber: shouldSyncReg
          ? nextRegNumber
          : draftRecord.registrationNumber,
      };
    }
    return (
      records.find((r) => r.id === effectiveSelectedId) ||
      records[0] ||
      draftRecord
    );
  }, [effectiveSelectedId, records, draftRecord, nextRegNumber]);

  const updateCurrentRecordField = <K extends keyof PtspRecord>(
    key: K,
    value: PtspRecord[K]
  ) => {
    if (effectiveSelectedId === 'NEW_DRAFT') {
      setDraftRecord((prev) => ({ ...prev, [key]: value }));
    } else {
      const updated = { ...currentRecord, [key]: value };
      onUpdateRecord(updated);
    }
  };

  const toggleArrayItem = <T extends string>(
    list: T[],
    item: T
  ): T[] => {
    return list.includes(item)
      ? list.filter((x) => x !== item)
      : [...list, item];
  };

  const handleSaveFormulir1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord.fullName.trim()) {
      setNoticeText('Mohon isi Nama Lengkap Pemohon pada Pendaftaran Pelayanan PTSP.');
      return;
    }
    if (effectiveSelectedId === 'NEW_DRAFT') {
      const syncedRegNumber = isRegNumberAlreadyUsed(
        currentRecord.registrationNumber,
        records
      )
        ? nextRegNumber
        : currentRecord.registrationNumber;

      const savedRec: PtspRecord = {
        ...currentRecord,
        id: `PTSP-2026-${String(records.length + 1).padStart(3, '0')}`,
        registrationNumber: syncedRegNumber,
        createdAt: new Date().toISOString(),
      };
      onSaveNewRecord(savedRec);

      if (workspaceRole === 'applicant') {
        const updatedList = [savedRec, ...records];
        const roman = getRomanMonth(new Date().getMonth() + 1);
        let maxSeq = updatedList.length;
        for (const r of updatedList) {
          const m = r.registrationNumber.trim().match(/^(\d+)/);
          if (m) {
            const p = parseInt(m[1], 10);
            if (!Number.isNaN(p) && p > maxSeq) maxSeq = p;
          }
        }
        const nextAvailable = `${String(maxSeq + 1).padStart(3, '0')}/PTSP/686138/${roman}/2026`;
        setDraftRecord(createEmptyDraft(nextAvailable));
        setSelectedRecordId('NEW_DRAFT');
      } else {
        setSelectedRecordId(savedRec.id);
      }

      setNoticeText(
        `Pendaftaran Pelayanan PTSP (${savedRec.registrationNumber}) berhasil disimpan ke Register Harian PTSP. Nomor registrasi otomatis diperbarui ke nomor berikutnya.`
      );
    } else {
      onUpdateRecord(currentRecord);
      setNoticeText(
        `Perubahan Pendaftaran Pelayanan PTSP (${currentRecord.registrationNumber}) berhasil disimpan.`
      );
    }
    setTimeout(() => setNoticeText(null), 4000);
  };

  const handleSaveOtherForm = (e: React.FormEvent, formLabel: string) => {
    e.preventDefault();
    if (effectiveSelectedId === 'NEW_DRAFT') {
      const syncedRegNumber = isRegNumberAlreadyUsed(
        currentRecord.registrationNumber,
        records
      )
        ? nextRegNumber
        : currentRecord.registrationNumber;

      const savedRec: PtspRecord = {
        ...currentRecord,
        id: `PTSP-2026-${String(records.length + 1).padStart(3, '0')}`,
        registrationNumber: syncedRegNumber,
        createdAt: new Date().toISOString(),
      };
      onSaveNewRecord(savedRec);
      if (workspaceRole === 'officer') {
        setSelectedRecordId(savedRec.id);
      }
    } else {
      onUpdateRecord(currentRecord);
    }
    setNoticeText(
      `Data ${formLabel} (${currentRecord.registrationNumber}) berhasil disimpan.`
    );
    setTimeout(() => setNoticeText(null), 4000);
  };

  const handleSaveSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    const newSurvey: PtspSurveyEntry = {
      id: `SKM-2026-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      respondentName:
        currentRecord.fullName.trim() || 'Responden Masyarakat',
      surveyDate: currentRecord.surveyDate || '9 November 2026',
      serviceType: currentRecord.serviceTypes[0] || 'ppid',
      surveyScores: { ...currentRecord.surveyScores },
      surveyFeedback: currentRecord.surveyFeedback.trim(),
      overallSatisfaction: currentRecord.overallSatisfaction,
    };

    onSaveSurveyEntry?.(newSurvey);

    if (effectiveSelectedId === 'NEW_DRAFT') {
      setDraftRecord((prev) => ({
        ...prev,
        fullName: '',
        surveyFeedback: '',
        overallSatisfaction: 'sangat_puas',
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
      }));
    } else {
      onUpdateRecord(currentRecord);
    }

    setNoticeText(
      'Terima kasih! Penilaian Survei Kepuasan Masyarakat berhasil dikirim dan telah ditambahkan ke Indeks Kinerja Sistem pada Dashboard Pelayanan PTSP.'
    );
    setTimeout(() => setNoticeText(null), 4500);
  };

  const exportPtspRegisterCsv = () => {
    const headers = [
      'No.',
      'Tanggal',
      'No. Registrasi',
      'Nama Pemohon',
      'Instansi/Organisasi',
      'Jenis Layanan',
      'Unit Tujuan',
      'Status Penyelesaian',
    ];
    const rows = records.map((r, idx) => [
      idx + 1,
      r.receivedDate || r.dayAndDate,
      r.registrationNumber,
      r.fullName,
      r.institution || '-',
      r.serviceTypes.map((s) => PTSP_SERVICE_TYPE_LABELS[s]).join('; '),
      r.dispositionTargets.map((d) => PTSP_DISPOSITION_LABELS[d]).join('; ') ||
        r.handlingUnit ||
        '-',
      PTSP_COMPLETION_STATUS_LABELS[r.completionStatus],
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Register_Harian_PTSP_Bawaslu_Subang.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFormMeta =
    PTSP_FORM_LIST.find((f) => f.code === activeFormCode) ||
    PTSP_FORM_LIST[0];

  const isOfficerLocked =
    Boolean(activeFormMeta.officerOnlyEdit) && !authenticatedOfficer;

  return (
    <div className="space-y-6">
      {/* RECORD SELECTOR & ACTION TOOLBAR FOR PTSP FORMS */}
      {activeFormCode !== 'formulir_5' && (
        <div className="no-print bg-white border border-slate-200 rounded-xl px-5 py-3.5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-bold text-slate-900">
                {activeFormMeta.fullTitle}
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-red-800 font-semibold">
                {currentRecord.registrationNumber}
              </span>
            </div>

            {/* Record Selector (Only for Officer Desk) & Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {workspaceRole === 'officer' && (
                <>
                  <select
                    value={selectedRecordId}
                    onChange={(e) => setSelectedRecordId(e.target.value)}
                    className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-red-800"
                  >
                    <option value="NEW_DRAFT">
                      + Permohonan Baru ({nextRegNumber})
                    </option>
                    {records.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.registrationNumber} — {r.fullName || 'Tanpa Nama'}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setDraftRecord(createEmptyDraft(nextRegNumber));
                      setSelectedRecordId('NEW_DRAFT');
                      setActiveFormCode('formulir_1');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Buat Pendaftaran Baru
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setShowLiveSheet((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                {showLiveSheet
                  ? 'Sembunyikan Lembar Cetak'
                  : 'Tampilkan Lembar Cetak'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak {activeFormMeta.shortTitle}
              </button>
            </div>
          </div>

          {(workspaceRole === 'officer' || !externalFormCode) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-200">
              {(workspaceRole === 'officer'
                ? PTSP_FORM_LIST.filter(
                    (f) => f.officerOnlyEdit || f.code === 'formulir_lampiran'
                  )
                : PTSP_FORM_LIST
              ).map((item) => {
                const isSelected = item.code === activeFormCode;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setActiveFormCode(item.code)}
                    className={`p-3 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                      isSelected
                        ? 'border-red-800 bg-red-50/60 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-red-800' : 'text-slate-900'
                          }`}
                        >
                          {item.shortTitle}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                          Petugas
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 mt-1 leading-snug line-clamp-2">
                        {item.fullTitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {noticeText && (
        <div className="no-print bg-emerald-50 border border-emerald-300 rounded-xl px-5 py-3.5 flex items-center gap-2 text-xs font-medium text-emerald-950">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{noticeText}</span>
        </div>
      )}

      {/* MAIN SPLIT WORKSPACE: INTERACTIVE FORM ON LEFT, EXACT PRINT SHEET ON RIGHT */}
      <div
        className={`grid grid-cols-1 ${
          showLiveSheet ? 'xl:grid-cols-12' : ''
        } gap-8 items-start`}
      >
        {/* LEFT COLUMN: INTERACTIVE FORM FOR SELECTED FORMULIR */}
        <div
          className={`no-print ${
            showLiveSheet ? 'xl:col-span-6' : 'max-w-4xl mx-auto w-full'
          } bg-white border border-slate-200 rounded-xl p-6 sm:p-8`}
        >
          {/* Header of current active form */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-red-800">
                {activeFormMeta.shortTitle}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {activeFormMeta.fullTitle}
              </h3>
            </div>
            {selectedRecordId === 'NEW_DRAFT' &&
              activeFormCode === 'formulir_1' && (
                <button
                  type="button"
                  onClick={() => setDraftRecord(createEmptyDraft())}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Isian
                </button>
              )}
          </div>

          {/* Lock notice for officer-only forms when not logged in */}
          {isOfficerLocked && (
            <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Lock className="w-4 h-4" />
                  <span>Khusus Petugas PTSP & Unit Kerja</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pengisian dan pengesahan {activeFormMeta.fullTitle} memerlukan login Meja Petugas. Anda tetap dapat melihat pratinjau dokumen di samping.
                </p>
              </div>
              <button
                type="button"
                onClick={onRequestOfficerLogin}
                className="px-4 py-2 text-xs font-semibold bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Login Meja Petugas
              </button>
            </div>
          )}

          {/* 1. PENDAFTARAN PELAYANAN PTSP */}
          {activeFormCode === 'formulir_1' && (
            <form onSubmit={handleSaveFormulir1} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  A. Identitas Pemohon
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        1. Nomor Registrasi
                      </label>
                      <span className="text-[10.5px] font-semibold text-emerald-700">
                        Otomatis Tersinkronisasi
                      </span>
                    </div>
                    <input
                      type="text"
                      value={currentRecord.registrationNumber}
                      readOnly={workspaceRole === 'applicant'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (
                          effectiveSelectedId === 'NEW_DRAFT' &&
                          isRegNumberAlreadyUsed(val, records)
                        ) {
                          updateCurrentRecordField(
                            'registrationNumber',
                            nextRegNumber
                          );
                          setNoticeText(
                            `Nomor registrasi "${val}" sudah digunakan pada Register PTSP. Disinkronkan otomatis ke nomor terbaru: ${nextRegNumber}`
                          );
                          setTimeout(() => setNoticeText(null), 4000);
                        } else {
                          updateCurrentRecordField('registrationNumber', val);
                        }
                      }}
                      className={`w-full px-3.5 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:border-red-800 ${
                        workspaceRole === 'applicant'
                          ? 'bg-slate-50 text-slate-800 cursor-default'
                          : 'bg-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      2. Hari / Tanggal
                    </label>
                    <input
                      type="text"
                      value={currentRecord.dayAndDate}
                      onChange={(e) =>
                        updateCurrentRecordField('dayAndDate', e.target.value)
                      }
                      placeholder="Senin, 9 November 2026"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      3. Nama Lengkap <span className="text-red-700">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentRecord.fullName}
                      onChange={(e) =>
                        updateCurrentRecordField('fullName', e.target.value)
                      }
                      placeholder="Nama lengkap pemohon"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      4. NIK / Identitas (jika diperlukan)
                    </label>
                    <input
                      type="text"
                      value={currentRecord.nikOrIdentity}
                      onChange={(e) =>
                        updateCurrentRecordField(
                          'nikOrIdentity',
                          e.target.value
                        )
                      }
                      placeholder="Nomor KTP / Identitas"
                      className="w-full px-3.5 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:border-red-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      5. Instansi / Organisasi (jika ada)
                    </label>
                    <input
                      type="text"
                      value={currentRecord.institution}
                      onChange={(e) =>
                        updateCurrentRecordField('institution', e.target.value)
                      }
                      placeholder="Nama Partai / Lembaga / Instansi"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      6. Jabatan (jika ada)
                    </label>
                    <input
                      type="text"
                      value={currentRecord.position}
                      onChange={(e) =>
                        updateCurrentRecordField('position', e.target.value)
                      }
                      placeholder="Jabatan pemohon"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    7. Alamat
                  </label>
                  <textarea
                    rows={2}
                    value={currentRecord.address}
                    onChange={(e) =>
                      updateCurrentRecordField('address', e.target.value)
                    }
                    placeholder="Alamat lengkap pemohon"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      8. Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={currentRecord.phoneWhatsapp}
                      onChange={(e) =>
                        updateCurrentRecordField(
                          'phoneWhatsapp',
                          e.target.value
                        )
                      }
                      placeholder="08xx-xxxx-xxxx"
                      className="w-full px-3.5 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:border-red-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      9. Email
                    </label>
                    <input
                      type="email"
                      value={currentRecord.email}
                      onChange={(e) =>
                        updateCurrentRecordField('email', e.target.value)
                      }
                      placeholder="email@domain.id"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-800"
                    />
                  </div>
                </div>
              </div>

              {/* B. Jenis Layanan */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">
                  B. Pilihan Jenis Layanan PTSP
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(PTSP_SERVICE_TYPE_LABELS) as PtspServiceType[]).map(
                    (srv) => {
                      const checked =
                        currentRecord.serviceTypes.includes(srv);
                      return (
                        <div
                          key={srv}
                          className={`p-2.5 rounded-lg border transition-colors ${
                            checked
                              ? 'border-red-800 bg-red-50/40'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-800">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                updateCurrentRecordField(
                                  'serviceTypes',
                                  toggleArrayItem(
                                    currentRecord.serviceTypes,
                                    srv
                                  )
                                )
                              }
                              className="mt-0.5 accent-red-800"
                            />
                            <span>{PTSP_SERVICE_TYPE_LABELS[srv]}</span>
                          </label>
                          {srv === 'lainnya' && checked && (
                            <input
                              type="text"
                              value={currentRecord.serviceOtherText}
                              onChange={(e) =>
                                updateCurrentRecordField(
                                  'serviceOtherText',
                                  e.target.value
                                )
                              }
                              placeholder="Sebutkan layanan lainnya..."
                              className="mt-2 w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                            />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* C. Uraian Maksud dan Tujuan Pelayanan */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <label className="block text-sm font-bold text-slate-900">
                  C. Uraian Maksud dan Tujuan Pelayanan
                </label>
                <textarea
                  rows={3}
                  value={currentRecord.purposeSummary}
                  onChange={(e) =>
                    updateCurrentRecordField('purposeSummary', e.target.value)
                  }
                  placeholder="Tuliskan maksud dan tujuan permohonan pelayanan..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-800"
                />
              </div>

              {/* D. Dokumen Pendukung */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">
                  D. Dokumen Pendukung
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    Object.keys(
                      PTSP_SUPPORTING_DOC_LABELS
                    ) as PtspSupportingDocType[]
                  ).map((doc) => {
                    const checked =
                      currentRecord.supportingDocTypes.includes(doc);
                    return (
                      <div
                        key={doc}
                        className={`p-2.5 rounded-lg border transition-colors ${
                          checked
                            ? 'border-red-800 bg-red-50/40'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-800">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              updateCurrentRecordField(
                                'supportingDocTypes',
                                toggleArrayItem(
                                  currentRecord.supportingDocTypes,
                                  doc
                                )
                              )
                            }
                            className="mt-0.5 accent-red-800"
                          />
                          <span>{PTSP_SUPPORTING_DOC_LABELS[doc]}</span>
                        </label>
                        {doc === 'dokumen_lainnya' && checked && (
                          <input
                            type="text"
                            value={currentRecord.supportingDocOtherText}
                            onChange={(e) =>
                              updateCurrentRecordField(
                                'supportingDocOtherText',
                                e.target.value
                              )
                            }
                            placeholder="Sebutkan dokumen lainnya..."
                            className="mt-2 w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* E. Pernyataan & Tanda Tangan Pemohon */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  E. Pernyataan & Tanda Tangan Pemohon
                </h4>
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed">
                  Saya menyatakan bahwa informasi dan dokumen yang disampaikan
                  dalam formulir ini adalah benar dan dapat
                  dipertanggungjawabkan. Saya bersedia mengikuti prosedur
                  pelayanan yang berlaku di lingkungan Bawaslu Kabupaten Subang.
                </p>

                <SignaturePad
                  label="Tanda Tangan Pemohon"
                  value={currentRecord.applicantSignature}
                  onChange={(sig) =>
                    updateCurrentRecordField('applicantSignature', sig)
                  }
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Pendaftaran PTSP
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                  Simpan Pendaftaran PTSP
                </button>
              </div>
            </form>
          )}

          {/* 2. LEMBAR PENERIMAAN DAN VERIFIKASI PETUGAS PTSP */}
          {activeFormCode === 'formulir_2' && (
            <form
              onSubmit={(e) => handleSaveOtherForm(e, 'Verifikasi Petugas')}
              className="space-y-6"
            >
              <fieldset disabled={isOfficerLocked} className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">
                    A. Data Penerimaan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        1. Nomor Registrasi
                      </label>
                      <input
                        type="text"
                        value={currentRecord.registrationNumber}
                        onChange={(e) =>
                          updateCurrentRecordField(
                            'registrationNumber',
                            e.target.value
                          )
                        }
                        className="w-full px-3.5 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        2. Tanggal Penerimaan
                      </label>
                      <input
                        type="text"
                        value={currentRecord.receivedDate}
                        onChange={(e) =>
                          updateCurrentRecordField(
                            'receivedDate',
                            e.target.value
                          )
                        }
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        3. Waktu Penerimaan
                      </label>
                      <input
                        type="text"
                        value={currentRecord.receivedTime}
                        onChange={(e) =>
                          updateCurrentRecordField(
                            'receivedTime',
                            e.target.value
                          )
                        }
                        className="w-full px-3.5 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        4. Nama Petugas PTSP
                      </label>
                      <input
                        type="text"
                        value={currentRecord.ptspOfficerName}
                        onChange={(e) =>
                          updateCurrentRecordField(
                            'ptspOfficerName',
                            e.target.value
                          )
                        }
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* B. Hasil Verifikasi Administratif */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    B. Hasil Verifikasi Administratif
                  </h4>
                  <div className="space-y-2">
                    {(
                      Object.keys(
                        PTSP_VERIFICATION_LABELS
                      ) as PtspVerificationCheck[]
                    ).map((chk) => {
                      const checked =
                        currentRecord.verificationChecks.includes(chk);
                      return (
                        <label
                          key={chk}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs font-medium ${
                            checked
                              ? 'border-red-800 bg-red-50/40 text-slate-900'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              updateCurrentRecordField(
                                'verificationChecks',
                                toggleArrayItem(
                                  currentRecord.verificationChecks,
                                  chk
                                )
                              )
                            }
                            className="mt-0.5 accent-red-800"
                          />
                          <span>{PTSP_VERIFICATION_LABELS[chk]}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan hasil verifikasi:
                    </label>
                    <textarea
                      rows={2}
                      value={currentRecord.verificationNotes}
                      onChange={(e) =>
                        updateCurrentRecordField(
                          'verificationNotes',
                          e.target.value
                        )
                      }
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* C. Tujuan Disposisi */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    C. Tujuan Disposisi
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(
                      Object.keys(
                        PTSP_DISPOSITION_LABELS
                      ) as PtspDispositionTarget[]
                    ).map((dsp) => {
                      const checked =
                        currentRecord.dispositionTargets.includes(dsp);
                      return (
                        <div
                          key={dsp}
                          className={`p-2.5 rounded-lg border ${
                            checked
                              ? 'border-red-800 bg-red-50/40'
                              : 'border-slate-200'
                          }`}
                        >
                          <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-800">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                updateCurrentRecordField(
                                  'dispositionTargets',
                                  toggleArrayItem(
                                    currentRecord.dispositionTargets,
                                    dsp
                                  )
                                )
                              }
                              className="mt-0.5 accent-red-800"
                            />
                            <span>{PTSP_DISPOSITION_LABELS[dsp]}</span>
                          </label>
                          {dsp === 'unit_lainnya' && checked && (
                            <input
                              type="text"
                              value={currentRecord.dispositionOtherText}
                              onChange={(e) =>
                                updateCurrentRecordField(
                                  'dispositionOtherText',
                                  e.target.value
                                )
                              }
                              placeholder="Sebutkan unit kerja lainnya..."
                              className="mt-2 w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* D. Catatan dan Arahan */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <label className="block text-sm font-bold text-slate-900">
                    D. Catatan dan Arahan
                  </label>
                  <textarea
                    rows={3}
                    value={currentRecord.dispositionNotes}
                    onChange={(e) =>
                      updateCurrentRecordField(
                        'dispositionNotes',
                        e.target.value
                      )
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Pejabat / Unit Penerima Disposisi
                      </label>
                      <input
                        type="text"
                        value={currentRecord.dispositionReceiverName}
                        onChange={(e) =>
                          updateCurrentRecordField(
                            'dispositionReceiverName',
                            e.target.value
                          )
                        }
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <SignaturePad
                    label="Tanda Tangan Petugas PTSP"
                    value={currentRecord.ptspOfficerSignature}
                    onChange={(sig) =>
                      updateCurrentRecordField('ptspOfficerSignature', sig)
                    }
                    height={100}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-lg"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Verifikasi Petugas
                  </button>
                </div>
              </fieldset>
            </form>
          )}

          {/* 3. TANDA TERIMA PERMOHONAN PELAYANAN */}
          {activeFormCode === 'formulir_3' && (
            <form
              onSubmit={(e) => handleSaveOtherForm(e, 'Tanda Terima Layanan')}
              className="space-y-5"
            >
              <fieldset disabled={isOfficerLocked} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor Registrasi
                    </label>
                    <input
                      type="text"
                      value={currentRecord.registrationNumber}
                      onChange={(e) =>
                        updateCurrentRecordField(
                          'registrationNumber',
                          e.target.value
                        )
                      }
                      className="w-full px-3.5 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Tanda Terima (Subang, ... 20...)
                    </label>
                    <input
                      type="text"
                      value={currentRecord.receiptDateText}
                      onChange={(e) =>
                        updateCurrentRecordField(
                          'receiptDateText',
                          e.target.value
                        )
                      }
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Status Awal Permohonan
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(
                      Object.keys(
                        PTSP_INITIAL_STATUS_LABELS
                      ) as PtspInitialStatus[]
                    ).map((st) => (
                      <label
                        key={st}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer text-xs font-medium ${
                          currentRecord.initialStatus === st
                            ? 'border-red-800 bg-red-50/40 text-slate-900'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="ptsp_initial_status"
                          checked={currentRecord.initialStatus === st}
                          onChange={() =>
                            updateCurrentRecordField('initialStatus', st)
                          }
                          className="mt-0.5 accent-red-800"
                        />
                        <span>{PTSP_INITIAL_STATUS_LABELS[st]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Keterangan Tanda Terima
                  </label>
                  <textarea
                    rows={3}
                    value={currentRecord.receiptRemarks}
                    onChange={(e) =>
                      updateCurrentRecordField('receiptRemarks', e.target.value)
                    }
                    placeholder="Keterangan tambahan penerimaan berkas..."
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak Tanda Terima
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-lg"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Tanda Terima
                  </button>
                </div>
              </fieldset>
            </form>
          )}

          {/* 4. MONITORING DAN PENYELESAIAN PELAYANAN */}
          {activeFormCode === 'formulir_4' && (
            <form
              onSubmit={(e) => handleSaveOtherForm(e, 'Monitoring Pelayanan')}
              className="space-y-5"
            >
              <fieldset disabled={isOfficerLocked} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      4. Unit Kerja yang Menangani
                    </label>
                    <input
                      type="text"
                      value={currentRecord.handlingUnit}
                      onChange={(e) =>
                        updateCurrentRecordField('handlingUnit', e.target.value)
                      }
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      5. Tanggal Diteruskan
                    </label>
                    <input
                      type="text"
                      value={currentRecord.forwardedDate}
                      onChange={(e) =>
                        updateCurrentRecordField(
                          'forwardedDate',
                          e.target.value
                        )
                      }
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      6. Petugas / Pejabat Penanggung Jawab
                    </label>
                    <input
                      type="text"
                      value={currentRecord.personInCharge}
                      onChange={(e) =>
                        updateCurrentRecordField(
                          'personInCharge',
                          e.target.value
                        )
                      }
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      7. Tanggal Penyelesaian
                    </label>
                    <input
                      type="text"
                      value={currentRecord.completionDate}
                      onChange={(e) =>
                        updateCurrentRecordField(
                          'completionDate',
                          e.target.value
                        )
                      }
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Status Penyelesaian
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(
                      Object.keys(
                        PTSP_COMPLETION_STATUS_LABELS
                      ) as PtspCompletionStatus[]
                    ).map((st) => (
                      <label
                        key={st}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs font-medium ${
                          currentRecord.completionStatus === st
                            ? 'border-red-800 bg-red-50/40 text-slate-900'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="ptsp_completion_status"
                          checked={currentRecord.completionStatus === st}
                          onChange={() =>
                            updateCurrentRecordField('completionStatus', st)
                          }
                          className="mt-0.5 accent-red-800"
                        />
                        <span>{PTSP_COMPLETION_STATUS_LABELS[st]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hasil / Tindak Lanjut
                  </label>
                  <textarea
                    rows={3}
                    value={currentRecord.followUpResult}
                    onChange={(e) =>
                      updateCurrentRecordField('followUpResult', e.target.value)
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan kepada Pemohon
                  </label>
                  <textarea
                    rows={2}
                    value={currentRecord.notesToApplicant}
                    onChange={(e) =>
                      updateCurrentRecordField(
                        'notesToApplicant',
                        e.target.value
                      )
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-lg"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Monitoring Pelayanan
                  </button>
                </div>
              </fieldset>
            </form>
          )}

          {/* 5. SURVEI KEPUASAN MASYARAKAT TERHADAP PELAYANAN PTSP (TANPA NOMOR REGISTRASI -> MASUK INDEKS DASHBOARD) */}
          {activeFormCode === 'formulir_5' && (
            <form onSubmit={handleSaveSurvey} className="space-y-5">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                Penilaian ini <strong>tidak memerlukan Nomor Registrasi</strong>. Seluruh penilaian yang Anda berikan langsung dihitung ke dalam <strong>Indeks Kepuasan Masyarakat &amp; Kinerja Sistem Pelayanan</strong> pada Dashboard Pelayanan PTSP Bawaslu Kabupaten Subang.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Responden (Opsional)
                  </label>
                  <input
                    type="text"
                    value={currentRecord.fullName}
                    onChange={(e) =>
                      updateCurrentRecordField('fullName', e.target.value)
                    }
                    placeholder="Nama Anda / Anonim"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Penilaian
                  </label>
                  <input
                    type="text"
                    value={currentRecord.surveyDate}
                    onChange={(e) =>
                      updateCurrentRecordField('surveyDate', e.target.value)
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Layanan yang Dinilai
                  </label>
                  <select
                    value={currentRecord.serviceTypes[0] || 'ppid'}
                    onChange={(e) =>
                      updateCurrentRecordField('serviceTypes', [
                        e.target.value as PtspServiceType,
                      ])
                    }
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
                  >
                    {(
                      Object.keys(PTSP_SERVICE_TYPE_LABELS) as PtspServiceType[]
                    ).map((srv) => (
                      <option key={srv} value={srv}>
                        {PTSP_SERVICE_TYPE_LABELS[srv]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700">
                  Unsur Penilaian (1 = Tidak Baik | 2 = Kurang Baik | 3 = Baik |
                  4 = Sangat Baik)
                </div>

                <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                  {PTSP_SURVEY_QUESTIONS.map((q) => {
                    const currentScore = currentRecord.surveyScores[q.key];
                    return (
                      <div
                        key={q.key}
                        className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <span className="text-xs font-medium text-slate-800">
                          {q.no}. {q.label}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {([1, 2, 3, 4] as const).map((scoreVal) => (
                            <button
                              key={scoreVal}
                              type="button"
                              onClick={() =>
                                updateCurrentRecordField('surveyScores', {
                                  ...currentRecord.surveyScores,
                                  [q.key]: scoreVal,
                                })
                              }
                              className={`w-8 h-8 rounded-md text-xs font-bold font-mono transition-colors ${
                                currentScore === scoreVal
                                  ? 'bg-red-800 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {scoreVal}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kritik dan Saran
                </label>
                <textarea
                  rows={3}
                  value={currentRecord.surveyFeedback}
                  onChange={(e) =>
                    updateCurrentRecordField('surveyFeedback', e.target.value)
                  }
                  placeholder="Tuliskan kritik dan saran untuk peningkatan layanan PTSP Bawaslu Kabupaten Subang..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Penilaian Keseluruhan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'sangat_puas', label: 'Sangat Puas' },
                      { id: 'puas', label: 'Puas' },
                      { id: 'kurang_puas', label: 'Kurang Puas' },
                      { id: 'tidak_puas', label: 'Tidak Puas' },
                    ] as { id: PtspOverallSatisfaction; label: string }[]
                  ).map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-semibold ${
                        currentRecord.overallSatisfaction === opt.id
                          ? 'border-red-800 bg-red-50/50 text-red-900'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="overall_satisfaction"
                        checked={currentRecord.overallSatisfaction === opt.id}
                        onChange={() =>
                          updateCurrentRecordField(
                            'overallSatisfaction',
                            opt.id
                          )
                        }
                        className="accent-red-800"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                  Simpan Survei Kepuasan
                </button>
              </div>
            </form>
          )}

          {/* 6. PEDOMAN PENGELOLAAN DOKUMEN & REGISTER HARIAN PTSP */}
          {activeFormCode === 'formulir_lampiran' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Daftar seluruh permohonan layanan yang tercatat dalam{' '}
                  <strong>Format Register Harian PTSP</strong>.
                  Klik salah satu baris untuk membuka dan menindaklanjuti berkas permohonan pelayanan.
                </p>
                <button
                  type="button"
                  onClick={exportPtspRegisterCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh CSV Register PTSP
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                      <th className="py-2.5 px-3">No.</th>
                      <th className="py-2.5 px-3">No. Registrasi</th>
                      <th className="py-2.5 px-3">Pemohon</th>
                      <th className="py-2.5 px-3">Jenis Layanan</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Buka</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {records.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-slate-900">
                          {r.registrationNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">
                            {r.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {r.receivedDate || r.dayAndDate}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {r.serviceTypes
                            .map((s) => PTSP_SERVICE_TYPE_LABELS[s])
                            .join(', ')}
                        </td>
                        <td className="py-2.5 px-3">
                          {PTSP_COMPLETION_STATUS_LABELS[r.completionStatus]}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecordId(r.id);
                              setActiveFormCode('formulir_1');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-red-800 hover:bg-red-50 rounded"
                          >
                            Pilih Berkas
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: OFFICIAL PRINTABLE SHEET PREVIEW */}
        {showLiveSheet && (
          <div className="xl:col-span-6 space-y-4">
            <div className="no-print flex items-center justify-between bg-slate-900 text-white px-4 py-3 rounded-xl">
              <div className="text-xs">
                <span className="font-semibold">
                  Pratinjau Dokumen Resmi: {activeFormMeta.fullTitle}
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-900 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Sekarang
              </button>
            </div>

            <PtspOfficialSheets
              formCode={activeFormCode}
              record={currentRecord}
              allRecords={records}
            />
          </div>
        )}
      </div>
    </div>
  );
};
