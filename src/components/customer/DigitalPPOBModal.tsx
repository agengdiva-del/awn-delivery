import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { PPOBProduct } from '../../types';
import { X, Zap, Phone, Wallet, Shield, CheckCircle2, Copy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DigitalPPOBModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalPPOBModal: React.FC<DigitalPPOBModalProps> = ({ isOpen, onClose }) => {
  const { ppobProducts, createPPOBOrder } = useApp();

  const [activeCategory, setActiveCategory] = useState<'pulsa' | 'pln' | 'ewallet' | 'bpjs'>('pulsa');
  const [targetNumber, setTargetNumber] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<PPOBProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    token?: string;
    product: PPOBProduct;
    target: string;
    orderNum: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const categoryProducts = ppobProducts.filter(p => {
    if (activeCategory === 'pulsa') return p.category === 'pulsa' || p.category === 'data';
    return p.category === activeCategory;
  });

  const handleBuy = async () => {
    if (!selectedProduct || !targetNumber) return;
    setIsProcessing(true);

    try {
      const order = await createPPOBOrder(selectedProduct, targetNumber);
      setIsProcessing(false);

      // Generate random simulated PLN token if PLN
      const fakeToken = selectedProduct.category === 'pln'
        ? `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
        : undefined;

      setSuccessReceipt({
        token: fakeToken,
        product: selectedProduct,
        target: targetNumber,
        orderNum: order.orderNumber,
      });

      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full sm:max-w-md h-full sm:h-[88vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-pink-800 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-pink-700 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Bayar Tagihan & Produk Digital</h3>
              <p className="text-[11px] text-pink-200">Pulsa, PLN, BPJS & Top Up E-Wallet Instan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {successReceipt ? (
            <div className="py-6 px-4 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-800">Transaksi Berhasil!</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pembayaran {successReceipt.product.name} telah diproses secara otomatis.
                </p>
              </div>

              {/* Token Display if PLN */}
              {successReceipt.token && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
                  <span className="text-[11px] font-bold text-amber-800 block">
                    20-Digit Stroom Token Listrik PLN:
                  </span>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200 font-mono text-sm font-extrabold text-slate-800 tracking-wider">
                    <span>{successReceipt.token}</span>
                    <button
                      onClick={() => handleCopy(successReceipt.token!)}
                      className="text-xs text-amber-700 hover:text-amber-800 font-sans flex items-center gap-1 font-bold ml-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-700">
                    Masukkan 20 angka di atas ke meteran PLN Anda lalu tekan Enter.
                  </p>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Pesanan</span>
                  <span className="font-mono font-bold text-slate-800">{successReceipt.orderNum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Tujuan</span>
                  <span className="font-bold text-slate-800">{successReceipt.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Dibayar</span>
                  <span className="font-extrabold text-pink-700">{formatRupiah(successReceipt.product.price)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccessReceipt(null);
                  setSelectedProduct(null);
                  setTargetNumber('');
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition"
              >
                Transaksi Lainnya
              </button>
            </div>
          ) : (
            <>
              {/* Category Tabs */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: 'pulsa', label: 'Pulsa & Data', icon: Phone },
                  { id: 'pln', label: 'Listrik PLN', icon: Zap },
                  { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
                  { id: 'bpjs', label: 'BPJS', icon: Shield },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveCategory(tab.id as typeof activeCategory);
                        setSelectedProduct(null);
                      }}
                      className={`py-2 px-1 rounded-lg text-center flex flex-col items-center justify-center transition ${
                        isActive
                          ? 'bg-white text-pink-700 font-bold shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[10px] truncate max-w-full">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Target Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {activeCategory === 'pulsa'
                    ? 'Nomor HP'
                    : activeCategory === 'pln'
                    ? 'No. Meter / ID Pelanggan PLN'
                    : activeCategory === 'ewallet'
                    ? 'Nomor Akun E-Wallet (DANA/GoPay)'
                    : 'Nomor Kartu BPJS'}
                </label>
                <input
                  type="text"
                  placeholder={
                    activeCategory === 'pulsa'
                      ? '081234567890'
                      : activeCategory === 'pln'
                      ? '140023456789'
                      : '081234567890'
                  }
                  value={targetNumber}
                  onChange={e => setTargetNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
                />
              </div>

              {/* Products Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pilih Nominal
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {categoryProducts.map(prod => {
                    const isSelected = selectedProduct?.id === prod.id;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => setSelectedProduct(prod)}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-pink-600 bg-pink-50/70 ring-1 ring-pink-500'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          {prod.name}
                        </span>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-xs font-extrabold text-pink-700">
                            {formatRupiah(prod.price)}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            Admin {formatRupiah(prod.adminFee)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Summary */}
              {selectedProduct && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Produk</span>
                    <span className="font-semibold text-slate-800">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Admin</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(selectedProduct.adminFee)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-extrabold text-sm text-slate-900">
                    <span>Total Bayar</span>
                    <span className="text-pink-700">{formatRupiah(selectedProduct.price)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!successReceipt && (
          <div className="p-4 border-t border-slate-200 bg-white">
            <button
              onClick={handleBuy}
              disabled={!selectedProduct || !targetNumber || isProcessing}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
            >
              {isProcessing
                ? 'Memproses Pembayaran...'
                : selectedProduct
                ? `Bayar ${formatRupiah(selectedProduct.price)} Sekarang`
                : 'Pilih Nominal Pembayaran'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
