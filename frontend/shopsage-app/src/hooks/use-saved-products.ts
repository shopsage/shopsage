"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export interface SavedProductItem {
  id: string;
  product_name: string;
  cheapest_price: number | null;
  image: string | null;
  last_searched_at: string;
  created_at: string;
}

export function useSavedProducts() {
  const { user } = useAuth();
  const [savedProducts, setSavedProducts] = useState<SavedProductItem[]>([]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiFetch("/api/saved-products");
      if (res.ok) {
        setSavedProducts(await res.json());
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const saveProduct = useCallback(
    async (name: string, price?: number, image?: string) => {
      try {
        await apiFetch("/api/saved-products", {
          method: "POST",
          body: JSON.stringify({
            product_name: name,
            cheapest_price: price ?? null,
            image: image ?? null,
          }),
        });
        await fetchProducts();
      } catch {
        // ignore
      }
    },
    [fetchProducts]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        await apiFetch(`/api/saved-products/${id}`, { method: "DELETE" });
        setSavedProducts((prev) => prev.filter((p) => p.id !== id));
      } catch {
        // ignore
      }
    },
    []
  );

  const isProductSaved = useCallback(
    (name: string) => {
      return savedProducts.some(
        (p) => p.product_name.toLowerCase() === name.toLowerCase()
      );
    },
    [savedProducts]
  );

  return { savedProducts, saveProduct, deleteProduct, isProductSaved, refresh: fetchProducts };
}
