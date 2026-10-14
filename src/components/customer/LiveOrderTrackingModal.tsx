import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { formatRupiah, getWhatsAppLink } from '../../utils/formatters';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  Bike, 
  MapPin, 
  Store, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Send,
  Star,
  Receipt,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveOrderTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveOrderTrackingModal: React.FC<LiveOrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { submitRating, cancelOrder, couriers } = useApp();
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'driver' | 'customer'; text: string; time: string }>>([
    { sender: 'driver', text: 'Halo kak, pesanan sudah saya ambil dari resto ya, sedang otw ke lokasi.', time: 'Baru saja' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Rating states
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Animated courier coordinates on SVG map
  const [courierPosition, setCourierPosition] = useState({ x: 30, y: 35 });

  useEffect(() => {
    if (!order) return;

    if (order.status === 'delivered' && !ratingSubmitted) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    // Dynamic interpolation along simulated path
    let target = { x: 30, y: 35 };
    if (order.status === 'courier_heading_to_store') {
      target = { x: 35, y: 32 };
    } else if (order.status === 'courier_arrived_at_store' || order.status === 'merchant_preparing') {
      target = { x: 25, y: 30 };
    } else if (order.status === 'on_delivery') {
      target = { x: 55, y: 52 };
    } else if (order.status === 'delivered') {
      target = { x: 75, y: 70 };
    }
    setCourierPosition(target);
  }, [order?.status, order, ratingSubmitted]);

  if (!isOpen || !order) return null;

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMsg = {
      sender: 'customer' as const,
      text: inputMessage,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    // Simulate driver reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'driver',
          text: 'Siap kak, saya ikuti titik peta ya!',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  const handleRatingSubmit = () => {
    submitRating(order.id, ratingVal, reviewText);
    setRatingSubmitted(true);
  };

  // Status mapping
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'merchant_preparing':
        return {
          title: 'Sedang Disiapkan Toko',
          subtitle: 'Toko sedang memasak/menyiapkan pesanan Anda',
          badgeColor: 'bg-amber-100 text-amber-800',
        };
      case 'looking_courier':
        return {
          title: 'Mencari Driver Terdekat',
          subtitle: 'Radar Auto-Dispatch sedang mengirim tugas ke mitra kurir...',
          badgeColor: 'bg-blue-100 text-blue-800',
        };
      case 'courier_assigned':
        return {
          title: 'Driver Mengkonfirmasi Pesanan',
          subtitle: `${order.courierName || 'Driver'} menerima pesanan`,
          badgeColor: 'bg-pink-100 text-pink-800',
        };
      case 'courier_heading_to_store':
        return {
          title: 'Driver Menuju ke Toko',
          subtitle: 'Driver bergerak ke lokasi toko untuk mengambil pesanan',
          badgeColor: 'bg-pink-100 text-pink-800',
        };
      case 'courier_arrived_at_store':
        return {
          title: 'Driver Tiba di Toko',
          subtitle: 'Driver memeriksa & mengambil pesanan Anda',
          badgeColor: 'bg-pink-100 text-pink-800',
        };
      case 'on_delivery':
        return {
          title: 'Dalam Perjalanan ke Rumah Anda',
          subtitle: 'Driver sedang mengantar pesanan dengan hati-hati',
          badgeColor: 'bg-green-100 text-green-800',
        };
      case 'delivered':
        return {
          title: 'Pesanan Telah Sampai!',
          subtitle: 'Terima kasih telah menggunakan Arjawinangun Delivery',
          badgeColor: 'bg-pink-100 text-pink-800',
        };
      case 'cancelled':
        return {
          title: 'Pesanan Dibatalkan',
          subtitle: 'Pesanan ini telah dibatalkan',
          badgeColor: 'bg-red-100 text-red-800',
        };
      default:
        return {
          title: 'Pesanan Diproses',
          subtitle: 'Menunggu konfirmasi',
          badgeColor: 'bg-slate-100 text-slate-800',
        };
    }
  };

  const statusInfo = getStatusText(order.status);

  // Stepper active indices
  const steps = [
    { label: 'Diterima', active: true },
    { label: 'Disiapkan', active: !['pending_payment', 'looking_courier'].includes(order.status) },
    { label: 'Dijemput', active: ['courier_arrived_at_store', 'on_delivery', 'delivered'].includes(order.status) },
    { label: 'Diantar', active: ['on_delivery', 'delivered'].includes(order.status) },
    { label: 'Selesai', active: order.status === 'delivered' },
  ];

  const driverPhone = order.courierPhone || '081223456789';
  const waLink = getWhatsAppLink(
    driverPhone,
    `Halo Mas ${order.courierName || 'Driver'}, ini dengan ${order.customerName} terkait pesanan #${order.orderNumber} di Arjawinangun Delivery.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full sm:max-w-md h-full sm:h-[94vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 text-slate-700 hover:text-pink-600 font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lacak Pesanan</span>
          </button>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">
            {order.orderNumber}
          </span>
        </div>

        {/* Interactive Simulated Map */}
        <div className="relative h-64 sm:h-72 w-full bg-[#FFF1F2] overflow-hidden shrink-0">
          {/* Map Grid Roads Background */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Arjawinangun Town Roads / Paths */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#FFE4E6" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {/* River / Kali Arjawinangun */}
            <path
              d="M 0 10 Q 30 20 50 15 T 100 25"
              fill="none"
              stroke="#BFDBFE"
              strokeWidth="2.5"
            />

            {/* Main Roads */}
            <path d="M 10 50 L 90 50" stroke="#CBD5E1" strokeWidth="3" />
            <path d="M 50 10 L 50 90" stroke="#CBD5E1" strokeWidth="3" />
            <path d="M 25 30 L 75 70" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="1.5,1.5" />

            {/* Active Delivery Route Line (Pink) */}
            <path
              d="M 25 30 Q 40 45 75 70"
              fill="none"
              stroke="#E11D48"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Store Pin */}
            <g transform="translate(25, 30)">
              <circle cx="0" cy="0" r="4.5" fill="#F97316" />
              <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
            </g>

            {/* Customer Pin */}
            <g transform="translate(75, 70)">
              <circle cx="0" cy="0" r="5" fill="#DC2626" />
              <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
            </g>

            {/* Animated Courier Marker */}
            <g
              transform={`translate(${courierPosition.x}, ${courierPosition.y})`}
              className="transition-all duration-700 ease-out"
            >
              <circle cx="0" cy="0" r="6" fill="#E11D48" opacity="0.3" className="animate-ping" />
              <circle cx="0" cy="0" r="5.5" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1" />
              <circle cx="0" cy="-1.5" r="1.5" fill="#FFFFFF" />
            </g>
          </svg>

          {/* Floating ETA Badge */}
          <div className="absolute bottom-3 left-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-600 animate-pulse" />
              <div>
                <span className="font-extrabold text-slate-800 block">
                  {order.status === 'delivered'
                    ? 'Pesanan Sudah Diterima'
                    : 'Driver menuju ke lokasi Anda'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {order.status === 'delivered' ? 'Selesai diantar' : '± 3 menit lagi • 800 meter'}
                </span>
              </div>
            </div>
            <div className="bg-pink-50 text-pink-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-pink-200">
              Live GPS
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Order Title & Status Card */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 truncate">
                {order.storeName || order.packageDetails?.itemName || 'Pesanan Arjawinangun'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.badgeColor}`}>
                {statusInfo.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{statusInfo.subtitle}</p>

            {/* Stepper Progress matching poster */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-center relative">
                {/* Horizontal line */}
                <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
                
                {steps.map((step, idx) => (
                  <div key={idx} className="relative z-1 flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                        step.active
                          ? 'bg-pink-600 text-white ring-2 ring-pink-100'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {step.active ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[9px] mt-1 font-semibold ${
                        step.active ? 'text-pink-900 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Courier Card matching poster */}
          {order.courierName && (
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    couriers.find(c => c.name === order.courierName)?.photo ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={order.courierName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-pink-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">{order.courierName}</h4>
                    <span className="text-[10px] font-bold text-amber-500 flex items-center">
                      ★ {order.courierRating || 4.9}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{order.courierVehicle || 'Honda Beat'}</p>
                  <span className="text-[9px] font-bold text-pink-700 bg-pink-50 px-1.5 py-0.2 rounded inline-block mt-0.5">
                    Kurir Independen Arjawinangun
                  </span>
                </div>
              </div>

              {/* Action Buttons: Phone & WhatsApp Chat */}
              <div className="flex items-center space-x-2">
                <a
                  href={`tel:${driverPhone}`}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                  title="Telepon Driver"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setShowChat(true)}
                  className="w-9 h-9 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center transition shadow-xs"
                  title="Chat Langsung"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Order Item Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                Rincian Pesanan
              </span>
              <span className="text-emerald-700 font-extrabold">{formatRupiah(order.total)}</span>
            </div>

            {order.items.length > 0 && (
              <div className="divide-y divide-slate-200/60 pt-1">
                {order.items.map((item, i) => (
                  <div key={i} className="py-1 flex justify-between text-[11px] text-slate-600">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-medium text-slate-800">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            {order.packageDetails && (
              <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                <p>
                  Barang: <strong>{order.packageDetails.itemName}</strong> ({order.packageDetails.weightKg} kg)
                </p>
                <p>Penerima: {order.packageDetails.recipientName} ({order.packageDetails.recipientPhone})</p>
                <p>Tujuan: {order.packageDetails.dropoffAddress}</p>
              </div>
            )}

            <div className="border-t border-slate-200 pt-1.5 flex justify-between text-[11px] text-slate-500">
              <span>Metode Pembayaran: <strong className="uppercase text-slate-700">{order.paymentMethod}</strong></span>
              <span className={`font-bold ${order.paymentStatus === 'paid' ? 'text-pink-700' : 'text-amber-700'}`}>
                {order.paymentStatus === 'paid' ? 'LUNAS (Cashless)' : 'BAYAR DI TEMPAT (COD)'}
              </span>
            </div>
          </div>

          {/* Rating Prompt if Delivered */}
          {order.status === 'delivered' && (
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-pink-200 text-pink-800 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-pink-950">
                  {ratingSubmitted ? 'Terima Kasih atas Penilaian Anda!' : 'Beri Nilai Pelayanan Driver & Resto'}
                </h4>
                <p className="text-xs text-pink-800 mt-0.5">
                  Bantu UMKM dan Driver Arjawinangun terus memberikan layanan terbaik.
                </p>
              </div>

              {!ratingSubmitted ? (
                <div className="space-y-3">
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRatingVal(star)}
                        className="text-amber-400 hover:scale-110 transition p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= ratingVal ? 'fill-amber-400' : 'stroke-slate-300 fill-transparent'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Tulis ulasan Anda (makanan lezat, driver ramah & cepat)..."
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />

                  <button
                    onClick={handleRatingSubmit}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-2 rounded-xl shadow-xs transition"
                  >
                    Kirim Penilaian
                  </button>
                </div>
              ) : (
                <div className="text-xs font-bold text-pink-800 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Ulasan tersimpan ★ {ratingVal}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Chat Drawer */}
        {showChat && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-pink-800 text-white">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowChat(false)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h4 className="text-xs font-bold">{order.courierName || 'Driver'}</h4>
                  <span className="text-[10px] text-pink-200">Online • Sedang mengantar</span>
                </div>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] bg-pink-600 hover:bg-pink-500 text-white font-bold px-2 py-1 rounded"
              >
                Buka di WhatsApp
              </a>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-2xs ${
                      msg.sender === 'customer'
                        ? 'bg-pink-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 ${
                        msg.sender === 'customer' ? 'text-pink-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-slate-200 bg-white flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ketik pesan untuk driver..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
              <button
                onClick={handleSendMessage}
                className="w-8 h-8 rounded-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center transition shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
