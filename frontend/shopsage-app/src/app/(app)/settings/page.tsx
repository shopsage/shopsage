"use client";

import { useAuth, DEFAULT_PREFERENCES, type UserPreferences } from "@/hooks/use-auth";
import { useSavedProducts } from "@/hooks/use-saved-products";
import { LogOut, Trash2, Search, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";

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

const SLIDER_CONFIG: { key: keyof UserPreferences; label: string; description: string }[] = [
  { key: "price", label: "Price", description: "How much cheaper prices matter to you" },
  { key: "rating", label: "Rating", description: "How much product ratings influence results" },
  { key: "reputation", label: "Store Reputation", description: "Preference for well-known, trusted stores" },
  { key: "review_count", label: "Review Count", description: "Preference for products with more reviews" },
];

function PreferenceSlider({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = (value / 10) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        <span className="min-w-[2ch] text-right text-xs font-semibold text-primary-600">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="preference-slider w-full"
        style={{ "--slider-pct": `${pct}%` } as React.CSSProperties}
      />
      <p className="text-[11px] text-neutral-400">{description}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout, updatePreferences } = useAuth();
  const { savedProducts, deleteProduct } = useSavedProducts();
  const router = useRouter();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when user loads
  useEffect(() => {
    if (user?.preferences) {
      setLocalPrefs({ ...DEFAULT_PREFERENCES, ...user.preferences });
    }
  }, [user?.preferences]);

  const handleSliderChange = useCallback(
    (key: keyof UserPreferences, value: number) => {
      setLocalPrefs((prev) => {
        const next = { ...prev, [key]: value };
        // Debounce the API save
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
          setSaving(true);
          try {
            await updatePreferences(next);
          } catch {
            // silently fail — local state is still updated
          } finally {
            setSaving(false);
          }
        }, 500);
        return next;
      });
    },
    [updatePreferences]
  );

  const handleProductClick = (productName: string) => {
    router.push(`/search?q=${encodeURIComponent(productName)}`);
  };

  return (
    <main className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-[70px] pt-[80px]">
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

        {/* Shopping Preferences Section */}
        {user && (
          <div className="rounded-[var(--radius-md)] bg-surface-card shadow-card">
            <button
              onClick={() => setPrefsOpen((v) => !v)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
                <h3 className="font-medium text-neutral-800">Shopping Preferences</h3>
                {saving && (
                  <span className="text-[11px] text-primary-500">Saving…</span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                  prefsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {prefsOpen && (
              <div className="space-y-5 border-t border-neutral-100 px-4 pb-5 pt-4">
                <p className="text-xs text-neutral-500">
                  Adjust how search results are ranked. Higher values mean that
                  factor matters more to you.
                </p>
                {SLIDER_CONFIG.map(({ key, label, description }) => (
                  <PreferenceSlider
                    key={key}
                    label={label}
                    description={description}
                    value={localPrefs[key]}
                    onChange={(v) => handleSliderChange(key, v)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

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
