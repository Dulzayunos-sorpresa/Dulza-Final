
export interface Category {
  id: string;
  name: string;
  order: number;
}

export enum ProductCategory {
  // Full Catalog Categories
  CUSTOM_BOX = 'Personalizados',
  VALENTINE = 'San Valentín',
  
  // Standard Categories
  BREAKFAST = 'Desayunos Artesanales',
  CAKES_AND_SWEETS = 'Tortas y Picadas dulces',
  CORPORATE = 'Empresas',
  BOARD = 'Tablas y Picadas saladas',
  KIDS = 'Infantiles y Bebés',
  FOOTBALL = 'Equipos de Fútbol'
}

export interface ProductOptionValue {
  id: string;
  name: string;
  price?: number;
  stock?: number;
  category?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  type: 'select' | 'multi-select';
  values: ProductOptionValue[];
  maxSelections?: number;
  description?: string;
  isRequired?: boolean;
}

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  galleryImages?: string[];
  videoUrl?: string;
  tags?: string[];
  stock?: number;
  options?: ProductOption[];
  freeDelivery?: boolean;
}

export enum OrderStatus {
  NUEVO = 'Nuevo',
  PENDIENTE = 'Pendiente',
  PAGADO = 'Pagado',
  ENTREGADO = 'Entregado',
  CANCELADO = 'Cancelado'
}

export enum PaymentStatus {
  PENDING = 'Pendiente de pago',
  PAID = 'Pagado',
  REJECTED = 'Rechazado',
  REFUNDED = 'Reembolsado'
}

export enum PaymentMethod {
  TRANSFERENCIA_MP = 'Mercado Pago (Transferencia)',
  TARJETA_UALA = 'Ualá (Tarjeta)',
  EFECTIVO = 'Efectivo',
  PAGOS_INTERNACIONALES = 'Pagos Internacionales (PayPal o Western Union)'
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minPurchase?: number;
  isActive: boolean;
  expiryDate?: string;
}

export interface ShippingSettings {
  baseCost: number;
  pricePerKm: number;
  maxKmForAutoPayment: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryType?: 'DELIVERY' | 'PICKUP';
  deliveryDate: string;
  deliveryTime?: string;
  recipientName?: string;
  recipientPhone?: string;
  neighborhood?: string;
  reference?: string;
  isPrivateNeighborhood?: boolean;
  familyName?: string;
  blockLot?: string;
  houseNumber?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: CartItem[];
  total: number;
  shippingCost?: number;
  shippingZone?: string;
  distanceKm?: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
  externalPaymentId?: string;
  couponCode?: string;
  discountAmount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedOptions?: {
    optionId: string;
    values: string[];
  }[];
}