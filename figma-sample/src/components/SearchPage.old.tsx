import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { ProductResponseCard } from './ProductResponseCard';
import type { Message, Conversation, Listing } from '@/lib/types';
import { MOCK_LISTINGS, MOCK_CONVERSATIONS } from '@/lib/mocks/data';

const SUGGESTED_PROMPTS = [
  "Best wireless earbuds under $100",
  "Compare iPhone 15 Pro vs Samsung Galaxy S24 Ultra",
  "Top gaming laptops for Southeast Asia"
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&h=400&fit=crop',
    price: 'SGD $429.00',
    seller: 'TechStore Official',
    trusted: true,
    discount: '25% off',
    platform: 'Shopee',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Apple AirPods Pro (2nd Generation)',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&h=400&fit=crop',
    price: 'SGD $349.00',
    seller: 'Apple Authorized Reseller',
    trusted: true,
    platform: 'Lazada',
    rating: 4.9
  },
  {
    id: '3',
    name: 'Samsung Galaxy Buds2 Pro',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=400&fit=crop',
    price: 'SGD $229.00',
    seller: 'Samsung Official Store',
    trusted: true,
    discount: '15% off',
    platform: 'Shopee',
    rating: 4.7
  }
];

const CHAT_HISTORY = [
  { id: '1', title: 'Best wireless earbuds', date: 'Today' },
  { id: '2', title: 'Gaming laptops comparison', date: 'Yesterday' },
  { id: '3', title: 'Smartphone deals', date: '2 days ago' }
];

export function SearchPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Based on your search for "${text}", I've analyzed listings across Shopee, Lazada, and other Southeast Asian platforms. Here are the top recommendations:`,
        timestamp: new Date(),
        products: MOCK_PRODUCTS
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handlePromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Previous Chats */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl text-gray-900">ShopSage</h1>
              <p className="text-xs text-gray-500">AI Shopping Assistant</p>
            </div>
          </div>
          
          <h3 className="text-sm text-gray-500 mb-3 uppercase tracking-wide">History</h3>
          <div className="space-y-2">
            {CHAT_HISTORY.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-sm text-gray-900 truncate">{chat.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{chat.date}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl text-gray-900 mb-3">Welcome to ShopSage</h2>
              <p className="text-gray-600 mb-10 max-w-lg">
                Your AI-powered shopping assistant for Southeast Asia. Discover products, compare prices, and track deals across multiple platforms.
              </p>
              
              <div className="w-full max-w-2xl">
                <p className="text-sm text-gray-500 mb-3">Suggested Prompts</p>
                <div className="grid grid-cols-1 gap-3">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt)}
                      className="px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors text-left text-gray-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === 'user' ? (
                    <div className="flex justify-end mb-4">
                      <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-md max-w-2xl">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl rounded-tl-md">
                            {message.content}
                          </div>
                        </div>
                      </div>
                      
                      {message.products && (
                        <div className="ml-11 space-y-4">
                          {message.products.map((product) => (
                            <ProductResponseCard key={product.id} product={product} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl rounded-tl-md">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me about products, prices, or comparisons..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="lg"
                className="px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}