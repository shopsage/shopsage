"use client";

import { useState, useCallback, useEffect } from "react";
import { mockTrackedItems, TrackedItem } from "@/lib/mock-data";

interface UseTrackingReturn {
  trackedItems: TrackedItem[];
  addItem: (item: TrackedItem) => void;
  removeItem: (id: string) => void;
  updateTargetPrice: (id: string, targetPrice: number) => void;
}

const STORAGE_KEY = "shopsage-tracked-items";

export function useTracking(): UseTrackingReturn {
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTrackedItems(JSON.parse(stored));
      } else {
        // Use mock data if nothing stored
        setTrackedItems(mockTrackedItems);
      }
    } catch {
      setTrackedItems(mockTrackedItems);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackedItems));
    }
  }, [trackedItems, isInitialized]);

  const addItem = useCallback((item: TrackedItem) => {
    setTrackedItems((prev) => {
      // Don't add duplicates
      if (prev.find((i) => i.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setTrackedItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateTargetPrice = useCallback((id: string, targetPrice: number) => {
    setTrackedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, targetPrice } : item
      )
    );
  }, []);

  return {
    trackedItems,
    addItem,
    removeItem,
    updateTargetPrice,
  };
}

