import prisma from "../lib/prisma";
import { Cart, CartItem, Product } from "@prisma/client";
import { AppError } from "../utils/appError";

export interface CartWithItems extends Cart {
  cartItems: (CartItem & { product: Product; subtotal?: number })[];
  total?: number;
}

export const cartService = {
  // ✅ Get or create user's cart
  async getUserCart(userId: number): Promise<CartWithItems> {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: { include: { product: true } } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { cartItems: { include: { product: true } } },
      });
    }

    // ✅ Compute subtotal for each item and total for cart
    let total = 0;
    const cartItems = cart.cartItems.map((item) => {
      const unitPrice = Number(item.product?.price || 0);
      const subtotal = unitPrice * item.quantity;
      total += subtotal;
      return { ...item, subtotal };
    });

    return {
      ...cart,
      cartItems,
      total,
    };
  },

  // ✅ Add or increment item in cart
  async addToCart(userId: number, productId: number, quantity: number) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError("Product not found", 404);

    const cart = await this.getUserCart(userId);

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      // Increment quantity if exists
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    }

    // Create new item if not in cart
    return prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  },

  // ✅ Update (decrease) cart item quantity or remove if reaches zero
  async updateCart(cartItemId: number, quantity: number) {
    const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!item) throw new AppError("Cart item not found", 404);

    const newQuantity = item.quantity - quantity;
    if (newQuantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return { message: "Item removed from cart" };
    }

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: newQuantity },
    });
  },

  // ✅ Remove cart item completely
  async removeFromCart(cartItemId: number) {
    const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!item) throw new AppError("Cart item not found", 404);

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return { message: "Item removed from cart" };
  },
};
