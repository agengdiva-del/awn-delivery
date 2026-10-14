import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Store, Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { 
  Search, 
  Utensils, 
  ShoppingBag, 
  Package, 
  Receipt, 
  Store as StoreIcon, 
  Pill, 
  ShoppingBasket, 
  Sparkles, 
  Star, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Tag, 
  Ticket, 
  ShieldCheck, 
  Bell,
  Heart,
  Flame,
  ArrowRight
} from 'lucide-react';

interface CustomerHomeProps {
  onSelectStore: (store: Store) => void;
  onOpenSendPackage: () => void;
  onOpenPPOB: () => void;
  onOpenCart: () => void;
  onOpenOrders: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onSelectStore,
  onOpenSendPackage,
  onOpenPPOB,
  onOpenCart,
  onOpenOrders,
}) => {
  const { 
    merchants, 
    banners, 
    cartItems, 
    selectedDistrict, 
    applyPromoCode,
    activeOrder,
    orders 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [claimedPromo, setClaimedPromo] = useState(false);

  // Filter merchants
  const filteredMerchants = merchants.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategoryFilter === 'all'
        ? true
        : activeCategoryFilter === 'food'
        ? m.category === 'food'
        : activeCategoryFilter === 'groceries'
        ? m.category === 'groceries'
        : activeCategoryFilter === 'pharmacy'
        ? m.category === 'pharmacy'
        : true;

    return matchesSearch && matchesCategory;
  });

  const cartTotalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const liveActiveOrder = orders.find(o => !['delivered', 'cancelled'].includes(o.status));

  const handleClaimGratisOngkir = () => {
    applyPromoCode('ARJAWINGRATIS');
    setClaimedPromo(true);
    setTimeout(() => setClaimedPromo(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-28">
      {/* Hero Header Section styled with vibrant pink food delivery theme */}
      <div className="bg-gradient-to-b from-pink-600 via-rose-600 to-pink-700 text-white pt-4 pb-6 px-4 rounded-b-3xl shadow-sm relative overflow-hidden">
        {/* Decorative Background Waves & Arch hint */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M40 160H160" stroke="#FFFFFF" strokeWidth="8" />
          </svg>
        </div>

        {/* Top Tagline */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-pink-100 tracking-wider">
            Dari Arjawinangun Untuk Anda
          </span>
          <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full text-white">
            100% Karya Lokal
          </span>
        </div>

        {/* Brand Headline */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Arjawinangun Delivery</span>
            </h1>
            <p className="text-xs text-pink-100 font-medium mt-0.5">
              Lebih Dekat, Lebih Cepat, Untuk Arjawinangun
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Mau kirim atau pesan apa hari ini?"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white text-slate-900 rounded-2xl shadow-sm placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-5 -mt-2">
        {/* Active Order Float if any */}
        {liveActiveOrder && (
          <div
            onClick={onOpenOrders}
            className="bg-pink-700 text-white p-3 rounded-2xl shadow-md border border-pink-500 flex items-center justify-between cursor-pointer hover:bg-pink-800 transition animate-in slide-in-from-top-2"
          >
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-300 animate-pulse" />
              <div>
                <span className="text-xs font-bold block">
                  Pesanan Aktif: {liveActiveOrder.storeName || liveActiveOrder.orderNumber}
                </span>
                <span className="text-[11px] text-pink-200">
                  {liveActiveOrder.courierName
                    ? `Driver ${liveActiveOrder.courierName} sedang menuju ke lokasi`
                    : 'Sedang disiapkan / diproses'}
                </span>
              </div>
            </div>
            <div className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>Lacak</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* 4 Primary Quick Action Services matching poster */}
        <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-100 grid grid-cols-4 gap-2 text-center">
          {/* Makanan */}
          <button
            onClick={() => setActiveCategoryFilter('food')}
            className="flex flex-col items-center group transition active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-200 transition shadow-2xs">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800 mt-1.5">Makanan</span>
            <span className="text-[9px] text-slate-400">Resto & UMKM</span>
          </button>

          {/* Belanja */}
          <button
            onClick={() => setActiveCategoryFilter('groceries')}
            className="flex flex-col items-center group transition active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center group-hover:bg-pink-200 transition shadow-2xs">
              <ShoppingBasket className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800 mt-1.5">Belanja</span>
            <span className="text-[9px] text-slate-400">Pasar & Mart</span>
          </button>

          {/* Kirim Barang */}
          <button
            onClick={onOpenSendPackage}
            className="flex flex-col items-center group transition active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-200 transition shadow-2xs">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800 mt-1.5">Kirim Barang</span>
            <span className="text-[9px] text-slate-400">Kurir Instan</span>
          </button>

          {/* Tagihan / PPOB */}
          <button
            onClick={onOpenPPOB}
            className="flex flex-col items-center group transition active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-200 transition shadow-2xs">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-800 mt-1.5">Tagihan</span>
            <span className="text-[9px] text-slate-400">PLN & Pulsa</span>
          </button>
        </div>

        {/* Layanan Favorit Row matching poster */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">
              Layanan Favorit
            </h3>
            <span className="text-[10px] text-slate-400">Pilihan Terpopuler</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <button
              onClick={() => setActiveCategoryFilter('food')}
              className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs flex flex-col items-center hover:border-pink-200 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1 truncate max-w-full">
                Restoran Terdekat
              </span>
            </button>

            <button
              onClick={() => setActiveCategoryFilter('groceries')}
              className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs flex flex-col items-center hover:border-pink-200 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <StoreIcon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1 truncate max-w-full">
                Minimarket
              </span>
            </button>

            <button
              onClick={() => setActiveCategoryFilter('pharmacy')}
              className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs flex flex-col items-center hover:border-pink-200 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1 truncate max-w-full">
                Apotek 24 Jam
              </span>
            </button>

            <button
              onClick={() => setActiveCategoryFilter('all')}
              className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs flex flex-col items-center hover:border-pink-200 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1 truncate max-w-full">
                Toko Online
              </span>
            </button>
          </div>
        </div>

        {/* Promo Spesial Spanduk */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="relative z-1 max-w-[70%]">
            <span className="text-[10px] font-bold bg-white/20 text-pink-100 px-2 py-0.5 rounded-full inline-block mb-1">
              PROMO SPESIAL
            </span>
            <h3 className="text-sm font-extrabold uppercase leading-tight">
              GRATIS ONGKIR di area Arjawinangun
            </h3>
            <p className="text-[11px] text-pink-100 mt-0.5">
              Kupon: <strong className="text-amber-300 font-mono">ARJAWINGRATIS</strong>
            </p>
            <button
              onClick={handleClaimGratisOngkir}
              className="mt-2 text-xs font-bold bg-white text-pink-900 hover:bg-pink-50 px-3 py-1 rounded-full shadow-xs transition"
            >
              {claimedPromo ? '✓ Kupon Terpasang!' : 'Klaim Sekarang'}
            </button>
          </div>

          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <Ticket className="w-10 h-10 text-white/90" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: 'Semua Toko' },
            { id: 'food', label: 'Kuliner & Makanan' },
            { id: 'groceries', label: 'Sembako & Pasar' },
            { id: 'pharmacy', label: 'Apotek & Obat' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveCategoryFilter(f.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs transition ${
                activeCategoryFilter === f.id
                  ? 'bg-pink-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Merchant Store Cards List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Toko & Resto Terdekat ({filteredMerchants.length})
            </h3>
            <span className="text-[10px] text-slate-400">Area {selectedDistrict.split(' (')[0]}</span>
          </div>

          {filteredMerchants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-xs text-slate-400">
              Tidak ada toko yang sesuai dengan filter.
            </div>
          ) : (
            filteredMerchants.map(merchant => (
              <div
                key={merchant.id}
                onClick={() => onSelectStore(merchant)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:border-pink-400 hover:shadow-xs transition cursor-pointer group"
              >
                <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={merchant.banner}
                    alt={merchant.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {merchant.isPremium && (
                    <div className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 fill-slate-900" />
                      MITRA RESMI
                    </div>
                  )}

                  <div className="absolute bottom-2 left-3 right-3 text-white flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                      {merchant.estimatedDeliveryMin}
                    </span>
                    <span className="text-[10px] text-slate-200 font-medium">
                      {merchant.distanceKm} km
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-pink-600 transition">
                        {merchant.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{merchant.address}</p>
                    </div>

                    <div className="flex items-center text-amber-500 font-extrabold text-xs shrink-0 ml-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                      {merchant.rating}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center space-x-1 truncate">
                      {merchant.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="text-pink-600 font-bold shrink-0 flex items-center gap-0.5">
                      Lihat Menu
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar if items in cart */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 z-30">
          <button
            onClick={onOpenCart}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold p-3 rounded-2xl shadow-xl shadow-pink-600/30 flex items-center justify-between transition animate-in slide-in-from-bottom-2"
          >
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs flex items-center justify-center font-bold">
                {cartTotalItems}
              </span>
              <span className="text-xs">Keranjang Anda</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span>Buka Keranjang</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
