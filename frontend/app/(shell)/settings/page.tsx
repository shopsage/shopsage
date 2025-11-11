"use client";

import { useState } from "react";
import { useUserStore } from "@/lib/stores/user.store";

export default function SettingsPage() {
  const user = useUserStore((state) => state.user);
  const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || "mock";
  const [copied, setCopied] = useState(false);

  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your ShopSage preferences</p>
      </div>

      {/* User ID section */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Identity</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={user?.id || ""}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={handleCopyUserId}
                className="btn btn-outline btn-small"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This UUID identifies you locally. Share it to recover your data, or log in with real
              auth later.
            </p>
          </div>
        </div>
      </div>

      {/* Data Source section */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Data Source</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Mode
            </label>
            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-mono text-sm">
                NEXT_PUBLIC_DATA_SOURCE = <strong>{dataSource}</strong>
              </p>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {dataSource === "mock"
                ? "Using mock data (in-memory + localStorage). Perfect for testing the UI without a backend."
                : "Connected to HTTP backend. Make sure the FastAPI server is running at http://localhost:8000"}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Flags / Coming Soon */}
      <div className="card p-6 mb-6 opacity-50 pointer-events-none">
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              disabled
              defaultChecked
              id="notifications"
              className="w-4 h-4"
            />
            <label htmlFor="notifications" className="text-sm text-gray-600">
              Email notifications for price drops
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              disabled
              defaultChecked
              id="theme"
              className="w-4 h-4"
            />
            <label htmlFor="theme" className="text-sm text-gray-600">
              Dark mode
            </label>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">Coming soon...</p>
      </div>

      {/* Developer Info */}
      <div className="card p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Developer Info</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            📦 <strong>Frontend:</strong> Next.js 15 + TypeScript + Tailwind CSS
          </p>
          <p>
            🔌 <strong>Adapter Pattern:</strong> UI is fully decoupled from backend via{" "}
            <code className="bg-gray-200 px-2 py-1 rounded text-xs">ShopSageClient</code>
          </p>
          <p>
            💾 <strong>State Management:</strong> Zustand (lightweight stores) + React Query
          </p>
          <p>
            📱 <strong>UI Library:</strong> Tailwind CSS + shadcn/ui components
          </p>
          <p>
            🎨 <strong>Design System:</strong> Color scheme follows Colour_Scheme.png
          </p>
          <p className="text-xs text-gray-500 pt-4 border-t">
            For development docs, see <code className="bg-gray-200 px-2 py-1 rounded">/frontend/DEV.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}
