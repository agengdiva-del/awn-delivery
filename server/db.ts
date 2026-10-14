import fs from 'fs';
import path from 'path';
import { 
  Store, 
  Product, 
  Courier, 
  Order, 
  WithdrawalRequest, 
  FraudAlert,
  BannerAd,
  PromoCode,
  PPOBProduct,
  RegisteredUser,
  ProductReview
} from '../src/types';
import { 
  INITIAL_MERCHANTS, 
  INITIAL_PRODUCTS, 
  INITIAL_COURIERS, 
  INITIAL_BANNERS, 
  INITIAL_PROMOS, 
  INITIAL_PPOB_PRODUCTS, 
  INITIAL_FRAUD_ALERTS 
} from '../src/utils/mockData';
import { INITIAL_REGISTERED_USERS, INITIAL_REVIEWS } from '../src/utils/seedData';

export interface ProDatabaseSchema {
  users: RegisteredUser[];
  merchants: Store[];
  products: Product[];
  reviews: ProductReview[];
  couriers: Courier[];
  orders: Order[];
  withdrawals: WithdrawalRequest[];
  fraudAlerts: FraudAlert[];
  banners: BannerAd[];
  promos: PromoCode[];
  ppobProducts: PPOBProduct[];
}

const DB_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DB_DIR, 'arjawinangun_db.json');

