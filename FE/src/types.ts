export interface Product {
  id: string;
  name: string;
  sku: string; // Must be unique
  price: number;
  quantity: number; // Must be >= 0
}

export interface Customer {
  id: string;
  name: string;
  email: string; // Must be unique
  phone: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  status: 'Completed' | 'Cancelled';
}

export interface SystemStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  lowStockCount: number;
  revenue: number;
}
