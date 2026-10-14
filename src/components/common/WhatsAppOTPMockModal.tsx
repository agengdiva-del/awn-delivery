import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, CheckCircle, ShieldCheck, X, PhoneCall, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';

interface WhatsAppOTPMockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppOTPMockModal: React.FC<WhatsAppOTPMockModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithCredentials, updateUser, isAuthenticated, logout } = useApp();

  const [phone, setPhone] = useState(user?.phone || '081234567890');
  const [step, setStep] = useState<'input_phone' | 'input_otp'>('input_phone');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showSimulatedBanner, setShowSimulatedBanner] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    if (!phone || phone.length < 9) {
      setErrorMsg('Masukkan nomor WhatsApp yang valid (contoh: 081234567890)');
      return;
    }
    setErrorMsg('');
    setIsSending(true);

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);

    setTimeout(() => {
      setIsSending(false);
      setStep('input_otp');
      setShowSimulatedBanner(true);
    }, 800);
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp !== generatedOtp) {
      setErrorMsg('Kode OTP tidak sesuai. Silakan coba lagi.');
      return;
    }
    setErrorMsg('');
    const res = await loginWithCredentials(phone, '', true);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickFill = () => {
    setEnteredOtp(generatedOtp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col font-sans">
        {/* Simulated WhatsApp Notification banner overlay */}
        {showSimulatedBanner && (
          <div className="bg-emerald-800 text-white p-3 border-b border-emerald-900 flex items-start gap-2.5 animate-in slide-in-from-top-4 duration-200">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-200">WhatsApp Official • Arjawinangun Delivery</span>
                <span className="text-[10px] text-emerald-300">Baru saja</span>
              </div>
              <p className="mt-0.5 text-slate-100">
                Kode Verifikasi OTP Anda: <strong className="text-yellow-300 font-mono text-sm tracking-wider">{generatedOtp}</strong>. JANGAN bagikan kode ini kepada siapapun!
              </p>
              <button
                onClick={handleQuickFill}
                className="mt-1.5 inline-flex items-center text-[10px] font-bold text-emerald-900 bg-yellow-300 hover:bg-yellow-200 px-2 py-0.5 rounded transition"
              >
                Klik untuk Salin & Tempel Otomatis
              </button>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isAuthenticated && user ? 'Kelola Akun Saya' : 'Login WhatsApp OTP'}
              </h3>
              <p className="text-[10px] text-slate-500">Otentikasi aman berbasis database terdaftar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-2xl border border-pink-100">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border border-pink-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{user.name}</h4>
                  <p className="text-xs text-slate-600">{user.phone}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-semibold text-pink-800 bg-pink-200/80 px-2 py-0.5 rounded-full">
                    Terverifikasi Database
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={user.name}
                  onChange={e => updateUser({ name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Pengiriman Utama</label>
                <input
                  type="text"
                  value={user.address}
                  onChange={e => updateUser({ address: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    logout();
                    setStep('input_phone');
                  }}
                  className="flex-1 text-xs font-semibold py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  Keluar Akun
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 text-xs font-bold py-2 px-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-xs transition"
                >
                  Simpan & Tutup
                </button>
              </div>
            </div>
          ) : step === 'input_phone' ? (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2 text-pink-600">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Masukkan Nomor WhatsApp</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Hanya nomor yang sudah terdaftar di database yang dapat masuk.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">🇮🇩 +62</span>
                  <input
                    type="tel"
                    value={phone.startsWith('0') ? phone.slice(1) : phone.startsWith('62') ? phone.slice(2) : phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="81234567890"
                    className="w-full text-xs pl-16 pr-3 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                {errorMsg && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errorMsg}</span>
                  </p>
                )}
              </div>

              <button
                onClick={handleSendOtp}
                disabled={isSending}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirim OTP...</span>
                  </>
                ) : (
                  <span>Kirim Kode OTP WhatsApp</span>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-1">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2 text-pink-600">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Verifikasi Kode OTP</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kode dikirim ke WhatsApp <strong>{phone}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
                  Masukkan 4-Digit Kode
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={e => setEnteredOtp(e.target.value)}
                  placeholder="----"
                  className="w-full text-center tracking-[0.5em] text-xl font-bold py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                {errorMsg && <p className="text-[11px] text-red-500 text-center mt-1">{errorMsg}</p>}
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition"
              >
                Verifikasi & Masuk
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => setStep('input_phone')}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Ubah Nomor
                </button>
                <button
                  onClick={handleSendOtp}
                  className="text-pink-600 hover:underline font-semibold"
                >
                  Kirim Ulang Kode
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
