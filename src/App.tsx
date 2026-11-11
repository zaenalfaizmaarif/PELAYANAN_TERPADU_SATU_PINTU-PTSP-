/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
  OfficerDeskPanel,
  OfficerWorkspaceTab,
} from './components/OfficerDeskPanel';
import {
  OfficerLoginGate,
  AuthenticatedOfficer,
} from './components/OfficerLoginGate';
import { PtspWorkspace } from './components/PtspWorkspace';
import { PtspOfficialSheets } from './components/PtspOfficialSheets';
import { ApplicationTrackerCard } from './components/ApplicationTrackerCard';
import { BAWASLU_LOGO_DATA_URI } from './assets/bawasluLogo';
import {
  PtspRecord,
  PtspFormCode,
  PtspSurveyEntry,
  PTSP_FORM_LIST,
  INITIAL_PTSP_RECORDS,
  INITIAL_PTSP_SURVEYS,
  PTSP_SERVICE_TYPE_LABELS,
  PTSP_DISPOSITION_LABELS,
  PTSP_COMPLETION_STATUS_LABELS,
} from './types/ptsp';
import {
  Printer,
  Search,
  Plus,
  Download,
  ExternalLink,
  X,
  Lock,
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  BookOpen,
  LogOut,
  FolderOpen,
  FileCheck,
  Activity,
} from 'lucide-react';

type ActiveTab = 'form' | 'register' | 'officer' | 'template';

const PTSP_STORAGE_KEY = 'bawaslu_subang_ptsp_records_v2';
const PTSP_SURVEY_STORAGE_KEY = 'bawaslu_subang_ptsp_surveys_v1';
const OFFICER_TOKEN_KEY = 'bawaslu_subang_ptsp_officer_token_v1';

