import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Store, Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ProductDetailReviewModal } from './ProductDetailReviewModal';
import { 
  X, 
  Star, 
  Clock, 
  MapPin, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  Search,
  MessageSquare,
  ChevronRight,
  Flame
} from 'lucide-react';

interface StoreDetailModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCart: () => void;
}

export const StoreDetailModal: React.FC<StoreDetailModalProps> = ({
  store,
  isOpen,
  onClose,
  onOpenCart,
}) => {
  const { products, reviews, addToCart, cartItems, cartStoreId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedProductForReview, setSelectedProductForReview] = useState<Product | null>(null);

  if (!isOpen || !store) return null;

  const storeProducts = products.filter(p => p.storeId === store.id);
  const storeReviews = reviews.filter(r => r.storeId === store.id);
  const categories = ['Semua', ...Array.from(new Set(storeProducts.map(p => p.category)))];

  const filteredProducts = storeProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartCount = cartStoreId === store.id ? cartItems.reduce((acc, i) => acc + i.quantity, 0) : 0;
  const cartSubtotal = cartStoreId === store.id ? cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0) : 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
        <div className="bg-white w-full sm:max-w-lg h-full sm:h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
          {/* Banner with close button */}
          <div className="relative h-44 sm:h-48 w-full shrink-0">
            <img
              src={store.banner}
              alt={store.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
            
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

            {store.isPremium && (
              <div className="absolute top-3 left-3 bg-amber-500 text-slate-900 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 fill-slate-900" />
                MITRA RESMI
              </div>
            )}

            {/* Store Info on Header bottom */}
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <h2 className="text-lg font-black leading-tight">{store.name}</h2>
              <div className="flex items-center space-x-3 text-xs mt-1 text-slate-200">
                <span className="flex items-center text-amber-400 font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                  {store.rating} ({storeReviews.length || store.reviewCount} Ulasan)
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {store.estimatedDeliveryMin}
                </span>
                <span>•</span>
                <span>{store.distanceKm} km</span>
              </div>
            </div>
          </div>

          {/* Address and details sub-strip */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span className="truncate">{store.address}</span>
            </div>
            <span className="text-pink-600 font-bold shrink-0 ml-2">
              Buka {store.openingHours}
            </span>
          </div>

          {/* Search & Categories */}
          <div className="p-3 border-b border-slate-100 bg-white">
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Cari menu di ${store.name}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap text-xs transition ${
                    selectedCategory === cat
                      ? 'bg-pink-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Tidak ada produk yang cocok dengan pencarian Anda.
              </div>
            ) : (
              filteredProducts.map(product => {
                const inCart = cartItems.find(i => i.productId === product.id);
                const prodReviews = reviews.filter(r => r.productId === product.id);
                const ratingDisplay = prodReviews.length > 0
                  ? Math.round((prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length) * 10) / 10
                  : (product.rating || 4.9);

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-pink-400 transition shadow-2xs group"
                  >
                    {/* Clickable details area */}
                    <div
                      onClick={() => setSelectedProductForReview(product)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-pink-600 transition truncate">
                          {product.name}
                        </h4>
                        {product.isBestSeller && (
                          <span className="bg-orange-100 text-orange-700 text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                            Favorit
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs font-black text-pink-700">
                          {formatRupiah(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatRupiah(product.originalPrice)}
                          </span>
                        )}

                        <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.2 rounded">
                          ★ {ratingDisplay} ({prodReviews.length} ulasan)
                        </span>
                      </div>
                    </div>

                    {/* Image & Add Button */}
                    <div className="flex flex-col items-end shrink-0 space-y-2">
                      <div 
                        onClick={() => setSelectedProductForReview(product)}
                        className="cursor-pointer relative overflow-hidden rounded-xl border border-slate-100"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover group-hover:scale-105 transition duration-200"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5 font-bold">
                          Lihat Ulasan
                        </span>
                      </div>
                      
                      {product.isAvailable ? (
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 transition active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                          Tambah {inCart ? `(${inCart.quantity})` : ''}
                        </button>
                      ) : (
                        <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded">
                          Habis
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Floating Cart Footer */}
          {cartCount > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200">
              <button
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                  <span className="text-xs">Lihat Keranjang</span>
                </div>
                <span className="text-sm font-extrabold">
                  {formatRupiah(cartSubtotal)}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail & Customer Reviews Modal */}
      <ProductDetailReviewModal
        product={selectedProductForReview}
        store={store}
        isOpen={!!selectedProductForReview}
        onClose={() => setSelectedProductForReview(null)}
        onAddToCart={(prod, qty, notes) => addToCart(prod, qty, notes)}
      />
    </>
  );
};
