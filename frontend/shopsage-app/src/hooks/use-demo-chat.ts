"use client";

import { useState, useCallback } from "react";
import { demoScript, DemoMessage, PreferenceGroup } from "@/lib/mock-data";

interface UseDemoChatReturn {
  messages: DemoMessage[];
  sendMessage: (text: string) => void;
  confirmSelection: () => void;
  confirmPriceInput: (price: number) => void;
  updatePreferences: (groupLabel: string, value: string) => void;
  isTyping: boolean;
  reset: () => void;
}

export function useDemoChat(): UseDemoChatReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Update a preference selection within the current messages
  const updatePreferences = useCallback((groupLabel: string, value: string) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.role !== "assistant") return message;

        const updatedContent = message.content.map((content) => {
          if (content.type !== "preferences") return content;

          const updatedOptions: PreferenceGroup[] = content.options.map((group) => {
            if (group.label !== groupLabel) return group;

            return {
              ...group,
              options: group.options.map((opt) => ({
                ...opt,
                selected: opt.value === value,
              })),
            };
          });

          return { ...content, options: updatedOptions };
        });

        return { ...message, content: updatedContent };
      })
    );
  }, []);

  // Confirm current selections and advance the conversation (skip user message)
  const confirmSelection = useCallback(() => {
    // Calculate which messages to show next
    const userMessageIndex = currentStep * 2;
    const assistantMessageIndex = userMessageIndex + 1;

    if (userMessageIndex >= demoScript.length) {
      return;
    }

    // Go straight to the next assistant response (skip user message)
    if (assistantMessageIndex < demoScript.length) {
      setIsTyping(true);

      setTimeout(() => {
        setMessages((prev) => [...prev, demoScript[assistantMessageIndex]]);
        setIsTyping(false);
        setCurrentStep((prev) => prev + 1);
      }, 800);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  // Confirm price input and advance the conversation (skip user message)
  const confirmPriceInput = useCallback(
    (_price: number) => {
      // Calculate which messages to show next
      const userMessageIndex = currentStep * 2;
      const assistantMessageIndex = userMessageIndex + 1;

      if (userMessageIndex >= demoScript.length) {
        return;
      }

      // Go straight to the next assistant response (skip user message)
      if (assistantMessageIndex < demoScript.length) {
        setIsTyping(true);

        setTimeout(() => {
          setMessages((prev) => [...prev, demoScript[assistantMessageIndex]]);
          setIsTyping(false);
          setCurrentStep((prev) => prev + 1);
        }, 800);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    },
    [currentStep]
  );

  const sendMessage = useCallback(
    (text: string) => {
      // Calculate which messages to show next
      // Even indices are user messages, odd indices are assistant responses
      const userMessageIndex = currentStep * 2;
      const assistantMessageIndex = userMessageIndex + 1;

      if (userMessageIndex >= demoScript.length) {
        // Demo complete, just add the user's message
        setMessages((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            role: "user",
            content: [{ type: "text", text }],
          },
        ]);
        return;
      }

      // Add user message (use their actual input, not script)
      const userMessage: DemoMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: [{ type: "text", text }],
      };

      setMessages((prev) => [...prev, userMessage]);

      // Check if there's an assistant response in the script
      if (assistantMessageIndex < demoScript.length) {
        setIsTyping(true);

        // Simulate typing delay
        setTimeout(() => {
          setMessages((prev) => [...prev, demoScript[assistantMessageIndex]]);
          setIsTyping(false);
          setCurrentStep((prev) => prev + 1);
        }, 800);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    },
    [currentStep]
  );

  const reset = useCallback(() => {
    setCurrentStep(0);
    setMessages([]);
    setIsTyping(false);
  }, []);

  return {
    messages,
    sendMessage,
    confirmSelection,
    confirmPriceInput,
    updatePreferences,
    isTyping,
    reset,
  };
}

