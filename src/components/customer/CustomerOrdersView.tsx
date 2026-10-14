import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Navigation,
  Star,
  Package,
  Receipt
} from 'lucide-react';

interface CustomerOrdersViewProps {
  onBackToHome: () => void;
  onOpenTracking: (order: Order) => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  onBackToHome,
  onOpenTracking,
}) => {
  const { orders } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const displayedOrders =
    activeTab === 'active'
      ? activeOrders
      : activeTab === 'completed'
      ? completedOrders
      : cancelledOrders;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'merchant_preparing':
        return { label: 'Sedang Disiapkan Toko', color: 'bg-amber-100 text-amber-800' };
      case 'looking_courier':
        return { label: 'Mencari Kurir Terdekat...', color: 'bg-blue-100 text-blue-800 animate-pulse' };
      case 'courier_assigned':
      case 'courier_heading_to_store':
        return { label: 'Kurir Menuju Resto', color: 'bg-pink-100 text-pink-800' };
      case 'courier_arrived_at_store':
        return { label: 'Kurir di Toko', color: 'bg-pink-100 text-pink-800' };
      case 'on_delivery':
        return { label: 'Dalam Perjalanan', color: 'bg-green-100 text-green-800 font-extrabold' };
      case 'delivered':
        return { label: 'Selesai', color: 'bg-slate-100 text-slate-700' };
      case 'cancelled':
        return { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' };
      default:
        return { label: 'Diproses', color: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 p-4 shadow-2xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBackToHome}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Pesanan Saya</h2>
            <p className="text-[11px] text-slate-500">Riwayat dan status pemesanan Anda</p>
          </div>
        </div>

        {/* Tab Filters matching poster */}
        <div className="flex border-b border-slate-200 mt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 pb-2.5 text-center relative transition ${
              activeTab === 'active'
                ? 'text-pink-700 font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Aktif ({activeOrders.length})
            {activeTab === 'active' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-700" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 pb-2.5 text-center relative transition ${
              activeTab === 'completed'
                ? 'text-pink-700 font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Selesai ({completedOrders.length})
            {activeTab === 'completed' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-700" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`flex-1 pb-2.5 text-center relative transition ${
              activeTab === 'cancelled'
                ? 'text-pink-700 font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Dibatalkan ({cancelledOrders.length})
            {activeTab === 'cancelled' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-700" />
            )}
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Tidak ada pesanan di kategori ini</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {activeTab === 'active'
                ? 'Yuk pesan makanan lezat atau gunakan layanan kirim barang di Arjawinangun!'
                : 'Daftar pesanan sebelumnya akan tercatat di sini.'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={onBackToHome}
                className="mt-3 inline-flex items-center text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl shadow-xs transition"
              >
                Mulai Pesan Sekarang
              </button>
            )}
          </div>
        ) : (
          displayedOrders.map(order => {
            const badge = getStatusBadge(order.status);

            return (
              <div
                key={order.id}
                onClick={() => onOpenTracking(order)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-pink-300 transition cursor-pointer space-y-3"
              >
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {order.orderNumber} • {formatDateTime(order.createdAt)}
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-900 mt-0.5">
                      {order.storeName || order.packageDetails?.itemName || order.ppobDetails?.serviceType || 'Pesanan Arjawinangun'}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Items preview */}
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="truncate pr-2">
                    {order.items.length > 0
                      ? `${order.items[0].productName} ${order.items.length > 1 ? `+${order.items.length - 1} lainnya` : ''}`
                      : order.packageDetails
                      ? `Kirim Paket: ${order.packageDetails.itemName}`
                      : order.ppobDetails?.serviceType}
                  </span>
                  <span className="font-extrabold text-pink-700 shrink-0">
                    {formatRupiah(order.total)}
                  </span>
                </div>

                {/* Driver or Action bar */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  {order.courierName ? (
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-pink-600"></span>
                      <span className="text-slate-600 font-medium">
                        Driver: <strong>{order.courierName}</strong>
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Metode: {order.paymentMethod.toUpperCase()}</span>
                  )}

                  <div className="flex items-center text-pink-700 font-bold text-xs gap-1">
                    <span>Lacak Detail</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
