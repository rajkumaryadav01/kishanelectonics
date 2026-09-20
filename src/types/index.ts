export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  houseShopNo: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  productCount?: number;
  active: boolean;
}

export interface ProductSpecification {
  [key: string]: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  modelNumber?: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  description: string;
  features: string[];
  applications: string[];
  specifications: ProductSpecification;
  images: string[];
  datasheetUrl?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  questions?: ProductQuestion[];
  relatedProducts?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectKitItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface ProjectKit {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
  components: ProjectKitItem[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  stockQuantity: number;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  stockQuantity: number;
  isKit?: boolean;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  total: number;
  currency: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Pickup / Shipped'
  | 'Delivered / Collected'
  | 'Cancelled';

export type OrderType = 'Pickup' | 'Delivery';
export type PaymentMethod = 'Cash on Pickup' | 'Pay on Delivery' | 'UPI / Online';

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  orderType: OrderType;
  pickupLocation?: string;
  deliveryAddress?: {
    houseShopNo: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: 'Pending' | 'Paid';
  orderStatus: OrderStatus;
  timeline: OrderTimeline[];
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  openingHours: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  pickupNotice: string;
  currency: string;
  currencyCode: string;
  taxPercent: number;
  lowStockThreshold: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'enquiry' | 'system';
  read: boolean;
  linkUrl?: string;
  createdAt: string;
}
