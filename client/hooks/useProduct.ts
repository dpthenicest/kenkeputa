import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../constants/api";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

const API_BASE = `${API_BASE_URL}/products`;

export const useProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchProducts = useCallback(async (query?: ProductQuery) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query?.search) params.append("search", query.search);
      if (query?.minPrice !== undefined)
        params.append("minPrice", query.minPrice.toString());
      if (query?.maxPrice !== undefined)
        params.append("maxPrice", query.maxPrice.toString());
      if (query?.page) params.append("page", query.page.toString());
      if (query?.limit) params.append("limit", query.limit.toString());

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load products");

      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Product not found");

      return data.data;
    } catch (err: any) {
      setError(err.message || "Product not found");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(
    async (data: Partial<Product>, token: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json.message || "Failed to create product");

        setProducts((prev) => [json.data, ...prev]);
        return json.data;
      } catch (err: any) {
        setError(err.message || "Failed to create product");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateProduct = useCallback(
    async (id: number, data: Partial<Product>, token: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json.message || "Failed to update product");

        setProducts((prev) =>
          prev.map((p) => (p.id === id ? json.data : p))
        );
        return json.data;
      } catch (err: any) {
        setError(err.message || "Failed to update product");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteProduct = useCallback(async (id: number, token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to delete product");

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
