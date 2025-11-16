"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTrackingStore } from "@/lib/stores/tracking.store";
import { getClient } from "@/lib/adapters";

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState<"active" | "saved">("active");
  const [loading, setLoading] = useState(false);

  const { trackedItems, setTrackedItems } = useTrackingStore();
  const client = getClient();

  useEffect(() => {
    const loadTrackedItems = async () => {
      try {
        setLoading(true);
        const items = await client.listTrackedItems();
        setTrackedItems(items);
      } catch (error) {
        console.error("Failed to load tracked items:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrackedItems();
  }, [client, setTrackedItems]);

  const activeItems = trackedItems.filter((item) => item.status === "active");
  const savedItems = trackedItems.filter((item) => item.status === "saved");

  const displayItems = activeTab === "active" ? activeItems : savedItems;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Price Tracking</h1>
        <p className="text-gray-600">
          Monitor products you&apos;re interested in and track price changes over time
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-dark"
          }`}
        >
          Active Tracking ({activeItems.length})
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "saved"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-dark"
          }`}
        >
          Saved Products ({savedItems.length})
        </button>
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">⏳</div>
          <p className="text-gray-500 mt-2">Loading tracked items...</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">
            No {activeTab} items yet
          </p>
          <Link href="/search" className="btn btn-primary">
            Search for products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <Link
              key={item.id}
              href={`/tracking/${item.id}`}
              className="card p-6 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-2">{item.listing.title}</h3>

              {item.listing.seller && (
                <p className="text-sm text-gray-500 mb-3">Seller: {item.listing.seller}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold">
                    ${item.listing.price.toFixed(2)}
                  </span>
                </div>

                {item.listing.sellerRating && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller Rating:</span>
                    <span className="text-secondary">
                      {item.listing.sellerRating} / 5.0
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-accent capitalize">
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Added {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
