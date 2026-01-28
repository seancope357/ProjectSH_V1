
'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2, ChevronDown } from 'lucide-react';
import { useNavigation } from '@/components/providers/navigation-provider';
import { cn } from '@/lib/utils';

export function LuminaChat() {
  const { currentRole, user } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: currentRole === 'SELLER' 
          ? "Hi! I'm Lumina, your AI Sequence Specialist. ✨ I'm here to help you optimize your sequences, write great descriptions, and help you grow your sales. How can I assist you today?"
          : "Welcome to SequenceHUB! I'm Lumina. ✨ Looking for the perfect LED sequence for your display? I can help you find what you need or answer any questions you have about our marketplace!"
      }
    ]
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                ✨
              </div>
              <div>
                <h3 className="font-bold text-lg leading-none">Lumina</h3>
                <p className="text-xs text-purple-100 mt-1">AI Specialist</p>
              </div>
            </div>
            <button 
              onClick={toggleChat}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950"
          >
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm",
                  m.role === 'user' 
                    ? "bg-blue-600 text-white" 
                    : "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
                )}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-sm",
                  m.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 mr-auto max-w-[85%] animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
                <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="p-2 text-center text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                Sorry, Lumina is having a quick break. Please try again in a moment!
              </div>
            )}
          </div>

          {/* Quick Actions for Sellers */}
          {isOpen && currentRole === 'SELLER' && messages.length < 3 && (
            <div className="px-4 py-2 flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => handleInputChange({ target: { value: "Help me write a description for my new sequence" } } as any)}
                className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                Write Description 📝
              </button>
              <button 
                onClick={() => handleInputChange({ target: { value: "Give me some SEO tags for Christmas sequences" } } as any)}
                className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                SEO Tags 🏷️
              </button>
            </div>
          )}

          {/* Input */}
          <form 
            onSubmit={handleSubmit}
            className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask Lumina anything..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={cn(
          "group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95",
          isOpen 
            ? "bg-gray-100 dark:bg-gray-800 text-gray-500" 
            : "bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 text-white"
        )}
      >
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20 group-hover:opacity-40 transition-opacity" />
        )}
        {isOpen ? (
          <ChevronDown className="w-8 h-8 animate-bounce" />
        ) : (
          <div className="flex flex-col items-center">
             <Sparkles className="w-7 h-7" />
             <span className="text-[8px] font-bold uppercase tracking-tighter">Lumina</span>
          </div>
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-20 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-xl shadow-xl text-xs font-medium border border-gray-100 dark:border-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {currentRole === 'SELLER' ? "Need help with your listings?" : "Hi! I'm Lumina, how can I help?"}
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-8 border-transparent border-l-white dark:border-l-gray-800" />
          </div>
        )}
      </button>
    </div>
  );
}
