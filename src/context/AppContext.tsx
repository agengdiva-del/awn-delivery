import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  Store,
  Product,
  ProductReview,
  Order,
  OrderItem,
  Courier,
  WithdrawalRequest,
  FraudAlert,
  BannerAd,
  PromoCode,
  PPOBProduct,
  PaymentMethod,
  RegisteredUser,
} from '../types';
import {
  DISTRICTS,
  INITIAL_MERCHANTS,
  INITIAL_PRODUCTS,
  INITIAL_COURIERS,
  INITIAL_BANNERS,
  INITIAL_PROMOS,
  INITIAL_PPOB_PRODUCTS,
  INITIAL_FRAUD_ALERTS,
} from '../utils/mockData';
import { INITIAL_REGISTERED_USERS, INITIAL_REVIEWS } from '../utils/seedData';
import { sounds } from '../utils/soundEffects';

interface AppContextType {
  // Current user & authentication (Strict Registered Verification)
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  user: UserProfile | null;
  updateUser: (fields: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  registeredAccounts: RegisteredUser[];
  loginWithCredentials: (
    phone: string,
    password?: string,
    isOtp?: boolean
  ) => Promise<{ success: boolean; message: string; isNotRegistered?: boolean }>;
  registerAccount: (data: {
    name: string;
    phone: string;
    password: string;
    role: 'customer' | 'merchant' | 'courier';
    address: string;
    district: string;
    storeName?: string;
    storeCategory?: 'food' | 'groceries' | 'pharmacy';
    vehicleModel?: string;
    plateNumber?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  // Selected delivery location
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (addr: string) => void;

  // Catalog & Reviews
  merchants: Store[];
  products: Product[];
  couriers: Courier[];
  banners: BannerAd[];
  promos: PromoCode[];
  ppobProducts: PPOBProduct[];
  reviews: ProductReview[];
  addProductReview: (review: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>) => Promise<void>;

  // Cart
  cartItems: OrderItem[];
  cartStoreId: string | null;
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  activePromo: PromoCode | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;

  // Orders & Synchronization
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  createFoodOrder: (paymentMethod: PaymentMethod, notes?: string) => Promise<Order>;
  createPackageOrder: (details: {
    itemName: string;
    recipientName: string;
    recipientPhone: string;
    weightKg: number;
    pickupAddress: string;
    dropoffAddress: string;
    notes?: string;
  }) => Promise<Order>;
  createPPOBOrder: (product: PPOBProduct, targetNumber: string) => Promise<Order>;
  cancelOrder: (orderId: string, reason?: string) => void;
  submitRating: (orderId: string, rating: number, reviewText?: string) => void;

  // Merchant actions
  currentMerchantStore: Store;
  updateStoreDetails: (storeId: string, fields: Partial<Store>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (productId: string, fields: Partial<Product>) => void;
  toggleProductStock: (productId: string) => void;
  acceptMerchantOrder: (orderId: string) => void;
  setOrderReadyForPickup: (orderId: string) => void;
  registerNewStore: (storeData: Partial<Store>) => void;
  subscribeMerchantPremium: (storeId: string) => void;

  // Courier actions
  currentCourier: Courier;
  toggleCourierOnline: () => void;
  togglePriorityCourier: () => void;
  acceptIncomingDispatch: (orderId: string) => void;
  rejectIncomingDispatch: (orderId: string) => void;
  updateDeliveryProgress: (orderId: string, nextStatus: Order['status']) => void;
  registerNewCourier: (data: { name: string; phone: string; vehicleModel: string; plateNumber: string }) => void;

  // Admin & Financials
  withdrawals: WithdrawalRequest[];
  fraudAlerts: FraudAlert[];
  requestWithdrawal: (userId: string, role: 'merchant' | 'courier', amount: number, bank: string, accNo: string, holder: string) => boolean;
  approveWithdrawal: (id: string) => void;
  approveCourierKYC: (courierId: string) => void;
  rejectCourierKYC: (courierId: string) => void;
  approveMerchantKYC: (storeId: string) => void;
  resolveFraudAlert: (id: string) => void;
  suspendEntity: (type: 'merchant' | 'courier', id: string) => void;
  resetAllData: () => void;

  // Auto-dispatch timer state
  dispatchCountdown: number;
  autoDispatchLogs: string[];
}

const STORAGE_KEY = 'arjawinangun_send_v2';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback
  const loadInitial = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  // Requirement: Default is NOT logged in on opening the app so user sees the stunning landing login screen!
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadInitial('isAuth', false));
  const [user, setUser] = useState<UserProfile | null>(() => loadInitial('user', null));
  const [currentRole, setCurrentRole] = useState<UserRole>(() => loadInitial('role', 'customer'));

  // Database collections (synchronized with localStorage and backend REST API)
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredUser[]>(() =>
    loadInitial('registeredUsers', INITIAL_REGISTERED_USERS)
  );
  const [merchants, setMerchants] = useState<Store[]>(() => loadInitial('merchants', INITIAL_MERCHANTS));
  const [products, setProducts] = useState<Product[]>(() => loadInitial('products', INITIAL_PRODUCTS));
  const [reviews, setReviews] = useState<ProductReview[]>(() => loadInitial('reviews', INITIAL_REVIEWS));
  const [couriers, setCouriers] = useState<Courier[]>(() => loadInitial('couriers', INITIAL_COURIERS));
  const [banners] = useState<BannerAd[]>(INITIAL_BANNERS);
  const [promos] = useState<PromoCode[]>(INITIAL_PROMOS);
  const [ppobProducts] = useState<PPOBProduct[]>(INITIAL_PPOB_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(() => loadInitial('orders', []));
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => loadInitial('withdrawals', []));
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>(() => loadInitial('fraudAlerts', INITIAL_FRAUD_ALERTS));

  // Locations & active states
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => loadInitial('district', DISTRICTS[0]));
  const [deliveryAddress, setDeliveryAddress] = useState<string>(() =>
    loadInitial('address', 'Perum Arjawinangun Asri Blok C No. 12')
  );
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Cart
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => loadInitial('cart', []));
  const [cartStoreId, setCartStoreId] = useState<string | null>(() => loadInitial('cartStoreId', null));
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);

  // Auto-dispatch countdown simulation
  const [dispatchCountdown, setDispatchCountdown] = useState<number>(30);
  const [autoDispatchLogs, setAutoDispatchLogs] = useState<string[]>(() => [
    'Sistem Pro Database Arjawinangun Delivery diinisialisasi.',
    'Konektor Hyperlocal: Pelanggan • UMKM • Kurir Independen aktif.',
  ]);

  // Persist critical state
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_isAuth`, JSON.stringify(isAuthenticated));
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(user));
    localStorage.setItem(`${STORAGE_KEY}_role`, JSON.stringify(currentRole));
    localStorage.setItem(`${STORAGE_KEY}_registeredUsers`, JSON.stringify(registeredAccounts));
    localStorage.setItem(`${STORAGE_KEY}_merchants`, JSON.stringify(merchants));
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
    localStorage.setItem(`${STORAGE_KEY}_reviews`, JSON.stringify(reviews));
    localStorage.setItem(`${STORAGE_KEY}_couriers`, JSON.stringify(couriers));
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
    localStorage.setItem(`${STORAGE_KEY}_cart`, JSON.stringify(cartItems));
    localStorage.setItem(`${STORAGE_KEY}_cartStoreId`, JSON.stringify(cartStoreId));
    localStorage.setItem(`${STORAGE_KEY}_district`, JSON.stringify(selectedDistrict));
    localStorage.setItem(`${STORAGE_KEY}_address`, JSON.stringify(deliveryAddress));
    localStorage.setItem(`${STORAGE_KEY}_withdrawals`, JSON.stringify(withdrawals));
    localStorage.setItem(`${STORAGE_KEY}_fraudAlerts`, JSON.stringify(fraudAlerts));
  }, [isAuthenticated, user, currentRole, registeredAccounts, merchants, products, reviews, couriers, orders, cartItems, cartStoreId, selectedDistrict, deliveryAddress, withdrawals, fraudAlerts]);

  // Keep activeOrder in sync with orders list
  useEffect(() => {
    if (activeOrder) {
      const updated = orders.find(o => o.id === activeOrder.id);
      if (updated) setActiveOrder(updated);
    }
  }, [orders]);

  // -------------------------------------------------------------
  // AUTOMATED COURIER DISPATCH ENGINE (30-SECOND COUNTDOWN & ROLLOVER)
  // -------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(prevOrders => {
        let hasChanges = false;
        const nextOrders = prevOrders.map(order => {
          // If looking for courier
          if (order.status === 'looking_courier') {
            hasChanges = true;
            const rejected = order.rejectedCourierIds || [];
            const candidates = couriers.filter(
              c => c.isOnline && c.verificationStatus === 'approved' && !rejected.includes(c.id)
            );

            if (candidates.length > 0) {
              const bestCandidate = candidates.sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0))[0];

              setAutoDispatchLogs(logs => [
                `[Auto-Dispatch Radar ${new Date().toLocaleTimeString('id-ID')}] Order #${order.orderNumber} diarahkan ke ${bestCandidate.name} (${bestCandidate.vehicleModel}). Timer 30 detik dimulai.`,
                ...logs.slice(0, 40),
              ]);

              return {
                ...order,
                status: 'courier_assigned' as const,
                courierId: bestCandidate.id,
                courierName: bestCandidate.name,
                courierPhone: bestCandidate.phone,
                courierVehicle: `${bestCandidate.vehicleModel} - ${bestCandidate.plateNumber}`,
                courierRating: bestCandidate.rating,
                courierCoords: bestCandidate.coords,
                assignedCourierTimeout: Date.now() + 30000,
              };
            }
          }

          // 30s Timeout Rollover
          if (order.status === 'courier_assigned' && order.assignedCourierTimeout) {
            const timeLeft = Math.max(0, Math.ceil((order.assignedCourierTimeout - Date.now()) / 1000));
            setDispatchCountdown(timeLeft);

            if (timeLeft <= 0) {
              hasChanges = true;
              const currentName = order.courierName || 'Kurir';
              setAutoDispatchLogs(logs => [
                `[Auto-Dispatch 30s Timeout] ${currentName} tidak merespon order #${order.orderNumber}. Otomatis dialihkan ke kurir terdekat berikutnya.`,
                ...logs.slice(0, 40),
              ]);

              return {
                ...order,
                status: 'looking_courier' as const,
                rejectedCourierIds: [...(order.rejectedCourierIds || []), order.courierId || ''],
                courierId: undefined,
                courierName: undefined,
                courierPhone: undefined,
                courierVehicle: undefined,
                assignedCourierTimeout: undefined,
                dispatchAttempt: order.dispatchAttempt + 1,
              };
            }
          }

          return order;
        });

        return hasChanges ? nextOrders : prevOrders;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [couriers]);

  // -------------------------------------------------------------
  // STRICT REGISTERED-ONLY AUTHENTICATION & REGISTRATION
  // -------------------------------------------------------------
  const loginWithCredentials = async (
    phone: string,
    password?: string,
    isOtp = false
  ): Promise<{ success: boolean; message: string; isNotRegistered?: boolean }> => {
    // Attempt backend API login first
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, isOtpLogin: isOtp }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setCurrentRole(data.user.role);
          setIsAuthenticated(true);
          sounds.playSuccess();
          return { success: true, message: data.message };
        }
      } else {
        const errorData = await response.json();
        return {
          success: false,
          isNotRegistered: errorData.isNotRegistered,
          message: errorData.message || 'Gagal login. Nomor tidak terdaftar.',
        };
      }
    } catch {
      // Offline / Local database fallback
    }

    // Verify phone against registered accounts in Pro Database
    const cleanPhone = phone.replace(/\D/g, '');
    const foundUser = registeredAccounts.find(u => {
      const uClean = u.phone.replace(/\D/g, '');
      return (
        uClean === cleanPhone ||
        (cleanPhone.startsWith('62') && uClean === '0' + cleanPhone.slice(2)) ||
        (cleanPhone.startsWith('0') && uClean === '62' + cleanPhone.slice(1))
      );
    });

    if (!foundUser) {
      return {
        success: false,
        isNotRegistered: true,
        message: `Nomor WhatsApp ${phone} BELUM terdaftar di database Arjawinangun Delivery. Silakan daftar terlebih dahulu.`,
      };
    }

    if (!isOtp && password && foundUser.password && foundUser.password !== password) {
      return {
        success: false,
        message: 'Password yang Anda masukkan salah. Silakan coba lagi atau gunakan login WhatsApp OTP.',
      };
    }

    setUser(foundUser);
    setCurrentRole(foundUser.role);
    setIsAuthenticated(true);
    sounds.playSuccess();
    return { success: true, message: `Selamat datang kembali, ${foundUser.name}!` };
  };

  const registerAccount = async (data: {
    name: string;
    phone: string;
    password: string;
    role: 'customer' | 'merchant' | 'courier';
    address: string;
    district: string;
    storeName?: string;
    storeCategory?: 'food' | 'groceries' | 'pharmacy';
    vehicleModel?: string;
    plateNumber?: string;
  }): Promise<{ success: boolean; message: string }> => {
    // Check if phone already registered
    const cleanPhone = data.phone.replace(/\D/g, '');
    const existing = registeredAccounts.find(u => u.phone.replace(/\D/g, '') === cleanPhone);
    if (existing) {
      return {
        success: false,
        message: `Nomor WhatsApp ${data.phone} sudah terdaftar. Silakan langsung login.`,
      };
    }

    const userId = `user-${Date.now()}`;
    let storeId: string | undefined;
    let courierId: string | undefined;

    // If merchant, generate store
    if (data.role === 'merchant') {
      storeId = `store-${Date.now()}`;
      const newStore: Store = {
        id: storeId,
        name: data.storeName || `${data.name} Kuliner`,
        ownerId: userId,
        category: data.storeCategory || 'food',
        categoryLabel: data.storeCategory === 'groceries' ? 'Belanja & Sembako' : 'Kuliner UMKM',
        rating: 5.0,
        reviewCount: 0,
        address: data.address,
        district: data.district,
        distanceKm: 0.9,
        banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=200&auto=format&fit=crop&q=80',
        isFeatured: false,
        isPremium: false,
        status: 'active',
        minOrder: 15000,
        estimatedDeliveryMin: '15-25 min',
        openingHours: '08:00 - 21:00',
        isOpen: true,
        verified: true,
        totalSalesCount: 0,
        tags: ['UMKM Baru', 'Mitra Arjawinangun Delivery'],
      };
      setMerchants(prev => [newStore, ...prev]);
    }

    // If courier, generate courier
    if (data.role === 'courier') {
      courierId = `courier-${Date.now()}`;
      const newCourier: Courier = {
        id: courierId,
        userId,
        name: data.name,
        phone: data.phone,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        vehicleModel: data.vehicleModel || 'Honda Beat',
        plateNumber: data.plateNumber || 'E 1234 XY',
        rating: 5.0,
        totalDeliveries: 0,
        isOnline: true,
        isPriority: false,
        verificationStatus: 'approved',
        documents: {
          ktp: 'verified-ktp.pdf',
          sim: 'verified-sim-c.pdf',
          stnk: 'verified-stnk.pdf',
          selfie: 'verified-selfie.jpg',
        },
        currentZone: data.district,
        walletBalance: 0,
        coords: { x: 50, y: 50 },
      };
      setCouriers(prev => [newCourier, ...prev]);
    }

    const newUser: RegisteredUser = {
      id: userId,
      name: data.name,
      phone: data.phone,
      email: `${data.phone}@arjawinangun.delivery`,
      password: data.password,
      role: data.role,
      avatar:
        data.role === 'merchant'
          ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
          : data.role === 'courier'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      address: data.address,
      district: data.district,
      balance: data.role === 'customer' ? 50000 : 0, // Bonus saldo awal Rp 50.000
      loyaltyPoints: 100,
      referralCode: `${data.name.slice(0, 4).toUpperCase()}-DELIV`,
      referralsCount: 0,
      storeId,
      courierId,
      isRegistered: true,
    };

    setRegisteredAccounts(prev => [newUser, ...prev]);
    setUser(newUser);
    setCurrentRole(newUser.role);
    setIsAuthenticated(true);
    sounds.playSuccess();

    // Sync to backend API if available
    try {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // Ignored
    }

    return {
      success: true,
      message: 'Pendaftaran berhasil! Akun Anda aktif di Arjawinangun Delivery.',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (fields: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...fields };
    setUser(updated);
    setRegisteredAccounts(prev => prev.map(u => (u.id === user.id ? { ...u, ...fields } : u)));
  };

  // -------------------------------------------------------------
  // REVIEWS & COMMENTS
  // -------------------------------------------------------------
  const addProductReview = async (reviewData: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>) => {
    const newRev: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
    };

    setReviews(prev => [newRev, ...prev]);

    // Recalculate product rating & store rating
    setProducts(prevProds =>
      prevProds.map(p => {
        if (p.id === reviewData.productId) {
          const prodReviews = [newRev, ...reviews.filter(r => r.productId === p.id)];
          const avg = prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length;
          return {
            ...p,
            rating: Math.round(avg * 10) / 10,
            reviewsCount: prodReviews.length,
          };
        }
        return p;
      })
    );

    setMerchants(prevStores =>
      prevStores.map(s => {
        if (s.id === reviewData.storeId) {
          const storeReviews = [newRev, ...reviews.filter(r => r.storeId === s.id)];
          const avg = storeReviews.reduce((acc, r) => acc + r.rating, 0) / storeReviews.length;
          return {
            ...s,
            rating: Math.round(avg * 10) / 10,
            reviewCount: storeReviews.length,
          };
        }
        return s;
      })
    );

    sounds.playSuccess();

    // Sync to backend
    try {
      fetch(`/api/catalog/products/${reviewData.productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
    } catch {
      // Ignored
    }
  };

  // -------------------------------------------------------------
  // CART OPERATIONS
  // -------------------------------------------------------------
  const addToCart = (product: Product, quantity = 1, notes?: string) => {
    sounds.playNewOrderDing();
    if (cartStoreId && cartStoreId !== product.storeId) {
      if (
        !window.confirm(
          'Keranjang Anda berisi produk dari toko lain. Kosongkan keranjang untuk memesan dari toko ini?'
        )
      ) {
        return;
      }
      setCartItems([
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity,
          notes,
          image: product.image,
        },
      ]);
      setCartStoreId(product.storeId);
      return;
    }

    setCartStoreId(product.storeId);
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity,
          notes,
          image: product.image,
        },
      ];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => {
        const filtered = prev.filter(i => i.productId !== productId);
        if (filtered.length === 0) setCartStoreId(null);
        return filtered;
      });
    } else {
      setCartItems(prev => prev.map(i => (i.productId === productId ? { ...i, quantity } : i)));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCartStoreId(null);
    setActivePromo(null);
  };

  const applyPromoCode = (code: string) => {
    const promo = promos.find(p => p.code.toUpperCase() === code.trim().toUpperCase());
    if (!promo) {
      return { success: false, message: 'Kode promo tidak valid' };
    }
    setActivePromo(promo);
    sounds.playSuccess();
    return { success: true, message: `Promo "${promo.title}" berhasil digunakan!` };
  };

  const removePromoCode = () => {
    setActivePromo(null);
  };

  // -------------------------------------------------------------
  // ORDERS: LIVE SYNCHRONIZATION ACROSS CUSTOMER, MERCHANT & COURIER
  // -------------------------------------------------------------
  const createFoodOrder = async (paymentMethod: PaymentMethod, notes?: string): Promise<Order> => {
    const store = merchants.find(m => m.id === cartStoreId) || merchants[0];
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const baseDistance = store.distanceKm || 1.2;
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

    const total = Math.max(0, subtotal + deliveryFee + serviceFee - discount);
    const commissionRate = store.isPremium ? 0.08 : 0.10;
    const platformCommissionMerchant = Math.round(subtotal * commissionRate);
    const platformDeliveryFeeShare = 1500;
    const courierEarnings = deliveryFee - platformDeliveryFeeShare;
    const merchantNetEarnings = subtotal - platformCommissionMerchant;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `SEND-${Math.floor(100000 + Math.random() * 900000)}`,
      type: store.category === 'groceries' ? 'groceries' : 'food',
      customerId: user?.id || 'cust-demo',
      customerName: user?.name || 'Pelanggan Arjawinangun',
      customerPhone: user?.phone || '081234567890',
      customerAddress: deliveryAddress,
      customerDistrict: selectedDistrict,
      customerCoords: { x: 75, y: 70 },
      storeId: store.id,
      storeName: store.name,
      storeAddress: store.address,
      storeCoords: { x: 25, y: 30 },
      items: [...cartItems],
      status: 'merchant_preparing', // Enters Merchant order board immediately
      subtotal,
      deliveryFee,
      serviceFee,
      discount,
      total,
      platformCommissionMerchant,
      platformDeliveryFeeShare,
      courierEarnings,
      merchantNetEarnings,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      createdAt: new Date().toISOString(),
      estimatedMinutes: 25,
      dispatchAttempt: 1,
      notes,
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    sounds.playSuccess();

    if (user) {
      updateUser({ loyaltyPoints: user.loyaltyPoints + 15 });
    }

    // Auto-dispatch trigger after merchant preparation delay
    setTimeout(() => {
      setOrders(current =>
        current.map(o => (o.id === newOrder.id ? { ...o, status: 'looking_courier' } : o))
      );
      sounds.playDispatchAlert();
    }, 4000);

    return newOrder;
  };

  const createPackageOrder = async (details: {
    itemName: string;
    recipientName: string;
    recipientPhone: string;
    weightKg: number;
    pickupAddress: string;
    dropoffAddress: string;
    notes?: string;
  }): Promise<Order> => {
    const baseFee = 8000;
    const weightFee = Math.max(0, (details.weightKg - 1) * 2000);
    const deliveryFee = baseFee + weightFee;
    const serviceFee = 1000;
    const total = deliveryFee + serviceFee;
    const platformDeliveryFeeShare = 2000;
    const courierEarnings = deliveryFee - platformDeliveryFeeShare;

    const newOrder: Order = {
      id: `ord-pkg-${Date.now()}`,
      orderNumber: `KIRIM-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'package',
      customerId: user?.id || 'cust-demo',
      customerName: user?.name || 'Pelanggan Arjawinangun',
      customerPhone: user?.phone || '081234567890',
      customerAddress: details.pickupAddress,
      customerDistrict: selectedDistrict,
      customerCoords: { x: 30, y: 35 },
      items: [],
      packageDetails: { ...details },
      status: 'looking_courier',
      subtotal: 0,
      deliveryFee,
      serviceFee,
      discount: 0,
      total,
      platformCommissionMerchant: 0,
      platformDeliveryFeeShare,
      courierEarnings,
      merchantNetEarnings: 0,
      paymentMethod: 'qris',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      estimatedMinutes: 20,
      dispatchAttempt: 1,
      notes: details.notes,
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    sounds.playDispatchAlert();
    return newOrder;
  };

  const createPPOBOrder = async (product: PPOBProduct, targetNumber: string): Promise<Order> => {
    const total = product.price;
    const serviceFee = product.adminFee;

    const newOrder: Order = {
      id: `ord-ppob-${Date.now()}`,
      orderNumber: `PPOB-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'ppob',
      customerId: user?.id || 'cust-demo',
      customerName: user?.name || 'Pelanggan Arjawinangun',
      customerPhone: user?.phone || '081234567890',
      customerAddress: '-',
      customerDistrict: selectedDistrict,
      customerCoords: { x: 50, y: 50 },
      items: [],
      ppobDetails: {
        serviceType: product.name,
        targetNumber,
        operator: product.provider,
        nominal: product.nominal.toString(),
      },
      status: 'delivered',
      subtotal: product.nominal,
      deliveryFee: 0,
      serviceFee,
      discount: 0,
      total,
      platformCommissionMerchant: serviceFee,
      platformDeliveryFeeShare: 0,
      courierEarnings: 0,
      merchantNetEarnings: product.nominal,
      paymentMethod: 'qris',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      estimatedMinutes: 1,
      dispatchAttempt: 0,
    };

    setOrders(prev => [newOrder, ...prev]);
    sounds.playSuccess();
    return newOrder;
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: 'cancelled', notes: `${o.notes ? o.notes + ' | ' : ''}Dibatalkan: ${reason || 'Permintaan pembeli'}` }
          : o
      )
    );
  };

  const submitRating = (orderId: string, rating: number, reviewText?: string) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, rating, reviewText } : o)));
    sounds.playSuccess();
  };

  // -------------------------------------------------------------
  // MERCHANT SYNCHRONIZATION
  // -------------------------------------------------------------
  const currentMerchantStore = merchants[0];

  const updateStoreDetails = (storeId: string, fields: Partial<Store>) => {
    setMerchants(prev => prev.map(s => (s.id === storeId ? { ...s, ...fields } : s)));
  };

  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = { ...prodData, id: `prod-${Date.now()}` };
    setProducts(prev => [newProd, ...prev]);
    sounds.playSuccess();
  };

  const updateProduct = (productId: string, fields: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, ...fields } : p)));
  };

  const toggleProductStock = (productId: string) => {
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p)));
  };

  const acceptMerchantOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'merchant_preparing' } : o)));
    sounds.playSuccess();
  };

  const setOrderReadyForPickup = (orderId: string) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'looking_courier' } : o)));
    sounds.playDispatchAlert();
  };

  const registerNewStore = (storeData: Partial<Store>) => {
    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: storeData.name || 'Toko Baru Arjawinangun',
      ownerId: user?.id || 'owner-demo',
      category: storeData.category || 'food',
      categoryLabel: storeData.categoryLabel || 'Kuliner UMKM',
      rating: 5.0,
      reviewCount: 1,
      address: storeData.address || 'Arjawinangun, Cirebon',
      district: storeData.district || selectedDistrict,
      distanceKm: 1.0,
      banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      logo: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=200&auto=format&fit=crop&q=80',
      isFeatured: false,
      isPremium: false,
      status: 'active',
      minOrder: 15000,
      estimatedDeliveryMin: '20-30 min',
      openingHours: storeData.openingHours || '08:00 - 21:00',
      isOpen: true,
      verified: true,
      totalSalesCount: 0,
      tags: ['UMKM Arjawinangun', 'Toko Baru'],
    };

    setMerchants(prev => [newStore, ...prev]);
    sounds.playSuccess();
  };

  const subscribeMerchantPremium = (storeId: string) => {
    setMerchants(prev => prev.map(s => (s.id === storeId ? { ...s, isPremium: true, isFeatured: true } : s)));
    sounds.playSuccess();
  };

  // -------------------------------------------------------------
  // COURIER SYNCHRONIZATION
  // -------------------------------------------------------------
  const currentCourier = couriers[0];

  const toggleCourierOnline = () => {
    setCouriers(prev => prev.map(c => (c.id === currentCourier.id ? { ...c, isOnline: !c.isOnline } : c)));
  };

  const togglePriorityCourier = () => {
    setCouriers(prev => prev.map(c => (c.id === currentCourier.id ? { ...c, isPriority: !c.isPriority } : c)));
    sounds.playSuccess();
  };

  const acceptIncomingDispatch = (orderId: string) => {
    sounds.playSuccess();
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: 'courier_heading_to_store', assignedCourierTimeout: undefined }
          : o
      )
    );
  };

  const rejectIncomingDispatch = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    setAutoDispatchLogs(logs => [
      `[Kurir Menolak] ${currentCourier.name} melewatkan order #${targetOrder.orderNumber}. Re-routing otomatis ke kurir berikutnya.`,
      ...logs.slice(0, 40),
    ]);

    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'looking_courier',
              rejectedCourierIds: [...(o.rejectedCourierIds || []), currentCourier.id],
              courierId: undefined,
              courierName: undefined,
              courierPhone: undefined,
              assignedCourierTimeout: undefined,
              dispatchAttempt: o.dispatchAttempt + 1,
            }
          : o
      )
    );
  };

  const updateDeliveryProgress = (orderId: string, nextStatus: Order['status']) => {
    sounds.playSuccess();
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;

        // Balance synchronization on delivery completion
        if (nextStatus === 'delivered') {
          // Credit courier wallet
          setCouriers(cList =>
            cList.map(c =>
              c.id === o.courierId
                ? { ...c, walletBalance: c.walletBalance + o.courierEarnings, totalDeliveries: c.totalDeliveries + 1 }
                : c
            )
          );

          // Credit merchant wallet in registered users
          if (o.storeId) {
            const store = merchants.find(m => m.id === o.storeId);
            if (store) {
              setRegisteredAccounts(uList =>
                uList.map(u => (u.id === store.ownerId ? { ...u, balance: u.balance + o.merchantNetEarnings } : u))
              );
            }
          }
        }

        return { ...o, status: nextStatus };
      })
    );
  };

  const registerNewCourier = (data: { name: string; phone: string; vehicleModel: string; plateNumber: string }) => {
    const newCourier: Courier = {
      id: `courier-${Date.now()}`,
      userId: `user-cour-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      vehicleModel: data.vehicleModel,
      plateNumber: data.plateNumber,
      rating: 5.0,
      totalDeliveries: 0,
      isOnline: false,
      isPriority: false,
      verificationStatus: 'pending',
      documents: {
        ktp: 'uploaded-ktp.jpg',
        sim: 'uploaded-sim-c.jpg',
        stnk: 'uploaded-stnk.jpg',
        selfie: 'uploaded-selfie.jpg',
      },
      currentZone: selectedDistrict,
      walletBalance: 0,
      coords: { x: 50, y: 50 },
    };

    setCouriers(prev => [...prev, newCourier]);
    sounds.playSuccess();
  };

  // -------------------------------------------------------------
  // ADMIN & WITHDRAWALS
  // -------------------------------------------------------------
  const requestWithdrawal = (
    userId: string,
    role: 'merchant' | 'courier',
    amount: number,
    bank: string,
    accNo: string,
    holder: string
  ): boolean => {
    const fee = 2500;
    const netAmount = amount - fee;

    const req: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      userId,
      userName: role === 'merchant' ? currentMerchantStore.name : currentCourier.name,
      userRole: role,
      bankName: bank,
      accountNumber: accNo,
      accountHolder: holder,
      amount,
      fee,
      netAmount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    setWithdrawals(prev => [req, ...prev]);
    sounds.playSuccess();
    return true;
  };

  const approveWithdrawal = (id: string) => {
    setWithdrawals(prev =>
      prev.map(w => (w.id === id ? { ...w, status: 'approved', processedAt: new Date().toISOString() } : w))
    );
    sounds.playSuccess();
  };

  const approveCourierKYC = (courierId: string) => {
    setCouriers(prev =>
      prev.map(c => (c.id === courierId ? { ...c, verificationStatus: 'approved', isOnline: true } : c))
    );
    sounds.playSuccess();
  };

  const rejectCourierKYC = (courierId: string) => {
    setCouriers(prev => prev.map(c => (c.id === courierId ? { ...c, verificationStatus: 'rejected' } : c)));
  };

  const approveMerchantKYC = (storeId: string) => {
    setMerchants(prev => prev.map(s => (s.id === storeId ? { ...s, verified: true } : s)));
    sounds.playSuccess();
  };

  const resolveFraudAlert = (id: string) => {
    setFraudAlerts(prev => prev.map(f => (f.id === id ? { ...f, status: 'resolved' } : f)));
  };

  const suspendEntity = (type: 'merchant' | 'courier', id: string) => {
    if (type === 'merchant') {
      setMerchants(prev => prev.map(m => (m.id === id ? { ...m, status: 'suspended' } : m)));
    } else {
      setCouriers(prev => prev.map(c => (c.id === id ? { ...c, verificationStatus: 'rejected', isOnline: false } : c)));
    }
    sounds.playSuccess();
  };

  const resetAllData = () => {
    localStorage.clear();
    setRegisteredAccounts(INITIAL_REGISTERED_USERS);
    setMerchants(INITIAL_MERCHANTS);
    setProducts(INITIAL_PRODUCTS);
    setReviews(INITIAL_REVIEWS);
    setCouriers(INITIAL_COURIERS);
    setOrders([]);
    setCartItems([]);
    setCartStoreId(null);
    setFraudAlerts(INITIAL_FRAUD_ALERTS);
    setWithdrawals([]);
    setIsAuthenticated(false);
    setUser(null);
    sounds.playSuccess();
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        user,
        updateUser,
        isAuthenticated,
        registeredAccounts,
        loginWithCredentials,
        registerAccount,
        logout,
        selectedDistrict,
        setSelectedDistrict,
        deliveryAddress,
        setDeliveryAddress,
        merchants,
        products,
        couriers,
        banners,
        promos,
        ppobProducts,
        reviews,
        addProductReview,
        cartItems,
        cartStoreId,
        addToCart,
        updateCartQuantity,
        clearCart,
        activePromo,
        applyPromoCode,
        removePromoCode,
        orders,
        activeOrder,
        setActiveOrder,
        createFoodOrder,
        createPackageOrder,
        createPPOBOrder,
        cancelOrder,
        submitRating,
        currentMerchantStore,
        updateStoreDetails,
        addProduct,
        updateProduct,
        toggleProductStock,
        acceptMerchantOrder,
        setOrderReadyForPickup,
        registerNewStore,
        subscribeMerchantPremium,
        currentCourier,
        toggleCourierOnline,
        togglePriorityCourier,
        acceptIncomingDispatch,
        rejectIncomingDispatch,
        updateDeliveryProgress,
        registerNewCourier,
        withdrawals,
        fraudAlerts,
        requestWithdrawal,
        approveWithdrawal,
        approveCourierKYC,
        rejectCourierKYC,
        approveMerchantKYC,
        resolveFraudAlert,
        suspendEntity,
        resetAllData,
        dispatchCountdown,
        autoDispatchLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
