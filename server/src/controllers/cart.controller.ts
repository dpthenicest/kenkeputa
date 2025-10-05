import { Request, Response, NextFunction } from "express";
import { cartService } from "../services/cart.service";

export const cartController = {
  // ✅ Get all items in user's cart
  getUserCart: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Missing user ID" });
      }
      const cart = await cartService.getUserCart(userId);
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  },

  // ✅ Add or increment cart item
  addToCart: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Missing user ID" });
      }
      const { productId, quantity } = req.body;
      const item = await cartService.addToCart(userId, productId, quantity);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },

  // ✅ Update quantity (reduce number of items or remove if zero)
  updateCart: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cartItemId } = req.params;
      const { quantity } = req.body;
      const result = await cartService.updateCart(Number(cartItemId), quantity);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  // ✅ Remove cart item completely
  removeFromCart: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cartItemId } = req.params;
      const result = await cartService.removeFromCart(Number(cartItemId));
      res.json({ success: true, message: result.message });
    } catch (err) {
      next(err);
    }
  },
};
