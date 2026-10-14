import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { DISTRICTS } from '../../utils/mockData';
import { X, Package, MapPin, Navigation, Clock, ShieldCheck, ArrowRight, Bike } from 'lucide-react';

interface SendPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SendPackageModal: React.FC<SendPackageModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createPackageOrder, selectedDistrict, deliveryAddress, user } = useApp();

  const [pickupAddress, setPickupAddress] = useState(deliveryAddress);
  const [dropoffAddress, setDropoffAddress] = useState('Jl. Raya Jungjang Blok Pesantren No. 18');
  const [dropoffDistrict, setDropoffDistrict] = useState(DISTRICTS[1]);
  const [recipientName, setRecipientName] = useState('Siti Aminah');
  const [recipientPhone, setRecipientPhone] = useState('081399887766');
  const [itemName, setItemName] = useState('Dokumen Penting & Paket Baju');
  const [weightKg, setWeightKg] = useState(2);
  const [notes, setNotes] = useState('Tolong bawa jas hujan, barang rawan basah');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const baseFee = 8000;
  const weightFee = Math.max(0, (weightKg - 1) * 2000);
  const deliveryFee = baseFee + weightFee;
  const serviceFee = 1000;
  const total = deliveryFee + serviceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createPackageOrder({
        itemName,
        recipientName,
        recipientPhone,
        weightKg,
        pickupAddress: `${pickupAddress} (${selectedDistrict})`,
        dropoffAddress: `${dropoffAddress} (${dropoffDistrict})`,
        notes,
      });

      setIsSubmitting(false);
      onClose();
      onSuccess();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full sm:max-w-md h-full sm:h-[92vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-pink-800 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-pink-700 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Kirim Barang Instan</h3>
              <p className="text-[11px] text-pink-200">Kurir jemput dan antar langsung di hari yang sama</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Pickup Section */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-600"></span>
              <span>1. Titik Penjemputan Barang</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium">Alamat Jemput (Pengirim)</label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={e => setPickupAddress(e.target.value)}
                placeholder="Alamat lengkap penjemputan di Arjawinangun"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Destination Section */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>2. Titik Pengantaran & Penerima</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium">Alamat Tujuan Pengantaran</label>
              <input
                type="text"
                required
                value={dropoffAddress}
                onChange={e => setDropoffAddress(e.target.value)}
                placeholder="Alamat tujuan lengkap"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 font-medium">Nama Penerima</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium">No. Telepon / WA</label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={e => setRecipientPhone(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Package className="w-4 h-4 text-amber-600" />
              <span>3. Detail Barang</span>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium">Deskripsi Barang</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                placeholder="Contoh: Dokumen, Makanan basah, Pakaian..."
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            {/* Weight Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Perkiraan Berat Barang:</span>
                <span className="font-bold text-pink-700">{weightKg} Kg</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={weightKg}
                onChange={e => setWeightKg(Number(e.target.value))}
                className="w-full accent-pink-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 Kg (Ringan)</span>
                <span>10 Kg</span>
                <span>20 Kg (Maks motor)</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-medium">Instruksi Pengiriman</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Catatan ke driver..."
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tarif Ongkir Instan</span>
              <span className="font-semibold text-slate-800">{formatRupiah(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Biaya Layanan Aplikasi</span>
              <span className="font-semibold text-slate-800">{formatRupiah(serviceFee)}</span>
            </div>
            <div className="border-t border-pink-200 pt-1.5 flex justify-between font-extrabold text-sm text-pink-950">
              <span>Total Tarif</span>
              <span className="text-pink-700">{formatRupiah(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <Bike className="w-4 h-4" />
            <span>{isSubmitting ? 'Mencari Kurir...' : 'Panggil Kurir Sekarang'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
