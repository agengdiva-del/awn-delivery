import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Store } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { 
  X, 
  Star, 
  Plus, 
  Minus, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  ShieldCheck,
  Flame,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductDetailReviewModalProps {
  product: Product | null;
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, notes?: string) => void;
}

export const ProductDetailReviewModal: React.FC<ProductDetailReviewModalProps> = ({
  product,
  store,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { reviews, addProductReview, user } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customNotes, setCustomNotes] = useState('');
  
  // Review submission form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!isOpen || !product) return null;

  const productReviews = reviews.filter(r => r.productId === product.id);
  const avgRating = productReviews.length > 0
    ? Math.round((productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length) * 10) / 10
    : 5.0;

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    await addProductReview({
      productId: product.id,
      storeId: product.storeId,
      userName: user?.name || 'Pelanggan Arjawinangun',
      userPhone: user?.phone || '081234567890',
      userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: newRating,
      comment: newComment,
      verifiedOrder: true,
    });

    setIsSubmittingReview(false);
    setReviewSubmitted(true);
    setNewComment('');
    confetti({ particleCount: 50, spread: 50 });
  };

  const handleAddToCart = () => {
    const finalNotes = [selectedOption, customNotes].filter(Boolean).join(' • ');
    onAddToCart(product, quantity, finalNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full sm:max-w-md h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Product Banner */}
        <div className="relative h-52 sm:h-56 w-full shrink-0 bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>

          {product.isBestSeller && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-white" />
              MENU TERLARIS
            </div>
          )}

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
              {product.category}
            </span>
            <h2 className="text-base sm:text-lg font-black leading-snug">{product.name}</h2>
            <div className="flex items-center space-x-2 text-xs mt-1">
              <span className="text-amber-400 font-extrabold flex items-center">
                <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                {avgRating} ({productReviews.length} Ulasan)
              </span>
              <span>•</span>
              <span className="text-pink-200 font-bold">{store?.name}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Price & Description */}
          <div className="space-y-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-black text-pink-700">
                {formatRupiah(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatRupiah(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Options / Customization */}
          {product.options && product.options.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Pilih Varian / Level:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {product.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedOption(opt)}
                    className={`p-2 text-xs rounded-xl border text-left transition ${
                      selectedOption === opt
                        ? 'border-pink-600 bg-pink-100 text-pink-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Special Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan Pesanan Khusus (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Sambal dipisah, jangan pakai bawang goreng..."
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          {/* ================= REVIEWS & COMMENTS SECTION ================= */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-pink-600" />
                  Ulasan & Komentar Pelanggan ({productReviews.length})
                </h3>
                <span className="text-[10px] text-slate-500">Komentar asli warga Arjawinangun</span>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-full transition"
              >
                + Tulis Ulasan
              </button>
            </div>

            {/* Review Input Form */}
            {showReviewForm && (
              <form onSubmit={handleAddReview} className="p-3 bg-pink-50/70 border border-pink-200 rounded-2xl space-y-2.5 animate-in slide-in-from-top-2">
                <span className="text-xs font-bold text-pink-950 block">Beri Nilai & Komentar Anda</span>
                
                {/* Star rating picker */}
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star className={`w-5 h-5 ${s <= newRating ? 'fill-amber-400' : 'stroke-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-2">{newRating} Bintang</span>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Ceritakan rasa, kemasan, atau kecepatan pengiriman..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                />

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="text-xs px-3 py-1.5 text-slate-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Kirim Komentar
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {productReviews.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
                Belum ada komentar untuk menu ini. Jadilah yang pertama memberikan ulasan!
              </div>
            ) : (
              <div className="space-y-2.5">
                {productReviews.map(rev => (
                  <div key={rev.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                        {rev.verifiedOrder && (
                          <span className="text-[9px] font-bold text-pink-700 bg-pink-100 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Pembeli Terverifikasi
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-amber-500 font-bold text-[11px]">
                        ★ {rev.rating}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pl-8">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    <span className="text-[10px] text-slate-400 block pl-8">
                      {formatDateTime(rev.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Add to Cart Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shadow-lg">
          {/* Quantity selector */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center text-slate-700"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold w-5 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center text-pink-600"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md flex items-center justify-between transition active:scale-98"
          >
            <span>Tambah ke Keranjang</span>
            <span>{formatRupiah(product.price * quantity)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
