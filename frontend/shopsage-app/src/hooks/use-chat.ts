"use client";

import { useState, useCallback } from "react";
import type { DemoMessage, MessageContent, PreferenceGroup } from "@/lib/mock-data";

type ThinkingStage =
  | "researching"
  | "analyzing"
  | "finding-prices"
  | "comparing"
  | "general";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UseChatReturn {
  messages: DemoMessage[];
  sendMessage: (text: string) => void;
  confirmSelection: () => void;
  confirmPriceInput: (price: number) => void;
  updatePreferences: (groupLabel: string, value: string) => void;
  isTyping: boolean;
  thinkingStage: ThinkingStage;
  reset: () => void;
  setPriceInputValue: (price: number) => void;
}

/**
 * Extract plain-text summary from a DemoMessage's rich content blocks.
 * Used to build the simple {role, content} history sent to the API.
 */
function summariseContent(content: MessageContent[]): string {
  return content
    .map((block) => {
      if (block.type === "text") return block.text.replace(/<[^>]*>/g, "");
      if (block.type === "products")
        return `[${block.products.length} product results shown]`;
      if (block.type === "sources") return "[research sources shown]";
      return "";
    })
    .filter(Boolean)
    .join(" ");
}

function determineThinkingStage(text: string): ThinkingStage {
  const lower = text.toLowerCase();
  if (lower.includes("price") || lower.includes("cost") || lower.includes("cheap"))
    return "finding-prices";
  if (lower.includes("compare") || lower.includes("better") || lower.includes("which"))
    return "comparing";
  if (lower.includes("track")) return "analyzing";
  return "general";
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStage, setThinkingStage] = useState<ThinkingStage>("general");

  const sendMessage = useCallback(
    async (text: string) => {
      // 1. Add user message to local state immediately
      const userMessage: DemoMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: [{ type: "text", text }],
        timestamp: new Date(),
      };

      // We need the current messages for the API call, so capture before updating
      const currentMessages = [...messages, userMessage];
      setMessages(currentMessages);

      // 2. Show typing indicator
      setIsTyping(true);
      setThinkingStage(determineThinkingStage(text));

      try {
        // 3. Build simple chat history for the API
        const historyForApi = currentMessages.map((msg) => ({
          role: msg.role,
          content: summariseContent(msg.content),
        }));

        // 4. POST to the orchestrator API
        const response = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyForApi,
            latest_message: text,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // 5. Append assistant response to messages
        const assistantMessage: DemoMessage = {
          id: data.id || `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content || [
            { type: "text", text: "Sorry, I received an empty response." },
          ],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        // On failure, show an error message in the chat
        const errorMessage: DemoMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: [
            {
              type: "text",
              text: `Sorry, I couldn't process your request. Please make sure the backend server is running on <strong>${API_URL}</strong>.`,
            },
          ],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages]
  );

  // Preference and price input interactions (stubs — not wired to backend yet)
  const updatePreferences = useCallback(
    (groupLabel: string, value: string) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.role !== "assistant") return message;
          const updatedContent = message.content.map((content) => {
            if (content.type !== "preferences") return content;
            const updatedOptions: PreferenceGroup[] = content.options.map(
              (group) => {
                if (group.label !== groupLabel) return group;
                return {
                  ...group,
                  options: group.options.map((opt) => ({
                    ...opt,
                    selected: opt.value === value,
                  })),
                };
              }
            );
            return { ...content, options: updatedOptions };
          });
          return { ...message, content: updatedContent };
        })
      );
    },
    []
  );

  const confirmSelection = useCallback(() => {
    // Could send a follow-up message with selected preferences in the future
  }, []);

  const confirmPriceInput = useCallback((_price: number) => {
    // Could wire up price tracking in the future
  }, []);

  const setPriceInputValue = useCallback((_price: number) => {
    // Stub
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setIsTyping(false);
    setThinkingStage("general");
  }, []);

  return {
    messages,
    sendMessage,
    confirmSelection,
    confirmPriceInput,
    updatePreferences,
    isTyping,
    thinkingStage,
    reset,
    setPriceInputValue,
  };
}