export default function App() {
  const [ptspRecords, setPtspRecords] = useState<PtspRecord[]>(() => {
    try {
      const saved = localStorage.getItem(PTSP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_PTSP_RECORDS;
  });

  const [ptspSurveys, setPtspSurveys] = useState<PtspSurveyEntry[]>(() => {
    try {
      const saved = localStorage.getItem(PTSP_SURVEY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_PTSP_SURVEYS;
  });

  // Applicant section state ('formulir_1', 'formulir_5', or 'lacak_status')
  const [applicantSection, setApplicantSection] = useState<
    'formulir_1' | 'formulir_5' | 'lacak_status'
  >('formulir_1');
  const applicantFormCode: PtspFormCode =
    applicantSection === 'formulir_5' ? 'formulir_5' : 'formulir_1';

  // Officer desk state
  const [officerSubTab, setOfficerSubTab] =
    useState<OfficerWorkspaceTab>('dashboard');
  const [officerPtspFormCode, setOfficerPtspFormCode] =
    useState<PtspFormCode>('formulir_2');
  const [selectedOfficerRecordId, setSelectedOfficerRecordId] =
    useState<string>(INITIAL_PTSP_RECORDS[0]?.id || 'NEW_DRAFT');

  const [authToken, setAuthToken] = useState<string>(() => {
    try {
      return sessionStorage.getItem(OFFICER_TOKEN_KEY) || '';
    } catch {
      return '';
    }
  });
  const [authenticatedOfficer, setAuthenticatedOfficer] =
    useState<AuthenticatedOfficer | null>(null);

  useEffect(() => {
    if (!authToken) {
      setAuthenticatedOfficer(null);
      return;
    }
    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        if (data?.officer) {
          setAuthenticatedOfficer(data.officer);
        }
      })
      .catch(() => {
        setAuthenticatedOfficer(null);
        setAuthToken('');
        try {
          sessionStorage.removeItem(OFFICER_TOKEN_KEY);
        } catch {
          // ignore
        }
      });
  }, [authToken]);

  // Fetch records & surveys from server (XAMPP MySQL or server store) on mount
  useEffect(() => {
    fetch('/api/ptsp/records')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.records) && data.records.length > 0) {
          setPtspRecords(data.records);
        }
      })
      .catch(() => {
        // fallback to local state
      });

    fetch('/api/ptsp/surveys')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.surveys) && data.surveys.length > 0) {
          setPtspSurveys(data.surveys);
        }
      })
      .catch(() => {
        // fallback to local state
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PTSP_STORAGE_KEY, JSON.stringify(ptspRecords));
    } catch {
      // ignore storage errors
    }
  }, [ptspRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(PTSP_SURVEY_STORAGE_KEY, JSON.stringify(ptspSurveys));
    } catch {
      // ignore storage errors
    }
  }, [ptspSurveys]);

  const handleSaveNewPtspRecord = (newRec: PtspRecord) => {
    setPtspRecords((prev) => [newRec, ...prev]);
    setSelectedOfficerRecordId(newRec.id);
    fetch('/api/ptsp/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRec),
    }).catch(() => {
      // ignore network error
    });
  };

  const handleSaveNewSurvey = (newSurvey: PtspSurveyEntry) => {
    setPtspSurveys((prev) => [newSurvey, ...prev]);
    fetch('/api/ptsp/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSurvey),
    }).catch(() => {
      // ignore network error
    });
  };

  const handleUpdatePtspRecord = (updatedRec: PtspRecord) => {
    setPtspRecords((prev) =>
      prev.map((item) => (item.id === updatedRec.id ? updatedRec : item))
    );
    if (inspectedPtspRecord?.id === updatedRec.id) {
      setInspectedPtspRecord(updatedRec);
    }
    fetch(`/api/ptsp/records/${encodeURIComponent(updatedRec.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRec),
    }).catch(() => {
      // ignore network error
    });
  };

  const handleOfficerLogin = (officer: AuthenticatedOfficer, token: string) => {
    setAuthenticatedOfficer(officer);
    setAuthToken(token);
    try {
      sessionStorage.setItem(OFFICER_TOKEN_KEY, token);
    } catch {
      // ignore storage errors
    }
  };

  const handleOfficerLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      } catch {
        // ignore network errors
      }
    }
    setAuthenticatedOfficer(null);
    setAuthToken('');
    try {
      sessionStorage.removeItem(OFFICER_TOKEN_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('form');

  // Register filtering & modal preview state for PTSP records
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [inspectedPtspRecord, setInspectedPtspRecord] =
    useState<PtspRecord | null>(null);
  const [inspectedFormCode, setInspectedFormCode] =
    useState<PtspFormCode>('formulir_1');

  const filteredPtspRecords = useMemo(() => {
    return ptspRecords.filter((rec) => {
      const matchesStatus =
        statusFilter === 'ALL' || rec.completionStatus === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesStatus;
      return (
        matchesStatus &&
        (rec.fullName.toLowerCase().includes(q) ||
          rec.nikOrIdentity.toLowerCase().includes(q) ||
          rec.registrationNumber.toLowerCase().includes(q) ||
          rec.institution.toLowerCase().includes(q) ||
          rec.purposeSummary.toLowerCase().includes(q))
      );
    });
  }, [ptspRecords, searchQuery, statusFilter]);

  const exportRegisterCsv = () => {
    const headers = [
      'No.',
      'Tanggal',
      'No. Registrasi',
      'Nama Pemohon',
      'NIK / Identitas',
      'Instansi/Organisasi',
      'Jenis Layanan',
      'Unit Tujuan',
      'Status Penyelesaian',
    ];
    const rows = filteredPtspRecords.map((r, idx) => [
      idx + 1,
      r.receivedDate || r.dayAndDate,
      r.registrationNumber,
      r.fullName,
      `'${r.nikOrIdentity}`,
      r.institution || '-',
      r.serviceTypes.map((s) => PTSP_SERVICE_TYPE_LABELS[s]).join('; '),
      r.dispositionTargets.map((d) => PTSP_DISPOSITION_LABELS[d]).join('; ') ||
        r.handlingUnit ||
        '-',
      PTSP_COMPLETION_STATUS_LABELS[r.completionStatus],
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Register_Harian_PTSP_Bawaslu_Subang_2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] text-slate-900">
      {/* TOP BAR HEADER (INSTITUTIONAL BRANDING + ACCOUNT / SESSION BAR) */}
      <header className="no-print sticky top-0 z-30 bg-gradient-to-r from-[#6B1114] via-[#7F1D1D] to-[#4C0519] text-white border-b-2 border-amber-500/80 px-6 py-3.5 flex items-center justify-between gap-6 shadow-xs">
        {/* Left: Bawaslu Logo + PELAYANAN TERPADU SATU PINTU (PTSP) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('form');
          }}
          className="flex items-center gap-3.5 shrink-0"
        >
          <div className="w-11 h-11 rounded-xl bg-white p-1.5 shadow-xs flex items-center justify-center shrink-0 border border-amber-300/60">
            <img
              src={BAWASLU_LOGO_DATA_URI}
              alt="Logo Bawaslu Kabupaten Subang"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                PELAYANAN TERPADU SATU PINTU (PTSP)
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold text-amber-200 bg-amber-400/15 border border-amber-300/35 rounded-md px-2 py-0.5 whitespace-nowrap">
                BAWASLU SUBANG
              </span>
            </div>
            <p className="text-xs text-amber-100/85 hidden sm:block">
              Sistem Administrasi Pelayanan Publik Terpadu · Bawaslu Kabupaten Subang
            </p>
          </div>
        </a>

        {/* Right: Officer Profile & Logout (if logged in) OR Mode Switcher — Hidden on Layanan Pemohon (activeTab === 'form') */}
        {activeTab !== 'form' && (
          <div className="flex items-center gap-3.5 shrink-0">
            {authenticatedOfficer ? (
              <>
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-white">
                    {authenticatedOfficer.fullName}
                  </div>
                  <div className="text-[11px] text-amber-100/80">
                    Petugas Pelayanan PTSP Bawaslu Subang
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-400 text-red-950 text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                  {authenticatedOfficer.fullName.charAt(0)}
                </div>
                <button
                  type="button"
                  onClick={handleOfficerLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/10 border border-white/25 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-300" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <>
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-white">
                    Portal Layanan Pemohon
                  </div>
                  <div className="text-[11px] text-amber-100/80">
                    Pengisian Formulir Pelayanan PTSP
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOfficerSubTab('dashboard');
                    setActiveTab('officer');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-red-950" />
                  <span>Masuk Meja Petugas</span>
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* WORKSPACE CANVAS: LEFT SIDEBAR + MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="no-print w-full lg:w-64 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-stone-200/90 p-4 flex flex-col justify-between gap-6">
          <div className="space-y-6">
            {/* Group 1: Layanan Pemohon (Tampilan Pengisian Formulir Pemohon) */}
            <div className="space-y-1.5">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-red-900/75">
                Layanan Pemohon (Publik)
              </div>

              <button
                type="button"
                onClick={() => {
                  setApplicantSection('formulir_1');
                  setActiveTab('form');
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'form' && applicantSection === 'formulir_1'
                    ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-950'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <FileText
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === 'form' && applicantSection === 'formulir_1'
                        ? 'text-amber-300'
                        : 'text-red-800/70'
                    }`}
                  />
                  <span className="truncate">Pendaftaran Pelayanan PTSP</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setApplicantSection('formulir_5');
                  setActiveTab('form');
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'form' && applicantSection === 'formulir_5'
                    ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-950'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <FileCheck
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === 'form' && applicantSection === 'formulir_5'
                        ? 'text-amber-300'
                        : 'text-red-800/70'
                    }`}
                  />
                  <span className="truncate">Survei Kepuasan Masyarakat</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setApplicantSection('lacak_status');
                  setActiveTab('form');
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'form' && applicantSection === 'lacak_status'
                    ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-950'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Search
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === 'form' &&
                      applicantSection === 'lacak_status'
                        ? 'text-amber-300'
                        : 'text-red-800/70'
                    }`}
                  />
                  <span className="truncate">Lacak Status Permohonan</span>
                </span>
              </button>
            </div>

            {/* Group 2: Menu Meja Petugas PTSP (Tampilan Terpisah Khusus Petugas) */}
            <div className="space-y-1.5 pt-4 border-t border-stone-200/90">
              <div className="px-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-red-900/75">
                <span>Menu Meja Petugas</span>
                {!authenticatedOfficer && <Lock className="w-3 h-3 text-red-800/60" />}
              </div>

              {!authenticatedOfficer && (
                <button
                  type="button"
                  onClick={() => setActiveTab('officer')}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'officer'
                      ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                      : 'text-red-900 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-300/70'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Lock
                      className={`w-4 h-4 shrink-0 ${
                        activeTab === 'officer'
                          ? 'text-amber-300'
                          : 'text-red-800'
                      }`}
                    />
                    <span className="truncate">Login Meja Petugas</span>
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setOfficerSubTab('dashboard');
                  setActiveTab('officer');
                }}
                title={
                  !authenticatedOfficer
                    ? 'Silakan login terlebih dahulu untuk mengakses Dashboard Pelayanan'
                    : undefined
                }
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  Boolean(authenticatedOfficer) &&
                  activeTab === 'officer' &&
                  officerSubTab === 'dashboard'
                    ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                    : !authenticatedOfficer
                    ? 'text-slate-400 hover:bg-stone-50'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-950'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <LayoutDashboard
                    className={`w-4 h-4 shrink-0 ${
                      Boolean(authenticatedOfficer) &&
                      activeTab === 'officer' &&
                      officerSubTab === 'dashboard'
                        ? 'text-amber-300'
                        : !authenticatedOfficer
                        ? 'text-slate-400'
                        : 'text-red-800/70'
                    }`}
                  />
                  <span className="truncate">Dashboard Pelayanan</span>
                </span>
                {!authenticatedOfficer && (
                  <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOfficerPtspFormCode('formulir_2');
                  setOfficerSubTab('ptsp_desk');
                  setActiveTab('officer');
                }}
                title={
                  !authenticatedOfficer
                    ? 'Silakan login terlebih dahulu untuk mengakses Verifikasi Petugas'
                    : undefined
                }
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  Boolean(authenticatedOfficer) &&
                  activeTab === 'officer' &&
                  officerSubTab === 'ptsp_desk' &&
                  officerPtspFormCode === 'formulir_2'
                    ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                    : !authenticatedOfficer
                    ? 'text-slate-400 hover:bg-stone-50'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-950'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <ClipboardCheck
                    className={`w-4 h-4 shrink-0 ${
                      Boolean(authenticatedOfficer) &&
                      activeTab === 'officer' &&
                      officerSubTab === 'ptsp_desk' &&
                      officerPtspFormCode === 'formulir_2'
                        ? 'text-amber-300'
                        : !authenticatedOfficer
                        ? 'text-slate-400'
                        : 'text-red-800/70'
                    }`}
                  />
                  <span className="truncate">Verifikasi Petugas</span>
                </span>
                {authenticatedOfficer ? (
                  <span className="text-[11px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/70 shrink-0">
                    {ptspRecords.length}
                  </span>
                ) : (
                  <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOfficerPtspFormCode('formulir_3');
                  setOfficerSubTab('ptsp_desk');
                  setActiveTab('officer');
                }}
                title={
                  !authenticatedOfficer
                    ? 'Silakan login terlebih dahulu untuk mengakses Tanda Terima Layanan'
                    : undefined
                }
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  Boolean(authenticatedOfficer) &&
                  activeTab === 'officer' &&
                  officerSubTab === 'ptsp_desk' &&
                  officerPtspFormCode === 'formulir_3'
                    ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                    : !authenticatedOfficer
                    ? 'text-slate-400 hover:bg-stone-50'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-950'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <FileCheck
                    className={`w-4 h-4 shrink-0 ${
                      Boolean(authenticatedOfficer) &&
                      activeTab === 'officer' &&
                      officerSubTab === 'ptsp_desk' &&
                      officerPtspFormCode === 'formulir_3'
                        ? 'text-amber-300'
                        : !authenticatedOfficer
                        ? 'text-slate-400'
                        : 'text-red-800/70'
                    }`}
                  />
                  <span className="truncate">Tanda Terima Layanan</span>
                </span>
                {!authenticatedOfficer && (
                  <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOfficerPtspFormCode('formulir_4');
                  setOfficerSubTab('ptsp_desk');
                  setActiveTab('officer');
                }}
                title={
                  !authenticatedOfficer
                    ? 'Silakan login terlebih dahulu untuk mengakses Monitoring Pelayanan'
                    : undefined
                }
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  Boolean(authenticatedOfficer) &&
                  activeTab === 'officer' &&
                  officerSubTab === 'ptsp_desk' &&
                  officerPtspFormCode === 'formulir_4'
                    ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                    : !authenticatedOfficer
                    ? 'text-slate-400 hover:bg-stone-50'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-950'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Activity
                    className={`w-4 h-4 shrink-0 ${
                      Boolean(authenticatedOfficer) &&
                      activeTab === 'officer' &&
                      officerSubTab === 'ptsp_desk' &&
                      officerPtspFormCode === 'formulir_4'
                        ? 'text-amber-300'
                        : !authenticatedOfficer
                        ? 'text-slate-400'
                        : 'text-red-800/70'
                    }`}
                  />
                  <span className="truncate">Monitoring Pelayanan</span>
                </span>
                {!authenticatedOfficer && (
                  <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOfficerPtspFormCode('formulir_lampiran');
                  setOfficerSubTab('ptsp_desk');
                  setActiveTab('officer');
                }}
                title={
                  !authenticatedOfficer
                    ? 'Silakan login terlebih dahulu untuk mengakses Pedoman & Register PTSP'
                    : undefined
                }
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  Boolean(authenticatedOfficer) &&
                  activeTab === 'officer' &&
                  officerSubTab === 'ptsp_desk' &&
                  officerPtspFormCode === 'formulir_lampiran'
                    ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                    : !authenticatedOfficer
                    ? 'text-slate-400 hover:bg-stone-50'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-950'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <BookOpen
                    className={`w-4 h-4 shrink-0 ${
                      Boolean(authenticatedOfficer) &&
                      activeTab === 'officer' &&
                      officerSubTab === 'ptsp_desk' &&
                      officerPtspFormCode === 'formulir_lampiran'
                        ? 'text-amber-300'
                        : !authenticatedOfficer
                        ? 'text-slate-400'
                        : 'text-red-800/70'
                    }`}
                  />
                  <span className="truncate">Pedoman &amp; Register PTSP</span>
                </span>
                {!authenticatedOfficer && (
                  <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                )}
              </button>
            </div>

            {/* Group 3: Dokumen & Utilitas */}
            <div className="space-y-1.5 pt-4 border-t border-stone-200/90">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-red-900/75">
                Dokumen &amp; Register
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-950'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <BookOpen
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === 'register'
                        ? 'text-amber-300'
                        : 'text-red-800/70'
                    }`}
                  />
                  <span className="truncate">Buku Register Harian PTSP</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('template')}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'template'
                    ? 'bg-gradient-to-r from-[#7F1D1D] to-[#58111A] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-950'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <FolderOpen
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === 'template'
                        ? 'text-amber-300'
                        : 'text-red-800/70'
                    }`}
                  />
                  <span className="truncate">Template Dokumen Resmi</span>
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Sidebar Institutional Info */}
          <div className="hidden lg:block rounded-xl bg-gradient-to-br from-amber-50/90 via-red-50/40 to-stone-50 border border-amber-200/80 p-3.5 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-red-950">
              Bawaslu Kabupaten Subang
            </div>
            <div>Jl. Palabuan No. 9 Kel. Sukamelang Kec. Subang</div>
            <div className="font-mono tabular-nums font-semibold text-red-900">
              (0260) 42423530
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT VIEWPORT */}
        <main className="flex-1 min-w-0 max-w-[1260px] w-full mx-auto px-6 py-7">
          {/* TAB 1: TAMPILAN LAYANAN PEMOHON (TERPISAH DARI MEJA PETUGAS) */}
          {activeTab === 'form' && (
            <div className="space-y-6">
              {/* PILIHAN LAYANAN KHUSUS PEMOHON / MASYARAKAT */}
              <div className="no-print bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-gradient-to-r from-red-50/90 via-amber-50/50 to-white border-b border-stone-200/80 px-5 py-4">
                  <h2 className="text-base font-bold text-red-950">
                    Tampilan Layanan PTSP (Khusus Pemohon / Masyarakat)
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Pilih layanan Pemohon: Pendaftaran Pelayanan PTSP, Survei Kepuasan Masyarakat, atau Lacak Status Permohonan.
                  </p>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {PTSP_FORM_LIST.filter(
                    (item) =>
                      item.code === 'formulir_1' || item.code === 'formulir_5'
                  ).map((item) => {
                    const isSelected = applicantSection === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() =>
                          setApplicantSection(
                            item.code as 'formulir_1' | 'formulir_5'
                          )
                        }
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-red-800 bg-gradient-to-br from-red-50/90 via-white to-amber-50/60 text-slate-900 ring-1 ring-red-800/15 shadow-xs'
                            : 'border-stone-200/90 hover:border-red-300 hover:bg-red-50/20 text-slate-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs font-bold ${
                                isSelected ? 'text-red-900' : 'text-slate-900'
                              }`}
                            >
                              {item.fullTitle}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1.5 leading-snug">
                            {item.code === 'formulir_1'
                              ? 'Formulir pendaftaran pelayanan umum PTSP (PPID, Permohonan Data/Dokumen, Konsultasi Kepemiluan/Hukum, Pengaduan, Aspirasi, Audiensi, dll.).'
                              : 'Kuesioner penilaian kepuasan masyarakat terhadap pelayanan PTSP Bawaslu Kabupaten Subang (8 Unsur Pelayanan).'}
                          </p>
                        </div>
                        <span
                          className={`text-[10.5px] font-mono font-semibold mt-3 ${
                            isSelected ? 'text-amber-800' : 'text-slate-400'
                          }`}
                        >
                          Diisi Pemohon
                        </span>
                      </button>
                    );
                  })}

                  {/* Dedicated 3rd Card: Lacak Status Permohonan */}
                  <button
                    type="button"
                    onClick={() => setApplicantSection('lacak_status')}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      applicantSection === 'lacak_status'
                        ? 'border-red-800 bg-gradient-to-br from-red-50/90 via-white to-amber-50/60 text-slate-900 ring-1 ring-red-800/15 shadow-xs'
                        : 'border-stone-200/90 hover:border-red-300 hover:bg-red-50/20 text-slate-700 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold ${
                            applicantSection === 'lacak_status'
                              ? 'text-red-900'
                              : 'text-slate-900'
                          }`}
                        >
                          Lacak Status Permohonan
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-snug">
                        Lacak status terkini berkas permohonan pelayanan PTSP Anda menggunakan Nomor Resi / Pendaftaran.
                      </p>
                    </div>
                    <span
                      className={`text-[10.5px] font-mono font-semibold mt-3 ${
                        applicantSection === 'lacak_status'
                          ? 'text-amber-800'
                          : 'text-slate-400'
                      }`}
                    >
                      Pencarian Berkas Pemohon
                    </span>
                  </button>
                </div>
              </div>

              {applicantSection === 'lacak_status' ? (
                <ApplicationTrackerCard
                  records={ptspRecords}
                  mode="applicant"
                  onInspectPrintRecord={(rec, code) => {
                    setInspectedFormCode(code);
                    setInspectedPtspRecord(rec);
                  }}
                />
              ) : (
                <PtspWorkspace
                  records={ptspRecords}
                  onSaveNewRecord={handleSaveNewPtspRecord}
                  onUpdateRecord={handleUpdatePtspRecord}
                  onSaveSurveyEntry={handleSaveNewSurvey}
                  authenticatedOfficer={authenticatedOfficer}
                  onRequestOfficerLogin={() => setActiveTab('officer')}
                  externalFormCode={applicantFormCode}
                  onChangeFormCode={(code) =>
                    setApplicantSection(
                      code === 'formulir_5' ? 'formulir_5' : 'formulir_1'
                    )
                  }
                  workspaceRole="applicant"
                />
              )}
            </div>
          )}

          {/* TAB 2: BUKU REGISTER HARIAN PTSP */}
          {activeTab === 'register' && (
            <div className="space-y-6 no-print">
              <div className="bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-gradient-to-r from-[#7F1D1D] via-[#6B1114] to-[#4C0519] text-white px-6 py-5 border-b-2 border-amber-400/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Buku Register Harian Pelayanan Terpadu Satu Pintu (PTSP)
                    </h2>
                    <p className="text-xs text-amber-100/85 mt-0.5">
                      Daftar pencatatan resmi permohonan pelayanan publik PTSP Bawaslu Kabupaten Subang.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={exportRegisterCsv}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      Unduh CSV Register PTSP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setApplicantSection('formulir_1');
                        setActiveTab('form');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Pendaftaran Baru
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Search & Segmented Status Filter */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari Nomor Registrasi PTSP, Nama Pemohon, NIK, Instansi/Organisasi, atau Maksud Pelayanan..."
                        className="w-full pl-10 pr-4 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-red-800"
                      />
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg overflow-x-auto">
                      {(
                        [
                          { id: 'ALL', label: 'Semua Status' },
                          {
                            id: 'menunggu_verifikasi',
                            label: 'Menunggu Verifikasi',
                          },
                          { id: 'dalam_proses', label: 'Dalam Proses' },
                          { id: 'selesai', label: 'Selesai' },
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStatusFilter(st.id)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            statusFilter === st.id
                              ? 'bg-red-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* High-Density PTSP Register Table */}
                  <div className="w-full overflow-hidden border border-stone-200 rounded-lg">
                    <table className="w-full table-fixed text-left border-collapse">
                      <thead>
                        <tr className="bg-red-50/75 border-b border-red-200/80 text-[11px] font-bold uppercase tracking-wider text-red-950">
                          <th className="py-3 px-3.5 w-[18%]">No. Registrasi &amp; Tanggal</th>
                          <th className="py-3 px-3.5 w-[18%]">Pemohon &amp; Instansi</th>
                          <th className="py-3 px-3.5 w-[20%]">Jenis Layanan PTSP</th>
                          <th className="py-3 px-3.5 w-[16%]">Unit Tujuan Disposisi</th>
                          <th className="py-3 px-3.5 w-[12%]">Status Penyelesaian</th>
                          <th className="py-3 px-3.5 w-[16%] text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 text-xs">
                        {filteredPtspRecords.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-10 text-center text-slate-500"
                            >
                              Tidak ada berkas permohonan PTSP yang sesuai dengan kriteria pencarian.
                            </td>
                          </tr>
                        ) : (
                          filteredPtspRecords.map((rec) => (
                            <tr
                              key={rec.id}
                              className="hover:bg-amber-50/40 transition-colors"
                            >
                              <td className="py-3.5 px-3.5 align-top font-mono tabular-nums break-all">
                                <div className="font-bold text-red-900">
                                  {rec.registrationNumber}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 break-normal">
                                  {rec.receivedDate || rec.dayAndDate}
                                </div>
                              </td>
                              <td className="py-3.5 px-3.5 align-top break-words">
                                <div className="font-semibold text-slate-900">
                                  {rec.fullName}
                                </div>
                                <div className="text-slate-600 truncate mt-0.5">
                                  {rec.institution || 'Masyarakat Umum'}
                                </div>
                                <div className="text-[11px] font-mono tabular-nums text-slate-400 mt-0.5 truncate">
                                  NIK/ID {rec.nikOrIdentity}
                                </div>
                              </td>
                              <td className="py-3.5 px-3.5 align-top break-words">
                                <div className="text-slate-800 font-medium">
                                  {rec.serviceTypes
                                    .map((s) => PTSP_SERVICE_TYPE_LABELS[s])
                                    .join(' · ')}
                                </div>
                                <div className="text-slate-500 line-clamp-2 mt-0.5">
                                  {rec.purposeSummary}
                                </div>
                              </td>
                              <td className="py-3.5 px-3.5 align-top break-words">
                                <div className="font-medium text-slate-900">
                                  {rec.dispositionTargets
                                    .map((d) => PTSP_DISPOSITION_LABELS[d])
                                    .join(', ') || rec.handlingUnit}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Petugas: {rec.ptspOfficerName || '-'}
                                </div>
                              </td>
                              <td className="py-3.5 px-3.5 align-top break-words">
                                <span
                                  className={`font-semibold ${
                                    rec.completionStatus === 'selesai'
                                      ? 'text-emerald-700'
                                      : rec.completionStatus ===
                                        'menunggu_verifikasi'
                                      ? 'text-amber-700'
                                      : 'text-blue-700'
                                  }`}
                                >
                                  {
                                    PTSP_COMPLETION_STATUS_LABELS[
                                      rec.completionStatus
                                    ]
                                  }
                                </span>
                              </td>
                              <td className="py-3.5 px-3.5 align-top text-right">
                                <div className="flex flex-col items-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInspectedFormCode('formulir_1');
                                      setInspectedPtspRecord(rec);
                                    }}
                                    className="w-full sm:w-auto px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors text-center"
                                  >
                                    Lihat &amp; Cetak
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedOfficerRecordId(rec.id);
                                      setOfficerPtspFormCode('formulir_2');
                                      setOfficerSubTab('ptsp_desk');
                                      setActiveTab('officer');
                                    }}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-red-900 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-md transition-colors"
                                  >
                                    {!authenticatedOfficer && (
                                      <Lock className="w-3 h-3 shrink-0" />
                                    )}
                                    <span>Verifikasi</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEJA PETUGAS PTSP (PROTECTED BY SERVER LOGIN GATE) */}
          {activeTab === 'officer' && (
            <div className="no-print">
              {!authenticatedOfficer ? (
                <OfficerLoginGate onLoginSuccess={handleOfficerLogin} />
              ) : (
                <OfficerDeskPanel
                  currentOfficer={authenticatedOfficer}
                  authToken={authToken}
                  onLogoutOfficer={handleOfficerLogout}
                  ptspRecords={ptspRecords}
                  ptspSurveys={ptspSurveys}
                  onSaveSurveyEntry={handleSaveNewSurvey}
                  onSaveNewPtspRecord={handleSaveNewPtspRecord}
                  onUpdatePtspRecord={handleUpdatePtspRecord}
                  officerSubTab={officerSubTab}
                  onChangeOfficerSubTab={setOfficerSubTab}
                  officerPtspFormCode={officerPtspFormCode}
                  onChangeOfficerPtspFormCode={setOfficerPtspFormCode}
                  selectedPtspRecordId={selectedOfficerRecordId}
                  onChangeSelectedPtspRecordId={setSelectedOfficerRecordId}
                  onInspectPrintRecord={(rec, code) => {
                    setInspectedFormCode(code);
                    setInspectedPtspRecord(rec);
                  }}
                />
              )}
            </div>
          )}

          {/* TAB 4: DOKUMEN BLANKO RESMI PAKET PELAYANAN PTSP */}
          {activeTab === 'template' && (
            <div className="no-print max-w-3xl mx-auto space-y-6">
              <div className="bg-white border border-stone-200/90 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-gradient-to-r from-[#7F1D1D] via-[#6B1114] to-[#4C0519] text-white px-6 py-5 border-b-2 border-amber-400/80">
                  <h2 className="text-lg font-bold text-white">
                    Dokumen Resmi Paket Pelayanan PTSP
                  </h2>
                  <p className="text-xs text-amber-100/85 mt-1 leading-relaxed">
                    Unduh atau lihat dokumen resmi Paket Pelayanan Terpadu Satu Pintu (PTSP) Bawaslu Kabupaten Subang.
                  </p>
                </div>

                <div className="p-6 sm:p-8 space-y-5">
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="font-semibold text-red-950">
                      Daftar Lembar Layanan dalam Paket Dokumen PTSP Bawaslu Kabupaten Subang:
                    </div>
                    <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
                      <li>
                        <strong>Pendaftaran Pelayanan PTSP</strong>
                      </li>
                      <li>
                        <strong>Lembar Penerimaan dan Verifikasi Petugas PTSP</strong>
                      </li>
                      <li>
                        <strong>Tanda Terima Permohonan Pelayanan</strong>
                      </li>
                      <li>
                        <strong>Monitoring dan Penyelesaian Pelayanan</strong>
                      </li>
                      <li>
                        <strong>Survei Kepuasan Masyarakat Terhadap Pelayanan PTSP</strong>
                      </li>
                      <li>
                        <strong>Pedoman Pengelolaan Dokumen PTSP &amp; Format Register Harian PTSP</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href="/assets/aistudio/Formulir_PTSP_Bawaslu_Kabupaten_Subang-1_41c062f8.pdf"
                      download="Formulir_PTSP_Bawaslu_Kabupaten_Subang.pdf"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-red-900 hover:bg-red-950 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <Download className="w-4 h-4 text-amber-300" />
                      Unduh PDF Paket Dokumen PTSP
                    </a>
                    <a
                      href="/assets/aistudio/Formulir_PTSP_Bawaslu_Kabupaten_Subang-1_41c062f8.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Buka PDF PTSP di Tab Baru
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL INSPECT & PRINT PTSP FROM REGISTER */}
      {inspectedPtspRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto p-4 sm:p-8 flex items-start justify-center print:static print:p-0 print:bg-transparent">
          <div className="w-full max-w-[920px] bg-stone-100 rounded-xl overflow-hidden shadow-xl print:shadow-none print:bg-white">
            <div className="no-print bg-gradient-to-r from-[#7F1D1D] to-[#4C0519] text-white px-6 py-4 border-b-2 border-amber-400/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-amber-200 font-mono tabular-nums">
                  {inspectedPtspRecord.registrationNumber} ·{' '}
                  {
                    PTSP_COMPLETION_STATUS_LABELS[
                      inspectedPtspRecord.completionStatus
                    ]
                  }
                </div>
                <h3 className="text-sm font-bold mt-0.5">
                  Dokumen PTSP — {inspectedPtspRecord.fullName}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={inspectedFormCode}
                  onChange={(e) =>
                    setInspectedFormCode(e.target.value as PtspFormCode)
                  }
                  className="px-3 py-1.5 text-xs font-semibold bg-red-950/80 text-white border border-amber-300/40 rounded-lg"
                >
                  {PTSP_FORM_LIST.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.fullTitle}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-red-950 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Formulir
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedPtspRecord(null)}
                  className="p-2 text-amber-200 hover:text-white rounded-lg"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 print:p-0">
              <PtspOfficialSheets
                formCode={inspectedFormCode}
                record={inspectedPtspRecord}
                allRecords={ptspRecords}
              />
            </div>
          </div>
        </div>
      )}

      {/* INSTITUTIONAL FOOTER */}
      <footer className="no-print bg-white border-t-2 border-amber-500/40">
        <div className="max-w-[1360px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <img
              src={BAWASLU_LOGO_DATA_URI}
              alt="Logo Bawaslu"
              className="w-6 h-6 object-contain shrink-0"
            />
            <div>
              <span className="font-bold text-red-950">
                Badan Pengawas Pemilihan Umum Kabupaten Subang
              </span>{' '}
              · Jl. Palabuan No. 9 Kel. Sukamelang Kec. Subang · Telp. (0260) 42423530
            </div>
          </div>
          <div>
            Email:{' '}
            <a
              href="mailto:set.subangkab@bawaslu.go.id"
              className="text-red-900 font-medium underline hover:text-red-700"
            >
              set.subangkab@bawaslu.go.id
            </a>{' '}
            · Pelayanan Terpadu Satu Pintu (PTSP)
          </div>
        </div>
      </footer>
    </div>
  );
}
