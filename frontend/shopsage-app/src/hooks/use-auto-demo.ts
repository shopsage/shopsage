"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DemoMessage } from "@/lib/mock-data";

interface UseAutoDemoProps {
    sendMessage: (text: string) => void;
    updatePreferences: (groupLabel: string, value: string) => void;
    confirmSelection: () => void;
    confirmPriceInput: (price: number) => void;
    setPriceInputValue: (price: number) => void;
    setInput: (text: string) => void;
    isTyping: boolean;
    messages: DemoMessage[];
}

export function useAutoDemo({
    sendMessage,
    updatePreferences,
    confirmSelection,
    confirmPriceInput,
    setPriceInputValue,
    setInput,
    isTyping,
    messages,
}: UseAutoDemoProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isAutoPlay = searchParams.get("autoplay") === "true";

    const [step, setStep] = useState(0);
    const [isTypingText, setIsTypingText] = useState(false);

    // Refs to keep track of state in timeouts
    const stepRef = useRef(step);
    stepRef.current = step;

    useEffect(() => {
        if (!isAutoPlay) return;

        // Hide cursor globally
        document.body.style.cursor = "none";

        // Add a style tag to hide cursor on everything (including hover states)
        const style = document.createElement('style');
        style.innerHTML = `* { cursor: none !important; }`;
        document.head.appendChild(style);

        return () => {
            document.body.style.cursor = "";
            document.head.removeChild(style);
        };
    }, [isAutoPlay]);

    // Helper to type text
    const typeText = async (text: string) => {
        setIsTypingText(true);
        setInput("");

        let currentText = "";
        for (let i = 0; i < text.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 30)); // Random typing speed
            currentText += text[i];
            setInput(currentText);
        }

        setIsTypingText(false);
    };

    // The Main Director
    useEffect(() => {
        if (!isAutoPlay) return;

        const runStep = async () => {
            // Step 0: Initial Load -> Type first query
            if (step === 0) {
                await new Promise((r) => setTimeout(r, 1500)); // Wait for page load
                setStep(1);
            }

            // Step 1: Type "I'm looking for some good noise cancelling headphones"
            if (step === 1) {
                await typeText("I'm looking for some good noise cancelling headphones");
                await new Promise((r) => setTimeout(r, 500));
                setStep(2);
            }

            // Step 2: Send Message
            if (step === 2) {
                sendMessage("I'm looking for some good noise cancelling headphones");
                setInput(""); // Clear input
                setStep(3);
            }

            // Step 3: Wait for Assistant Response (Preferences)
            // This is handled by the effect below monitoring messages
        };

        runStep();
    }, [step, isAutoPlay, sendMessage, setInput]);

    // Monitor messages to advance steps
    useEffect(() => {
        if (!isAutoPlay) return;

        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.role !== "assistant") return;

        // Check if we are waiting for a response to proceed

        // After Step 2 (User sent query), we wait for response -> Step 4
        if (step === 3 && !isTyping) {
            // Wait a bit for "reading"
            setTimeout(() => setStep(4), 1500);
        }

        // After Step 5 (User confirmed selection), we wait for response -> Step 6
        if (step === 5 && !isTyping) {
            // This state is tricky because confirmSelection doesn't change 'step' explicitly in this hook, 
            // but we need to know when the NEXT assistant message arrives.
            // We can check the message content type or ID if possible, or just count.
            // Let's rely on the sequence.

            // Actually, let's handle the "Actions" in a separate effect or the main one?
            // The main one is better.
        }

    }, [messages, isTyping, isAutoPlay, step]);

    // We need a more robust state machine that doesn't get stuck.
    // Let's put the logic that depends on "Assistant just finished replying" here.
    useEffect(() => {
        if (!isAutoPlay) return;
        if (isTyping) return; // Wait until assistant finishes typing

        const lastMessage = messages[messages.length - 1];

        // If we just finished Step 2 (User sent), and assistant replied (msg-2)
        if (step === 3 && lastMessage?.role === "assistant") {
            // Move to selecting preferences
            setTimeout(() => setStep(4), 1500);
        }

        // If we just finished Step 5 (User confirmed), and assistant replied (msg-4 products)
        if (step === 5 && lastMessage?.role === "assistant") {
            // Move to typing next query - Wait 15s as requested
            setTimeout(() => setStep(6), 15000);
        }

        // If we just finished Step 8 (User sent track), and assistant replied (msg-6 price input)
        if (step === 8 && lastMessage?.role === "assistant") {
            // Move to entering price
            setTimeout(() => setStep(9), 1500);
        }

        // If we just finished Step 10 (User confirmed price), and assistant replied (msg-8 confirmation)
        if (step === 10 && lastMessage?.role === "assistant") {
            // Move to navigation - Wait 5s as requested
            setTimeout(() => setStep(11), 5000);
        }

    }, [messages, isTyping, isAutoPlay, step]);


    // Execute Actions based on Step
    useEffect(() => {
        if (!isAutoPlay) return;

        const executeAction = async () => {
            // Step 4: Select Preferences
            if (step === 4) {
                // Select In-ear
                updatePreferences("Type", "in-ear");
                await new Promise((r) => setTimeout(r, 600));
                // Select Under $350
                updatePreferences("Budget", "under-350");
                await new Promise((r) => setTimeout(r, 800));
                // Confirm
                confirmSelection();
                setStep(5); // Mark as confirmed, waiting for response
            }

            // Step 6: Type "track the sony one"
            if (step === 6) {
                await typeText("track the sony one");
                await new Promise((r) => setTimeout(r, 500));
                setStep(7);
            }

            // Step 7: Send Message
            if (step === 7) {
                sendMessage("track the sony one");
                setInput(""); // Clear input
                setStep(8); // Mark as sent, waiting for response
            }

            // Step 9: Change Price
            if (step === 9) {
                // Update the displayed price first
                setPriceInputValue(300);
                await new Promise((r) => setTimeout(r, 800)); // Let user see the change
                confirmPriceInput(300);
                setStep(10); // Mark as confirmed, waiting for response
            }

            // Step 11: Navigate
            if (step === 11) {
                router.push("/tracking");
            }
        };

        executeAction();
    }, [step, isAutoPlay, updatePreferences, confirmSelection, sendMessage, confirmPriceInput, setPriceInputValue, router]);

    return { isAutoPlay };
}
