import { currencies } from './App';

export type CountryCode = keyof typeof currencies;

export interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
  stock: number;
  category: 'For Men' | 'For Women' | 'Unisex';
  mainAccords: string;
  availableSizes: string[];
}

export interface CartItem extends Product {
  quantity: number;
  size: string;
}

export interface User {
  email: string;
  password?: string;
  isAdmin?: boolean;
}

export enum OrderStatus {
  Packing = 'Packing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  PaymentVerification = 'Payment Verification'
}

export enum PaymentMethod {
    COD = 'Cash on Delivery',
    Online = 'Online'
}

export interface ShippingDetails {
    name: string;
    address: string;
    area: string;
    city: string;
    country: string;
    postalCode: string;
}

export interface Order {
  id: string;
  userEmail: string;
  items: Omit<CartItem, 'stock' | 'category' | 'mainAccords' | 'availableSizes'>[];
  total: number;
  status: OrderStatus;
  shippingDetails: ShippingDetails;
  paymentMethod: PaymentMethod;
  paymentTransactionId?: string;
  paymentScreenshot?: string; // base64 string
  createdAt: string;
}

export interface Review {
  id: string;
  productId: number;
  name: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}
