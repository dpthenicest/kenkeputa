import { useState, useCallback, useEffect } from "react";
import { API_BASE_URL } from "../constants/api";


export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
  subtotal: number;
}

export interface Cart {
  id: number;
  userId: number;
  cartItems: CartItem[];
  total: number;
}

const API_BASE = `${API_BASE_URL}/cart`;

export const useCart = (token?: string | null) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load cart");
      setCart(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to add to cart");
        await fetchCart();
      } catch (err: any) {
        setError(err.message || "Failed to add to cart");
      } finally {
        setLoading(false);
      }
    },
    [token, fetchCart]
  );

  const updateCart = useCallback(
    async (cartItemId: number, quantity: number) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/update/${cartItemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to update cart item");
        await fetchCart();
      } catch (err: any) {
        setError(err.message || "Failed to update cart");
      } finally {
        setLoading(false);
      }
    },
    [token, fetchCart]
  );

  const removeFromCart = useCallback(
    async (cartItemId: number) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/remove/${cartItemId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to remove cart item");
        await fetchCart();
      } catch (err: any) {
        setError(err.message || "Failed to remove from cart");
      } finally {
        setLoading(false);
      }
    },
    [token, fetchCart]
  );

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCart,
    removeFromCart,
  };
};
