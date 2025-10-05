// src/validation/order.validation.ts
import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    cartId: z.number().int().positive("Cart ID is required"),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, "Invalid order ID"),
  }),
  body: z.object({
    status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
  }),
});
