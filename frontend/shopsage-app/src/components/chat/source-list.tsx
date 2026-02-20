"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronDown } from "lucide-react";
import type { SourceGroup } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface SourceListProps {
  sourceGroups: SourceGroup[];
}

export function SourceList({ sourceGroups }: SourceListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCount = sourceGroups.reduce(
    (sum, group) => sum + group.sources.length,
    0
  );

  return (
    <div
      className="
        w-fit
        max-w-[90%]
        rounded-[var(--radius-md)]
        bg-surface-card
        shadow-card
        overflow-hidden
      "
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          flex
          w-full
          items-center
          gap-2
          px-4
          py-3
          text-sm
          font-medium
          text-neutral-800
          transition-colors
          duration-200
          hover:bg-neutral-50
        "
      >
        <span>Sources ({totalCount})</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              {sourceGroups.map((group, groupIndex) => (
                <div
                  key={group.label}
                  className={cn(groupIndex > 0 && "mt-3")}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    {group.label}
                  </span>
                  <ul className="mt-1.5 space-y-1.5">
                    {group.sources.map((source, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            flex
                            items-start
                            gap-2
                            rounded-lg
                            px-2
                            py-1.5
                            text-sm
                            text-neutral-600
                            transition-colors
                            duration-150
                            hover:bg-neutral-100
                            hover:text-neutral-800
                          "
                        >
                          <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-neutral-400" />
                          <span className="line-clamp-2 leading-snug">
                            {source.title}
                          </span>
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
