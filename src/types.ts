export type UserRole = 'customer' | 'owner' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  address?: string;
  phone?: string;
}

export interface Supermarket {
  id: string;
  name: string;
  address: string;
  phone?: string;
  logoUrl?: string;
  description?: string;
  ownerId: string;
}

export interface Product {
  id: string;
  supermarketId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  stock?: number;
}

export interface Offer {
  id: string;
  supermarketId: string;
  productId: string;
  discountedPrice: number;
  type: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  supermarketId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryType: 'pickup' | 'home_delivery';
  address?: string;
  createdAt: any; // Firestore Timestamp
}
