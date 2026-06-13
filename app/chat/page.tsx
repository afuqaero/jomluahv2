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
  TextAlignLeft
} from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { useAppTheme } from "../components/useAppTheme";
import AppSidebar, { MobileBottomNav, BackgroundDecor } from "../components/AppSidebar";
import { RobotAvatar } from "../dashboard/ResponsiveAssets";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  options?: string[];
};

export default function ChatPage() {
  const { isDarkMode, setIsDarkMode, isSidebarCollapsed, setIsSidebarCollapsed, theme } = useAppTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Simulates AI responses based on message flow
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

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: "bot",
          text: replyText,
          timestamp: getFormattedTime(),
          options
        }
      ]);
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
      timestamp: getFormattedTime()
    };
    
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    
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
      <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-colors duration-500 pb-24 lg:pb-8">
        <BackgroundDecor isDarkMode={isDarkMode} />

        <MobileBottomNav />

        {/* Header matching dashboard theme consistency */}
        <header className="relative z-20 pb-4 border-b border-neutral-200/20 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle button (circular menu lines) */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] ${
                isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-neutral-200/50 hover:bg-neutral-50 text-neutral-700 shadow-sm"
              }`}
              title="Toggle sidebar"
            >
              <TextAlignLeft size={20} weight="bold" />
            </button>

            {/* New chat button (circular plus) */}
            <button
              onClick={() => setMessages([])}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] ${
                isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-neutral-200/50 hover:bg-neutral-50 text-neutral-700 shadow-sm"
              }`}
              title="New check-in"
            >
              <Plus size={20} weight="bold" />
            </button>

            <span className={`text-xl font-bold tracking-tight ${theme.textHeading}`}>Sanctuary Chat</span>
          </div>
        </header>

        {/* Chat Area Viewport */}
        <main className="relative z-10 flex-grow w-full max-w-4xl mx-auto flex flex-col justify-between mt-6 min-h-[60vh]">
          
          {messages.length === 0 ? (
            /* --- LANDING PROMPT VIEW --- */
            <div className="flex-grow flex flex-col items-center justify-center text-center px-4 animate-fade-in-up">
              
              {/* Animated 3D Glossy Purple Glassmorphic Orb */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6 flex items-center justify-center">
                <div className="absolute w-24 h-24 sm:w-28 sm:h-28 bg-[#6366F1]/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
                {/* Main Orb Body */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#6366F1] via-[#A855F7] to-[#3B82F6] opacity-80 shadow-[inset_-8px_-8px_24px_rgba(0,0,0,0.3),inset_8px_8px_24px_rgba(255,255,255,0.6)] animate-float-slow" />
                {/* 3D Curved Light Reflection Overlay */}
                <div className="absolute top-5 left-5 w-8 h-4 rounded-full bg-white/45 rotate-[-30deg] pointer-events-none filter blur-[0.5px]" />
                <div className="absolute bottom-5 right-5 w-6 h-3 rounded-full bg-white/15 rotate-[-30deg] pointer-events-none" />
              </div>

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
            <div className="flex-grow overflow-y-auto px-1 py-4 space-y-6 max-h-[60vh] scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 w-full animate-pop-in ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Bot Avatar */}
                  {msg.sender === "bot" && (
                    <div className="w-9 h-9 shrink-0 rounded-full bg-white dark:bg-stone-900 border border-neutral-200/60 dark:border-white/5 flex items-center justify-center p-0.5 shadow-sm overflow-hidden">
                      <RobotAvatar className="w-full h-full" />
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] gap-1.5 text-left`}>
                    <div
                      className={`px-5 py-3.5 rounded-3xl text-sm sm:text-base leading-relaxed backdrop-blur-md ${
                        msg.sender === "user"
                          ? "bg-[#E0D7FF]/80 dark:bg-purple-950/30 border border-purple-300/40 dark:border-purple-800/30 text-purple-950 dark:text-purple-100 rounded-tr-none shadow-lg shadow-purple-500/5"
                          : `${isDarkMode ? "bg-stone-900/40 border border-white/5 text-stone-200" : "bg-purple-50/40 border border-purple-100/80 text-neutral-800 shadow-lg shadow-purple-100/30"} rounded-tl-none`
                      }`}
                    >
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
                </div>
              ))}

              {/* Bot typing simulation */}
              {isTyping && (
                <div className="flex items-start gap-3 justify-start animate-pulse">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-white dark:bg-stone-900 border border-neutral-200/60 dark:border-white/5 flex items-center justify-center p-0.5 shadow-sm overflow-hidden">
                    <RobotAvatar className="w-full h-full" />
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
          )}

          {/* Floating Pill Input Bar */}
          <div className="mt-4 pb-6">
            <div className={`relative flex items-center gap-2 max-w-3xl mx-auto rounded-full p-2 border transition-all duration-300 shadow-2xl ${
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

      </div>
    </div>
  );
}
