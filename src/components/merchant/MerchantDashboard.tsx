import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Store, Order } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { 
  Store as StoreIcon, 
  ShoppingBag, 
  DollarSign, 
  Plus, 
  Edit3, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Sparkles, 
  TrendingUp, 
  Package, 
  Tag, 
  Layers, 
  Banknote,
  Search,
  Upload,
  ChevronRight
} from 'lucide-react';

interface MerchantDashboardProps {
  onOpenRoleModal: () => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ onOpenRoleModal }) => {
  const { 
    currentMerchantStore, 
    updateStoreDetails, 
    products, 
    addProduct, 
    updateProduct, 
    toggleProductStock,
    orders, 
    acceptMerchantOrder, 
    setOrderReadyForPickup,
    subscribeMerchantPremium,
    requestWithdrawal,
    registerNewStore,
    user
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'finances' | 'promos' | 'register'>('orders');

  // New product form
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(15000);
  const [newProdCategory, setNewProdCategory] = useState('Makanan');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');

  // Withdrawal form
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(100000);
  const [bankName, setBankName] = useState('BCA (Bank Central Asia)');
  const [accNumber, setAccNumber] = useState('8830192831');
  const [accHolder, setAccHolder] = useState('Siti Nurhaliza (Pemilik Toko)');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Self onboarding new store form
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState<'food' | 'groceries' | 'pharmacy'>('food');
  const [newStoreAddress, setNewStoreAddress] = useState('Jl. Raya Arjawinangun No. 10');
  const [newStoreHours, setNewStoreHours] = useState('08:00 - 21:00');
  const [onboardingSuccess, setOnboardingSuccess] = useState(false);

  // Merchant orders
  const merchantOrders = orders.filter(o => o.storeId === currentMerchantStore.id);
  const pendingOrders = merchantOrders.filter(o => o.status === 'merchant_preparing');
  const dispatchedOrders = merchantOrders.filter(o => !['merchant_preparing', 'delivered', 'cancelled'].includes(o.status));
  const completedOrders = merchantOrders.filter(o => o.status === 'delivered');

  // Revenue calculations
  const totalSales = completedOrders.reduce((acc, o) => acc + o.subtotal, 0);
  const totalCommissionDeducted = completedOrders.reduce((acc, o) => acc + o.platformCommissionMerchant, 0);
  const netEarnings = totalSales - totalCommissionDeducted;
  const storeProducts = products.filter(p => p.storeId === currentMerchantStore.id);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      storeId: currentMerchantStore.id,
      name: newProdName,
      description: newProdDesc,
      price: Number(newProdPrice),
      image: newProdImage,
      category: newProdCategory,
      isAvailable: true,
      isBestSeller: false,
    });
    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdDesc('');
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount > netEarnings && netEarnings > 0) {
      alert('Jumlah penarikan melebihi saldo bersih tersedia.');
      return;
    }
    requestWithdrawal(currentMerchantStore.id, 'merchant', withdrawAmount, bankName, accNumber, accHolder);
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setShowWithdrawModal(false);
    }, 2000);
  };

  const handleSelfOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    registerNewStore({
      name: newStoreName,
      category: newStoreCategory,
      categoryLabel: newStoreCategory === 'food' ? 'Kuliner' : newStoreCategory === 'groceries' ? 'Sembako' : 'Apotek',
      address: newStoreAddress,
      openingHours: newStoreHours,
    });
    setOnboardingSuccess(true);
    setTimeout(() => {
      setOnboardingSuccess(false);
      setActiveTab('orders');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-slate-50 flex flex-col pb-28">
      {/* Top Merchant Brand Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white p-5 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shrink-0">
              <StoreIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black truncate max-w-[200px] sm:max-w-xs">
                  {currentMerchantStore.name}
                </h1>
                {currentMerchantStore.isPremium && (
                  <span className="bg-white text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                    <Sparkles className="w-3 h-3 fill-amber-700" />
                    PREMIUM
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100 mt-0.5">{currentMerchantStore.address}</p>
            </div>
          </div>

          <button
            onClick={onOpenRoleModal}
            className="text-xs bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-full transition"
          >
            Mode Peran
          </button>
        </div>

        {/* Quick Ticker Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-2 bg-black/15 p-3 rounded-2xl border border-white/10 text-center">
          <div>
            <span className="text-[10px] text-amber-200 block">Pesanan Hari Ini</span>
            <span className="text-sm font-extrabold">{merchantOrders.length} Pesanan</span>
          </div>
          <div className="border-x border-white/10">
            <span className="text-[10px] text-amber-200 block">Saldo Bersih</span>
            <span className="text-sm font-extrabold text-white">{formatRupiah(Math.max(185000, netEarnings))}</span>
          </div>
          <div>
            <span className="text-[10px] text-amber-200 block">Rating Toko</span>
            <span className="text-sm font-extrabold text-amber-300">★ {currentMerchantStore.rating}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 px-4 text-xs font-semibold overflow-x-auto no-scrollbar">
        {[
          { id: 'orders', label: `Pesanan Masuk (${pendingOrders.length + dispatchedOrders.length})` },
          { id: 'products', label: `Katalog Menu (${storeProducts.length})` },
          { id: 'finances', label: 'Keuangan & Payout' },
          { id: 'promos', label: 'Iklan & Premium' },
          { id: 'register', label: '+ Daftar Toko Baru' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`py-3 px-3 whitespace-nowrap transition relative ${
              activeTab === tab.id
                ? 'text-amber-700 font-bold border-b-2 border-amber-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {/* ================= ORDERS TAB ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Pending Preparation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  Perlu Disiapkan ({pendingOrders.length})
                </h3>
                <span className="text-[10px] text-slate-500">Auto-Dispatch Aktif</span>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  Belum ada pesanan baru yang perlu disiapkan.
                </div>
              ) : (
                pendingOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 bg-white rounded-2xl border border-amber-300 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {order.orderNumber} • {formatDateTime(order.createdAt)}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                          {order.customerName} ({order.customerPhone})
                        </h4>
                        <p className="text-xs text-slate-500">{order.customerAddress}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {formatRupiah(order.subtotal)}
                      </span>
                    </div>

                    {/* Order items */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span>
                            {item.quantity}x {item.productName}
                          </span>
                          <span>{formatRupiah(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      {order.notes && (
                        <p className="text-[11px] text-amber-700 italic pt-1 border-t border-slate-200">
                          Catatan: &ldquo;{order.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Potongan platform: <strong>10% ({formatRupiah(order.platformCommissionMerchant)})</strong>
                      </span>
                      <button
                        onClick={() => setOrderReadyForPickup(order.id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
                      >
                        Pesanan Siap Diambil Driver
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Dispatched / En Route */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Sedang Diantar Kurir ({dispatchedOrders.length})
              </h3>

              {dispatchedOrders.length === 0 ? (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                  Tidak ada pesanan yang sedang diantar saat ini.
                </div>
              ) : (
                dispatchedOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{order.orderNumber}</span>
                      <span className="text-slate-500">
                        Driver: <strong>{order.courierName || 'Mencari kurir...'}</strong>
                      </span>
                    </div>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                      {order.status === 'on_delivery' ? 'Dalam Perjalanan' : 'Kurir Ditugaskan'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Menu & Stok Produk
              </h3>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Produk
              </button>
            </div>

            <div className="space-y-2">
              {storeProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{product.description}</p>
                    <span className="text-xs font-extrabold text-emerald-800">
                      {formatRupiah(product.price)}
                    </span>
                  </div>

                  {/* Stock Toggle Switch */}
                  <div className="flex flex-col items-end space-y-1 shrink-0">
                    <button
                      onClick={() => toggleProductStock(product.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${
                        product.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {product.isAvailable ? 'Tersedia' : 'Habis'}
                    </button>
                    <span className="text-[9px] text-slate-400">Klik ubah status</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= FINANCES TAB ================= */}
        {activeTab === 'finances' && (
          <div className="space-y-4">
            {/* Automated Split Info Card */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Otomatisasi Finansial & Bagi Hasil
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Potongan komisi 10% platform dihitung instan pada tiap transaksi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-3 rounded-xl border border-pink-100">
                  <span className="text-[10px] text-slate-400 block">Total Penjualan Kotor</span>
                  <span className="text-sm font-extrabold text-slate-800">{formatRupiah(totalSales || 380000)}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-pink-100">
                  <span className="text-[10px] text-slate-400 block">Komisi Platform (10%)</span>
                  <span className="text-sm font-extrabold text-red-600">-{formatRupiah(totalCommissionDeducted || 38000)}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-pink-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block">Saldo Siap Ditarik</span>
                  <span className="text-base font-black text-pink-700">
                    {formatRupiah(Math.max(185000, netEarnings))}
                  </span>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
                >
                  Tarik ke Rekening
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Informasi Pencairan Otomatis:</p>
              <p>• Payout diproses otomatis ke rekening BCA, BRI, Mandiri, BNI, DANA, GoPay.</p>
              <p>• Biaya transfer antar bank: Rp 2.500 (Otomatis dipotong sistem).</p>
            </div>
          </div>
        )}

        {/* ================= PROMOS TAB ================= */}
        {activeTab === 'promos' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="text-xs font-extrabold text-slate-900">
                  Langganan Mitra Premium (Rp 99.000/Bulan)
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Toko Anda otomatis tampil di bagian teratas beranda Arjawinangun Delivery, mendapatkan badge Mitra Resmi, serta komisi platform dipotong hanya 8% (hemat 2%).
              </p>

              {currentMerchantStore.isPremium ? (
                <div className="p-3 bg-pink-100 text-pink-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-pink-600" />
                  Status: Toko Anda Sedang Aktif Sebagai Mitra Premium!
                </div>
              ) : (
                <button
                  onClick={() => subscribeMerchantPremium(currentMerchantStore.id)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition"
                >
                  Tingkatkan ke Premium Sekarang (Rp 99.000/bln)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= REGISTER NEW STORE TAB ================= */}
        {activeTab === 'register' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Pendaftaran Toko Baru (Self-Service Onboarding)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Buka toko kuliner, sembako, atau apotek Anda di Arjawinangun tanpa perlu persetujuan manual admin.
              </p>
            </div>

            {onboardingSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-950">Toko Berhasil Didaftarkan!</h4>
                <p className="text-[11px] text-emerald-800">
                  Toko Anda kini live dan dapat langsung menerima pesanan dari warga Arjawinangun.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSelfOnboard} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Toko / Warung</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bebek Goreng Jungjang Mantap"
                    value={newStoreName}
                    onChange={e => setNewStoreName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Toko</label>
                  <select
                    value={newStoreCategory}
                    onChange={e => setNewStoreCategory(e.target.value as typeof newStoreCategory)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="food">Makanan & Minuman (Kuliner/Warung)</option>
                    <option value="groceries">Belanja & Sembako (Minimarket/Pasar)</option>
                    <option value="pharmacy">Apotek & Obat-obatan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap di Arjawinangun</label>
                  <input
                    type="text"
                    required
                    value={newStoreAddress}
                    onChange={e => setNewStoreAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Operasional</label>
                  <input
                    type="text"
                    value={newStoreHours}
                    onChange={e => setNewStoreHours(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                  Upload NIB / Izin Usaha bersifat opsional untuk UMKM kecil. Sistem otomatis mengaktifkan toko Anda.
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition"
                >
                  Buka Toko Sekarang
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Tambah Menu Baru</h3>
            <form onSubmit={handleCreateProduct} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Nama Menu</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  placeholder="Contoh: Es Campur Segar Durian"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Deskripsi</label>
                <input
                  type="text"
                  required
                  value={newProdDesc}
                  onChange={e => setNewProdDesc(e.target.value)}
                  placeholder="Bahan dan kelezatan menu..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Kategori</label>
                  <input
                    type="text"
                    required
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="text-xs px-3 py-2 text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Tarik Saldo Toko</h3>

            {withdrawSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                Permintaan penarikan {formatRupiah(withdrawAmount)} berhasil dikirimkan ke antrian settlement!
              </div>
            ) : (
              <form onSubmit={handleWithdrawal} className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Jumlah Penarikan</label>
                  <input
                    type="number"
                    min={20000}
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Bank Tujuan</label>
                  <select
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="DANA">DANA E-Wallet</option>
                    <option value="GoPay">GoPay</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Nomor Rekening / HP</label>
                  <input
                    type="text"
                    required
                    value={accNumber}
                    onChange={e => setAccNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    required
                    value={accHolder}
                    onChange={e => setAccHolder(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="text-xs px-3 py-2 text-slate-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Kirim Permintaan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
