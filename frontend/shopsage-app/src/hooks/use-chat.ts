"use client";

import { useState, useCallback } from "react";
import type { DemoMessage, MessageContent, PreferenceGroup } from "@/lib/mock-data";
import { apiFetch } from "@/lib/api";

type ThinkingStage =
  | "researching"
  | "analyzing"
  | "finding-prices"
  | "comparing"
  | "general";

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
  chatId: string | null;
  loadChat: (chatId: string) => Promise<void>;
  isLoadedChat: boolean;
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
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadedChat, setIsLoadedChat] = useState(false);

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

      // 2. Show typing indicator (new message — disable loaded-chat suppression)
      setIsLoadedChat(false);
      setIsTyping(true);
      setThinkingStage(determineThinkingStage(text));

      try {
        // 3. Build simple chat history for the API
        const historyForApi = currentMessages.map((msg) => ({
          role: msg.role,
          content: summariseContent(msg.content),
        }));

        // 4. POST to the orchestrator API (with auth via apiFetch)
        const response = await apiFetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({
            messages: historyForApi,
            latest_message: text,
            chat_id: chatId,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Track chat_id from server
        if (data.chat_id) {
          setChatId(data.chat_id);
        }

        // 5. Build assistant message, injecting extractedQuery into products blocks
        const contentBlocks: MessageContent[] = (
          data.content || [{ type: "text", text: "Sorry, I received an empty response." }]
        ).map((block: MessageContent) => {
          if (block.type === "products" && data.extracted_query) {
            return { ...block, extractedQuery: data.extracted_query };
          }
          return block;
        });

        const assistantMessage: DemoMessage = {
          id: data.id || `assistant-${Date.now()}`,
          role: "assistant",
          content: contentBlocks,
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
              text: "Sorry, I couldn't process your request. Please make sure the backend server is running.",
            },
          ],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, chatId]
  );

  const loadChat = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/api/chats/${id}`);
      if (!res.ok) throw new Error("Failed to load chat");
      const data = await res.json();

      setChatId(data.id);
      setIsLoadedChat(true);
      const loadedMessages: DemoMessage[] = data.messages.map(
        (m: { id: string; role: "user" | "assistant"; content: MessageContent[]; timestamp: string }) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        })
      );
      setMessages(loadedMessages);
    } catch {
      // Silently fail — user will see empty chat
    }
  }, []);

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
    setChatId(null);
    setIsLoadedChat(false);
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
    chatId,
    loadChat,
    isLoadedChat,
  };
}
