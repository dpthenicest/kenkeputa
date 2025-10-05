import prisma from "../lib/prisma";
import { AppError } from "../utils/appError";
import { OrderStatus } from "@prisma/client";

export const orderService = {
  async createOrder(userId: number, cartId: number) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { cartItems: { include: { product: true } } },
    });

    if (!cart || cart.userId !== userId)
      throw new AppError("Invalid or unauthorized cart", 403);

    if (cart.cartItems.length === 0)
      throw new AppError("Cart is empty", 400);

    // ✅ Check stock availability for each item
    for (const item of cart.cartItems) {
      if (!item.product)
        throw new AppError(`Product not found for cart item ID ${item.id}`, 404);

      if (item.quantity > item.product.stockQuantity) {
        throw new AppError(
          `Insufficient stock for product "${item.product.name}". Only ${item.product.stockQuantity} left.`,
          400
        );
      }
    }

    // ✅ Calculate total
    const totalAmount = cart.cartItems.reduce(
      (acc, item) => acc + Number(item.product.price) * item.quantity,
      0
    );

    // ✅ Use transaction to ensure atomic operation
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: OrderStatus.PAID,
          orderItems: {
            create: cart.cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              subtotal: Number(item.product.price) * item.quantity,
            })),
          },
        },
        include: { orderItems: true },
      });

      // ✅ Reduce stock for each ordered product
      for (const item of cart.cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }

      // ✅ Clear cart after order creation
      await tx.cartItem.deleteMany({ where: { cartId } });

      return createdOrder;
    });

    return order;
  },

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError("Order not found", 404);

    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  },

  async getUserOrders(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
};
