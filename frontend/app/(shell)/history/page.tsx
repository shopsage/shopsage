"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getClient } from "@/lib/adapters";
import type { Conversation } from "@/lib/types";

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "product" | "supplier">("all");

  const client = getClient();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const convs = await client.listConversations();
        setConversations(
          convs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        );
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [client]);

  const filteredConversations =
    filter === "all"
      ? conversations
      : conversations.filter((conv) => conv.agent === filter);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Research History</h1>
        <p className="text-gray-600">
          Your past product and supplier research conversations
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded transition-colors ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-gray-200 text-dark hover:bg-gray-300"
          }`}
        >
          All ({conversations.length})
        </button>
        <button
          onClick={() => setFilter("product")}
          className={`px-4 py-2 rounded transition-colors ${
            filter === "product"
              ? "bg-primary text-white"
              : "bg-gray-200 text-dark hover:bg-gray-300"
          }`}
        >
          Product (
          {conversations.filter((c) => c.agent === "product").length})
        </button>
        <button
          onClick={() => setFilter("supplier")}
          className={`px-4 py-2 rounded transition-colors ${
            filter === "supplier"
              ? "bg-primary text-white"
              : "bg-gray-200 text-dark hover:bg-gray-300"
          }`}
        >
          Supplier (
          {conversations.filter((c) => c.agent === "supplier").length})
        </button>
      </div>

      {/* Conversations list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">⏳</div>
          <p className="text-gray-500 mt-2">Loading conversations...</p>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">No conversations yet</p>
          <Link href="/search" className="btn btn-primary">
            Start researching
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Link href="/search">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {conv.messages.length > 0
                        ? conv.messages[0].content.substring(0, 60) + (conv.messages[0].content.length > 60 ? "..." : "")
                        : "Conversation"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {conv.agent === "product" ? "🔍 Product Research" : "🛒 Supplier Research"}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{conv.messages.length} messages</span>
                      <span>
                        {new Date(conv.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: conv.updatedAt.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl">→</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
