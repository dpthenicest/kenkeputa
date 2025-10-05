import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.number().int().positive("Product ID must be positive"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
  }),
});

export const updateCartSchema = z.object({
  params: z.object({
    cartItemId: z.string().regex(/^\d+$/, "Invalid cart item ID"),
  }),
  body: z.object({
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
  }),
});

export const removeFromCartSchema = z.object({
  params: z.object({
    cartItemId: z.string().regex(/^\d+$/, "Invalid cart item ID"),
  }),
});
