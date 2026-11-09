import React, { useState } from 'react';
import { Lock, UserCheck, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

export interface AuthenticatedOfficer {
  id: string;
  username: string;
  fullName: string;
  nipNik: string;
  roleTitle: string;
  accessLevel: 'petugas_penerima' | 'ketua_pelaksana';
}

interface OfficerLoginGateProps {
  onLoginSuccess: (officer: AuthenticatedOfficer, token: string) => void;
}

export const OfficerLoginGate: React.FC<OfficerLoginGateProps> = ({
  onLoginSuccess,
}) => {
  const [usernameOrNip, setUsernameOrNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrNip: usernameOrNip.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(
          data.error ||
            'Autentikasi gagal. Periksa kembali ID Pengguna/NIP dan Kata Sandi Anda.'
        );
        setIsSubmitting(false);
        return;
      }

      onLoginSuccess(data.officer, data.token);
    } catch {
      setErrorMsg(
        'Tidak dapat terhubung ke server autentikasi. Pastikan server berjalan dan coba kembali.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
      <div className="mb-6">
        <div className="flex flex-col items-center text-center gap-2.5 mb-4 pb-4 border-b border-slate-200">
          <img
            src="/assets/aistudio/logo_bawaslu-01_1cf173b0.png"
            alt="Logo Bawaslu Kabupaten Subang"
            className="w-14 h-14 object-contain"
          />
          <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 leading-snug">
            BADAN PENGAWAS PEMILIHAN UMUM
            <br />
            KABUPATEN SUBANG
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 text-center">
          Masuk ke Meja Petugas PTSP
        </h3>
        <p className="text-xs text-slate-500 mt-1 text-center">
          Masukkan ID Pengguna atau NIP beserta Kata Sandi petugas Bawaslu Kabupaten Subang.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            ID Pengguna atau NIP Petugas
          </label>
          <div className="relative">
            <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              autoComplete="username"
              value={usernameOrNip}
              onChange={(e) => setUsernameOrNip(e.target.value)}
              placeholder="Masukkan ID Pengguna atau NIP"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kata Sandi
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi petugas"
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Tampilkan kata sandi"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800">
            {errorMsg}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-red-800 hover:bg-red-900 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isSubmitting ? 'Memverifikasi di Server...' : 'Masuk ke Meja Petugas'}
            </span>
          </button>
        </div>

        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Autentikasi Terenkripsi Server (Scrypt Hash & Token Sesi)</span>
        </div>
      </form>
    </div>
  );
};
