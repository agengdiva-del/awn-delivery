export type UserRole = 'customer' | 'merchant' | 'courier' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar: string;
  address: string;
  district: string;
  balance: number;
  loyaltyPoints: number;
  referralCode: string;
  referralsCount: number;
}

export interface RegisteredUser extends UserProfile {
  password: string;
  storeId?: string;
  courierId?: string;
  isRegistered: boolean;
}

export type StoreCategory = 'food' | 'groceries' | 'mart' | 'pharmacy' | 'goods';

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  category: StoreCategory;
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  address: string;
  district: string;
  distanceKm: number;
  banner: string;
  logo: string;
  isFeatured: boolean;
  isPremium: boolean;
  status: 'active' | 'suspended';
  minOrder: number;
  estimatedDeliveryMin: string;
  openingHours: string;
  isOpen: boolean;
  verified: boolean;
  totalSalesCount: number;
  tags: string[];
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isBestSeller?: boolean;
  options?: string[];
  rating?: number;
  reviewsCount?: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  storeId: string;
  orderId?: string;
  userName: string;
  userPhone: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount: number;
  verifiedOrder: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'merchant_preparing'
  | 'looking_courier'
  | 'courier_assigned'
  | 'courier_heading_to_store'
  | 'courier_arrived_at_store'
  | 'on_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'qris' | 'cod' | 'gopay' | 'ovo' | 'dana' | 'shopeepay' | 'va';

export interface Order {
  id: string;
  orderNumber: string;
  type: 'food' | 'groceries' | 'package' | 'ppob';
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerDistrict: string;
  customerCoords: { x: number; y: number }; // Simulated coordinate percentage (0-100)
  
  // Store info (if food/goods)
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  storeCoords?: { x: number; y: number };
  
  // Courier info
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  courierVehicle?: string;
  courierRating?: number;
  courierCoords?: { x: number; y: number };
  
  items: OrderItem[];
  
  // Package delivery details
  packageDetails?: {
    itemName: string;
    recipientName: string;
    recipientPhone: string;
    weightKg: number;
    notes?: string;
    pickupAddress: string;
    dropoffAddress: string;
  };

  // PPOB details
  ppobDetails?: {
    serviceType: string;
    targetNumber: string;
    operator: string;
    nominal: string;
  };

  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number; // small platform fee (e.g. Rp 1.000)
  discount: number;
  total: number;
  
  // Automated Commission Splits
  platformCommissionMerchant: number; // 10% of subtotal
  platformDeliveryFeeShare: number;   // e.g. Rp 2.000 from delivery fee
  courierEarnings: number;            // deliveryFee - platformDeliveryFeeShare
  merchantNetEarnings: number;        // subtotal - platformCommissionMerchant
  
  paymentMethod: PaymentMethod;
  paymentStatus: 'unpaid' | 'paid';
  createdAt: string;
  estimatedMinutes: number;
  
  // Auto-Dispatch Simulation State
  dispatchAttempt: number;
  assignedCourierTimeout?: number; // 30-sec response timer timestamp
  rejectedCourierIds?: string[];
  
  notes?: string;
  rating?: number;
  reviewText?: string;
}

export interface Courier {
  id: string;
  userId: string;
  name: string;
  phone: string;
  photo: string;
  vehicleModel: string;
  plateNumber: string;
  rating: number;
  totalDeliveries: number;
  isOnline: boolean;
  isPriority: boolean; // Priority courier program subscriber
  verificationStatus: 'pending' | 'approved' | 'rejected';
  documents: {
    ktp: string;
    sim: string;
    stnk: string;
    selfie: string;
  };
  currentZone: string;
  walletBalance: number;
  coords: { x: number; y: number };
  activeOrderId?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: 'merchant' | 'courier';
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface FraudAlert {
  id: string;
  orderId?: string;
  targetId: string;
  targetType: 'customer' | 'courier' | 'merchant';
  targetName: string;
  type: 'fake_order' | 'duplicate_account' | 'courier_abuse' | 'suspicious_velocity' | 'gps_spoofing';
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'pending' | 'investigated' | 'resolved';
  timestamp: string;
  suggestedAction: string;
}

export interface BannerAd {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  linkAction?: string;
  merchantId?: string;
  isSponsored: boolean;
  costPerDay?: number;
}

export interface PromoCode {
  id: string;
  code: string;
  title: string;
  discountPercent: number;
  maxDiscount: number;
  minSpend: number;
  description: string;
  expiryDate: string;
}

export interface PPOBProduct {
  id: string;
  category: 'pulsa' | 'data' | 'pln' | 'bpjs' | 'ewallet' | 'pdam';
  name: string;
  provider: string;
  nominal: number;
  price: number;
  adminFee: number;
}
