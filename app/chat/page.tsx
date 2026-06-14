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
  ArrowBendUpLeft,
  Trash
} from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppTheme } from "../components/useAppTheme";
import AppSidebar, { MobileBottomNav, BackgroundDecor } from "../components/AppSidebar";
import InteractiveLiquidOrb from "../components/InteractiveLiquidOrb";
import { supabase } from "../lib/supabaseClient";
import { useInactivityLogout } from "../lib/useInactivityLogout";

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
  const router = useRouter();
  const { isDarkMode, setIsDarkMode, isSidebarCollapsed, setIsSidebarCollapsed, theme } = useAppTheme();
  useInactivityLogout();
  const [displayName, setDisplayName] = useState<string>("there");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [recentChats, setRecentChats] = useState<{ id: string; title: string; date: string; preview: string }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const loadRecentChats = async (uid: string) => {
    try {
      const { data: sessions, error } = await supabase
        .from("chat_sessions")
        .select(`
          id,
          title,
          created_at,
          chat_messages (
            text,
            created_at
          )
        `)
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (sessions && sessions.length > 0) {
        const formatted = sessions.map((s: any) => {
          const msgs = s.chat_messages || [];
          const sortedMsgs = [...msgs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const lastMsg = sortedMsgs[0];

          const dateObj = new Date(s.created_at);
          const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          return {
            id: s.id,
            title: s.title,
            date: dateStr,
            preview: lastMsg?.text || "No messages yet..."
          };
        });
        setRecentChats(formatted);
      } else {
        setRecentChats([]);
      }
    } catch (err) {
      console.error("Failed to load recent chats:", err);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", chatId);

      if (error) throw error;

      setRecentChats((prev) => prev.filter((c) => c.id !== chatId));
      
      if (currentSessionId === chatId) {
        setMessages([]);
        setCurrentSessionId(null);
      }
    } catch (err) {
      console.error("Failed to delete chat session:", err);
    }
  };

  // Auth guard — redirect to login if no session
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const meta = session.user.user_metadata;
      const name =
        meta?.full_name ||
        meta?.name ||
        session.user.email?.split("@")[0] ||
        "there";
      setDisplayName(name);
      loadRecentChats(session.user.id);
    };
    checkAuth();
  }, [router]);

  const handleLoadChat = async (chatId: string) => {
    setIsHistoryOpen(false);
    setCurrentSessionId(chatId);
    
    try {
      const { data: dbMsgs, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (dbMsgs) {
        const formatted: Message[] = dbMsgs.map((m) => {
          const dateObj = new Date(m.created_at);
          const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
          return {
            id: m.id,
            sender: m.sender as "bot" | "user",
            text: m.text,
            timestamp: timeStr,
            options: m.options || undefined,
            replyToText: m.reply_to_text || undefined,
            replyToSender: (m.reply_to_sender as "bot" | "user") || undefined
          };
        });
        setMessages(formatted);
      }
    } catch (err) {
      console.error("Failed to load chat messages:", err);
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
  // Fetches AI response from local API endpoint with a realistic typewriter effect
  const simulateBotResponse = async (userText: string, currentMessages: Message[], sessionId: string) => {
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch AI response");
      }

      const data = await res.json();
      const replyText = data.reply || "I am here to support you. Could you tell me more?";

      setIsTyping(false);

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

      // Save bot response to DB
      const { error: botDbErr } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          sender: "bot",
          text: replyText
        });
      if (botDbErr) console.error("Error saving bot message:", botDbErr);

      // Reload sidebar list to show updated preview
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        loadRecentChats(session.user.id);
      }

      let textIndex = 0;
      const interval = setInterval(() => {
        textIndex += 2; // Type 2 characters at a time for natural speed
        if (textIndex >= replyText.length) {
          clearInterval(interval);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? { ...msg, text: replyText }
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
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      
      const replyText = "I'm having a bit of trouble connecting right now, but I am still here. Take a gentle breath.";
      const botMsgId = String(Date.now());
      
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "bot",
          text: replyText,
          timestamp: getFormattedTime()
        }
      ]);

      // Save fallback to DB
      await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          sender: "bot",
          text: replyText
        });
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;

      let sessionId = currentSessionId;

      // 1. Create session if it doesn't exist
      if (!sessionId) {
        const words = text.split(" ");
        const title = words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");

        const { data: newSession, error: sErr } = await supabase
          .from("chat_sessions")
          .insert({
            user_id: uid,
            title: title
          })
          .select()
          .single();

        if (sErr || !newSession) {
          throw sErr || new Error("Failed to create chat session");
        }

        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
      }

      // 2. Add user message
      const userMsg: Message = {
        id: String(Date.now()),
        sender: "user",
        text,
        timestamp: getFormattedTime(),
        replyToText: replyingTo ? replyingTo.text : undefined,
        replyToSender: replyingTo ? replyingTo.sender : undefined
      };
      
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      if (!textToSend) setInputValue("");
      setReplyingTo(null);

      // Save user message to database
      const { error: msgErr } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          sender: "user",
          text,
          reply_to_text: userMsg.replyToText || null,
          reply_to_sender: userMsg.replyToSender || null
        });

      if (msgErr) console.error("Error saving user message:", msgErr);

      // Reload sidebar list
      loadRecentChats(uid);
      
      // 3. Query companion response
      simulateBotResponse(text, updatedMessages, sessionId);
    } catch (err) {
      console.error("Error sending message:", err);
    }
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
                  Hello, {displayName}
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
              
              <div className="flex-1 overflow-y-auto px-1 pt-4 pb-4 space-y-6 scrollbar-none">
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

                      <div className="space-y-1">
                        {renderFormattedText(msg.text)}
                      </div>
                      
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
                      onClick={() => {
                        setReplyingTo(msg);
                        inputRef.current?.focus();
                      }}
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
                ref={inputRef}
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
                  setCurrentSessionId(null);
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
                  <div
                    key={chat.id}
                    className="w-full relative group animate-slide-in-item"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <button
                      onClick={() => handleLoadChat(chat.id)}
                      className="w-full text-left p-3.5 pr-10 rounded-2xl border border-white/10 dark:border-white/5 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 transition duration-300 flex flex-col gap-1 hover:translate-x-1 shadow-sm"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-sm font-extrabold truncate max-w-[150px] ${theme.textHeading}`}>{chat.title}</span>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 shrink-0">{chat.date}</span>
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-stone-400 line-clamp-1 truncate block max-w-full">{chat.preview}</span>
                    </button>
                    
                    {/* Delete chat button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete chat "${chat.title}"?`)) {
                          await handleDeleteChat(chat.id);
                        }
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Delete chat session"
                    >
                      <Trash size={14} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

