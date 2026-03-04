"use client";

import { useAuth } from "@/hooks/use-auth";
import { useSavedProducts } from "@/hooks/use-saved-products";
import { LogOut, Trash2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { savedProducts, deleteProduct } = useSavedProducts();
  const router = useRouter();

  const handleProductClick = (productName: string) => {
    // Navigate to search and trigger a search for this product
    router.push(`/search?q=${encodeURIComponent(productName)}`);
  };

  return (
    <main className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-[90px] pt-[80px]">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-800">Settings</h1>
        <p className="mt-1 text-sm font-light text-neutral-500">
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-4">
        {/* Account Section */}
        <div className="rounded-[var(--radius-md)] bg-surface-card p-4 shadow-card">
          <h3 className="mb-3 font-medium text-neutral-800">Account</h3>
          {user ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  {user.display_name}
                </p>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Not signed in</p>
          )}
        </div>

        {/* Saved Products Section */}
        <div className="rounded-[var(--radius-md)] bg-surface-card p-4 shadow-card">
          <h3 className="mb-3 font-medium text-neutral-800">
            Saved Products
            {savedProducts.length > 0 && (
              <span className="ml-2 text-xs font-normal text-neutral-400">
                ({savedProducts.length})
              </span>
            )}
          </h3>

          {savedProducts.length === 0 ? (
            <p className="text-sm font-light text-neutral-500">
              No saved products yet. Bookmark products from search results to
              save them here.
            </p>
          ) : (
            <div className="space-y-2">
              {savedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3"
                >
                  {/* Thumbnail */}
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.product_name}
                      className="h-12 w-12 rounded-lg object-contain bg-neutral-50"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                      <Search className="h-5 w-5 text-neutral-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">
                      {product.product_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {product.cheapest_price != null && (
                        <span className="text-xs font-semibold text-primary-600">
                          ${product.cheapest_price.toFixed(2)}
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-400">
                        {timeAgo(product.last_searched_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleProductClick(product.product_name)}
                      className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-primary-50 hover:text-primary-500"
                      title="Search again"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* About */}
        <div className="rounded-[var(--radius-md)] bg-surface-card p-4 shadow-card">
          <h3 className="font-medium text-neutral-800">About</h3>
          <p className="mt-1 text-sm font-light text-neutral-500">
            ShopSage v1.0.0
          </p>
        </div>
      </div>
    </main>
  );
}
