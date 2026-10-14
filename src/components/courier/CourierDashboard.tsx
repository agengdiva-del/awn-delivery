import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Courier, Order } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { 
  Bike, 
  Power, 
  CheckCircle, 
  X, 
  Clock, 
  MapPin, 
  Navigation, 
  Phone, 
  Wallet, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  Upload,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CourierDashboardProps {
  onOpenRoleModal: () => void;
}

export const CourierDashboard: React.FC<CourierDashboardProps> = ({ onOpenRoleModal }) => {
  const { 
    currentCourier, 
    toggleCourierOnline, 
    togglePriorityCourier, 
    orders, 
    acceptIncomingDispatch, 
    rejectIncomingDispatch, 
    updateDeliveryProgress,
    dispatchCountdown,
    requestWithdrawal,
    registerNewCourier,
    selectedDistrict
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deliveries' | 'earnings' | 'registration'>('deliveries');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(50000);
  const [bankName, setBankName] = useState('BCA');
  const [accNumber, setAccNumber] = useState('1234567890');
  const [accHolder, setAccHolder] = useState(currentCourier.name);

  // Registration modal for new drivers
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regVehicle, setRegVehicle] = useState('Honda Beat');
  const [regPlate, setRegPlate] = useState('E 4567 XY');
  const [regSuccess, setRegSuccess] = useState(false);

  // Find incoming order assigned to this courier that is waiting for response
  const incomingDispatchOrder = orders.find(
    o => o.courierId === currentCourier.id && o.status === 'courier_assigned'
  );

  // Find active ongoing order for this courier
  const activeDelivery = orders.find(
    o => o.courierId === currentCourier.id && 
    ['courier_heading_to_store', 'courier_arrived_at_store', 'on_delivery'].includes(o.status)
  );

  const completedDeliveries = orders.filter(
    o => o.courierId === currentCourier.id && o.status === 'delivered'
  );

  const totalDeliveryEarnings = completedDeliveries.reduce((acc, o) => acc + o.courierEarnings, 0);

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    requestWithdrawal(currentCourier.id, 'courier', withdrawAmount, bankName, accNumber, accHolder);
    setShowWithdrawModal(false);
    confetti({ particleCount: 50 });
  };

  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    registerNewCourier({
      name: regName,
      phone: regPhone,
      vehicleModel: regVehicle,
      plateNumber: regPlate,
    });
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setActiveTab('deliveries');
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-28">
      {/* Top Courier Header */}
      <div className="bg-gradient-to-r from-pink-800 via-rose-700 to-pink-700 text-white p-4 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={currentCourier.photo}
                alt={currentCourier.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/60 shadow-xs"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-pink-800 ${
                  currentCourier.isOnline ? 'bg-pink-400' : 'bg-slate-400'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold">{currentCourier.name}</h2>
                <span className="text-[10px] font-bold text-amber-300">★ {currentCourier.rating}</span>
              </div>
              <p className="text-[11px] text-pink-100">{currentCourier.vehicleModel} • {currentCourier.plateNumber}</p>
            </div>
          </div>

          <button
            onClick={onOpenRoleModal}
            className="text-xs bg-white/20 hover:bg-white/30 text-white font-bold px-2.5 py-1 rounded-full transition"
          >
            Mode Peran
          </button>
        </div>

        {/* Online / Offline Switch Strip */}
        <div className="mt-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Power className={`w-4 h-4 ${currentCourier.isOnline ? 'text-pink-300' : 'text-slate-300'}`} />
            <div>
              <span className="text-xs font-bold block">
                {currentCourier.isOnline ? 'Status: ONLINE (Siap Terima Order)' : 'Status: OFFLINE (Istirahat)'}
              </span>
              <span className="text-[10px] text-pink-200">Zona: {selectedDistrict.split(' (')[0]}</span>
            </div>
          </div>

          <button
            onClick={toggleCourierOnline}
            className={`text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition ${
              currentCourier.isOnline
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-pink-500 hover:bg-pink-400 text-white'
            }`}
          >
            {currentCourier.isOnline ? 'OFFLINE' : 'ONLINE'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 px-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`flex-1 py-3 text-center transition ${
            activeTab === 'deliveries' ? 'text-pink-700 font-bold border-b-2 border-pink-600' : 'text-slate-500'
          }`}
        >
          Tugas Antar
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex-1 py-3 text-center transition ${
            activeTab === 'earnings' ? 'text-pink-700 font-bold border-b-2 border-pink-600' : 'text-slate-500'
          }`}
        >
          Dompet & Payout
        </button>
        <button
          onClick={() => setActiveTab('registration')}
          className={`flex-1 py-3 text-center transition ${
            activeTab === 'registration' ? 'text-pink-700 font-bold border-b-2 border-pink-600' : 'text-slate-500'
          }`}
        >
          Daftar Kurir Baru
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            {/* Priority Courier Program Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 fill-slate-900" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Program Kurir Prioritas
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {currentCourier.isPriority
                      ? 'Aktif: Radar order memprioritaskan Anda lebih dulu!'
                      : 'Aktifkan untuk prioritas order pertama di Arjawinangun.'}
                  </span>
                </div>
              </div>
              <button
                onClick={togglePriorityCourier}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${
                  currentCourier.isPriority
                    ? 'bg-pink-600 text-white'
                    : 'bg-amber-500 text-slate-900'
                }`}
              >
                {currentCourier.isPriority ? '✓ Prioritas' : 'Gabung'}
              </button>
            </div>

            {/* INCOMING DISPATCH POPUP WITH 30-SEC COUNTDOWN TIMER */}
            {incomingDispatchOrder && (
              <div className="bg-white border-2 border-pink-500 rounded-3xl p-4 shadow-xl space-y-3 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between bg-pink-50 p-2.5 rounded-2xl border border-pink-200">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-pink-600 animate-ping" />
                    <span className="text-xs font-black text-pink-950 uppercase tracking-wider">
                      Order Masuk Otomatis!
                    </span>
                  </div>
                  {/* 30-second ticking pill */}
                  <div className="flex items-center space-x-1 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
                    <Clock className="w-3 h-3" />
                    <span>{dispatchCountdown}s</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {incomingDispatchOrder.storeName || incomingDispatchOrder.packageDetails?.itemName}
                    </h3>
                    <span className="text-sm font-extrabold text-pink-700">
                      Ongkir: {formatRupiah(incomingDispatchOrder.courierEarnings)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Antar ke: <strong>{incomingDispatchOrder.customerAddress}</strong>
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex justify-between">
                  <span>Metode: <strong className="uppercase">{incomingDispatchOrder.paymentMethod}</strong></span>
                  <span>{incomingDispatchOrder.items.length} Item Makanan</span>
                </div>

                {/* 30s Countdown notice */}
                <p className="text-[10px] text-slate-400 text-center">
                  Bila tidak direspon dalam {dispatchCountdown} detik, order otomatis dilempar ke kurir berikutnya tanpa penalti.
                </p>

                {/* Accept / Reject actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => rejectIncomingDispatch(incomingDispatchOrder.id)}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Lewati (Tolak)
                  </button>
                  <button
                    onClick={() => acceptIncomingDispatch(incomingDispatchOrder.id)}
                    className="py-2.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-xs font-extrabold text-white shadow-md transition"
                  >
                    Terima Order
                  </button>
                </div>
              </div>
            )}

            {/* ACTIVE DELIVERY IN PROGRESS */}
            {activeDelivery ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Tugas Aktif #{activeDelivery.orderNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {activeDelivery.storeName || activeDelivery.packageDetails?.itemName}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full">
                    Penghasilan: {formatRupiah(activeDelivery.courierEarnings)}
                  </span>
                </div>

                {/* Pickup & Dropoff Address */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Lokasi Ambil:</span>
                      <p className="font-bold text-slate-800">{activeDelivery.storeAddress || activeDelivery.packageDetails?.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-600 shrink-0 mt-1" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Lokasi Antar ke Pelanggan:</span>
                      <p className="font-bold text-slate-800">{activeDelivery.customerAddress}</p>
                      <p className="text-slate-500 mt-0.5">Penerima: {activeDelivery.customerName} ({activeDelivery.customerPhone})</p>
                    </div>
                  </div>
                </div>

                {/* Workflow Progression Buttons */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {activeDelivery.status === 'courier_heading_to_store' && (
                    <button
                      onClick={() => updateDeliveryProgress(activeDelivery.id, 'courier_arrived_at_store')}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                    >
                      1. Saya Sudah Tiba di Toko
                    </button>
                  )}

                  {activeDelivery.status === 'courier_arrived_at_store' && (
                    <button
                      onClick={() => updateDeliveryProgress(activeDelivery.id, 'on_delivery')}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                    >
                      2. Pesanan Diambil & Mulai Antar ke Pelanggan
                    </button>
                  )}

                  {activeDelivery.status === 'on_delivery' && (
                    <button
                      onClick={() => updateDeliveryProgress(activeDelivery.id, 'delivered')}
                      className="w-full bg-green-700 hover:bg-green-800 text-white font-black py-3 rounded-xl text-xs shadow-md transition"
                    >
                      3. Selesai! Pesanan Diterima Pelanggan
                    </button>
                  )}
                </div>
              </div>
            ) : !incomingDispatchOrder && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
                <Bike className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Tidak ada pengantaran aktif</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {currentCourier.isOnline
                    ? 'Sistem Auto-Dispatch sedang memantau pesanan baru di sekitar Arjawinangun. Layar ini otomatis berbunyi saat ada order.'
                    : 'Anda sedang offline. Nyalakan status online di atas untuk menerima pesanan.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= EARNINGS TAB ================= */}
        {activeTab === 'earnings' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Saldo Dompet Kurir</span>
                  <span className="text-xl font-black text-pink-900">
                    {formatRupiah(currentCourier.walletBalance + totalDeliveryEarnings)}
                  </span>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition"
                >
                  Tarik Saldo
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-pink-200/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">Total Trip Berhasil</span>
                  <span className="font-bold text-slate-800 block">
                    {currentCourier.totalDeliveries + completedDeliveries.length} Pengantaran
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Bagi Hasil Ongkir</span>
                  <span className="font-bold text-pink-700 block">Langsung Masuk Dompet</span>
                </div>
              </div>
            </div>

            {/* Completed deliveries history */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Riwayat Pengantaran Terakhir
              </h4>
              {completedDeliveries.length === 0 ? (
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                  Belum ada riwayat trip selesai di sesi ini.
                </div>
              ) : (
                completedDeliveries.map(o => (
                  <div
                    key={o.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{o.orderNumber}</span>
                      <span className="text-[10px] text-slate-500">{o.customerAddress}</span>
                    </div>
                    <span className="font-bold text-emerald-800">+{formatRupiah(o.courierEarnings)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= REGISTRATION TAB ================= */}
        {activeTab === 'registration' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Pendaftaran Kurir Baru (Self-Registration)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar mandiri dengan motor sendiri di wilayah Arjawinangun dan Cirebon.
              </p>
            </div>

            {regSuccess ? (
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-pink-600 mx-auto" />
                <h4 className="text-xs font-bold text-pink-950">Pendaftaran Berhasil Dikirim!</h4>
                <p className="text-[11px] text-pink-800">
                  Dokumen KTP, SIM C, dan STNK Anda telah masuk ke sistem audit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterDriver} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Sesuai KTP</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Fauzi"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp Aktif</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Merk & Tipe Motor</label>
                    <input
                      type="text"
                      required
                      value={regVehicle}
                      onChange={e => setRegVehicle(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Plat (Plat E)</label>
                    <input
                      type="text"
                      required
                      value={regPlate}
                      onChange={e => setRegPlate(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl uppercase"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <span className="font-bold text-slate-800 block">Dokumen Wajib:</span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 text-pink-600" />
                    <span>Foto e-KTP Asli</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 text-pink-600" />
                    <span>SIM C Aktif</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 text-pink-600" />
                    <span>STNK Motor Pajak Hidup</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition"
                >
                  Kirim Pendaftaran Kurir
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Tarik Saldo Kurir</h3>
            <form onSubmit={handleWithdrawal} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Jumlah Penarikan (Rp)</label>
                <input
                  type="number"
                  min={10000}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">Bank / E-Wallet Tujuan</label>
                <select
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="BCA">BCA</option>
                  <option value="BRI">BRI</option>
                  <option value="DANA">DANA</option>
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
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Tarik Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