function parseInlineMarkdown(text: string) {
  // Regex to split by bold markers (**) and italic markers (*)
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-extrabold text-[#6366F1] dark:text-indigo-300">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function renderFormattedText(text: string) {
  if (!text) return null;

  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (trimmed === "---") {
      return <hr key={lineIdx} className="my-3 border-t border-neutral-200/20" />;
    }

    // Check for headings (e.g. ### Header)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const headingClass = level === 1 ? "text-xl font-black my-2 block" 
                           : level === 2 ? "text-lg font-extrabold my-2 block"
                           : "text-sm font-bold my-1.5 uppercase tracking-wide block";
      return (
        <span key={lineIdx} className={headingClass}>
          {parseInlineMarkdown(content)}
        </span>
      );
    }

    // Check for bullet points (e.g. * Item)
    const bulletMatch = line.match(/^[\*\-\+]\s+(.*)$/);
    if (bulletMatch) {
      return (
        <ul key={lineIdx} className="list-disc pl-5 my-1">
          <li>{parseInlineMarkdown(bulletMatch[1])}</li>
        </ul>
      );
    }

    // Check for numbered lists (e.g. 1. Item)
    const numberMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      return (
        <ol key={lineIdx} className="list-decimal pl-5 my-1">
          <li>{parseInlineMarkdown(numberMatch[1])}</li>
        </ol>
      );
    }

    // Default paragraph line
    return (
      <p key={lineIdx} className="mb-2 leading-relaxed">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}
