"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatContainer } from "@/components/chat/chat-container";
import { Composer } from "@/components/chat/composer";
import { SuggestionCards } from "@/components/chat/suggestion-cards";
import { useDemoChat } from "@/hooks/use-demo-chat";
import { useAutoDemo } from "@/hooks/use-auto-demo";
import { useTracking } from "@/hooks/use-tracking";
import type { TrackedItem } from "@/lib/mock-data";

export default function SearchPage() {
  const { messages, sendMessage, confirmSelection, confirmPriceInput, updatePreferences, isTyping, thinkingStage, setPriceInputValue } = useDemoChat();
  const { addItem } = useTracking();
  const [input, setInput] = useState("");

  useAutoDemo({
    sendMessage,
    updatePreferences,
    confirmSelection,
    confirmPriceInput,
    setPriceInputValue,
    setInput,
    isTyping,
    messages,
  });

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

