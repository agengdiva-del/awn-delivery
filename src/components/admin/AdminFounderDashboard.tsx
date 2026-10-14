import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { DISTRICTS } from '../../utils/mockData';
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Bike, 
  Store, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Cpu, 
  Layers, 
  Zap, 
  Eye, 
  Sliders, 
  Receipt,
  Sparkles,
  PhoneCall,
  Activity,
  Award,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminFounderDashboardProps {
  onOpenRoleModal: () => void;
}

export const AdminFounderDashboard: React.FC<AdminFounderDashboardProps> = ({ onOpenRoleModal }) => {
  const { 
    orders, 
    merchants, 
    couriers, 
    withdrawals, 
    fraudAlerts, 
    approveWithdrawal,
    approveCourierKYC,
    rejectCourierKYC,
    approveMerchantKYC,
    resolveFraudAlert,
    suspendEntity,
    resetAllData,
    autoDispatchLogs,
    selectedDistrict,
    setSelectedDistrict
  } = useApp();

  const [activeSection, setActiveSection] = useState<'overview' | 'dispatch' | 'monetization' | 'fraud' | 'verifications' | 'withdrawals'>('overview');
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(true);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(true);

  // Financial Metrics across 8 Monetization Channels
  const allOrders = orders;
  const completedOrders = allOrders.filter(o => o.status === 'delivered');
  const totalGMV = allOrders.reduce((acc, o) => acc + o.total, 0);

  // 1. Merchant 10% commission
  const revMerchantCommission = completedOrders.reduce((acc, o) => acc + o.platformCommissionMerchant, 0);
  // 2. Delivery fee share
  const revDeliveryFeeShare = completedOrders.reduce((acc, o) => acc + o.platformDeliveryFeeShare, 0);
  // 3. Merchant Premium subscriptions (Rp 99.000 per premium store)
  const premiumStoresCount = merchants.filter(m => m.isPremium).length;
  const revMerchantSubscriptions = premiumStoresCount * 99000;
  // 4. Featured Banner Ads (e.g. 2 active sponsored banners @ Rp 45.000)
  const revBannerAds = 90000;
  // 5. Priority Courier Program (Rp 25.000 per priority courier)
  const priorityCouriersCount = couriers.filter(c => c.isPriority).length;
  const revPriorityCouriers = priorityCouriersCount * 25000;
  // 6. Platform Service Fee (Rp 1.000 per order)
  const revServiceFee = completedOrders.reduce((acc, o) => acc + o.serviceFee, 0);
  // 7. Digital PPOB product admin fees
  const ppobOrders = completedOrders.filter(o => o.type === 'ppob');
  const revPPOB = ppobOrders.reduce((acc, o) => acc + o.serviceFee, 0);
  // 8. Local ad space
  const revLocalAds = 50000;

  const totalFounderGrossProfit =
    revMerchantCommission +
    revDeliveryFeeShare +
    revMerchantSubscriptions +
    revBannerAds +
    revPriorityCouriers +
    revServiceFee +
    revPPOB +
    revLocalAds;

  const pendingCouriers = couriers.filter(c => c.verificationStatus === 'pending');
  const activeCouriersCount = couriers.filter(c => c.isOnline && c.verificationStatus === 'approved').length;
  const pendingFraudAlerts = fraudAlerts.filter(f => f.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  const handleBatchApprovePayouts = () => {
    pendingWithdrawals.forEach(w => approveWithdrawal(w.id));
    confetti({ particleCount: 70 });
  };

  return (
    <div className="max-w-5xl mx-auto min-h-screen bg-slate-50 flex flex-col pb-28">
      {/* Top Founder Command Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-b-3xl shadow-lg border-b border-indigo-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">Admin Founder Command Center</h1>
                <span className="text-[10px] font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 px-2.5 py-0.5 rounded-full">
                  1-Founder Autopilot
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Arjawinangun Delivery • Operasional Tanpa Karyawan Manual
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenRoleModal}
              className="text-xs bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl border border-white/20 transition"
            >
              Ganti Peran
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset semua data ke katalog demo awal?')) {
                  resetAllData();
                }
              }}
              className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Demo
            </button>
          </div>
        </div>

        {/* Master KPIs Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <span className="text-[11px] text-indigo-200 block font-medium">Total GMV Transaksi</span>
            <span className="text-lg font-black text-white">{formatRupiah(Math.max(850000, totalGMV))}</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              100% Otomatis
            </span>
          </div>

          <div className="bg-indigo-600/30 border border-indigo-500/40 p-3.5 rounded-2xl">
            <span className="text-[11px] text-indigo-100 block font-bold">Pendapatan Bersih Founder</span>
            <span className="text-lg font-black text-yellow-300">
              {formatRupiah(Math.max(145000, totalFounderGrossProfit))}
            </span>
            <span className="text-[10px] text-indigo-200">Dari 8 Sumber Monetisasi</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <span className="text-[11px] text-indigo-200 block font-medium">Kurir Aktif di Jalan</span>
            <span className="text-lg font-black text-white">{activeCouriersCount} Driver</span>
            <span className="text-[10px] text-emerald-400">Radar Auto-Dispatch Aktif</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <span className="text-[11px] text-indigo-200 block font-medium">Mitra UMKM Terhubung</span>
            <span className="text-lg font-black text-white">{merchants.length} Toko</span>
            <span className="text-[10px] text-amber-300">{premiumStoresCount} Mitra Premium</span>
          </div>
        </div>
      </div>

      {/* Nav Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 flex items-center space-x-1 text-xs font-semibold overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Ringkasan Operasional' },
          { id: 'dispatch', label: 'Mesin Auto-Dispatch' },
          { id: 'monetization', label: '8 Jalur Monetisasi' },
          { id: 'verifications', label: `Verifikasi KYC (${pendingCouriers.length})` },
          { id: 'fraud', label: `Anti-Fraud (${pendingFraudAlerts.length})` },
          { id: 'withdrawals', label: `Pencairan Saldo (${pendingWithdrawals.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`py-3 px-3.5 whitespace-nowrap transition relative ${
              activeSection === tab.id
                ? 'text-indigo-700 font-bold border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="p-4 space-y-4">
        {/* ================= OVERVIEW ================= */}
        {activeSection === 'overview' && (
          <div className="space-y-4">
            {/* Automation Rules Status */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Status Otomatisasi Platform (Tanpa Karyawan Harian)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Auto-Dispatch Radar</span>
                    <span className="text-[11px] text-slate-500">Mencari & mengalihkan kurir tiap 30 detik</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    BERJALAN
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Kalkulator Komisi Instan</span>
                    <span className="text-[11px] text-slate-500">Potong 10% merchant & bagi hasil ongkir real-time</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    BERJALAN
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">WhatsApp Notification Gateway</span>
                    <span className="text-[11px] text-slate-500">Notifikasi otomatis OTP & update pesanan</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    BERJALAN
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Deteksi Fake Order AI</span>
                    <span className="text-[11px] text-slate-500">Blokir otomatis IP & nomor telepon fiktif</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    BERJALAN
                  </span>
                </div>
              </div>
            </div>

            {/* Expansion Zones */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Cakupan Wilayah Hyperlocal (Skalabilitas Arjawinangun & Sekitar)
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {DISTRICTS.map((dist, idx) => (
                  <span
                    key={idx}
                    className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    {dist}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= AUTO-DISPATCH ENGINE LOGS ================= */}
        {activeSection === 'dispatch' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Live Log Auto-Dispatch Engine
                </h3>
                <p className="text-[11px] text-slate-500">
                  Riwayat penugasan kurir otomatis tanpa keterlibatan founder
                </p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                Siklus 30 Detik Aktif
              </span>
            </div>

            <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono text-xs max-h-72 overflow-y-auto space-y-1.5 border border-slate-800">
              {autoDispatchLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  <span className="text-slate-500">›</span> {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 8 REVENUE STREAMS ================= */}
        {activeSection === 'monetization' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Breakdown 8 Jalur Monetisasi Platform
                  </h3>
                  <p className="text-[11px] text-slate-500">Sumber pendapatan otomatis Arjawinangun Delivery</p>
                </div>
                <span className="text-sm font-black text-indigo-700">
                  Total: {formatRupiah(Math.max(145000, totalFounderGrossProfit))}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  {
                    name: '1. Komisi Penjualan Toko (10%)',
                    desc: 'Dipotong otomatis dari tiap pesanan makanan & barang toko',
                    val: formatRupiah(revMerchantCommission || 45000),
                    badge: '10% Sales',
                  },
                  {
                    name: '2. Bagi Hasil Ongkos Kirim',
                    desc: 'Platform mengambil margin Rp 1.500 - Rp 2.000 per ongkir kurir',
                    val: formatRupiah(revDeliveryFeeShare || 18000),
                    badge: 'Hyperlocal Fee',
                  },
                  {
                    name: '3. Langganan Mitra Toko Premium',
                    desc: 'Toko membayar Rp 99.000/bln untuk promosi teratas & komisi 8%',
                    val: formatRupiah(revMerchantSubscriptions || 99000),
                    badge: 'SaaS Recurring',
                  },
                  {
                    name: '4. Iklan Toko Terpilih (Ads)',
                    desc: 'Slot banner promosi berbayar di bagian atas aplikasi',
                    val: formatRupiah(revBannerAds),
                    badge: 'Ad Revenue',
                  },
                  {
                    name: '5. Program Kurir Prioritas',
                    desc: 'Kurir berlangganan Rp 25.000/bln untuk dapat order lebih dulu',
                    val: formatRupiah(revPriorityCouriers || 50000),
                    badge: 'Driver Subscription',
                  },
                  {
                    name: '6. Biaya Jasa Aplikasi Pelanggan',
                    desc: 'Biaya admin Rp 1.000 per transaksi yang dibayar pelanggan',
                    val: formatRupiah(revServiceFee || 12000),
                    badge: 'Rp 1.000/order',
                  },
                  {
                    name: '7. Margin Produk Digital (PPOB)',
                    desc: 'Margin keuntungan penjualan pulsa, token PLN, tagihan BPJS',
                    val: formatRupiah(revPPOB || 14500),
                    badge: 'Digital Goods',
                  },
                  {
                    name: '8. Ruang Iklan Banner Lokal',
                    desc: 'Sponsor dari bisnis lokal sekitar Cirebon Barat & Arjawinangun',
                    val: formatRupiah(revLocalAds),
                    badge: 'Sponsorship',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    <span className="text-xs font-black text-emerald-800 block pt-1">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= VERIFICATIONS KYC ================= */}
        {activeSection === 'verifications' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Antrean Verifikasi Mandiri (KYC Kurir & Toko)
            </h3>

            {pendingCouriers.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Semua pendaftaran kurir dan toko telah diverifikasi.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCouriers.map(courier => (
                  <div
                    key={courier.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{courier.name}</h4>
                      <p className="text-slate-500">
                        {courier.phone} • {courier.vehicleModel} ({courier.plateNumber})
                      </p>
                      <div className="flex gap-2 text-[10px] text-slate-600 mt-1">
                        <span>✓ KTP: {courier.documents.ktp}</span>
                        <span>✓ SIM: {courier.documents.sim}</span>
                        <span>✓ STNK: {courier.documents.stnk}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => rejectCourierKYC(courier.id)}
                        className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => approveCourierKYC(courier.id)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                      >
                        Setujui & Aktifkan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= ANTI-FRAUD ================= */}
        {activeSection === 'fraud' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Sistem Anti-Fraud & Keamanan
            </h3>

            {fraudAlerts.length === 0 ? (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 text-center text-xs text-emerald-800 font-bold">
                Tidak ada aktivitas mencurigakan yang terdeteksi saat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {fraudAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      alert.status === 'resolved'
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{alert.targetName}</span>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${
                              alert.severity === 'high'
                                ? 'bg-red-600 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            Tingkat: {alert.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{alert.description}</p>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatDateTime(alert.timestamp)}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-red-100 text-[11px] text-slate-600">
                      Saran Tindakan: <strong>{alert.suggestedAction}</strong>
                    </div>

                    {alert.status === 'pending' && (
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          onClick={() => suspendEntity('courier', alert.targetId)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition"
                        >
                          Auto-Suspend Akun Ini
                        </button>
                        <button
                          onClick={() => resolveFraudAlert(alert.id)}
                          className="px-3 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
                        >
                          Tandai Selesai
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= WITHDRAWALS / SETTLEMENT ================= */}
        {activeSection === 'withdrawals' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Permintaan Pencairan Dana (Mitra & Kurir)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dapat diproses otomatis secara batching satu kali klik
                </p>
              </div>

              {pendingWithdrawals.length > 0 && (
                <button
                  onClick={handleBatchApprovePayouts}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition"
                >
                  Proses Semua ({pendingWithdrawals.length})
                </button>
              )}
            </div>

            {withdrawals.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Belum ada antrean penarikan dana.
              </div>
            ) : (
              <div className="space-y-2">
                {withdrawals.map(w => (
                  <div
                    key={w.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{w.userName}</span>
                        <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded uppercase">
                          {w.userRole}
                        </span>
                      </div>
                      <p className="text-slate-500">
                        {w.bankName} - {w.accountNumber} a.n. {w.accountHolder}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 block">{formatRupiah(w.amount)}</span>
                      {w.status === 'pending' ? (
                        <button
                          onClick={() => approveWithdrawal(w.id)}
                          className="text-[10px] font-bold text-emerald-700 hover:underline"
                        >
                          Klik Cairkan
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          LUNAS
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
