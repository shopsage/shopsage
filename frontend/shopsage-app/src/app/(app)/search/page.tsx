"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatContainer } from "@/components/chat/chat-container";
import { Composer } from "@/components/chat/composer";
import { SuggestionCards } from "@/components/chat/suggestion-cards";
import { ChatListView } from "@/components/chat/chat-list";
import { useChat } from "@/hooks/use-chat";
import { useTracking } from "@/hooks/use-tracking";
import type { TrackedItem, Product } from "@/lib/mock-data";

export default function SearchPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const {
    messages,
    sendMessage,
    confirmSelection,
    confirmPriceInput,
    updatePreferences,
    isTyping,
    thinkingStage,
    reset,
    loadChat,
    isLoadedChat,
  } = useChat();
  const { trackedItems, addItem, removeItem } = useTracking();
  const [input, setInput] = useState("");

  // On mount: if tracking page queued a search, open new chat and send it.
  // Uses sessionStorage so the query survives navigation.
  // sendMessage is captured at mount when messages=[] and chatId=null — exactly
  // right for a brand-new chat.
  useEffect(() => {
    const q = sessionStorage.getItem("shopsage:pending-search");
    if (q) {
      sessionStorage.removeItem("shopsage:pending-search");
      setActiveChatId("new");
      // Small delay lets the chat view mount before we add a message
      setTimeout(() => sendMessage(q), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hamburger dispatches this to go back to chat list
  useEffect(() => {
    const handler = () => {
      reset();
      setActiveChatId(null);
    };
    window.addEventListener("shopsage:back-to-list", handler);
    return () => window.removeEventListener("shopsage:back-to-list", handler);
  }, [reset]);

  useEffect(() => {
    if (activeChatId && activeChatId !== "new") {
      loadChat(activeChatId);
    }
    if (activeChatId === "new") {
      reset();
    }
  }, [activeChatId, loadChat, reset]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleTrackProduct = (product: TrackedItem) => {
    addItem(product);
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    sendMessage(text);
  };

  // Check tracking state by product query name (case-insensitive)
  const isProductTracked = (name: string) =>
    trackedItems.some((i) => i.title.toLowerCase() === name.toLowerCase());

  // Toggle: if tracked → remove, if not → add cheapest listing as TrackedItem
  const handleToggleTrack = (query: string, products: Product[]) => {
    const existing = trackedItems.find(
      (i) => i.title.toLowerCase() === query.toLowerCase()
    );
    if (existing) {
      removeItem(existing.id);
    } else {
      const cheapest = products.reduce((a, b) => (a.price < b.price ? a : b));
      addItem({
        id: cheapest.id || `track-${Date.now()}`,
        title: query,
        price: cheapest.price,
        currentPrice: cheapest.price,
        targetPrice: cheapest.price,
        rating: cheapest.rating,
        reviewCount: cheapest.reviewCount,
        platform: cheapest.platform,
        image: cheapest.image,
        url: cheapest.url,
      });
    }
  };

  if (activeChatId === null) {
    return (
      <ChatListView
        onOpenChat={(id) => setActiveChatId(id)}
        onNewChat={() => setActiveChatId("new")}
      />
    );
  }

  return (
    <>
      <ChatContainer
        messages={messages}
        isTyping={isTyping}
        thinkingStage={thinkingStage}
        onPreferenceChange={updatePreferences}
        onConfirmSelection={confirmSelection}
        onPriceConfirm={confirmPriceInput}
        onTrackProduct={handleTrackProduct}
        onProductSearch={sendMessage}
        onSaveProduct={handleToggleTrack}
        isProductSaved={isProductTracked}
        isLoadedChat={isLoadedChat}
      />

      <AnimatePresence>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-[160px] left-0 right-0 z-30"
          >
            <SuggestionCards onSuggestionClick={handleSuggestionClick} />
          </motion.div>
        )}
      </AnimatePresence>

      <Composer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        placeholder={messages.length === 0 ? "Chat with ShopSage" : "Ask follow-up..."}
      />
    </>
  );
}
