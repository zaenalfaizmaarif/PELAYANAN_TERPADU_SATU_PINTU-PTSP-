import React from 'react';
import {
  MediationRequestMC01,
  IssueStage,
} from '../types/mediation';

interface OfficialFormPreviewProps {
  data: MediationRequestMC01;
}

const CheckBoxSymbol: React.FC<{ checked: boolean }> = ({ checked }) => (
  <span
    className={`inline-flex items-center justify-center w-4 h-4 border border-black text-[11px] font-bold leading-none select-none shrink-0 mt-0.5 ${
      checked ? 'bg-slate-900 text-white print:bg-transparent print:text-black' : 'bg-white text-transparent'
    }`}
  >
    {checked ? '✓' : ''}
  </span>
);

export const OfficialFormPreview: React.FC<OfficialFormPreviewProps> = ({
  data,
}) => {
  const hasStage = (stage: IssueStage) => data.issueStages.includes(stage);

  const docA = data.supportingDocuments[0]?.label || '';
  const docB = data.supportingDocuments[1]?.label || '';
  const docC = data.supportingDocuments[2]?.label || '';
  const extraDocs = data.supportingDocuments.slice(3);

  return (
    <div className="space-y-8 print:space-y-0">
      {/* HALAMAN 1 DARI 2 */}
      <div className="bg-white text-black border border-slate-300 shadow-sm p-8 sm:p-12 max-w-[820px] mx-auto print-only-sheet print-page-break font-serif text-[13.5px] leading-relaxed">
        {/* Top Right Formulir MC-01 Box */}
        <div className="flex justify-end mb-4">
          <div className="border border-black px-5 py-1.5 font-bold text-sm tracking-wide">
            Formulir MC-01
          </div>
        </div>

        {/* Kop Surat Bawaslu Kabupaten Subang */}
        <div className="flex items-center justify-center gap-4 border-b border-black pb-3 mb-4">
          <img
            src="/assets/aistudio/logo_bawaslu-01_1cf173b0.png"
            alt="Logo Bawaslu Kabupaten Subang"
            className="w-16 h-16 object-contain shrink-0"
          />
          <div className="text-center">
            <p className="font-bold text-base tracking-wide uppercase leading-snug">
              BADAN PENGAWAS PEMILIHAN UMUM
            </p>
            <p className="font-bold text-base tracking-wide uppercase leading-snug">
              KABUPATEN SUBANG
            </p>
            <p className="text-[11.5px] font-sans mt-1 text-slate-900">
              Alamat : Jl. Palabuan No. 9 Kel. Sukamelang Kec. Subang Telp.(0260) 42423530 Email.{' '}
              <span className="underline">set.subangkab@bawaslu.go.id</span>
            </p>
          </div>
        </div>

        {/* Judul Formulir & Nomor Register */}
        <div className="text-center mb-5">
          <p className="font-bold text-sm uppercase leading-snug">
            FORMULIR PERMINTAAN LAYANAN KONSULTASI
          </p>
          <p className="font-bold text-sm uppercase leading-snug">
            MEDIATION CLINIC
          </p>
          <p className="mt-2 text-[13px] font-mono tabular-nums">
            Nomor Register:{' '}
            <span className="underline px-1 font-semibold">
              {data.officerData.registerNumber || data.registerNumber || '_________/MC/686138/  /2026'}
            </span>
          </p>
        </div>

        {/* SECTION A: IDENTITAS PEMOHON */}
        <div className="bg-slate-200/80 print:bg-gray-200 px-2.5 py-1 font-bold text-[13px] uppercase mb-3 border border-slate-300">
          A. IDENTITAS PEMOHON
        </div>

        <div className="space-y-2.5 text-[13px]">
          {/* 1. Nama Lengkap */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">1.</span>
              <span>Nama Lengkap</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px] font-medium">
                {data.fullName}
              </span>
            </div>
          </div>

          {/* 2. NIK */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">2.</span>
              <span>Nomor Induk Kependudukan</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px] font-mono tabular-nums">
                {data.nik}
              </span>
            </div>
          </div>

          {/* 3. Kategori Pemohon */}
          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">3.</span>
              <span>Kategori Pemohon</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start gap-2">
                  <CheckBoxSymbol checked={data.category === 'partai_politik'} />
                  <span>Partai politik peserta/calon peserta Pemilu</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckBoxSymbol checked={data.category === 'calon_dpr_dprd'} />
                  <span>
                    Bakal calon/calon anggota DPR, DPRD Provinsi, atau DPRD Kabupaten/Kota
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckBoxSymbol checked={data.category === 'calon_dpd'} />
                  <span>Bakal calon/calon anggota DPD</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <CheckBoxSymbol checked={data.category === 'pemangku_lainnya'} />
                  <span className="shrink-0">Pemangku kepentingan lainnya:</span>
                  <span className="flex-1 border-b border-dotted border-black min-h-[18px]">
                    {data.category === 'pemangku_lainnya' ? data.categoryOtherText : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Nama Partai Politik / Lembaga / Instansi */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">4.</span>
              <span>Nama Partai Politik/ Lembaga/Instansi</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                {data.institutionName}
              </span>
            </div>
          </div>

          {/* 5. Jabatan/Kedudukan */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">5.</span>
              <span>Jabatan/Kedudukan</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                {data.positionTitle}
              </span>
            </div>
          </div>

          {/* 6. Kehadiran Pemohon */}
          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">6.</span>
              <span>Kehadiran Pemohon</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start gap-2">
                  <CheckBoxSymbol checked={data.attendanceType === 'pribadi'} />
                  <span>Atas nama pribadi</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckBoxSymbol checked={data.attendanceType === 'mewakili'} />
                  <span>
                    Mewakili partai politik/lembaga (melampirkan surat tugas/mandat)
                    {data.attendanceType === 'mewakili' && data.mandateFileName ? (
                      <span className="ml-1.5 text-xs italic text-slate-700">
                        [{data.mandateFileName}]
                      </span>
                    ) : null}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Alamat */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">7.</span>
              <span>Alamat</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[38px]">
                {data.address}
              </span>
            </div>
          </div>

          {/* 8. Nomor Telepon/WhatsApp */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">8.</span>
              <span>Nomor Telepon/WhatsApp</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px] font-mono tabular-nums">
                {data.phoneWhatsapp}
              </span>
            </div>
          </div>

          {/* 9. Alamat Pos-el (E-mail) */}
          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">9.</span>
              <span>Alamat Pos-el (E-mail)</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                {data.email}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION B: POKOK PERSOALAN YANG DIKONSULTASIKAN */}
        <div className="bg-slate-200/80 print:bg-gray-200 px-2.5 py-1 font-bold text-[13px] uppercase mt-5 mb-3 border border-slate-300">
          B. POKOK PERSOALAN YANG DIKONSULTASIKAN
        </div>

        <div className="space-y-3 text-[13px]">
          {/* 1. Tahapan/Isu */}
          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">1.</span>
              <span>Tahapan/Isu</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start gap-2">
                  <CheckBoxSymbol
                    checked={hasStage('pendaftaran_verifikasi_parpol')}
                  />
                  <span>Pendaftaran dan verifikasi partai politik</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckBoxSymbol
                    checked={hasStage('pemutakhiran_data_parpol')}
                  />
                  <span>Pemutakhiran Data Partai Politik Berkelanjutan</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckBoxSymbol checked={hasStage('pencalonan')} />
                  <span>Pencalonan</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckBoxSymbol checked={hasStage('kampanye')} />
                  <span>Kampanye</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckBoxSymbol
                    checked={hasStage('mekanisme_permohonan_sengketa')}
                  />
                  <span>
                    Mekanisme pengajuan permohonan penyelesaian sengketa
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <CheckBoxSymbol checked={hasStage('lainnya')} />
                  <span className="shrink-0">Lainnya:</span>
                  <span className="flex-1 border-b border-dotted border-black min-h-[18px]">
                    {hasStage('lainnya') ? data.issueOtherText : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Uraian Singkat Persoalan */}
          <div className="space-y-1">
            <div className="flex gap-2">
              <span className="w-4 shrink-0">2.</span>
              <span>Uraian Singkat Persoalan :</span>
            </div>
            <div className="pl-6">
              <div className="border border-dotted border-slate-500 p-3 min-h-[110px] whitespace-pre-wrap leading-relaxed bg-slate-50/40 print:bg-transparent">
                {data.issueSummary ||
                  '.......................................................................................................................................'}
              </div>
            </div>
          </div>

          {/* 3. Keputusan/Objek yang Dipersoalkan */}
          <div className="grid grid-cols-12 gap-2 items-baseline pt-1">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">3.</span>
              <span>Keputusan/Objek yang Dipersoalkan (apabila ada)</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                {data.disputedDecisionObject || '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-right text-xs italic text-slate-600">
          Halaman 1 dari 2
        </div>
      </div>

      {/* HALAMAN 2 DARI 2 */}
      <div className="bg-white text-black border border-slate-300 shadow-sm p-8 sm:p-12 max-w-[820px] mx-auto print-only-sheet font-serif text-[13.5px] leading-relaxed">
        {/* 4. Dokumen Pendukung yang Dibawa/Dilampirkan */}
        <div className="space-y-2 text-[13px]">
          <div className="flex gap-2">
            <span className="w-4 shrink-0">4.</span>
            <span>Dokumen Pendukung yang Dibawa/Dilampirkan :</span>
          </div>
          <div className="pl-6 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="w-4 shrink-0">a.</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                {docA}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="w-4 shrink-0">b.</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                {docB}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="w-4 shrink-0">c.</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                {docC}
              </span>
            </div>
            {extraDocs.map((doc, idx) => (
              <div key={doc.id} className="flex items-baseline gap-2">
                <span className="w-4 shrink-0">
                  {String.fromCharCode(100 + idx)}.
                </span>
                <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                  {doc.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION C: METODE DAN JADWAL LAYANAN YANG DIHARAPKAN */}
        <div className="bg-slate-200/80 print:bg-gray-200 px-2.5 py-1 font-bold text-[13px] uppercase mt-5 mb-3 border border-slate-300">
          C. METODE DAN JADWAL LAYANAN YANG DIHARAPKAN
        </div>

        <div className="space-y-2.5 text-[13px]">
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">1.</span>
              <span>Metode Layanan</span>
            </div>
            <div className="col-span-8 flex gap-2 items-center">
              <span>:</span>
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-2">
                  <CheckBoxSymbol checked={data.serviceMethod === 'tatap_muka'} />
                  <span>Tatap muka</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckBoxSymbol checked={data.serviceMethod === 'daring'} />
                  <span>Daring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckBoxSymbol checked={data.serviceMethod === 'telepon'} />
                  <span>Telepon</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 items-baseline">
            <div className="col-span-4 flex gap-2">
              <span className="w-4 shrink-0">2.</span>
              <span>Hari/Tanggal dan Waktu</span>
            </div>
            <div className="col-span-8 flex gap-2">
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                {data.expectedScheduleFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION D: PERNYATAAN PEMOHON */}
        <div className="bg-slate-200/80 print:bg-gray-200 px-2.5 py-1 font-bold text-[13px] uppercase mt-5 mb-3 border border-slate-300">
          D. PERNYATAAN PEMOHON
        </div>

        <div className="text-[13px] space-y-1.5">
          <p>Dengan menandatangani formulir ini, saya menyatakan memahami bahwa:</p>
          <ol className="list-decimal pl-6 space-y-1 text-justify">
            <li>
              layanan Mediation Clinic bersifat konsultatif dan edukatif untuk pencegahan
              sengketa proses Pemilihan Umum serta diberikan tanpa pungutan biaya;
            </li>
            <li>
              konsultasi bukan merupakan pengajuan, penerimaan, atau registrasi permohonan
              penyelesaian sengketa proses Pemilihan Umum, serta tidak menunda atau
              memperpanjang tenggang waktu pengajuan permohonan;
            </li>
            <li>
              petugas tidak bertindak sebagai kuasa atau pendamping kepentingan salah satu
              pihak dan tidak menjanjikan hasil penyelesaian sengketa;
            </li>
            <li>
              informasi yang saya sampaikan dijaga kerahasiaannya dan hanya digunakan untuk
              keperluan layanan, pelaporan, serta evaluasi kinerja Badan Pengawas Pemilihan
              Umum Kabupaten Subang sesuai ketentuan peraturan perundang-undangan; dan
            </li>
            <li>
              data dan keterangan yang saya sampaikan dalam formulir ini adalah benar.
            </li>
          </ol>
        </div>

        {/* Tanggal & Blok Tanda Tangan */}
        <div className="mt-5 text-[13px]">
          <div className="flex justify-end pr-8 mb-2">
            <span>
              Subang,{' '}
              <span className="underline px-2">
                {data.signingDateFormatted || '__________________ 2026'}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 text-center mt-2">
            {/* Petugas Penerima */}
            <div className="flex flex-col items-center">
              <p>Petugas Penerima,</p>
              <div className="h-20 flex items-center justify-center my-1">
                {data.officerData.receivingOfficerSignature ? (
                  <img
                    src={data.officerData.receivingOfficerSignature}
                    alt="Tanda Tangan Petugas"
                    className="max-h-16 object-contain"
                  />
                ) : null}
              </div>
              <p className="font-medium">
                (
                <span className="inline-block min-w-[180px] border-b border-dotted border-black px-2">
                  {data.officerData.receivingOfficerName || ''}
                </span>
                )
              </p>
              <p className="mt-1 font-mono text-xs tabular-nums">
                NIP/NIK{' '}
                <span className="inline-block min-w-[140px] border-b border-dotted border-black text-left px-1">
                  {data.officerData.receivingOfficerNipNik || ''}
                </span>
              </p>
            </div>

            {/* Pemohon */}
            <div className="flex flex-col items-center">
              <p>Pemohon,</p>
              <div className="h-20 flex items-center justify-center my-1">
                {data.applicantSignature ? (
                  <img
                    src={data.applicantSignature}
                    alt="Tanda Tangan Pemohon"
                    className="max-h-16 object-contain"
                  />
                ) : null}
              </div>
              <p className="font-medium">
                (
                <span className="inline-block min-w-[180px] border-b border-dotted border-black px-2">
                  {data.fullName || ''}
                </span>
                )
              </p>
              <p className="mt-1 text-xs">Nama dan tanda tangan</p>
            </div>
          </div>
        </div>

        {/* SECTION E: DIISI OLEH PETUGAS */}
        <div className="mt-6 border border-black p-4 text-[13px]">
          <p className="font-bold uppercase mb-2.5">E. DIISI OLEH PETUGAS</p>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 items-baseline">
              <div className="col-span-4 flex gap-2">
                <span className="w-4 shrink-0">1.</span>
                <span>Tanggal dan Jam Diterima</span>
              </div>
              <div className="col-span-8 flex gap-2">
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                  {data.officerData.receivedDateTime}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-baseline">
              <div className="col-span-4 flex gap-2">
                <span className="w-4 shrink-0">2.</span>
                <span>Nomor Register</span>
              </div>
              <div className="col-span-8 flex gap-2">
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-black min-h-[20px] font-mono tabular-nums">
                  {data.officerData.registerNumber || data.registerNumber}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-baseline">
              <div className="col-span-4 flex gap-2">
                <span className="w-4 shrink-0">3.</span>
                <span>Jadwal Konsultasi</span>
              </div>
              <div className="col-span-8 flex gap-2">
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                  {data.officerData.consultationSchedule}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-baseline">
              <div className="col-span-4 flex gap-2">
                <span className="w-4 shrink-0">4.</span>
                <span>Pelaksana Konsultasi</span>
              </div>
              <div className="col-span-8 flex gap-2">
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                  {data.officerData.consultationExecutor}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-baseline">
              <div className="col-span-4 flex gap-2">
                <span className="w-4 shrink-0">5.</span>
                <span>Catatan/Arahan Ketua Pelaksana</span>
              </div>
              <div className="col-span-8 flex gap-2">
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-black min-h-[20px]">
                  {data.officerData.chairmanNotes}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Catatan Kaki Resmi */}
        <p className="mt-2.5 text-[11.5px] italic leading-snug">
          <span className="font-bold not-italic">Catatan:</span> Beri tanda (✓) pada kotak yang sesuai. Formulir yang telah diisi diserahkan kepada Petugas Layanan dan dicatat dalam Register Permintaan Layanan Konsultasi Mediation Clinic.
        </p>

        <div className="mt-6 text-right text-xs italic text-slate-600">
          Halaman 2 dari 2
        </div>
      </div>
    </div>
  );
};
