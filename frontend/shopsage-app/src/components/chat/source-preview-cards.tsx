"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { SourceItem } from "@/lib/mock-data";

interface SourcePreviewCardsProps {
  sources: SourceItem[];
  productName?: string;
}

/** Returns platform label and whether it's Reddit */
function parseSourceLabel(url: string): { label: string; isReddit: boolean } {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname.includes("reddit.com")) return { label: "Reddit", isReddit: true };
    const domain = hostname.split(".")[0];
    return {
      label: domain.charAt(0).toUpperCase() + domain.slice(1),
      isReddit: false,
    };
  } catch {
    return { label: "Source", isReddit: false };
  }
}

/** Convert ISO date string → compact relative time, e.g. "3mo ago", "2yr ago" */
function relativeTime(isoDate: string): string {
  try {
    const ms = Date.now() - new Date(isoDate).getTime();
    if (isNaN(ms)) return isoDate;
    const days = Math.floor(ms / 86_400_000);
    if (days < 1) return "today";
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}yr ago`;
  } catch {
    return isoDate;
  }
}

export function SourcePreviewCards({ sources, productName }: SourcePreviewCardsProps) {
  if (sources.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
        {sources.slice(0, 3).map((source, i) => {
          const { label, isReddit } = parseSourceLabel(source.url);
          // Evidence cards (those with an author) taper on both ends —
          // the quote comes from mid-text so front context is implied.
          // Regular source cards taper only at the bottom.
          const hasFrontTaper = Boolean(source.author);

          return (
            <motion.a
              key={i}
              href={source.url || undefined}
              target={source.url ? "_blank" : undefined}
              rel={source.url ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3, ease: "easeOut" }}
              className="group flex-shrink-0 w-[220px] rounded-[var(--radius-md)] bg-surface-card shadow-card p-3.5 flex flex-col gap-2 hover:shadow-float transition-shadow duration-200"
              style={{ cursor: source.url ? "pointer" : "default" }}
            >
              {/* Row 1: Platform label + external link icon */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wide ${
                    isReddit ? "text-orange-400" : "text-neutral-400"
                  }`}
                >
                  {label}
                </span>
                {source.url && (
                  <ExternalLink className="h-3 w-3 text-neutral-300 group-hover:text-neutral-500 transition-colors flex-shrink-0" />
                )}
              </div>

              {/* Row 2 (evidence cards): Author name + relative timestamp */}
              {source.author && (
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span className="text-[12px] font-semibold text-neutral-700 truncate">
                    {source.author}
                  </span>
                  {source.timestamp && (
                    <span className="text-[11px] text-neutral-400 flex-shrink-0">
                      {relativeTime(source.timestamp)}
                    </span>
                  )}
                </div>
              )}

              {/* Optional product name chip */}
              {productName && (
                <span className="inline-block w-fit max-w-full truncate rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700 leading-tight">
                  {productName}
                </span>
              )}

              {/* Post/page title — only shown on regular source cards (no author) */}
              {!source.author && source.title && (
                <p className="text-[12px] font-medium leading-snug text-neutral-700 line-clamp-2">
                  {source.title}
                </p>
              )}

              {/* Snippet / verbatim quote with tapers */}
              {source.snippet && (
                <div className="relative overflow-hidden" style={{ maxHeight: "80px" }}>
                  {/* Front taper: signals the quote starts mid-text */}
                  {hasFrontTaper && (
                    <div
                      className="absolute top-0 left-0 right-0 h-4 z-10 pointer-events-none"
                      style={{ background: "linear-gradient(to bottom, #ffffff, transparent)" }}
                    />
                  )}

                  <p className="text-[12px] leading-relaxed text-neutral-500 font-light">
                    {source.snippet}
                  </p>

                  {/* Back taper: always present when snippet exists */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                    style={{ background: "linear-gradient(to top, #ffffff, transparent)" }}
                  />
                </div>
              )}
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
