"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTrackingStore } from "@/lib/stores/tracking.store";
import { getClient } from "@/lib/adapters";
import type { TrackedItem, PricePoint } from "@/lib/types";

export default function TrackingDetailPage() {
  const params = useParams();
  const itemId = params.id as string;

  const [item, setItem] = useState<TrackedItem | null>(null);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const trackedItems = useTrackingStore((state) => state.trackedItems);
  const client = getClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get item from store or fetch
        let currentItem = trackedItems.find((i) => i.id === itemId);
        if (!currentItem) {
          // Fallback: fetch all items
          const allItems = await client.listTrackedItems();
          currentItem = allItems.find((i) => i.id === itemId);
        }

        if (!currentItem) {
          throw new Error("Item not found");
        }

        setItem(currentItem);

        // Get price history
        const priceHistory = await client.getPrices(itemId, "90d");
        setPrices(priceHistory);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load data";
        setError(message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [itemId, client, trackedItems]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin">⏳</div>
        <p className="text-gray-500 mt-2">Loading price data...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-semibold">Error</p>
        <p className="text-red-500 text-sm">{error || "Item not found"}</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = prices
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((point) => ({
      timestamp: new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: point.price,
      date: point.date,
    }));

  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const priceChange = currentPrice - (chartData.length > 0 ? chartData[0].price : currentPrice);
  const priceChangePercent = chartData.length > 0 ? ((priceChange / chartData[0].price) * 100).toFixed(1) : "0.0";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{item.listing.title}</h1>
        {item.listing.description && <p className="text-gray-600">{item.listing.description}</p>}
      </div>

      {/* Price summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Current Price</p>
          <p className="text-2xl font-bold text-primary">${currentPrice.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Lowest (90d)</p>
          <p className="text-2xl font-bold text-secondary">${minPrice.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Highest (90d)</p>
          <p className="text-2xl font-bold text-accent">${maxPrice.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Change (90d)</p>
          <p
            className={`text-2xl font-bold ${
              parseFloat(priceChangePercent) < 0 ? "text-secondary" : "text-red-600"
            }`}
          >
            {parseFloat(priceChangePercent) > 0 ? "+" : ""}
            {priceChangePercent}%
          </p>
        </div>
      </div>

      {/* Price chart */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Price Trend (Last 90 Days)</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timestamp"
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                interval={Math.floor(chartData.length / 10) || 0}
              />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                dot={false}
                isAnimationActive={false}
                name="Price"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No price data available</p>
        )}
      </div>

      {/* Listing info section */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Product Information</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Seller:</span>
            <span className="font-medium">{item.listing.seller}</span>
          </div>
          {item.listing.sellerRating && (
            <div className="flex justify-between">
              <span className="text-gray-600">Seller Rating:</span>
              <span className="font-medium">{item.listing.sellerRating} / 5.0</span>
            </div>
          )}
          {item.listing.url && (
            <div className="flex justify-between">
              <span className="text-gray-600">Link:</span>
              <a href={item.listing.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                View on site
              </a>
            </div>
          )}
        </div>
      </div>

      {/* TODO: Alerts section */}
      <div className="mt-8 text-gray-500 text-sm p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p>⏳ Price alert notifications coming soon</p>
      </div>
    </div>
  );
}
