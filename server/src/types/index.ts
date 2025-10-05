import { Role } from "@prisma/client"; // ✅ remove OrderStatus import

// ========== USER ==========
export interface IUser {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// Used for signup/login DTOs (input validation)
export interface IUserCreate {
  fullName: string;
  email: string;
  password: string;
}

// ========== PRODUCT ==========
export interface IProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductCreate {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
}

// ========== CART ==========
export interface ICart {
  id: number;
  userId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product?: IProduct; // populated when joining tables
}

// ========== ORDER ==========
export const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface IOrder {
  id: number;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: IOrderItem[];
}

export interface IOrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
  product?: IProduct;
}

// ========== AUTH ==========
export interface IAuthPayload {
  id: number;
  email: string;
  role: Role;
}

// JWT Response
export interface IAuthResponse {
  token: string;
  user: Pick<IUser, "id" | "fullName" | "email" | "role">;
}
