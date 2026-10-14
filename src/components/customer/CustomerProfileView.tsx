import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { 
  User, 
  Wallet, 
  Gift, 
  Share2, 
  Copy, 
  MapPin, 
  Phone, 
  Layers, 
  HelpCircle, 
  LogOut, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomerProfileViewProps {
  onOpenRoleModal: () => void;
  onOpenAuthModal: () => void;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({
  onOpenRoleModal,
  onOpenAuthModal,
}) => {
  const { user, selectedDistrict, logout } = useApp();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode || 'BUDI-SEND';

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Yuk pakai Arjawinangun Delivery! Platform hyperlocal pesan makanan, sembako, dan kurir instan se-Arjawinangun. Pakai kode referal saya "${referralCode}" untuk dapat voucher gratis ongkir!`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-28">
      {/* Top Profile Card */}
      <div className="bg-gradient-to-b from-pink-800 to-rose-700 text-white p-5 rounded-b-3xl shadow-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-16 h-16 rounded-full object-cover border-2 border-pink-300 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-pink-400 border-2 border-pink-800" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-extrabold truncate">{user?.name || 'Pelanggan Arjawinangun'}</h2>
            <p className="text-xs text-pink-200">{user?.phone || '081234567890'}</p>
            <span className="inline-block mt-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
              Member Arjawinangun Delivery Aktif
            </span>
          </div>
        </div>

        {/* Balance & Points Strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-pink-200" />
            </div>
            <div>
              <span className="text-[10px] text-pink-200 block">Saldo E-Wallet</span>
              <span className="text-sm font-extrabold">{formatRupiah(user?.balance || 0)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 border-l border-white/20 pl-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] text-pink-200 block">Poin Berkah</span>
              <span className="text-sm font-extrabold text-amber-300">{user?.loyaltyPoints || 0} Poin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Referral Program Card */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">
              <Gift className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">Program Ajak Teman (Referral)</h3>
              <p className="text-[11px] text-slate-600">Dapatkan Rp 5.000 saldo tiap teman yang order</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-pink-200 font-mono text-sm font-extrabold text-slate-800">
            <span>{referralCode}</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleCopyReferral}
                className="text-xs text-pink-700 hover:text-pink-800 font-sans font-bold flex items-center gap-1 bg-pink-100 px-2 py-1 rounded"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Tersalin' : 'Salin'}
              </button>
              <a
                href={waShareUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-white bg-pink-600 hover:bg-pink-700 font-sans font-bold flex items-center gap-1 px-2.5 py-1 rounded transition"
              >
                <Share2 className="w-3 h-3" />
                WA
              </a>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 flex justify-between pt-0.5">
            <span>Teman Bergabung: <strong>{user?.referralsCount || 0} orang</strong></span>
            <span className="text-pink-700 font-bold">Total Bonus: {formatRupiah((user?.referralsCount || 0) * 5000)}</span>
          </div>
        </div>

        {/* Account Menu List */}
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          <button
            onClick={onOpenAuthModal}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition text-left"
          >
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-pink-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Edit Profil & WhatsApp</span>
                <span className="text-[11px] text-slate-500">{user?.name} • {user?.phone}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={onOpenRoleModal}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition text-left"
          >
            <div className="flex items-center space-x-3">
              <Layers className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Ganti Mode Akun</span>
                <span className="text-[11px] text-slate-500">Toko Mitra, Driver Kurir, Admin Founder</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <div className="p-3.5 flex items-center justify-between text-left">
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-orange-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Wilayah Hyperlocal Terdaftar</span>
                <span className="text-[11px] text-slate-500">{selectedDistrict}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
              Arjawinangun
            </span>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Arjawinangun%20Delivery%2C%20saya%20butuh%20bantuan"
            target="_blank"
            rel="noreferrer"
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition text-left"
          >
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-4 h-4 text-pink-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Bantuan & WhatsApp CS</span>
                <span className="text-[11px] text-slate-500">Hubungi langsung customer support</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>

          {/* Logout button */}
          <button
            onClick={logout}
            className="w-full p-3.5 flex items-center justify-between hover:bg-red-50 text-red-600 transition text-left"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="w-4 h-4 text-red-600" />
              <div>
                <span className="text-xs font-bold block">Keluar Akun (Logout)</span>
                <span className="text-[11px] text-red-400">Kembali ke tampilan login awal</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>

        {/* Anti-fraud & Security Statement */}
        <div className="p-3 rounded-xl bg-slate-100 text-slate-500 text-[11px] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            Arjawinangun Delivery dilindungi sistem anti-fraud berbasis verifikasi nomor dan audit otomatis.
          </span>
        </div>
      </div>
    </div>
  );
};
