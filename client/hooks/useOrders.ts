// hooks/useOrders.ts
import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { API_BASE_URL } from "../constants/api";

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: {
    id: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      id: number;
      name: string;
      price: number;
      image?: string;
    };
  }[];
}

export function useOrders() {
  const { user, token } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user || !token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

      setOrders(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (cartId: number) => {
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cartId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Order creation failed");
    fetchOrders();
    return data.data;
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(
      `${API_BASE_URL}/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");
    fetchOrders();
    return data.data;
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
  };
}
