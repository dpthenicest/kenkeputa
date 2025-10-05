import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";

export const orderController = {
  createOrder: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Missing user ID" });
      }
      const { cartId } = req.body;
      const order = await orderService.createOrder(userId, cartId);
      res.status(201).json({ success: true, data: order });
    } catch (err) { next(err); }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(Number(orderId), status);
      res.json({ success: true, data: order });
    } catch (err) { next(err); }
  },

  getUserOrders: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Missing user ID" });
      }
      const orders = await orderService.getUserOrders(userId);
      res.json({ success: true, data: orders });
    } catch (err) { next(err); }
  },
};