class ProDatabase {
  private data: ProDatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): ProDatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || INITIAL_REGISTERED_USERS,
          merchants: parsed.merchants || INITIAL_MERCHANTS,
          products: parsed.products || INITIAL_PRODUCTS,
          reviews: parsed.reviews || INITIAL_REVIEWS,
          couriers: parsed.couriers || INITIAL_COURIERS,
          orders: parsed.orders || [],
          withdrawals: parsed.withdrawals || [],
          fraudAlerts: parsed.fraudAlerts || INITIAL_FRAUD_ALERTS,
          banners: parsed.banners || INITIAL_BANNERS,
          promos: parsed.promos || INITIAL_PROMOS,
          ppobProducts: parsed.ppobProducts || INITIAL_PPOB_PRODUCTS,
        };
      }
    } catch (e) {
      console.error('[ProDatabase] Error loading database, initializing defaults:', e);
    }

    const initialData: ProDatabaseSchema = {
      users: INITIAL_REGISTERED_USERS,
      merchants: INITIAL_MERCHANTS,
      products: INITIAL_PRODUCTS,
      reviews: INITIAL_REVIEWS,
      couriers: INITIAL_COURIERS,
      orders: [],
      withdrawals: [],
      fraudAlerts: INITIAL_FRAUD_ALERTS,
      banners: INITIAL_BANNERS,
      promos: INITIAL_PROMOS,
      ppobProducts: INITIAL_PPOB_PRODUCTS,
    };

    this.saveDatabase(initialData);
    return initialData;
  }

  private saveDatabase(dataToSave: ProDatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('[ProDatabase] Error writing database to file:', e);
    }
  }

  // --- User / Authentication Methods ---
  findUserByPhone(phone: string): RegisteredUser | undefined {
    const cleanPhone = phone.replace(/\D/g, '');
    return this.data.users.find(u => {
      const uClean = u.phone.replace(/\D/g, '');
      return uClean === cleanPhone || 
        (cleanPhone.startsWith('62') && uClean === '0' + cleanPhone.slice(2)) ||
        (cleanPhone.startsWith('0') && uClean === '62' + cleanPhone.slice(1));
    });
  }

  findUserById(id: string): RegisteredUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  registerUser(userDto: {
    name: string;
    phone: string;
    password: string;
    role: 'customer' | 'merchant' | 'courier';
    address: string;
    district: string;
    email?: string;
    storeName?: string;
    storeCategory?: 'food' | 'groceries' | 'pharmacy';
    vehicleModel?: string;
    plateNumber?: string;
  }): { success: boolean; message: string; user?: RegisteredUser } {
    const existing = this.findUserByPhone(userDto.phone);
    if (existing) {
      return {
        success: false,
        message: `Nomor WhatsApp ${userDto.phone} sudah terdaftar di Arjawinangun Delivery. Silakan langsung login.`,
      };
    }

    const userId = `user-${Date.now()}`;
    let storeId: string | undefined;
    let courierId: string | undefined;

    if (userDto.role === 'merchant') {
      storeId = `store-${Date.now()}`;
      const newStore: Store = {
        id: storeId,
        name: userDto.storeName || `${userDto.name} Food`,
        ownerId: userId,
        category: userDto.storeCategory || 'food',
        categoryLabel: userDto.storeCategory === 'groceries' ? 'Belanja & Sembako' : userDto.storeCategory === 'pharmacy' ? 'Apotek & Obat' : 'Kuliner & Minuman',
        rating: 5.0,
        reviewCount: 0,
        address: userDto.address,
        district: userDto.district,
        distanceKm: 0.8,
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
      this.data.merchants.unshift(newStore);
    }

    if (userDto.role === 'courier') {
      courierId = `courier-${Date.now()}`;
      const newCourier: Courier = {
        id: courierId,
        userId,
        name: userDto.name,
        phone: userDto.phone,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        vehicleModel: userDto.vehicleModel || 'Honda Beat 2023',
        plateNumber: userDto.plateNumber || 'E 1234 XY',
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
        currentZone: userDto.district,
        walletBalance: 0,
        coords: { x: 45, y: 50 },
      };
      this.data.couriers.unshift(newCourier);
    }

    const newUser: RegisteredUser = {
      id: userId,
      name: userDto.name,
      phone: userDto.phone,
      email: userDto.email || `${userDto.phone}@arjawinangun.delivery`,
      password: userDto.password,
      role: userDto.role,
      avatar: userDto.role === 'merchant'
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
        : userDto.role === 'courier'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      address: userDto.address,
      district: userDto.district,
      balance: userDto.role === 'customer' ? 50000 : 0,
      loyaltyPoints: 100,
      referralCode: `${userDto.name.slice(0, 4).toUpperCase()}-DELIV`,
      referralsCount: 0,
      storeId,
      courierId,
      isRegistered: true,
    };

    this.data.users.push(newUser);
    this.saveDatabase(this.data);

    return {
      success: true,
      message: 'Pendaftaran berhasil! Akun Anda aktif di Arjawinangun Delivery.',
      user: newUser,
    };
  }

  // --- Reviews Methods ---
  getProductReviews(productId: string): ProductReview[] {
    return this.data.reviews.filter(r => r.productId === productId);
  }

  getStoreReviews(storeId: string): ProductReview[] {
    return this.data.reviews.filter(r => r.storeId === storeId);
  }

  addReview(reviewData: Omit<ProductReview, 'id' | 'createdAt' | 'helpfulCount'>): ProductReview {
    const newRev: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
    };

    this.data.reviews.unshift(newRev);

    const storeRevs = this.getStoreReviews(reviewData.storeId);
    if (storeRevs.length > 0) {
      const avg = storeRevs.reduce((acc, r) => acc + r.rating, 0) / storeRevs.length;
      const store = this.data.merchants.find(m => m.id === reviewData.storeId);
      if (store) {
        store.rating = Math.round(avg * 10) / 10;
        store.reviewCount = storeRevs.length;
      }
    }

    this.saveDatabase(this.data);
    return newRev;
  }

  // --- Orders & Synchronization Methods ---
  getAllOrders(): Order[] {
    return this.data.orders;
  }

  saveOrder(order: Order): Order {
    const existingIndex = this.data.orders.findIndex(o => o.id === order.id);
    if (existingIndex >= 0) {
      this.data.orders[existingIndex] = order;
    } else {
      this.data.orders.unshift(order);
    }

    if (order.status === 'delivered') {
      if (order.storeId && order.merchantNetEarnings > 0) {
        const store = this.data.merchants.find(m => m.id === order.storeId);
        if (store) {
          const owner = this.data.users.find(u => u.id === store.ownerId);
          if (owner) {
            owner.balance += order.merchantNetEarnings;
          }
        }
      }

      if (order.courierId && order.courierEarnings > 0) {
        const courier = this.data.couriers.find(c => c.id === order.courierId);
        if (courier) {
          courier.walletBalance += order.courierEarnings;
          courier.totalDeliveries += 1;
        }
      }
    }

    this.saveDatabase(this.data);
    return order;
  }

  getMerchants(): Store[] {
    return this.data.merchants;
  }

  getProducts(): Product[] {
    return this.data.products;
  }

  getCouriers(): Courier[] {
    return this.data.couriers;
  }

  getBanners(): BannerAd[] {
    return this.data.banners;
  }

  getPromos(): PromoCode[] {
    return this.data.promos;
  }

  getPPOBProducts(): PPOBProduct[] {
    return this.data.ppobProducts;
  }

  getWithdrawals(): WithdrawalRequest[] {
    return this.data.withdrawals;
  }

  getFraudAlerts(): FraudAlert[] {
    return this.data.fraudAlerts;
  }

  resetToInitial() {
    this.data = {
      users: INITIAL_REGISTERED_USERS,
      merchants: INITIAL_MERCHANTS,
      products: INITIAL_PRODUCTS,
      reviews: INITIAL_REVIEWS,
      couriers: INITIAL_COURIERS,
      orders: [],
      withdrawals: [],
      fraudAlerts: INITIAL_FRAUD_ALERTS,
      banners: INITIAL_BANNERS,
      promos: INITIAL_PROMOS,
      ppobProducts: INITIAL_PPOB_PRODUCTS,
    };
    this.saveDatabase(this.data);
  }
}

export const proDb = new ProDatabase();
