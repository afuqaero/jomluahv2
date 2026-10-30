"use client";

import {
  Plus,
  Microphone,
  PaperPlaneRight,
  TextAlignLeft,
  X,
  ArrowBendUpLeft,
  Trash,
  ThumbsUp,
  ThumbsDown
} from "@phosphor-icons/react";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppTheme } from "../components/useAppTheme";
import AppSidebar, { MobileBottomNav, BackgroundDecor } from "../components/AppSidebar";
import InteractiveLiquidOrb from "../components/InteractiveLiquidOrb";
import { neon as neon } from "../lib/neonClient";
import {
  decryptChatPayload,
  decryptSessionText,
  encryptChatPayload,
  encryptSessionText,
  restoreChatEncryptionKey,
  unlockAndMigrateChat,
} from "../lib/chatEncryption";
import { useInactivityLogout } from "../lib/useInactivityLogout";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  options?: string[];
  replyToText?: string;
  replyToSender?: "bot" | "user";
  feedback?: 1 | -1;
};

type RecentChatSession = {
  id: string;
  title: string;
  created_at: string;
  chat_messages: Array<{ text: string; created_at: string }> | null;
};

type ContextProfile = "quick" | "balanced" | "deep";

// Recent messages are sent verbatim; older messages are compacted into the
// session summary. The server applies the actual token budget to every request.
const CONTEXT_PROFILES: Record<ContextProfile, { recentMessages: number; compactAt: number; label: string }> = {
  quick: { recentMessages: 8, compactAt: 12, label: "Quick · 8K budget" },
  balanced: { recentMessages: 24, compactAt: 36, label: "Balanced · 16K budget" },
  deep: { recentMessages: 48, compactAt: 64, label: "Deep · 32K budget" },
};
const DEFAULT_CONTEXT_PROFILE: ContextProfile = "balanced";
const MAX_MESSAGES_PER_SUMMARY = 50;

