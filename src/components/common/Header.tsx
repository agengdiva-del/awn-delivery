import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DISTRICTS } from '../../utils/mockData';
import { 
  MapPin, 
  ChevronDown, 
  User, 
  Store as StoreIcon, 
  Bike, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Bell
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface HeaderProps {
  onOpenRoleModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRoleModal, onOpenAuthModal }) => {
  const { 
    currentRole, 
    selectedDistrict, 
    setSelectedDistrict, 
    user, 
    isAuthenticated,
    orders,
    cartItems 
  } = useApp();

  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const activeOrdersCount = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'merchant':
        return {
          label: 'Mode Mitra Toko',
          color: 'bg-amber-500 text-white border-amber-600',
          icon: StoreIcon,
        };
      case 'courier':
        return {
          label: 'Mode Driver Kurir',
          color: 'bg-rose-600 text-white border-rose-700',
          icon: Bike,
        };
      case 'admin':
        return {
          label: 'Admin Founder',
          color: 'bg-indigo-600 text-white border-indigo-700',
          icon: ShieldCheck,
        };
      default:
        return {
          label: 'Pelanggan',
          color: 'bg-pink-50 text-pink-700 border-pink-200',
          icon: User,
        };
    }
  };

  const badge = getRoleBadge();
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-pink-700 via-rose-600 to-pink-600 text-white text-[11px] font-medium py-1 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-pink-300 animate-pulse"></span>
          <span className="font-semibold tracking-wide">ARJAWINANGUN DELIVERY</span>
          <span className="hidden sm:inline text-pink-100">• Lebih Dekat, Lebih Cepat, Untuk Arjawinangun</span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenRoleModal}
            className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[10px] font-semibold transition"
          >
            <Layers className="w-3 h-3" />
            <span>Ganti Peran ({currentRole})</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* District Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
            className="flex items-center space-x-1.5 text-left group"
          >
            <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 group-hover:bg-pink-200 transition">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                Lokasi Anda
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-pink-600 transition" />
              </span>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[170px] sm:max-w-[210px]">
                {selectedDistrict.split(' (')[0]}
              </span>
            </div>
          </button>

          {/* District Dropdown */}
          {showDistrictDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Pilih Wilayah Arjawinangun & Sekitar
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {DISTRICTS.map(dist => (
                  <button
                    key={dist}
                    onClick={() => {
                      setSelectedDistrict(dist);
                      setShowDistrictDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-pink-50 transition ${
                      selectedDistrict === dist ? 'text-pink-600 font-bold bg-pink-50/70' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{dist}</span>
                    {selectedDistrict === dist && (
                      <span className="w-2 h-2 rounded-full bg-pink-600"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons & Role Pill */}
        <div className="flex items-center space-x-2">
          {/* Role Pill Button */}
          <button
            onClick={onOpenRoleModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs transition hover:scale-102 ${badge.color}`}
            title="Klik untuk beralih mode (Pelanggan, Toko, Kurir, Admin)"
          >
            <BadgeIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{badge.label}</span>
          </button>

          {/* User Profile / Login */}
          {isAuthenticated && user ? (
            <button
              onClick={onOpenAuthModal}
              className="relative w-8 h-8 rounded-full border border-pink-300 overflow-hidden shadow-xs hover:ring-2 hover:ring-pink-500 transition"
              title="Akun Saya"
            >
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs transition"
            >
              Masuk
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
