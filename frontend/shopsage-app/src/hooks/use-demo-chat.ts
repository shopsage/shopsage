"use client";

import { useState, useCallback } from "react";
import { demoScript, DemoMessage, PreferenceGroup } from "@/lib/mock-data";

type ThinkingStage = "researching" | "analyzing" | "finding-prices" | "comparing" | "general";

interface UseDemoChatReturn {
  messages: DemoMessage[];
  sendMessage: (text: string) => void;
  confirmSelection: () => void;
  confirmPriceInput: (price: number) => void;
  updatePreferences: (groupLabel: string, value: string) => void;
  isTyping: boolean;
  thinkingStage: ThinkingStage;
  reset: () => void;
}

export function useDemoChat(): UseDemoChatReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingStage, setThinkingStage] = useState<ThinkingStage>("general");

  // Helper function to determine thinking stage based on user message
  const determineThinkingStage = (messageText: string): ThinkingStage => {
    const lowerText = messageText.toLowerCase();
    if (lowerText.includes("looking for") || lowerText.includes("find") || lowerText.includes("search")) {
      return "researching";
    } else if (lowerText.includes("price") || lowerText.includes("cost") || lowerText.includes("cheap")) {
      return "finding-prices";
    } else if (lowerText.includes("compare") || lowerText.includes("better") || lowerText.includes("which")) {
      return "comparing";
    } else if (lowerText.includes("track")) {
      return "analyzing";
    }
    return "general";
  };

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
      // No thinking animation for this step
      setMessages((prev) => [
        ...prev,
        { ...demoScript[assistantMessageIndex], timestamp: new Date() },
      ]);
      setCurrentStep((prev) => prev + 1);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  // Confirm price input and advance the conversation (skip user message)
  const confirmPriceInput = useCallback(
    () => {
      // Calculate which messages to show next
      const userMessageIndex = currentStep * 2;
      const assistantMessageIndex = userMessageIndex + 1;

      if (userMessageIndex >= demoScript.length) {
        return;
      }

      // Go straight to the next assistant response (skip user message)
      if (assistantMessageIndex < demoScript.length) {
        // No thinking animation for this step
        setMessages((prev) => [
          ...prev,
          { ...demoScript[assistantMessageIndex], timestamp: new Date() },
        ]);
        setCurrentStep((prev) => prev + 1);
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
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Check if there's an assistant response in the script
      if (assistantMessageIndex < demoScript.length) {
        setIsTyping(true);
        setThinkingStage(determineThinkingStage(text));

        // Simulate typing delay
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { ...demoScript[assistantMessageIndex], timestamp: new Date() },
          ]);
          setIsTyping(false);
          setCurrentStep((prev) => prev + 1);
        }, 1200);
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
  };
}

