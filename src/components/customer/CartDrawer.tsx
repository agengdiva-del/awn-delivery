import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { PaymentMethod } from '../../types';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Ticket, 
  MapPin, 
  CreditCard, 
  QrCode, 
  Banknote, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const {
    cartItems,
    cartStoreId,
    merchants,
    updateCartQuantity,
    clearCart,
    activePromo,
    applyPromoCode,
    removePromoCode,
    createFoodOrder,
    deliveryAddress,
    selectedDistrict,
  } = useApp();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRISModal, setShowQRISModal] = useState(false);

  if (!isOpen) return null;

  const store = merchants.find(m => m.id === cartStoreId) || merchants[0];
  const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  
  // Distance-based delivery fee
  const baseDistance = store?.distanceKm || 1.2;
  const deliveryFee = Math.max(5000, Math.round(5000 + (baseDistance > 1 ? (baseDistance - 1) * 2000 : 0)));
  const serviceFee = 1000;

  let discount = 0;
  if (activePromo) {
    if (activePromo.discountPercent === 100) {
      discount = Math.min(deliveryFee, activePromo.maxDiscount);
    } else {
      discount = Math.min(Math.round((subtotal * activePromo.discountPercent) / 100), activePromo.maxDiscount);
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee + serviceFee - discount);

  const handleApplyPromo = (codeToApply?: string) => {
    const code = codeToApply || promoInput;
    if (!code) return;
    const res = applyPromoCode(code);
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) setPromoInput('');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    try {
      await createFoodOrder(paymentMethod, orderNotes);
      setIsSubmitting(false);
      onClose();
      onOrderSuccess();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Keranjang Belanja</h3>
            <p className="text-[11px] text-slate-500">{store?.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kosongkan
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Address Card */}
          <div className="p-3 bg-pink-50/70 border border-pink-100 rounded-xl flex items-start space-x-2.5">
            <MapPin className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-pink-950 block">Alamat Pengantaran</span>
              <p className="text-slate-700 font-medium">{deliveryAddress}</p>
              <span className="text-[10px] text-pink-700 font-semibold">{selectedDistrict}</span>
            </div>
          </div>

          {/* Cart Items */}
          {cartItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Keranjang Anda masih kosong. Silakan pilih menu favorit Anda!
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Pesanan ({cartItems.length} item)
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                {cartItems.map(item => (
                  <div key={item.productId} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 truncate">
                        {item.productName}
                      </h5>
                      <span className="text-xs font-semibold text-pink-700">
                        {formatRupiah(item.price)}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-pink-600 hover:bg-pink-50 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan untuk Toko / Driver (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Jangan terlalu pedas, titip di pagar depan..."
              value={orderNotes}
              onChange={e => setOrderNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          {/* Promo Section */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-pink-600" />
                Voucher & Diskon
              </span>
              {activePromo && (
                <button
                  onClick={removePromoCode}
                  className="text-[10px] text-red-500 hover:underline"
                >
                  Hapus
                </button>
              )}
            </div>

            {activePromo ? (
              <div className="flex items-center justify-between bg-pink-100 text-pink-900 p-2 rounded-lg text-xs font-semibold">
                <span>Voucher Digunakan: <strong>{activePromo.code}</strong></span>
                <span className="text-pink-700 font-bold">-{formatRupiah(discount)}</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik kode promo (e.g. ARJAWINGRATIS)"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 uppercase font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
                <button
                  onClick={() => handleApplyPromo()}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Pakai
                </button>
              </div>
            )}

            {promoMessage && (
              <p
                className={`text-[11px] font-medium ${
                  promoMessage.isError ? 'text-red-500' : 'text-pink-600'
                }`}
              >
                {promoMessage.text}
              </p>
            )}

            {/* Quick Promo Chips */}
            {!activePromo && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => handleApplyPromo('ARJAWINGRATIS')}
                  className="text-[10px] font-bold bg-pink-100 text-pink-800 hover:bg-pink-200 px-2 py-0.5 rounded-full transition"
                >
                  ⚡ ARJAWINGRATIS (Gratis Ongkir)
                </button>
                <button
                  onClick={() => handleApplyPromo('UMKMBERKAH')}
                  className="text-[10px] font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 px-2 py-0.5 rounded-full transition"
                >
                  🏷️ UMKMBERKAH (Diskon 20%)
                </button>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Metode Pembayaran
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'qris', name: 'QRIS (Semua E-Wallet/Bank)', icon: QrCode, desc: 'Instan & Otomatis' },
                { id: 'cod', name: 'Cash on Delivery (COD)', icon: Banknote, desc: 'Bayar Tunai ke Kurir' },
                { id: 'gopay', name: 'GoPay / OVO', icon: CreditCard, desc: 'Potong Saldo' },
                { id: 'dana', name: 'DANA / ShopeePay', icon: CreditCard, desc: 'E-Wallet' },
              ].map(method => {
                const isSelected = paymentMethod === method.id;
                const Icon = method.icon;

                return (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-pink-600 bg-pink-50/70 ring-1 ring-pink-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-pink-600' : 'text-slate-500'}`} />
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-pink-600" />}
                    </div>
                    <div className="mt-1">
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {method.name}
                      </span>
                      <span className="text-[10px] text-slate-500">{method.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal Makanan</span>
              <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim ({baseDistance} km)</span>
              <span className="font-semibold text-slate-800">{formatRupiah(deliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                Biaya Jasa Aplikasi
                <ShieldCheck className="w-3 h-3 text-pink-600" />
              </span>
              <span className="font-semibold text-slate-800">{formatRupiah(serviceFee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-pink-600 font-bold">
                <span>Diskon Promo</span>
                <span>-{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-1.5 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Pembayaran</span>
              <span className="text-pink-700">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          {/* Automation Assurance */}
          <div className="p-2.5 rounded-lg bg-pink-50 border border-pink-100 text-[10px] text-pink-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-600 shrink-0" />
            <span>
              Sistem Auto-Dispatch akan langsung mencarikan kurir terdekat dalam 30 detik setelah pesanan dibuat!
            </span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-200 bg-white shadow-lg">
          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || isSubmitting}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-pink-600/25 flex items-center justify-between transition active:scale-98"
          >
            <div>
              <span className="text-[10px] text-pink-100 block text-left">Total Pesanan</span>
              <span className="text-sm font-extrabold">{formatRupiah(grandTotal)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span>{isSubmitting ? 'Memproses Pesanan...' : 'Pesan Sekarang'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
