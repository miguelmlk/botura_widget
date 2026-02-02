"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatWidgetProps {
  chatbotId: string;
  chatbotName: string;
  color?: string;
  avatarImage?: string;
  welcomeMessage?: string;
  placeholderText?: string;
}

export function ChatWidget({
  chatbotId,
  chatbotName,
  color = "#10b981",
  avatarImage,
  welcomeMessage = "👋 Hi! Wie kann ich dir helfen?",
  placeholderText = "Schreibe eine Nachricht...",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Conversation ID mit localStorage
  const [conversationId, setConversationId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`chat_conversation_${chatbotId}`);
      if (stored) {
        console.log("📦 Lade bestehende Conversation:", stored);
      }
      return stored || null;
    }
    return null;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const timestamp = new Date().toISOString();
    
    setInput("");
    setIsLoading(true);

    // User message hinzufügen
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp },
    ]);

    try {
      const API_URL = (window as any).BOTURA_API_URL || "http://localhost:8000";

      const response = await fetch(
        `${API_URL}/api/v1/chatbots/${chatbotId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            conversation_id: conversationId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();

      // Bot response hinzufügen
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: data.response,
          timestamp: new Date().toISOString()
        },
      ]);

      // Conversation ID speichern
      const newConversationId = data.conversation_id;
      setConversationId(newConversationId);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          `chat_conversation_${chatbotId}`,
          newConversationId
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.",
          timestamp: new Date().toISOString()
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("de-DE", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <>
      {/* Chat Button - Floating */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          }}
        >
          {/* Pulsing Ring Animation */}
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: color }}
          />
          
          {/* Avatar or Icon */}
          {avatarImage ? (
            <img
              src={avatarImage}
              alt={chatbotName}
              className="h-12 w-12 rounded-full border-2 border-white object-cover"
            />
          ) : (
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          )}

          {/* Notification Badge (optional) */}
          {messages.length === 0 && (
            <div 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white animate-bounce"
              style={{ backgroundColor: color }}
            >
              !
            </div>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="flex h-[600px] w-[400px] flex-col rounded-3xl border border-zinc-200/50 bg-white shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/95 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header - Glassmorphism Style */}
          <div
            className="relative flex items-center gap-4 p-5 backdrop-blur-xl border-b border-white/10"
            style={{
              background: `linear-gradient(135deg, ${color}f0 0%, ${color}cc 100%)`,
            }}
          >
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-30 animate-pulse"
                style={{ background: `${color}` }}
              />
              <div 
                className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 animate-pulse"
                style={{ background: `${color}`, animationDelay: '1s' }}
              />
            </div>

            {/* Avatar */}
            <div className="relative z-10">
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={chatbotName}
                  className="h-14 w-14 rounded-full border-2 border-white/40 object-cover shadow-lg backdrop-blur-sm"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white backdrop-blur-sm border-2 border-white/40 shadow-lg">
                  {chatbotName.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Online Status Indicator */}
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-400 border-2 border-white shadow-sm animate-pulse" />
            </div>

            {/* Info */}
            <div className="flex-1 text-white relative z-10">
              <p className="font-bold text-lg drop-shadow-sm">{chatbotName}</p>
              <div className="flex items-center gap-2 text-sm opacity-95">
                <div className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                <span className="font-medium">Online · Antwortet sofort</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="relative z-10 rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6 bg-gradient-to-b from-zinc-50/50 via-white to-zinc-50/30 dark:from-zinc-900/50 dark:via-zinc-950 dark:to-zinc-900/50">
            
            {/* Welcome Message - nur wenn keine Messages */}
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center px-4">
                <div className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Icon */}
                  <div
                    className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl shadow-2xl backdrop-blur-sm"
                    style={{ 
                      background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                      border: `2px solid ${color}30`
                    }}
                  >
                    <svg
                      className="h-12 w-12"
                      style={{ color }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>

                  {/* Welcome Text */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {welcomeMessage}
                    </h3>
                    <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Stelle mir eine Frage zu unseren Produkten, Services oder
                      Öffnungszeiten
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setInput("Öffnungszeiten?")}
                      className="group rounded-full bg-white border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span className="flex items-center gap-2">
                        🕐 Öffnungszeiten
                      </span>
                    </button>
                    <button
                      onClick={() => setInput("Wo seid ihr?")}
                      className="group rounded-full bg-white border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:border-emerald-300 hover:bg-emerald-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span className="flex items-center gap-2">
                        📍 Standorte
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex animate-in fade-in slide-in-from-bottom-3 duration-300 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* Avatar (nur bei Assistant) */}
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0">
                      {avatarImage ? (
                        <img
                          src={avatarImage}
                          alt={chatbotName}
                          className="h-8 w-8 rounded-full border-2 border-zinc-200 dark:border-zinc-700 object-cover"
                        />
                      ) : (
                        <div 
                          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {chatbotName.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`group relative rounded-2xl px-5 py-3.5 shadow-sm transition-all hover:shadow-md ${
                      msg.role === "user"
                        ? "text-white rounded-br-sm"
                        : "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 rounded-bl-sm border border-zinc-200/80 dark:border-zinc-700/80"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                          }
                        : undefined
                    }
                  >
                    {/* Markdown Content */}
                    <div className={`prose prose-sm max-w-none ${
                      msg.role === "user" 
                        ? "prose-invert" 
                        : "dark:prose-invert"
                    }`}>
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              className="font-semibold underline hover:no-underline transition-all"
                              style={{ color: msg.role === "user" ? "white" : color }}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul {...props} className="space-y-1.5 my-3" />
                          ),
                          p: ({ node, ...props }) => (
                            <p {...props} className="leading-relaxed mb-2 last:mb-0" />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong {...props} className="font-bold" />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      style={{ 
                        color: msg.role === "user" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)" 
                      }}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex-shrink-0">
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt={chatbotName}
                      className="h-8 w-8 rounded-full border-2 border-zinc-200 dark:border-zinc-700 object-cover"
                    />
                  ) : (
                    <div 
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {chatbotName.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="rounded-2xl rounded-bl-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: color, animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: color, animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: color, animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-zinc-200/80 bg-white/80 backdrop-blur-sm p-5 dark:border-zinc-700/80 dark:bg-zinc-900/80">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholderText}
                className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 text-sm placeholder:text-zinc-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:bg-zinc-800 transition-all"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="rounded-2xl px-5 py-3.5 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center min-w-[50px]"
                style={{
                  background: input.trim() && !isLoading
                    ? `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
                    : '#94a3b8',
                }}
              >
                {isLoading ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Powered by Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-600">
              <span>Powered by</span>
              <a
                href="https://botura.app"
                target="_blank"
                className="font-semibold hover:underline transition-all"
                style={{ color }}
              >
                Botura
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}