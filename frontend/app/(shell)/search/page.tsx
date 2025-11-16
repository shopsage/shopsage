"use client";

import { useState, useEffect, useRef } from "react";
import { useConversationStore } from "@/lib/stores/conversation.store";
import { getClient } from "@/lib/adapters";
import type { Conversation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupContent, InputGroupButton } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Send, Plus, MessageSquare } from "lucide-react";

const getConversationTitle = (conv: Conversation): string => {
  if (conv.messages.length > 0) {
    const firstMessage = conv.messages[0].content;
    return firstMessage.substring(0, 50) + (firstMessage.length > 50 ? "..." : "");
  }
  return "Conversation";
};

export default function SearchPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    activeConversation,
    messages,
    streaming,
    setActiveConversation,
    setMessages,
    setStreaming,
    resetStreamingContent,
  } = useConversationStore();

  const client = getClient();

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const convs = await client.listConversations();
        setConversations(convs);
        // Auto-select the first conversation if none is selected
        if (convs.length > 0 && !activeConversation) {
          setActiveConversation(convs[0]);
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadConversations();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const handleNewConversation = async () => {
    try {
      setLoading(true);
      // Use unified model - no agent distinction
      const newConv = await client.createConversation();
      setConversations([newConv, ...conversations]);
      setActiveConversation(newConv);
      setMessageInput("");
      resetStreamingContent();
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    setMessageInput("");
    resetStreamingContent();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation || streaming) return;

    try {
      setStreaming(true);

      // Send message to backend
      await client.sendMessage(activeConversation.id, messageInput);

      // Get the updated conversation
      const updatedConversations = await client.listConversations();
      const updatedConv = updatedConversations.find(
        (c) => c.id === activeConversation.id
      );

      if (updatedConv) {
        setConversations(updatedConversations);
        setActiveConversation(updatedConv);
        setMessages(updatedConv.messages);
      }

      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setStreaming(false);
      resetStreamingContent();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
      {/* Sidebar - Conversation History */}
      <div className="hidden md:flex md:col-span-1 flex-col bg-gradient-to-b from-shopsage-light-bg to-white rounded-lg border border-shopsage-cool shadow-sm overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 bg-gradient-to-r from-shopsage-orange to-shopsage-peach">
          <h2 className="font-bold text-lg text-white mb-4">Conversations</h2>
          <Button
            onClick={handleNewConversation}
            disabled={loading}
            className="w-full bg-white text-shopsage-orange hover:bg-shopsage-light-peach border border-shopsage-orange"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <Separator />

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-shopsage-gray p-4 text-center">
                No conversations yet. Start one!
              </p>
            ) : (
              conversations.map((conv) => {
                const title = getConversationTitle(conv);
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-all text-sm truncate flex items-center gap-2 ${
                      activeConversation?.id === conv.id
                        ? "bg-shopsage-orange text-white shadow-md"
                        : "hover:bg-shopsage-light-peach text-dark"
                    }`}
                    title={title}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    {title}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-3 flex flex-col bg-white rounded-lg border border-shopsage-cool shadow-sm overflow-hidden">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 border-b border-primary-200">
              <h1 className="text-xl font-bold text-white">{getConversationTitle(activeConversation)}</h1>
              <p className="text-sm text-primary-100 mt-1">
                {messages.length} messages
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="bg-shopsage-light-bg rounded-full p-4 mb-4">
                    <MessageSquare className="w-8 h-8 text-shopsage-orange" />
                  </div>
                  <p className="text-lg font-semibold text-dark mb-2">Start a conversation</p>
                  <p className="text-sm text-gray-600 max-w-xs">
                    Ask me anything about products, prices, or suppliers across Southeast Asian e-commerce platforms
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "text-white rounded-tr-none"
                          : "bg-gray-100 text-dark rounded-tl-none"
                      }`}
                      style={{
                        backgroundColor: msg.role === "user" ? "#2563eb" : undefined,
                      }}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}

              {/* Streaming Indicator */}
              {streaming && (
                <div className="flex justify-start">
                  <div
                    className="text-white rounded-lg px-4 py-2 rounded-tl-none"
                    style={{ backgroundColor: "#2563eb" }}
                  >
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-white rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-white rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-shopsage-cool p-4 bg-gradient-to-t from-shopsage-light-bg to-white">
              <form onSubmit={handleSendMessage}>
                <InputGroup className="w-full">
                  <InputGroupContent>
                    <Input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Ask about products, prices, or suppliers..."
                      disabled={streaming}
                      className="border-shopsage-cool focus:border-shopsage-orange focus:ring-shopsage-orange"
                    />
                  </InputGroupContent>
                  <InputGroupButton>
                    <Button
                      type="submit"
                      disabled={streaming || !messageInput.trim()}
                      className="bg-shopsage-orange hover:bg-shopsage-peach text-white gap-2"
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </Button>
                  </InputGroupButton>
                </InputGroup>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full flex-col gap-4">
            <div className="bg-shopsage-light-bg rounded-full p-6">
              <MessageSquare className="w-12 h-12 text-shopsage-orange" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-dark mb-2">
                No conversation selected
              </p>
              <p className="text-sm text-gray-600 mb-6 max-w-xs">
                Create a new chat to start exploring products and pricing
              </p>
              <Button
                onClick={handleNewConversation}
                className="bg-shopsage-orange hover:bg-shopsage-peach text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
