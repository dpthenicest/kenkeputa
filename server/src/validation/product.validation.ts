// src/validation/product.validation.ts
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  stockQuantity: z.number().int().min(0, "Stock must be non-negative"),
  imageUrl: z.string().url("Must be a valid image URL").optional(),
})

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    stockQuantity: z.number().int().min(0).optional(),
    imageUrl: z.string().url().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid product ID"),
  }),
});
