"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ChatSummary {
  id: string;
  title: string;
  preview: string;
  updated_at: string;
}

interface ChatListViewProps {
  onOpenChat: (chatId: string) => void;
  onNewChat: () => void;
}

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

export function ChatListView({ onOpenChat, onNewChat }: ChatListViewProps) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const res = await apiFetch("/api/chats");
      if (res.ok) {
        setChats(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      await apiFetch(`/api/chats/${chatId}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch {
      // ignore
    }
  };

  return (
    <main className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-[70px] pt-[120px]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-800">Chats</h1>
          <p className="mt-0.5 text-sm font-light text-neutral-500">
            Your conversation history
          </p>
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500" />
        </div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-neutral-300" />
          <p className="text-sm text-neutral-500">No chats yet</p>
          <p className="mt-1 text-xs text-neutral-400">Start a new conversation</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {chats.map((chat) => (
              <motion.button
                key={chat.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                onClick={() => onOpenChat(chat.id)}
                className="group flex w-full items-start gap-3 rounded-[var(--radius-md)] bg-surface-card p-4 text-left shadow-card transition-all hover:shadow-md active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-800">
                    {chat.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-light text-neutral-500">
                    {chat.preview || "Empty chat"}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                  <span className="text-[11px] text-neutral-400">
                    {timeAgo(chat.updated_at)}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="rounded-md p-1 text-neutral-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