function isContextProfile(value: unknown): value is ContextProfile {
  return value === "quick" || value === "balanced" || value === "deep";
}

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
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [recentChats, setRecentChats] = useState<{ id: string; title: string; date: string; preview: string }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [contextSummary, setContextSummary] = useState("");
  const [summaryMessageCount, setSummaryMessageCount] = useState(0);
  const [contextProfile, setContextProfile] = useState<ContextProfile>(DEFAULT_CONTEXT_PROFILE);
  const [isContextProfileSaving, setIsContextProfileSaving] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [isChatUnlocked, setIsChatUnlocked] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [rememberThisDevice, setRememberThisDevice] = useState(true);
  const [unlockError, setUnlockError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  const loadContextProfile = async () => {
    try {
      const response = await fetch("/api/ai/preferences", { cache: "no-store" });
      if (!response.ok) return;
      const body = await response.json();
      if (isContextProfile(body?.preferences?.context_profile)) {
        setContextProfile(body.preferences.context_profile);
      }
    } catch (error) {
      console.warn("Could not load conversation context preference:", error);
    }
  };

  const saveContextProfile = async (profile: ContextProfile) => {
    const previousProfile = contextProfile;
    setContextProfile(profile);
    setIsContextProfileSaving(true);
    try {
      const response = await fetch("/api/ai/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context_profile: profile }),
      });
      if (!response.ok) throw new Error("Could not save conversation context preference");
    } catch (error) {
      console.error("Could not save conversation context preference:", error);
      setContextProfile(previousProfile);
    } finally {
      setIsContextProfileSaving(false);
    }
  };

  const loadRecentChats = async (uid: string) => {
    try {
      const { data: sessions, error } = await neon
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
        const formatted = await Promise.all((sessions as RecentChatSession[]).map(async (s) => {
          const msgs = s.chat_messages || [];
          const sortedMsgs = [...msgs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const lastMsg = sortedMsgs[0];

          const dateObj = new Date(s.created_at);
          const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          return {
            id: s.id,
            title: await decryptSessionText(uid, s.title),
            date: dateStr,
            preview: lastMsg ? (await decryptChatPayload<{ text: string }>(uid, lastMsg.text)).text : "No messages yet..."
          };
        }));
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
      const { error } = await neon
        .from("chat_sessions")
        .delete()
        .eq("id", chatId);

      if (error) throw error;

      setRecentChats((prev) => prev.filter((c) => c.id !== chatId));
      
      if (currentSessionId === chatId) {
        setMessages([]);
        setCurrentSessionId(null);
        setContextSummary("");
        setSummaryMessageCount(0);
      }
    } catch (err) {
      console.error("Failed to delete chat session:", err);
    }
  };

  const handleLoadChat = async (chatId: string) => {
    // Keep the desktop history sidebar open while switching conversations;
    // close only the mobile slide-over so the selected chat is immediately visible.
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setIsHistoryOpen(false);
    }
    setCurrentSessionId(chatId);
    setContextSummary("");
    setSummaryMessageCount(0);
    
    try {
      const { data: sessionContext, error: sessionContextError } = await neon
        .from("chat_sessions")
        .select("context_summary, summary_message_count")
        .eq("id", chatId)
        .single();

      // The app can still display older chats if the migration has not been
      // run yet; summary persistence will become available after migration.
      if (sessionContextError) {
        console.warn("Chat context summary is unavailable:", sessionContextError.message);
      } else {
        setContextSummary(sessionContext?.context_summary
          ? await decryptSessionText(chatUserId!, sessionContext.context_summary)
          : "");
        setSummaryMessageCount(Number(sessionContext?.summary_message_count || 0));
      }

      const { data: dbMsgs, error } = await neon
        .from("chat_messages")
        .select("*")
        .eq("session_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (dbMsgs) {
        const formatted: Message[] = await Promise.all(dbMsgs.map(async (m) => {
          const dateObj = new Date(m.created_at);
          const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
          const payload = await decryptChatPayload<{
            text: string;
            options?: string[];
            replyToText?: string;
            replyToSender?: "bot" | "user";
          }>(chatUserId!, m.text);
          return {
            id: m.id,
            sender: m.sender as "bot" | "user",
            text: payload.text,
            timestamp: timeStr,
            options: payload.options,
            replyToText: payload.replyToText,
            replyToSender: payload.replyToSender
          };
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    const messagePane = messagesScrollRef.current;
    messagePane?.scrollTo({ top: messagePane.scrollHeight, behavior: "smooth" });
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
      const contextLimits = CONTEXT_PROFILES[contextProfile];
      const compactBoundary = Math.max(0, currentMessages.length - contextLimits.recentMessages);
      const unsummarisedStart = Math.min(summaryMessageCount, currentMessages.length);
      const canCompact =
        currentMessages.length - summaryMessageCount > contextLimits.compactAt &&
        compactBoundary > unsummarisedStart;
      // The API validates a maximum 50-message summary batch. When a user
      // switches from Deep to Quick in an old chat, process it in batches so
      // no messages disappear from context between requests.
      const messagesToSummarize = canCompact
        ? currentMessages.slice(unsummarisedStart, compactBoundary).slice(0, MAX_MESSAGES_PER_SUMMARY)
        : [];
      const contextStart = messagesToSummarize.length > 0
        ? unsummarisedStart + messagesToSummarize.length
        : Math.max(0, Math.min(summaryMessageCount, currentMessages.length - contextLimits.recentMessages));
      const contextMessages = currentMessages.slice(contextStart);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: contextMessages,
          contextSummary,
          summaryMessageCount,
          messagesToSummarize,
          contextProfile,
          sessionId,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(errorBody || "Failed to fetch AI response");
      }

      if (!res.body) {
        throw new Error("AI response stream unavailable");
      }

      const botMsgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "bot",
          text: "",
          timestamp: getFormattedTime()
        }
      ]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let replyText = "";
      let summaryUpdate: { contextSummary: string; summaryMessageCount: number } | null = null;

      const processLine = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === "meta" && event.didSummarize && typeof event.contextSummary === "string") {
          summaryUpdate = {
            contextSummary: event.contextSummary,
            summaryMessageCount: Number(event.summaryMessageCount),
          };
        }
        if (event.type === "delta" && typeof event.text === "string") {
          replyText += event.text;
          setIsTyping(false);
          setMessages((prev) => prev.map((message) =>
            message.id === botMsgId ? { ...message, text: replyText } : message
          ));
        }
        if (event.type === "error") throw new Error(event.error || "AI stream failed");
      };

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        lines.forEach(processLine);
        if (done) break;
      }
      if (buffer.trim()) processLine(buffer);

      if (!replyText) {
        replyText = "I am here with you. Could you tell me a little more?";
        setMessages((prev) => prev.map((message) =>
          message.id === botMsgId ? { ...message, text: replyText } : message
        ));
      }

      if (summaryUpdate) {
        const nextSummary = summaryUpdate as { contextSummary: string; summaryMessageCount: number };
        setContextSummary(nextSummary.contextSummary);
        setSummaryMessageCount(nextSummary.summaryMessageCount);
        const { error: summaryDbError } = await neon
          .from("chat_sessions")
          .update({
            context_summary: await encryptSessionText(chatUserId!, nextSummary.contextSummary),
            summary_message_count: nextSummary.summaryMessageCount,
          })
          .eq("id", sessionId);
        if (summaryDbError) console.warn("Could not persist chat context summary:", summaryDbError.message);
      }

      const { data: savedBotMessage, error: botDbErr } = await neon
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          sender: "bot",
          text: await encryptChatPayload(chatUserId!, { text: replyText }),
        })
        .select("id")
        .single();
      if (botDbErr) console.error("Error saving bot message:", botDbErr);
      if (savedBotMessage?.id) {
        setMessages((prev) => prev.map((message) =>
          message.id === botMsgId ? { ...message, id: savedBotMessage.id } : message
        ));
      }

      // Reload sidebar list to show updated preview
      const { data: { session } } = await neon.auth.getSession();
      if (session) {
        loadRecentChats(session.user.id);
      }

      setIsTyping(false);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      
      const replyText = "I'm having a bit of trouble connecting right now, but I am still here. Take a gentle breath.";
      const botMsgId = crypto.randomUUID();
      
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
      await neon
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          sender: "bot",
          text: await encryptChatPayload(chatUserId!, { text: replyText })
        });
    }
  };

  const submitFeedback = async (messageId: string, rating: 1 | -1) => {
    const { data: { session } } = await neon.auth.getSession();
    if (!session) return;
    const { error } = await neon.from("chat_feedback").upsert(
      { user_id: session.user.id, message_id: messageId, rating, updated_at: new Date().toISOString() },
      { onConflict: "user_id,message_id" }
    );
    if (error) {
      console.error("Could not save chat feedback:", error);
      return;
    }
    setMessages((prev) => prev.map((message) =>
      message.id === messageId ? { ...message, feedback: rating } : message
    ));
  };

  async function handleInitialEntry(uid: string) {
    const params = new URLSearchParams(window.location.search);
    const entryId = params.get("entryId");
    const moodParam = params.get("mood");
    const descParam = params.get("desc");

    if (!entryId && !moodParam) return;

    // Clear parameters from the URL immediately so it doesn't run again on refresh
    window.history.replaceState({}, document.title, window.location.pathname);

    try {
      let mood = moodParam || "";
      let description = descParam || "";

      if (entryId) {
        const { data: entry, error: entryErr } = await neon
          .from("journal_entries")
          .select("*")
          .eq("id", entryId)
          .single();

        if (entryErr || !entry) {
          console.error("Error fetching initial journal entry:", entryErr);
          return;
        }
        mood = entry.mood;
        description = entry.excerpt;
      }

      // Create a new chat session
      const title = `Reflection: Feeling ${mood}`;
      const { data: newSession, error: sErr } = await neon
        .from("chat_sessions")
        .insert({
          user_id: uid,
          title: await encryptSessionText(uid, title),
        })
        .select()
        .single();

      if (sErr || !newSession) {
        console.error("Failed to create chat session:", sErr);
        return;
      }

      const sessionId = newSession.id;
      setCurrentSessionId(sessionId);
      setContextSummary("");
      setSummaryMessageCount(0);

      // Format user message based on the mood/description
      const userText = description && description !== "No additional notes for this entry."
        ? `I logged my mood as "${mood}". Here is what's on my mind:\n\n${description}`
        : `I logged my mood as "${mood}" today.`;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        sender: "user",
        text: userText,
        timestamp: getFormattedTime()
      };

      setMessages([userMsg]);

      // Save user message to database
      const { error: msgErr } = await neon
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          sender: "user",
          text: await encryptChatPayload(uid, { text: userText }),
        });

      if (msgErr) console.error("Error saving user message:", msgErr);

      // Reload recent chats list to show the new session
      loadRecentChats(uid);

      // Query companion response
      simulateBotResponse(userText, [userMsg], sessionId);
    } catch (err) {
      console.error("Error handling initial entry:", err);
    }
  }

  // Auth guard — redirect to login if no session.
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await neon.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      setIsAuthReady(true);
      setChatUserId(session.user.id);
      const name = session.user.name || session.user.email?.split("@")[0] || "there";
      setDisplayName(name);
      if (!await restoreChatEncryptionKey(session.user.id)) return;
      setIsChatUnlocked(true);
      loadRecentChats(session.user.id);
      loadContextProfile();
      handleInitialEntry(session.user.id);
    };
    checkAuth();
    // Auth bootstrap intentionally follows router lifecycle only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleUnlockChat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chatUserId || !unlockPassword) return;
    setIsUnlocking(true);
    setUnlockError("");
    try {
      await unlockAndMigrateChat(chatUserId, unlockPassword, rememberThisDevice);
      setUnlockPassword("");
      setIsChatUnlocked(true);
      await loadRecentChats(chatUserId);
      await loadContextProfile();
      await handleInitialEntry(chatUserId);
    } catch (error) {
      setUnlockError(error instanceof Error ? error.message : "Could not unlock your saved chats.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || isTyping) return;

    try {
      const { data: { session } } = await neon.auth.getSession();
      if (!session) return;
      const uid = session.user.id;

      let sessionId = currentSessionId;

      // 1. Create session if it doesn't exist
      if (!sessionId) {
        const words = text.split(" ");
        const title = words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");

        const { data: newSession, error: sErr } = await neon
          .from("chat_sessions")
          .insert({
            user_id: uid,
            title: await encryptSessionText(uid, title),
          })
          .select()
          .single();

        if (sErr || !newSession) {
          throw sErr || new Error("Failed to create chat session");
        }

        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        setContextSummary("");
        setSummaryMessageCount(0);
      }

      // 2. Add user message
      const userMsg: Message = {
        id: crypto.randomUUID(),
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
      const { error: msgErr } = await neon
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          sender: "user",
          text: await encryptChatPayload(uid, {
            text,
            replyToText: userMsg.replyToText,
            replyToSender: userMsg.replyToSender,
          }),
        });

      if (msgErr) console.error("Error saving user message:", msgErr);

      // Reload sidebar list
      loadRecentChats(uid);
      
      // 3. Query companion response
      if (sessionId) {
        simulateBotResponse(text, updatedMessages, sessionId);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleOptionClick = (option: string) => {
    handleSendMessage(option);
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setContextSummary("");
    setSummaryMessageCount(0);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setIsHistoryOpen(false);
    }
  };

  const conversationHistoryContent = (
    <>
      <button
        onClick={startNewChat}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 mb-4 rounded-2xl bg-[#6366F1]/90 hover:bg-[#4F46E5] text-white font-bold text-sm shadow-lg shadow-[#6366F1]/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus size={16} weight="bold" />
        New check-in
      </button>

      <details className={`mb-4 rounded-2xl border p-3 ${isDarkMode ? "border-white/10 bg-white/5" : "border-indigo-100 bg-indigo-50/60"}`}>
        <summary className={`cursor-pointer list-none text-xs font-extrabold ${theme.textHeading}`}>
          <span className="flex items-center justify-between gap-3">
            Conversation memory
            <span className={`text-[10px] font-semibold ${isDarkMode ? "text-stone-400" : "text-neutral-500"}`}>Settings</span>
          </span>
        </summary>
        <div className="pt-3">
          <select
            aria-label="Conversation memory setting"
            value={contextProfile}
            onChange={(event) => {
              if (isContextProfile(event.target.value)) saveContextProfile(event.target.value);
            }}
            disabled={isContextProfileSaving}
            className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none transition focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 ${isDarkMode ? "border-white/10 bg-stone-900 text-stone-100" : "border-indigo-100 bg-white text-neutral-700"}`}
          >
            {(Object.keys(CONTEXT_PROFILES) as ContextProfile[]).map((profile) => (
              <option key={profile} value={profile}>{CONTEXT_PROFILES[profile].label}</option>
            ))}
          </select>
          <p className={`mt-2 text-[10px] leading-relaxed ${isDarkMode ? "text-stone-400" : "text-neutral-500"}`}>
            {isContextProfileSaving ? "Saving your choice…" : "Older turns stay in a compact private summary."}
          </p>
        </div>
      </details>

      <div className="flex items-baseline justify-between gap-3 mb-3 px-1">
        <div>
          <h2 className={`text-sm font-extrabold ${theme.textHeading}`}>Recent conversations</h2>
          <p className={`mt-0.5 text-[10px] ${isDarkMode ? "text-stone-400" : "text-neutral-500"}`}>
            {recentChats.length > 10 ? "Showing 10 at a time · scroll for older chats" : `${recentChats.length} ${recentChats.length === 1 ? "conversation" : "conversations"}`}
          </p>
        </div>
        <span className={`inline-flex min-w-7 h-7 items-center justify-center rounded-full text-xs font-extrabold ${isDarkMode ? "bg-indigo-400/15 text-indigo-200" : "bg-indigo-100 text-indigo-600"}`} aria-label={`${recentChats.length} conversations`}>
          {recentChats.length}
        </span>
      </div>

      <div className="max-h-[min(640px,calc(100dvh-290px))] overflow-y-auto space-y-2 pr-1 overscroll-contain scrollbar-thin" aria-label="Conversation history">
        {recentChats.length === 0 ? (
          <p className={`rounded-2xl border border-dashed p-4 text-center text-xs leading-relaxed ${isDarkMode ? "border-white/10 text-stone-400" : "border-indigo-100 text-neutral-500"}`}>
            Your check-ins will appear here.
          </p>
        ) : recentChats.map((chat, index) => (
          <div key={chat.id} className="w-full relative group animate-slide-in-item" style={{ animationDelay: `${Math.min(index, 9) * 45}ms` }}>
            <button
              onClick={() => handleLoadChat(chat.id)}
              aria-current={currentSessionId === chat.id ? "page" : undefined}
              className={`w-full min-h-15 text-left p-3 pr-10 rounded-2xl border transition duration-300 flex flex-col gap-1 shadow-sm ${
                currentSessionId === chat.id
                  ? "border-indigo-400/50 bg-indigo-500/10"
                  : "border-white/10 dark:border-white/5 bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 hover:translate-x-0.5"
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className={`text-sm font-extrabold truncate ${theme.textHeading}`}>{chat.title}</span>
                <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 shrink-0">{chat.date}</span>
              </div>
              <span className="text-xs text-neutral-500 dark:text-stone-400 line-clamp-1 truncate block max-w-full">{chat.preview}</span>
            </button>
            <button
              onClick={async (event) => {
                event.stopPropagation();
                if (window.confirm(`Delete chat "${chat.title}"?`)) await handleDeleteChat(chat.id);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
              title="Delete chat session"
              aria-label={`Delete ${chat.title}`}
            >
              <Trash size={14} weight="bold" />
            </button>
          </div>
        ))}
      </div>
    </>
  );

  if (!isAuthReady || !isChatUnlocked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f5f6ff] px-5 py-10 text-slate-900">
        <section className="w-full max-w-md rounded-3xl border border-indigo-100 bg-white p-8 shadow-xl shadow-indigo-950/5">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white" aria-hidden="true">J</div>
          {!isAuthReady ? (
            <p role="status" className="text-sm text-slate-600">Checking your secure session…</p>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Unlock your private chats</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Your chat history is encrypted on this device. Enter your account password to unlock it. Your password is used only in this browser to unlock the encryption key.</p>
              <form onSubmit={handleUnlockChat} className="mt-6 space-y-4">
                <label htmlFor="chat-unlock-password" className="block text-sm font-semibold">Account password</label>
                <input
                  id="chat-unlock-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={unlockPassword}
                  onChange={(event) => setUnlockPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                />
                <label className="flex items-start gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={rememberThisDevice}
                    onChange={(event) => setRememberThisDevice(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-indigo-600"
                  />
                  <span>Remember this device <span className="block text-xs text-slate-500">Recommended for your private device. Leave off on a shared device.</span></span>
                </label>
                {unlockError && <p role="alert" className="text-sm text-red-700">{unlockError}</p>}
                <button type="submit" disabled={isUnlocking} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-wait disabled:opacity-60">
                  {isUnlocking ? "Unlocking and securing chat history…" : "Unlock chats"}
                </button>
              </form>
              <p className="mt-5 text-xs leading-5 text-slate-500">On a new device, enter your password once to unlock your chats. A password reset cannot unlock older chats.</p>
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <div className={`h-dvh overflow-clip ${theme.bg} font-sans antialiased flex transition-colors duration-500`}>

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
      <div className="flex-1 h-full min-w-0 p-4 sm:p-6 md:p-8 flex flex-col relative overflow-clip transition-colors duration-500 pb-24 lg:pb-8">
        <BackgroundDecor isDarkMode={isDarkMode} />

        <MobileBottomNav />

        <div className="relative z-10 flex flex-1 min-h-0 gap-5">
        <section className="flex flex-1 min-w-0 min-h-0 flex-col">
        {/* Header matching dashboard theme consistency */}
        <header className="relative z-20 pb-4 border-b border-neutral-200/20 dark:border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* The same control opens a desktop sidebar or a mobile slide-over. */}
            <button
              onClick={() => setIsHistoryOpen((isOpen) => !isOpen)}
              aria-expanded={isHistoryOpen}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] ${
                isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-neutral-200/50 hover:bg-neutral-50 text-neutral-700 shadow-sm"
              }`}
              title={isHistoryOpen ? "Collapse conversation history" : "Open conversation history"}
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
              <div ref={messagesScrollRef} className="flex-1 overflow-y-auto px-1 pt-4 pb-4 space-y-6 scrollbar-none">
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
                    {msg.sender === "bot" && msg.text && (
                      <div className="flex items-center gap-1 px-1" aria-label="Rate this response">
                        <button
                          type="button"
                          onClick={() => submitFeedback(msg.id, 1)}
                          className={`p-1.5 rounded-full transition ${msg.feedback === 1 ? "text-emerald-500 bg-emerald-500/10" : "text-neutral-400 hover:text-emerald-500 hover:bg-emerald-500/10"}`}
                          title="Helpful response"
                          aria-label="Helpful response"
                        >
                          <ThumbsUp size={14} weight={msg.feedback === 1 ? "fill" : "regular"} />
                        </button>
                        <button
                          type="button"
                          onClick={() => submitFeedback(msg.id, -1)}
                          className={`p-1.5 rounded-full transition ${msg.feedback === -1 ? "text-rose-500 bg-rose-500/10" : "text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10"}`}
                          title="Unhelpful response"
                          aria-label="Unhelpful response"
                        >
                          <ThumbsDown size={14} weight={msg.feedback === -1 ? "fill" : "regular"} />
                        </button>
                      </div>
                    )}
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

        </section>

        {/* Desktop: a real secondary sidebar that can collapse without covering the chat. */}
        <aside
          id="conversation-history-desktop"
          aria-label="Conversation history"
          className={`hidden lg:flex min-h-0 shrink-0 flex-col overflow-hidden rounded-[1.75rem] border backdrop-blur-2xl transition-[width,opacity,padding] duration-300 ease-out ${
            isHistoryOpen
              ? `w-88 p-5 opacity-100 ${isDarkMode ? "border-white/10 bg-stone-900/35" : "border-white/70 bg-white/65 shadow-[0_18px_55px_rgba(99,102,241,0.12)]"}`
              : "w-0 border-transparent p-0 opacity-0"
          }`}
        >
          {isHistoryOpen && (
            <>
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className={`text-lg font-extrabold tracking-tight ${theme.textHeading}`}>Your conversations</span>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition" aria-label="Collapse conversation history">
                  <X size={18} weight="bold" />
                </button>
              </div>
              {conversationHistoryContent}
            </>
          )}
        </aside>

        {/* Mobile: the same history becomes an accessible slide-over. */}
        {isHistoryOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <button onClick={() => setIsHistoryOpen(false)} className="absolute inset-0 w-full h-full bg-black/30 backdrop-blur-xs animate-backdrop-fade" aria-label="Close conversation history" />
            <aside id="conversation-history-mobile" className={`absolute top-0 bottom-0 left-0 w-84 max-w-[88vw] overflow-y-auto p-5 shadow-2xl animate-slide-in-left ${isDarkMode ? "bg-stone-950 border-r border-white/10" : "bg-white border-r border-indigo-100"}`} aria-label="Conversation history">
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className={`text-lg font-extrabold tracking-tight ${theme.textHeading}`}>Your conversations</span>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition" aria-label="Close conversation history">
                  <X size={18} weight="bold" />
                </button>
              </div>
              {conversationHistoryContent}
            </aside>
          </div>
        )}

        </div>
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
  const blocks: Array<{
    type: "heading" | "bullet" | "number" | "rule" | "table" | "paragraph";
    lines: string[];
    level?: number;
  }> = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "---") {
      blocks.push({ type: "rule", lines: [line] });
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({ type: "heading", lines: [line], level: headingMatch[1].length });
      i++;
      continue;
    }

    // Bullet points
    const bulletMatch = line.match(/^[\*\-\+]\s+(.*)$/);
    if (bulletMatch) {
      blocks.push({ type: "bullet", lines: [line] });
      i++;
      continue;
    }

    // Numbered lists
    const numberMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      blocks.push({ type: "number", lines: [line] });
      i++;
      continue;
    }

    // Table detection: starts with '|' and ends with '|'
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines = [line];
      i++;
      // Gather consecutive lines that start with '|' and end with '|'
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      // Verify if there is a separator row (e.g., |---| or | :--- |)
      const hasSeparator = tableLines.some(l => l.includes("---"));
      if (hasSeparator) {
        blocks.push({ type: "table", lines: tableLines });
        continue;
      } else {
        // If not a real table, backtrack to handle them as paragraphs
        i -= (tableLines.length - 1);
      }
    }

    // Default: Paragraph
    blocks.push({ type: "paragraph", lines: [line] });
    i++;
  }

  // Render the blocks
  return blocks.map((block, blockIdx) => {
    switch (block.type) {
      case "rule":
        return <hr key={blockIdx} className="my-3 border-t border-neutral-200/20" />;

      case "heading": {
        const level = block.level || 3;
        const headingMatch = block.lines[0].match(/^(#{1,6})\s+(.*)$/);
        const content = headingMatch ? headingMatch[2] : block.lines[0];
        const headingClass = level === 1 ? "text-xl font-black my-2 block" 
                             : level === 2 ? "text-lg font-extrabold my-2 block"
                             : "text-sm font-bold my-1.5 uppercase tracking-wide block";
        return (
          <span key={blockIdx} className={headingClass}>
            {parseInlineMarkdown(content)}
          </span>
        );
      }

      case "bullet": {
        const bulletMatch = block.lines[0].match(/^[\*\-\+]\s+(.*)$/);
        const content = bulletMatch ? bulletMatch[1] : block.lines[0];
        return (
          <ul key={blockIdx} className="list-disc pl-5 my-1 text-sm sm:text-base leading-relaxed">
            <li>{parseInlineMarkdown(content)}</li>
          </ul>
        );
      }

      case "number": {
        const numberMatch = block.lines[0].match(/^\d+\.\s+(.*)$/);
        const content = numberMatch ? numberMatch[1] : block.lines[0];
        return (
          <ol key={blockIdx} className="list-decimal pl-5 my-1 text-sm sm:text-base leading-relaxed">
            <li>{parseInlineMarkdown((numberMatch && numberMatch[1]) || content)}</li>
          </ol>
        );
      }

      case "table": {
        // Parse rows
        const parsedRows = block.lines
          .map(l => {
            const parts = l.split("|").map(p => p.trim());
            if (parts[0] === "") parts.shift();
            if (parts[parts.length - 1] === "") parts.pop();
            return parts;
          })
          .filter(row => !row.every(cell => /^:?-+:?$/.test(cell)));

        if (parsedRows.length === 0) return null;

        const headers = parsedRows[0];
        const bodyRows = parsedRows.slice(1);

        return (
          <div key={blockIdx} className="overflow-x-auto my-3 rounded-xl border border-neutral-200/20 dark:border-white/5 shadow-sm">
            <table className="min-w-full divide-y divide-neutral-200/20 dark:divide-white/5 text-xs sm:text-sm text-left">
              <thead className="bg-neutral-100/50 dark:bg-white/5 font-extrabold text-neutral-800 dark:text-neutral-200">
                <tr>
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-4 py-2 border-r last:border-r-0 border-neutral-200/20 dark:border-white/5">
                      {parseInlineMarkdown(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/10 dark:divide-white/5">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-neutral-100/30 dark:hover:bg-white/[0.02] transition">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2 border-r last:border-r-0 border-neutral-200/10 dark:border-white/5">
                        {parseInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case "paragraph":
      default:
        return (
          <p key={blockIdx} className="mb-2 leading-relaxed text-sm sm:text-base">
            {parseInlineMarkdown(block.lines[0])}
          </p>
        );
    }
  });
}
