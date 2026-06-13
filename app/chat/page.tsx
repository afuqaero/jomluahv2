"use client";

import {
  ChatCircleDots,
  ShieldCheck,
  Plus,
  Microphone,
  PaperPlaneRight,
  Bell,
  Gear,
  User,
  Circle,
  TextAlignLeft,
  X,
  ArrowBendUpLeft
} from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { useAppTheme } from "../components/useAppTheme";
import AppSidebar, { MobileBottomNav, BackgroundDecor } from "../components/AppSidebar";
import InteractiveLiquidOrb from "../components/InteractiveLiquidOrb";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  options?: string[];
  replyToText?: string;
  replyToSender?: "bot" | "user";
};

export default function ChatPage() {
  const { isDarkMode, setIsDarkMode, isSidebarCollapsed, setIsSidebarCollapsed, theme } = useAppTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const recentChats = [
    { id: "1", title: "Feeling Overwhelmed", date: "Today", preview: "That's a heavy feeling to carry..." },
    { id: "2", title: "Breathing Exercise Check-in", date: "Yesterday", preview: "Close your eyes. Inhale... 2, 3, 4..." },
    { id: "3", title: "Logged Diary Entry", date: "Jun 12", preview: "I'm glad to hear that, Ali. Remember..." },
    { id: "4", title: "Anxious thoughts & stress", date: "Jun 10", preview: "Let's sit with it. What is running through..." }
  ];

  const handleLoadChat = (chatId: string) => {
    setIsHistoryOpen(false);
    if (chatId === "1") {
      setMessages([
        { id: "101", sender: "user", text: "I've been feeling really overwhelmed today.", timestamp: "10:30 AM" },
        { id: "102", sender: "bot", text: "That's a heavy feeling to carry. Let's try to break that down. When you think of that 'overwhelmed' feeling, where do you feel it in your body right now?", timestamp: "10:31 AM", options: ["My chest", "My shoulders", "My head", "Somewhere else"] }
      ]);
    } else if (chatId === "2") {
      setMessages([
        { id: "201", sender: "user", text: "Start breathing exercise", timestamp: "Yesterday, 3:15 PM" },
        { id: "202", sender: "bot", text: "Close your eyes. Inhale... 2, 3, 4. Hold... 2, 3, 4. Exhale... 2, 3, 4. Take another slow breath. How does it feel now?", timestamp: "Yesterday, 3:16 PM", options: ["A bit better", "Still tense"] }
      ]);
    } else {
      setMessages([
        { id: "301", sender: "bot", text: "This is a past conversation. What other thoughts are running through your mind right now?", timestamp: "Jun 12, 11:20 AM" }
      ]);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  // Simulates AI responses based on message flow with a realistic typewriter effect
  const simulateBotResponse = (userText: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "I hear you, Ali. Tell me more about what's going on.";
      let options: string[] | undefined;
 
      const lowerText = userText.toLowerCase();
      if (lowerText.includes("overwhelmed") || lowerText.includes("breath")) {
        replyText = "That's a heavy feeling to carry. Let's try to break that down. When you think of that 'overwhelmed' feeling, where do you feel it in your body right now?";
        options = ["My chest", "My shoulders", "My head", "Somewhere else"];
      } else if (lowerText.includes("chest") || lowerText.includes("shoulders") || lowerText.includes("head")) {
        replyText = "I hear you. Let's try a quick breathing exercise together to ease that physical tension. Breathe in for 4 seconds, hold, and release. Ready?";
        options = ["Start breathing exercise", "I'd rather just talk"];
      } else if (lowerText.includes("breathing") || lowerText.includes("start")) {
        replyText = "Close your eyes. Inhale... 2, 3, 4. Hold... 2, 3, 4. Exhale... 2, 3, 4. Take another slow breath. How does it feel now?";
        options = ["A bit better", "Still tense"];
      } else if (lowerText.includes("better")) {
        replyText = "I'm glad to hear that, Ali. Remember, it's completely okay to take pause. I'm here if you want to log this in your journal or keep talking.";
        options = ["Log in diary", "Keep talking"];
      } else if (lowerText.includes("tense") || lowerText.includes("talk")) {
        replyText = "That's okay, Ali. There is no rush. Let's just sit with it. What other thoughts are running through your mind right now?";
      }
 
      // Insert placeholder message for typewriter animation
      const botMsgId = String(Date.now());
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "bot",
          text: "",
          timestamp: getFormattedTime()
        }
      ]);

      let textIndex = 0;
      const interval = setInterval(() => {
        textIndex += 2; // Type 2 characters at a time for natural speed
        if (textIndex >= replyText.length) {
          clearInterval(interval);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? { ...msg, text: replyText, options }
                : msg
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? { ...msg, text: replyText.substring(0, textIndex) }
                : msg
            )
          );
        }
      }, 20);
    }, 1500);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text) return;

    // Add user message
    const userMsg: Message = {
      id: String(Date.now()),
      sender: "user",
      text,
      timestamp: getFormattedTime(),
      replyToText: replyingTo ? replyingTo.text : undefined,
      replyToSender: replyingTo ? replyingTo.sender : undefined
    };
    
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setReplyingTo(null); // Clear reply context
    
    // Simulate companion response
    simulateBotResponse(text);
  };

  const handleOptionClick = (option: string) => {
    handleSendMessage(option);
  };

  return (
    <div className={`min-h-screen ${theme.bg} font-sans antialiased flex transition-colors duration-500`}>

      <AppSidebar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarOpen={false}
        onCloseSidebar={() => {}}
        theme={theme}
      />

      {/* Page Content */}
      <div className="flex-1 h-screen min-w-0 p-4 sm:p-6 md:p-8 flex flex-col relative overflow-hidden transition-colors duration-500 pb-24 lg:pb-8">
        <BackgroundDecor isDarkMode={isDarkMode} />

        <MobileBottomNav />

        {/* Header matching dashboard theme consistency */}
        <header className="relative z-20 pb-4 border-b border-neutral-200/20 dark:border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle button (circular menu lines) -> Opens Recent Chats history drawer */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] ${
                isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-neutral-200/50 hover:bg-neutral-50 text-neutral-700 shadow-sm"
              }`}
              title="Open recent chats"
            >
              <TextAlignLeft size={20} weight="bold" />
            </button>

            <span className={`text-xl font-bold tracking-tight ${theme.textHeading}`}>Sanctuary Chat</span>
          </div>
        </header>

        {/* Chat Area Viewport */}
        <main className="relative z-10 flex-1 w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto flex flex-col mt-6 min-h-0 overflow-hidden">
          
          {messages.length === 0 ? (
            /* --- LANDING PROMPT VIEW --- */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in-up overflow-y-auto">
              
              {/* Interactive Liquid Physics Orb */}
              <InteractiveLiquidOrb />

              {/* Dynamic Personalized Greetings */}
              <div>
                <span className="text-xl sm:text-2xl font-light text-[#6366F1] dark:text-indigo-300 block mb-1">
                  Hello, Ali
                </span>
                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.textHeading}`}>
                  How can I assist you today?
                </h2>
                <p className={`text-xs mt-3 max-w-xs mx-auto leading-relaxed ${theme.textMuted}`}>
                  Type in your feelings or thoughts below. Your companion is here to listen and guide you through.
                </p>
              </div>
            </div>
          ) : (
            /* --- ACTIVE CHAT MESSAGE HISTORY --- */
            <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Premium Gradient Top Fade to transparency */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#F0F2F6] dark:from-stone-950 to-transparent pointer-events-none z-20 transition-colors duration-500" />
              
              <div className="flex-1 overflow-y-auto px-1 pt-4 pb-4 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 w-full animate-fade-slide-up group ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Bot Avatar */}
                  {msg.sender === "bot" && (
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                      <InteractiveLiquidOrb size={36} />
                    </div>
                  )}
 
                  {/* Message Bubble Container */}
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] gap-1.5 text-left`}>
                    <div
                      className={`px-5 py-3.5 rounded-3xl text-sm sm:text-base leading-relaxed backdrop-blur-md ${
                        msg.sender === "user"
                          ? "bg-[#6366F1] text-white rounded-tr-none shadow-lg shadow-indigo-500/10 border border-indigo-400/20 dark:border-indigo-800/35"
                          : `${isDarkMode ? "bg-stone-900/40 border border-white/5 text-stone-200" : "bg-purple-50/40 border border-purple-100/80 text-neutral-800 shadow-lg shadow-purple-100/30"} rounded-tl-none`
                      }`}
                    >
                      {/* Replying to preview quote inside user bubble */}
                      {msg.replyToText && (
                        <div className="mb-2 p-2 rounded-lg bg-black/10 dark:bg-black/20 border-l-2 border-white/40 text-xs text-indigo-100 dark:text-indigo-200 max-w-full text-left">
                          <span className="font-bold block opacity-75 mb-0.5">
                            Replying to {msg.replyToSender === "bot" ? "Companion AI" : "You"}
                          </span>
                          <span className="opacity-90 line-clamp-1 truncate block max-w-full">{msg.replyToText}</span>
                        </div>
                      )}

                      <p>{msg.text}</p>
                      
                      {/* Optional Interactive Action Pills (Quick Replies) */}
                      {msg.sender === "bot" && msg.options && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-1">
                          {msg.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleOptionClick(option)}
                              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
                                isDarkMode
                                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-neutral-300 hover:text-white"
                                  : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Timestamp */}
                    <span className={`text-[9px] font-bold uppercase tracking-wider block px-2 ${theme.textMuted} ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Hover Reply Button (Bot messages only) */}
                  {msg.sender === "bot" && (
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full hover:bg-neutral-200/50 dark:hover:bg-white/5 text-neutral-400 hover:text-neutral-700 dark:hover:text-stone-300 self-center"
                      title="Reply to this message"
                    >
                      <ArrowBendUpLeft size={16} weight="bold" />
                    </button>
                  )}
                </div>
              ))}

              {/* Bot typing simulation */}
              {isTyping && (
                <div className="flex items-start gap-3 justify-start animate-pulse">
                  <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                    <InteractiveLiquidOrb size={36} />
                  </div>
                  <div className={`px-5 py-3.5 rounded-3xl backdrop-blur-md ${isDarkMode ? "bg-stone-900/40 border border-white/5" : "bg-purple-50/40 border border-purple-100/80 shadow-lg shadow-purple-100/30"} rounded-tl-none`}>
                    <div className="flex gap-1 items-center justify-center py-1">
                      <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            </div>
          )}

          {/* Floating Pill Input Bar */}
          <div className="mt-4 pb-6 w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto flex flex-col gap-2">
            {/* Replying to Context Bar Preview */}
            {replyingTo && (
              <div className="w-full px-4 py-2.5 bg-white/60 dark:bg-stone-900/60 backdrop-blur-md rounded-2xl border border-neutral-200/30 dark:border-white/5 flex items-center justify-between text-xs animate-fade-in-up">
                <div className="flex flex-col border-l-2 border-[#6366F1] pl-2 text-left truncate">
                  <span className="font-bold text-[#6366F1]">Replying to Companion AI</span>
                  <span className="text-neutral-500 dark:text-stone-400 truncate line-clamp-1 block max-w-lg">{replyingTo.text}</span>
                </div>
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-400 hover:text-neutral-700 dark:hover:text-stone-300 transition shrink-0 ml-4"
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
            )}

            <div className={`relative flex items-center gap-2 w-full rounded-full p-2 border transition-all duration-300 shadow-2xl ${
              isDarkMode ? "bg-stone-900/80 border-white/10 text-white" : "bg-white/80 border-neutral-200 text-neutral-800"
            }`}>
              {/* Plus Circle Button */}
              <button
                type="button"
                aria-label="Add attachment"
                className={`p-2.5 rounded-full transition hover:scale-105 shrink-0 ${
                  isDarkMode ? "hover:bg-white/5 text-stone-400 hover:text-white" : "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Plus weight="bold" className="w-4.5 h-4.5" />
              </button>

              {/* Text Input Field */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Share your thoughts..."
                className="flex-1 bg-transparent outline-none text-sm px-2 py-1 placeholder:text-neutral-400 dark:placeholder:text-stone-500"
              />

              {/* Microphone/Voice Input */}
              <button
                type="button"
                aria-label="Voice input"
                className={`p-2.5 rounded-full transition hover:scale-105 shrink-0 ${
                  isDarkMode ? "hover:bg-white/5 text-stone-400 hover:text-white" : "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Microphone weight="duotone" className="w-4.5 h-4.5" />
              </button>

              {/* Circular Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                aria-label="Send message"
                className="w-10 h-10 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white flex items-center justify-center transition duration-200 transform hover:scale-105 shrink-0 shadow-lg shadow-[#6366F1]/20"
              >
                <PaperPlaneRight weight="fill" className="w-4 h-4 translate-x-[1px]" />
              </button>
            </div>
          </div>

        </main>

        {/* Slide-out Recent Chats History Panel (Absolute to page content so it sits to the right of Sidebar) */}
        {isHistoryOpen && (
          <>
            {/* Backdrop Overlay */}
            <div 
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-black/10 dark:bg-black/35 backdrop-blur-xs transition-opacity duration-300 animate-backdrop-fade z-30"
            />

            {/* Drawer Body (Premium Glassmorphic Panel with Slide-in animation) */}
            <div className="absolute top-0 bottom-0 left-0 z-40 w-80 max-w-[85vw] h-full flex flex-col backdrop-blur-2xl bg-white/30 dark:bg-stone-900/35 border-r border-white/20 dark:border-white/10 p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] animate-slide-in-left">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between mb-6">
                <span className={`text-lg font-extrabold tracking-tight ${theme.textHeading}`}>Recent Chats</span>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className={`p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/5 transition text-neutral-800 dark:text-white`}
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* New Chat Action Button */}
              <button
                onClick={() => {
                  setMessages([]);
                  setIsHistoryOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 mb-6 rounded-2xl bg-[#6366F1]/90 hover:bg-[#4F46E5] text-white font-bold text-sm shadow-lg shadow-[#6366F1]/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={16} weight="bold" />
                New check-in
              </button>

              {/* Chats List with Staggered Slide-in Animation */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {recentChats.map((chat, idx) => (
                  <button
                    key={chat.id}
                    onClick={() => handleLoadChat(chat.id)}
                    className="w-full text-left p-3.5 rounded-2xl border border-white/10 dark:border-white/5 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 transition duration-300 flex flex-col gap-1 hover:translate-x-1 animate-slide-in-item shadow-sm"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-extrabold truncate ${theme.textHeading}`}>{chat.title}</span>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 shrink-0">{chat.date}</span>
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-stone-400 line-clamp-1 truncate block">{chat.preview}</span>
                  </button>
                ))}
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
