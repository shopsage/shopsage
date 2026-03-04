"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatContainer } from "@/components/chat/chat-container";
import { Composer } from "@/components/chat/composer";
import { SuggestionCards } from "@/components/chat/suggestion-cards";
import { useChat } from "@/hooks/use-chat";
import { useTracking } from "@/hooks/use-tracking";
import type { TrackedItem } from "@/lib/mock-data";

export default function SearchPage() {
  const { messages, sendMessage, confirmSelection, confirmPriceInput, updatePreferences, isTyping, thinkingStage } = useChat();
  const { addItem } = useTracking();
  const [input, setInput] = useState("");

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

  return (
    <>
      {/* Chat Messages */}
      <ChatContainer
        messages={messages}
        isTyping={isTyping}
        thinkingStage={thinkingStage}
        onPreferenceChange={updatePreferences}
        onConfirmSelection={confirmSelection}
        onPriceConfirm={confirmPriceInput}
        onTrackProduct={handleTrackProduct}
        onProductSearch={sendMessage}
      />

      {/* Suggestion Cards - Only show when no messages */}
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

      {/* Composer */}
      <Composer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        placeholder={messages.length === 0 ? "Chat with ShopSage" : "Ask follow-up..."}
      />
    </>
  );
}

