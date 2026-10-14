import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { User, Store, Bike, ShieldCheck, X, Check, ArrowRight, Zap } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentRole, setCurrentRole } = useApp();

  if (!isOpen) return null;

  const roles: {
    role: UserRole;
    title: string;
    subtitle: string;
    badge: string;
    icon: typeof User;
    features: string[];
    bgActive: string;
    borderActive: string;
    color: string;
  }[] = [
    {
      role: 'customer',
      title: 'Pelanggan (Customer)',
      subtitle: 'Pesan makanan UMKM, belanja pasar & sembako, kirim barang, bayar tagihan PPOB',
      badge: 'B2C Marketplace',
      icon: User,
      features: [
        'WhatsApp OTP Login',
        'Tracking Kurir Realtime Live Map',
        'Cashless QRIS / E-Wallet & COD',
        'Poin Loyalitas & Referral Rp 5.000',
      ],
      bgActive: 'bg-pink-50',
      borderActive: 'border-pink-600 ring-2 ring-pink-500/20',
      color: 'text-pink-700 bg-pink-100',
    },
    {
      role: 'merchant',
      title: 'Mitra Toko & UMKM (Merchant)',
      subtitle: 'Self-service onboarding tanpa campur tangan admin untuk warung & toko Arjawinangun',
      badge: 'Self-Service Onboarding',
      icon: Store,
      features: [
        'Daftar toko mandiri & upload produk',
        'Manajemen harga, stok & promo',
        'Auto-potong komisi platform 10%',
        'Tarik penghasilan otomatis ke bank',
      ],
      bgActive: 'bg-amber-50',
      borderActive: 'border-amber-600 ring-2 ring-amber-500/20',
      color: 'text-amber-800 bg-amber-100',
    },
    {
      role: 'courier',
      title: 'Kurir Independen (Driver)',
      subtitle: 'Mitra pengantaran bebas dengan sistem auto-dispatch radar 30 detik',
      badge: 'Independent Partner',
      icon: Bike,
      features: [
        'Self-registration KTP, SIM, STNK, Selfie',
        'Smart Auto-Dispatch order timer 30 detik',
        'Navigasi rute jemput & antar',
        'Bagi hasil ongkir adil & dompet digital',
      ],
      bgActive: 'bg-green-50',
      borderActive: 'border-green-600 ring-2 ring-green-500/20',
      color: 'text-green-800 bg-green-100',
    },
    {
      role: 'admin',
      title: 'Admin Founder (Single Founder)',
      subtitle: 'Pusat komando 1 layar untuk mengawasi seluruh operasional & monetisasi otomatis',
      badge: 'Solopreneur Dashboard',
      icon: ShieldCheck,
      features: [
        'Monitor GMV & 8 sumber monetisasi',
        'Log Auto-Dispatch tanpa telpon manual',
        'Deteksi fraud (Fake order & GPS spoof)',
        'Batching pencairan saldo & kelola wilayah',
      ],
      bgActive: 'bg-indigo-50',
      borderActive: 'border-indigo-600 ring-2 ring-indigo-500/20',
      color: 'text-indigo-800 bg-indigo-100',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-700 uppercase tracking-wider">
              <Zap className="w-4 h-4 fill-pink-600 text-pink-600" />
              Multi-Role Switcher
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              Pilih Tampilan Pengguna
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Note */}
        <div className="px-5 py-2.5 bg-pink-50 border-b border-pink-100 text-xs text-pink-950 flex items-center justify-between">
          <span>
            Platform ini <strong>bukan toko</strong> dan <strong>tidak mempekerjakan kurir langsung</strong>, melainkan konektor otomatis 3 pihak.
          </span>
        </div>

        {/* Roles List */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {roles.map(item => {
            const isSelected = currentRole === item.role;
            const Icon = item.icon;

            return (
              <div
                key={item.role}
                onClick={() => {
                  setCurrentRole(item.role);
                  onClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected ? `${item.bgActive} ${item.borderActive} shadow-sm` : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 group-hover:text-slate-600">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Features Bullets */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-2 gap-1.5">
                  {item.features.map((feat, i) => (
                    <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0"></span>
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Anda dapat berganti peran kapan saja melalui tombol peran di header atas.
          </p>
        </div>
      </div>
    </div>
  );
};
