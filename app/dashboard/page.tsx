"use client";

import { cloneElement, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChatCircleDots,
  Notebook,
  ClockCounterClockwise,
  SignOut,
  Sparkle,
  ArrowRight,
  CaretRight,
  ShieldCheck,
  MoonStars,
  Sun,
  SunDim,
  SunHorizon,
  Moon,
  Star,
  Quotes,
  CalendarBlank,
  Clock,
  CheckCircle,
  List,
  X,
  SquaresFour,
  GearSix,
  CaretLineLeft,
  CaretLineRight,
  PencilSimple,
  User,
  TrendUp,
  Files
} from "@phosphor-icons/react";
import JournalIllustration from "./JournalIllustration";
import MoodEntryModal, { type MoodEntryPayload, type ModalInitialEntry } from "./MoodEntryModal";
import { HappyEmoji, GoodEmoji, OkayEmoji, SadEmoji } from "./ResponsiveAssets";
import AppSidebar, { MobileBottomNav, BackgroundDecor } from "../components/AppSidebar";
import InteractiveLiquidOrb from "../components/InteractiveLiquidOrb";
import { useAppTheme } from "../components/useAppTheme";
import { supabase } from "../lib/supabaseClient";

const THEME_STORAGE_KEY = "jomluah-theme";
const SIDEBAR_COLLAPSED_KEY = "jomluah-sidebar-collapsed";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/chat", label: "Companion AI", icon: ChatCircleDots },
  { href: "/journal", label: "Idea Board", icon: Notebook },
  { href: "/memories", label: "Memories", icon: ClockCounterClockwise },
];

type JournalEntry = {
  id: number | string;
  timestamp: number;
  title: string;
  mood: string;
  excerpt: string;
  tags: string[];
  favorite: boolean;
  isNew?: boolean;
  images?: string[];
};

const initialEntries: JournalEntry[] = [];

const getLocalDateString = (timestamp: number) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
};

const calculateStreak = (entries: JournalEntry[]): number => {
  if (entries.length === 0) return 0;
  const loggedDates = Array.from(new Set(entries.map(e => getLocalDateString(e.timestamp))))
    .sort((a, b) => b.localeCompare(a));
  if (loggedDates.length === 0) return 0;
  const todayStr = getLocalDateString(Date.now());
  const getYesterdayStr = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00+08:00");
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d.getTime());
  };
  const yesterdayStr = getYesterdayStr(todayStr);
  const newestLogged = loggedDates[0];
  if (newestLogged !== todayStr && newestLogged !== yesterdayStr) {
    return 0;
  }
  let currentStreak = 0;
  let checkDate = newestLogged;
  while (true) {
    if (loggedDates.includes(checkDate)) {
      currentStreak++;
      checkDate = getYesterdayStr(checkDate);
    } else {
      break;
    }
  }
  return currentStreak;
};


const formatEntryDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en-MY", { timeZone: "Asia/Kuala_Lumpur", month: "long", day: "numeric" }).format(timestamp);

const formatEntryTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en-MY", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", minute: "2-digit", hour12: true }).format(timestamp);

const dailyQuotes = [
  { text: "Calmness is the cradle of power.", author: "Josiah Gilbert Holland" },
  { text: "Small steps every day lead to big changes.", author: "Danielle Koepke" },
  { text: "Your feelings are valid, even on the hard days.", author: "Unknown" },
  { text: "Write it down — even the messy thoughts deserve a page.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Confucius" },
  { text: "Be gentle with yourself today.", author: "Unknown" },
  { text: "Every entry brings you closer to understanding yourself.", author: "Unknown" },
  { text: "The present moment is the only one that truly matters.", author: "Thich Nhat Hanh" },
];

const getMoodCardBg = (moodName: string, isDarkMode: boolean) => {
  const baseClass = "backdrop-blur-md transition-all duration-300 border hover:scale-[1.02]";
  if (isDarkMode) {
    switch (moodName) {
      case "Happy":
        return `${baseClass} bg-[#1c1917]/70 border-amber-500/20 shadow-[0_8px_30px_rgba(245,158,11,0.08)] hover:shadow-[0_8px_35px_rgba(245,158,11,0.22)] hover:border-amber-500/40`;
      case "Good":
        return `${baseClass} bg-[#14221d]/70 border-emerald-500/20 shadow-[0_8px_30px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_35px_rgba(16,185,129,0.22)] hover:border-emerald-500/40`;
      case "Okay":
        return `${baseClass} bg-[#131e24]/70 border-sky-500/20 shadow-[0_8px_30px_rgba(14,165,233,0.08)] hover:shadow-[0_8px_35px_rgba(14,165,233,0.22)] hover:border-sky-500/40`;
      case "Sad":
        return `${baseClass} bg-[#18192b]/70 border-indigo-500/20 shadow-[0_8px_30px_rgba(99,102,241,0.08)] hover:shadow-[0_8px_35px_rgba(99,102,241,0.22)] hover:border-indigo-500/40`;
      default:
        return "bg-stone-900/80 border-white/5 shadow-2xl";
    }
  } else {
    switch (moodName) {
      case "Happy":
        return `${baseClass} bg-white/75 border-amber-200/60 shadow-[0_8px_30px_rgba(245,158,11,0.06)] hover:shadow-[0_8px_35px_rgba(245,158,11,0.18)] hover:border-amber-300`;
      case "Good":
        return `${baseClass} bg-white/75 border-emerald-200/60 shadow-[0_8px_30px_rgba(16,185,129,0.06)] hover:shadow-[0_8px_35px_rgba(16,185,129,0.18)] hover:border-emerald-300`;
      case "Okay":
        return `${baseClass} bg-white/75 border-sky-200/60 shadow-[0_8px_30px_rgba(14,165,233,0.06)] hover:shadow-[0_8px_35px_rgba(14,165,233,0.18)] hover:border-sky-300`;
      case "Sad":
        return `${baseClass} bg-white/75 border-indigo-200/60 shadow-[0_8px_30px_rgba(99,102,241,0.06)] hover:shadow-[0_8px_35px_rgba(99,102,241,0.18)] hover:border-indigo-300`;
      default:
        return "bg-white border-neutral-200/50 shadow-md";
    }
  }
};

export default function StudentDashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDarkMode, setIsDarkMode, isSidebarCollapsed, setIsSidebarCollapsed, theme } = useAppTheme();
  const [activeMood, setActiveMood] = useState("Good");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>(initialEntries);
  const [quotesList, setQuotesList] = useState<{ text: string; author: string }[]>(dailyQuotes);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<number | string | null>(null);
  const [modalReadOnly, setModalReadOnly] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>("there");
  const [isLoading, setIsLoading] = useState(true);

  // Selected date states (for mock weekly calendar view)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.getDate().toString().padStart(2, "0");
  });
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);

  // Device-type detection state
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Dynamic weekDays generator based on Asia/Kuala_Lumpur
  const weekDays = useMemo(() => {
    const currentDate = now || new Date();
    const currentDay = currentDate.getDay(); // 0 is Sunday, 1 is Mon...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + distanceToMonday);

    const temp = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayStr = day.getDate().toString().padStart(2, "0");
      const dateStr = getLocalDateString(day.getTime());
      temp.push({
        name: day.toLocaleDateString("en-US", { weekday: "short" }),
        day: dayStr,
        dateStr: dateStr
      });
    }
    return temp;
  }, [now]);

  const handleDateClick = (dayStr: string) => {
    setSelectedDate(dayStr);
    const found = weekDays.find((d) => d.day === dayStr);
    if (found) {
      const parts = found.dateStr.split("-");
      const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
      setSelectedTimestamp(dateObj.getTime());
    } else {
      const dateNum = Number(dayStr);
      // Set timestamp for June [dateNum], 2026 at 12:00 PM
      const newTimestamp = new Date(2026, 5, dateNum, 12, 0, 0).getTime();
      setSelectedTimestamp(newTimestamp);
    }
    
    // Auto trigger new mood log for selected date
    handleMoodSelect(activeMood);
  };

  // Load entries from Supabase on mount — authenticated users only
  useEffect(() => {
    const fetchUserAndEntries = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      setUser(session.user);
      // Derive display name: prefer full_name metadata, fallback to email prefix
      const meta = session.user.user_metadata;
      const name =
        meta?.full_name ||
        meta?.name ||
        session.user.email?.split("@")[0] ||
        "there";
      setDisplayName(name);
      // Fetch real entries from DB — empty array if none yet
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("timestamp", { ascending: false });
      if (!error && data) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          timestamp: new Date(d.timestamp).getTime(),
          title: d.title,
          mood: d.mood,
          excerpt: d.excerpt,
          tags: d.tags || [],
          favorite: d.favorite,
          images: d.images || [],
        }));
        setRecentEntries(mapped);
      }

      // Fetch dynamic quotes from database
      const { data: dbQuotes, error: qErr } = await supabase
        .from("daily_quotes")
        .select("text, author");
      if (!qErr && dbQuotes && dbQuotes.length > 0) {
        setQuotesList(dbQuotes);
      }
      setIsLoading(false);
    };
    fetchUserAndEntries();
  }, []);


  // User-Agent & Width Device type detection
  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent || "";
      const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = mobileRegex.test(ua);
      const isNarrowWidth = window.innerWidth < 768;
      setIsMobileDevice(isMobileUA || isNarrowWidth);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Live clock
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss the toast
  useEffect(() => {
    if (!savedToast) return;
    const timeout = setTimeout(() => setSavedToast(null), 4000);
    return () => clearTimeout(timeout);
  }, [savedToast]);

  // Handle auto-open journal log from search param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("newJournal") === "true") {
      const selectedMood = params.get("mood") || "Good";
      handleMoodSelect(selectedMood);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [recentEntries]);

  const moods = [
    { name: "Happy", icon: <HappyEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-amber-300 to-orange-400" },
    { name: "Good", icon: <GoodEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-emerald-300 to-teal-400" },
    { name: "Okay", icon: <OkayEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-sky-300 to-cyan-400" },
    { name: "Sad", icon: <SadEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-blue-300 to-indigo-400" },
  ];

  const malaysiaHour = now
    ? Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", hourCycle: "h23" }).format(now))
    : null;

  const greeting =
    malaysiaHour === null ? "Hello"
    : malaysiaHour < 4 ? "Good night"
    : malaysiaHour < 12 ? "Good morning"
    : malaysiaHour < 18 ? "Good afternoon"
    : malaysiaHour < 22 ? "Good evening"
    : "Good night";

  const GreetingIcon =
    malaysiaHour === null ? Sparkle
    : malaysiaHour < 4 ? MoonStars
    : malaysiaHour < 12 ? SunDim
    : malaysiaHour < 18 ? Sun
    : malaysiaHour < 22 ? SunHorizon
    : MoonStars;

  const malaysiaDateLabel = now
    ? new Intl.DateTimeFormat("en-MY", { timeZone: "Asia/Kuala_Lumpur", weekday: "long", day: "numeric", month: "long" }).format(now)
    : "";

  const malaysiaTimeLabel = now
    ? new Intl.DateTimeFormat("en-MY", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", minute: "2-digit", hour12: true }).format(now)
    : "--:--";

  const getWeeklyStats = () => {
    if (recentEntries.length === 0) {
      return { dominantMood: "None", streak: 0, weeklyLogsCount: 0 };
    }

    const currentWeekDatesStr = weekDays.map(w => w.dateStr);
    const weeklyEntries = recentEntries.filter(e => currentWeekDatesStr.includes(getLocalDateString(e.timestamp)));

    const moodCounts: Record<string, number> = {};
    weeklyEntries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    let dominantMood = "Good";
    let maxCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    });

    const streak = calculateStreak(recentEntries);
    const weeklyLogsCount = new Set(weeklyEntries.map(e => getLocalDateString(e.timestamp))).size;

    return { dominantMood, streak, weeklyLogsCount };
  };

  const { dominantMood, streak } = getWeeklyStats();

  const getThrowbackEntry = () => {
    if (recentEntries.length === 0) return null;
    const nowMs = Date.now();
    const oneMonthAgo = nowMs - 30 * 24 * 60 * 60 * 1000;
    const oneYearAgo = nowMs - 365 * 24 * 60 * 60 * 1000;
    const sorted = [...recentEntries].sort((a, b) => {
      const distA = Math.min(Math.abs(a.timestamp - oneYearAgo), Math.abs(a.timestamp - oneMonthAgo));
      const distB = Math.min(Math.abs(b.timestamp - oneYearAgo), Math.abs(b.timestamp - oneMonthAgo));
      return distA - distB;
    });
    return sorted[0];
  };
  const throwbackEntry = getThrowbackEntry();

  const todayQuote = useMemo(() => {
    if (quotesList.length === 0) return { text: "Calmness is the cradle of power.", author: "Josiah Gilbert Holland" };
    const todayStr = getLocalDateString(now ? now.getTime() : Date.now());
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % quotesList.length;
    return quotesList[index];
  }, [quotesList, now]);
  const activeMoodObj = moods.find((m) => m.name === activeMood) ?? null;
  const editingEntry = editingEntryId !== null ? recentEntries.find((entry) => entry.id === editingEntryId) ?? null : null;

  const modalInitialEntry: ModalInitialEntry | null = editingEntry
    ? {
        title: editingEntry.title,
        tags: editingEntry.tags,
        description: editingEntry.excerpt,
        images: editingEntry.images ?? [],
        timestamp: editingEntry.timestamp,
      }
    : selectedTimestamp
      ? {
          title: "",
          tags: [],
          description: "",
          images: [],
          timestamp: selectedTimestamp,
        }
      : null;

  const handleMoodSelect = (name: string) => {
    setActiveMood(name);
    setEditingEntryId(null);
    setModalReadOnly(false);
    setMoodModalOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setActiveMood(entry.mood);
    setEditingEntryId(entry.id);
    setSelectedTimestamp(entry.timestamp);
    setModalReadOnly(false);
    setMoodModalOpen(true);
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setActiveMood(entry.mood);
    setEditingEntryId(entry.id);
    setSelectedTimestamp(entry.timestamp);
    setModalReadOnly(true);
    setMoodModalOpen(true);
  };

  const handleMoodSubmit = async (entry: MoodEntryPayload, action: "save" | "continue") => {
    const title = entry.title.trim() || `Feeling ${entry.mood}`;

    if (user) {
      if (editingEntryId !== null) {
        const { error } = await supabase
          .from("journal_entries")
          .update({
            timestamp: new Date(entry.timestamp).toISOString(),
            title,
            mood: entry.mood,
            excerpt: entry.description.trim() || "No additional notes for this entry.",
            tags: entry.tags,
            images: entry.images,
          })
          .eq("id", editingEntryId);

        if (!error) {
          setRecentEntries((prev) =>
            prev.map((existing) =>
              existing.id === editingEntryId
                ? {
                    ...existing,
                    timestamp: entry.timestamp,
                    title,
                    mood: entry.mood,
                    excerpt: entry.description.trim() || "No additional notes for this entry.",
                    tags: entry.tags,
                    images: entry.images,
                  }
                : existing
            )
          );
          if (action === "continue") {
            router.push(`/chat?entryId=${editingEntryId}`);
          }
        }
      } else {
        const { data, error } = await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            timestamp: new Date(selectedTimestamp || entry.timestamp).toISOString(),
            title,
            mood: entry.mood,
            excerpt: entry.description.trim() || "No additional notes for this entry.",
            tags: entry.tags,
            images: entry.images,
            favorite: false,
          })
          .select()
          .single();

        if (!error && data) {
          const newEntry: JournalEntry = {
            id: data.id,
            timestamp: new Date(data.timestamp).getTime(),
            title: data.title,
            mood: data.mood,
            excerpt: data.excerpt,
            tags: data.tags || [],
            favorite: data.favorite,
            isNew: true,
            images: data.images || [],
          };
          setRecentEntries((prev) => [newEntry, ...prev]);
          if (action === "continue") {
            router.push(`/chat?entryId=${data.id}`);
          }
        }
      }
    } else {
      if (editingEntryId !== null) {
        setRecentEntries((prev) =>
          prev.map((existing) =>
            existing.id === editingEntryId
              ? {
                  ...existing,
                  timestamp: entry.timestamp,
                  title,
                  mood: entry.mood,
                  excerpt: entry.description.trim() || "No additional notes for this entry.",
                  tags: entry.tags,
                  images: entry.images,
                }
              : existing
          )
        );
      } else {
        const newEntry: JournalEntry = {
          id: Date.now(),
          timestamp: selectedTimestamp || entry.timestamp,
          title,
          mood: entry.mood,
          excerpt: entry.description.trim() || "No additional notes for this entry.",
          tags: entry.tags,
          favorite: false,
          isNew: true,
          images: entry.images,
        };
        setRecentEntries((prev) => [newEntry, ...prev]);
        if (action === "continue") {
          router.push(`/chat?mood=${entry.mood}&desc=${encodeURIComponent(entry.description)}`);
        }
      }
    }

    setMoodModalOpen(false);
    setEditingEntryId(null);
    setSelectedTimestamp(null);
    if (action === "save") setSavedToast(`"${title}" saved`);
  };

  const handleDeleteEntry = async () => {
    if (editingEntryId === null) return;
    
    if (user) {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", editingEntryId);
        
      if (!error) {
        setRecentEntries((prev) => prev.filter((entry) => entry.id !== editingEntryId));
        setSavedToast("Entry deleted successfully");
      } else {
        console.error("Failed to delete entry:", error);
      }
    } else {
      setRecentEntries((prev) => prev.filter((entry) => entry.id !== editingEntryId));
      setSavedToast("Entry deleted successfully");
    }
    
    setMoodModalOpen(false);
    setEditingEntryId(null);
    setSelectedTimestamp(null);
  };

  const navLinkClass = (isActive: boolean, collapsed: boolean) => `group flex items-center gap-3 rounded-xl text-sm transition ${
    collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
  } ${
    isActive
      ? "bg-[#6366F1]/10 text-[#6366F1] font-bold"
      : `font-medium ${isDarkMode ? "text-neutral-400 hover:bg-white/5 hover:text-white" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"}`
  }`;

  const renderNavLinks = (collapsed: boolean) => navItems.map(({ href, label, icon: Icon }) => (
    <Link
      key={href}
      href={href}
      onClick={() => setIsSidebarOpen(false)}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={navLinkClass(pathname === href, collapsed)}
    >
      <Icon weight="duotone" className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" /> {!collapsed && label}
    </Link>
  ));

  const renderFooterLinks = (collapsed: boolean) => (
    <div className="space-y-2 pt-6 border-t border-neutral-200/20">
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        title={collapsed ? (isDarkMode ? "Switch to light mode" : "Switch to dark mode") : undefined}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        className={`group flex items-center gap-3 rounded-lg text-sm font-medium transition w-full ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"} ${
          isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        {isDarkMode
          ? <Sun weight="duotone" className="w-4 h-4 shrink-0 transition-transform duration-500 group-hover:rotate-90" />
          : <Moon weight="duotone" className="w-4 h-4 shrink-0 transition-transform duration-500 group-hover:-rotate-12" />}
        {!collapsed && (isDarkMode ? "Light mode" : "Dark mode")}
      </button>
      <Link
        href="/settings"
        title={collapsed ? "Settings" : undefined}
        aria-label={collapsed ? "Settings" : undefined}
        className={`group flex items-center gap-3 rounded-lg text-sm font-medium transition ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"} ${
          isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        <GearSix weight="duotone" className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" /> {!collapsed && "Settings"}
      </Link>
      <Link
        href="/"
        title={collapsed ? "Logout" : undefined}
        aria-label={collapsed ? "Logout" : undefined}
        className={`group flex items-center gap-3 rounded-lg text-rose-500 hover:text-rose-700 text-sm font-bold transition ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"}`}
      >
        <SignOut weight="duotone" className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" /> {!collapsed && "Logout"}
      </Link>
    </div>
  );

  // =================================================================================
  // MOBILE VIEW - Rendered only for mobile devices detected via User-Agent/Width
  // =================================================================================
  if (isMobileDevice) {
    return (
      <div className={`min-h-screen ${theme.bg} font-sans antialiased flex flex-col relative overflow-hidden pb-28`}>
        {/* Top Curved Gradient Panel (Original Indigo/Blue Theme) */}
        <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white pt-6 pb-20 px-6 rounded-b-[40px] shadow-lg relative">
          
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 100 100" className="w-6 h-6 text-white shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <clipPath id="orb-clip">
                    <circle cx="50" cy="50" r="41" />
                  </clipPath>
                </defs>
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
                <g clipPath="url(#orb-clip)">
                  <path d="M12 55 C 30 40, 45 70, 88 55 L 88 94 L 12 94 Z" fill="currentColor" opacity="0.2" />
                  <path d="M10 65 C 35 55, 60 75, 90 60 L 90 94 L 10 94 Z" fill="currentColor" opacity="0.4" />
                </g>
                <ellipse cx="40" cy="30" rx="10" ry="5" fill="currentColor" transform="rotate(-30 40 30)" opacity="0.8" />
              </svg>
              <span className="text-xl font-bold tracking-tight">JomLuah</span>
            </div>



            {/* Right side controls: Logout + Profile */}
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  document.cookie = "jl_ob=; path=/; max-age=0; SameSite=Lax";
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/25 hover:border-rose-500/35 hover:text-rose-200 text-white transition-all shrink-0 flex items-center justify-center border border-white/10"
                aria-label="Logout"
              >
                <SignOut weight="duotone" className="w-5 h-5" />
              </button>
              <button
                aria-label="User Profile"
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 flex items-center justify-center border border-white/10"
              >
                <User weight="bold" className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-12 text-left">
            <h1 className="text-3xl font-extrabold tracking-tight">Today</h1>
            <span className="text-xs font-bold uppercase tracking-widest text-white/70 block mt-1">
              {malaysiaDateLabel || "SATURDAY, JUNE 13"}
            </span>
          </div>

          {/* Weekly date strip - Circular bubble designs */}
          <div className="mt-8 flex justify-between items-center bg-white/10 backdrop-blur-md rounded-full p-2.5 border border-white/5 gap-1.5 overflow-x-auto scrollbar-none">
            {weekDays.map((day) => {
              const isSelected = day.day === selectedDate;
              return (
                <button
                  key={day.day}
                  onClick={() => handleDateClick(day.day)}
                  className={`w-11 h-11 rounded-full flex flex-col justify-center items-center transition-all duration-300 hover:scale-110 shrink-0 ${
                    isSelected
                      ? "bg-white/20 text-white font-extrabold border border-white/25 shadow-inner"
                      : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className="text-[8px] font-bold uppercase tracking-wider">{day.name}</span>
                  <span className="text-xs font-extrabold mt-0.5">{day.day}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Original Dashboard Content Cards Styled for Mobile */}
        <div className="px-6 -mt-10 space-y-6 relative z-10 text-left">
          
          {/* How are you feeling? Mood Selector (Original) */}
          <div className={`${theme.card} rounded-3xl p-5 relative overflow-hidden`}>
            {isDarkMode && <div aria-hidden="true" className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />}
            <span className={`text-xs font-bold uppercase tracking-wider block text-left mb-4 ${theme.textMuted}`}>How are you feeling?</span>
            <div className="grid grid-cols-4 gap-2">
              {moods.map((mood) => {
                const isActive = activeMood === mood.name;
                return (
                  <button
                    key={mood.name}
                    onClick={() => handleMoodSelect(mood.name)}
                    className={`group flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-md ${
                      isActive
                        ? `bg-[#6366F1]/10 border-[#6366F1] ${isDarkMode ? "text-white" : "text-[#6366F1]"} shadow-md`
                        : `${isDarkMode ? "bg-white/2 border-white/5 text-neutral-400 hover:border-white/10 hover:text-white" : "bg-neutral-50 border-neutral-200/50 text-neutral-600 hover:bg-neutral-100 hover:text-black"}`
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">
                      {mood.icon}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 tracking-wide ${isActive ? (isDarkMode ? "text-white" : "text-[#6366F1]") : (isDarkMode ? "text-stone-400" : "text-neutral-500")}`}>
                      {mood.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quote of the Day Card */}
          <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 min-h-[200px] shadow-lg shadow-[#6366F1]/20 border-none">
            {/* Ambient glows inside the card */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-4 relative z-10 text-center w-full my-auto">
              <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block bg-white/20 border border-white/25 text-white">
                Quote of the Day
              </span>
              
              <div className="flex flex-col items-center justify-center">
                <p className="text-2xl leading-relaxed text-white font-bold transition-all duration-300 drop-shadow-sm">
                  &ldquo;{todayQuote.text}&rdquo;
                </p>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-2 block text-indigo-100">
                  — {todayQuote.author} —
                </span>
                <p className="text-[10px] text-indigo-200/90 font-light mt-3 leading-relaxed max-w-xs mx-auto">
                  Take a deep breath and let this message guide your thoughts as you journal today.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Entries List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${theme.textMuted}`}>Recent Entries</h3>
              <Link href="/memories" className="text-[#6366F1] text-xs font-bold hover:underline flex items-center gap-1">
                View All <CaretRight weight="bold" className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`relative rounded-3xl p-5 flex flex-col justify-between h-40 border animate-pulse ${
                      isDarkMode ? "bg-stone-900/40 border-white/5" : "bg-neutral-50 border-neutral-200"
                    }`}>
                      <div className="space-y-3">
                        <div className="h-3 w-24 bg-neutral-300 dark:bg-stone-700 rounded-full" />
                        <div className="h-6 w-3/4 bg-neutral-300 dark:bg-stone-700 rounded-full" />
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-neutral-300 dark:bg-stone-700 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : recentEntries.length === 0 ? (
                <div className={`p-6 rounded-3xl border text-center text-sm font-semibold ${isDarkMode ? "bg-stone-900/40 border-white/5 text-stone-400" : "bg-neutral-50 border-neutral-200 text-neutral-500"}`}>
                  no entry added so far
                </div>
              ) : (
                recentEntries.slice(0, 3).map((entry) => {
                  const entryMood = moods.find((m) => m.name === entry.mood);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => handleViewEntry(entry)}
                      className={`${getMoodCardBg(entry.mood, isDarkMode)} relative p-5 rounded-3xl shadow-md flex flex-col justify-between text-left cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border`}
                    >
                      <div className="space-y-3">
                        {/* Top Row: Date & Time, Edit Button and Emoji */}
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-neutral-400 dark:text-stone-400 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
                            <CalendarBlank weight="duotone" className="w-3.5 h-3.5 text-[#6366F1]" /> {formatEntryDate(entry.timestamp)}
                            <span className="opacity-30">•</span>
                            <Clock weight="duotone" className="w-3.5 h-3.5 text-[#6366F1]" /> {formatEntryTime(entry.timestamp)}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0 -mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEntry(entry);
                              }}
                              aria-label="Edit entry"
                              className={`p-1.5 rounded-full border transition ${
                                isDarkMode
                                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white"
                                  : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                              }`}
                            >
                              <PencilSimple weight="bold" className="w-3 h-3" />
                            </button>
                            {entryMood && (
                              <span className="w-8 h-8 flex items-center justify-center">
                                {entryMood.icon}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Middle: Title */}
                        <h4 className="text-xl font-extrabold text-neutral-800 dark:text-white font-journal pr-2">
                          {entry.title}
                        </h4>
                        
                        {/* Bottom: Excerpt */}
                        <p className="text-xs text-neutral-500 dark:text-stone-400 line-clamp-2 leading-relaxed pr-12">
                          {entry.excerpt}
                        </p>
                      </div>
                      {entry.images && entry.images.length > 0 && (
                        <div className={`absolute -bottom-3 -right-3 w-14 h-14 p-1 pb-2.5 rotate-6 rounded-sm shadow-md z-20 ${isDarkMode ? "bg-stone-800" : "bg-white"}`}>
                          <img src={entry.images[0]} alt="" className="w-full h-full object-cover rounded-sm" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Weekly Mood Spectrum & Memory Lane (Dynamic) */}
          <div className="grid grid-cols-1 gap-6 pb-6">
            <div className={`${theme.card} rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider block ${theme.textMuted}`}>Weekly Mood Spectrum</h3>
              <p className={`text-xs leading-relaxed font-light mt-2 ${theme.textMuted}`}>
                Check your consistency and streaks this week.
              </p>
              
              <div className="flex items-end gap-2.5 pt-4 h-16 justify-between">
                {weekDays.map((wd, idx) => {
                  const entry = recentEntries.find(e => getLocalDateString(e.timestamp) === wd.dateStr);
                  
                  let heightClass = "h-3";
                  let bgClass = isDarkMode ? "bg-white/10" : "bg-neutral-200";
                  let shadowClass = "";
                  let moodLabel = "No Log";

                  if (entry) {
                    moodLabel = entry.mood;
                    switch (entry.mood) {
                      case "Happy":
                        heightClass = "h-14";
                        bgClass = "bg-amber-400 dark:bg-amber-500";
                        shadowClass = "shadow-[0_0_8px_rgba(245,158,11,0.25)]";
                        break;
                      case "Good":
                        heightClass = "h-11";
                        bgClass = "bg-emerald-400 dark:bg-emerald-500";
                        shadowClass = "shadow-[0_0_8px_rgba(16,185,129,0.25)]";
                        break;
                      case "Okay":
                        heightClass = "h-8";
                        bgClass = "bg-sky-400 dark:bg-sky-500";
                        shadowClass = "shadow-[0_0_8px_rgba(14,165,233,0.25)]";
                        break;
                      case "Sad":
                        heightClass = "h-5";
                        bgClass = "bg-indigo-400 dark:bg-indigo-500";
                        shadowClass = "shadow-[0_0_8px_rgba(99,102,241,0.25)]";
                        break;
                    }
                  }

                  return (
                    <div key={wd.dateStr} className="flex flex-col items-center gap-1 relative group">
                      <div className={`absolute bottom-full mb-1.5 px-2 py-1 rounded-lg bg-stone-900/95 dark:bg-stone-950/95 text-white text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none z-30 shadow-md border border-white/5 flex flex-col items-start ${
                        idx === 0 
                          ? "left-0 translate-x-0" 
                          : idx === 6 
                            ? "right-0 left-auto translate-x-0" 
                            : "left-1/2 -translate-x-1/2"
                      }`}>
                        <span className="font-bold opacity-80">{wd.name}</span>
                        <span className="font-extrabold">{moodLabel}</span>
                      </div>
                      <div className={`w-3.5 rounded-full transition-all duration-300 ${heightClass} ${bgClass} ${shadowClass} cursor-pointer`} />
                      <span className="text-[8px] font-bold text-neutral-400 dark:text-stone-500">{wd.name[0]}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-200/10 mt-3 text-left">
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 dark:text-stone-500 uppercase tracking-widest block">Dominant Mood</span>
                  <span className={`text-xs font-bold mt-0.5 block ${theme.textHeading}`}>{dominantMood}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 dark:text-stone-500 uppercase tracking-widest block">Streak</span>
                  <span className={`text-xs font-bold mt-0.5 block ${theme.textHeading}`}>{streak} Days</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Bottom Navigation */}
        <MobileBottomNav onNewEntry={() => handleMoodSelect(activeMood)} />

        {/* Mobile Sidebar Menu */}
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <div onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
          <aside className={`absolute left-0 top-0 bottom-0 w-72 ${theme.sidebar} p-6 flex flex-col justify-between transition-transform duration-300 transform shadow-2xl ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <span className={`text-xl font-bold tracking-tight ${theme.textHeading}`}>JomLuah</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg border">
                  <X weight="bold" className="w-4.5 h-4.5" />
                </button>
              </div>
              <nav className="space-y-1 text-left">
                {renderNavLinks(false)}
              </nav>
            </div>
            {renderFooterLinks(false)}
          </aside>
        </div>

        {/* Modal & Toast */}
        <MoodEntryModal isOpen={moodModalOpen} mood={activeMoodObj} isDarkMode={isDarkMode} initialEntry={modalInitialEntry} isReadOnly={modalReadOnly} onClose={() => { setMoodModalOpen(false); setEditingEntryId(null); setSelectedTimestamp(null); }} onSubmit={handleMoodSubmit} onDelete={handleDeleteEntry} />
        {savedToast && (
          <div role="status" className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl animate-toast-in ${isDarkMode ? "bg-white text-stone-950" : "bg-[#1a202c] text-white"}`}>
            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold">{savedToast}</span>
          </div>
        )}
      </div>
    );
  }

  // =================================================================================
  // DESKTOP / TABLET VIEW - The original unchanged layout from latest commit
  // =================================================================================
  return (
    <div className={`min-h-screen ${theme.bg} font-sans antialiased flex transition-colors duration-500`}>

      <AppSidebar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        theme={theme}
      />

      {/* Page Content */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-colors duration-500">

        {/* Background radial highlights */}
        {isDarkMode && (
          <>
            <div aria-hidden="true" className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.10)_0%,transparent_70%)] pointer-events-none blur-3xl animate-float-slow" />
            <div aria-hidden="true" className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.07)_0%,transparent_70%)] pointer-events-none blur-3xl animate-float-delayed" />
          </>
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.015] pointer-events-none bg-repeat"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Mobile Navigation Header */}
        <header className="lg:hidden relative z-20 border-b border-white/5 pb-4 flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
            className={`p-2.5 rounded-xl border transition-all duration-300 shrink-0 ${
              isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700"
            } shadow-sm`}
          >
            <List weight="bold" className="w-5 h-5" />
          </button>
        </header>

        {/* Main Workspace Content */}
        <main className="relative z-10 my-6 sm:my-8 flex-grow max-w-7xl mx-auto w-full flex flex-col justify-center gap-6 sm:gap-8">

          {/* Greeting */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6 animate-fade-in-up">
            <div className="text-left space-y-4">
              <div>
                <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold mb-1.5 ${theme.textMuted}`}>
                  <GreetingIcon weight="duotone" className="w-4 h-4 sm:w-5 sm:h-5 text-[#6366F1]" />
                  <span>{malaysiaDateLabel || "Loading your day..."}</span>
                  {now && (
                    <>
                      <span className="opacity-30">•</span>
                      <span className="flex items-center gap-1">
                        <Clock weight="duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {malaysiaTimeLabel} <span className="text-[10px] opacity-60">MYT</span>
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight">
                  {greeting}, <span className="font-extrabold text-[#6366F1] drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]">{displayName}</span>
                </h1>
              </div>

              {/* Weekly Date selector strip - Circular bubble designs (Desktop) */}
              <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-thin">
                {weekDays.map((day) => {
                  const isSelected = day.day === selectedDate;
                  return (
                    <button
                      key={day.day}
                      onClick={() => handleDateClick(day.day)}
                      className={`w-14 h-14 rounded-full flex flex-col justify-center items-center transition-all duration-300 hover:scale-110 shrink-0 border ${
                        isSelected
                          ? "bg-[#6366F1]/15 border-[#6366F1]/30 text-[#6366F1] font-extrabold shadow-sm"
                          : `${isDarkMode ? "bg-stone-900/40 border-white/5 text-stone-400 hover:bg-white/5" : "bg-white border-neutral-200/50 text-neutral-500 hover:bg-neutral-50"}`
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wide">{day.name}</span>
                      <span className="text-sm font-extrabold mt-0.5">{day.day}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 1: Moods and Featured Sanctuary Space */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-fade-in-up [animation-delay:100ms]">

            {/* Card 1: How are you feeling? Mood Selector */}
            <div className={`${theme.card} rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
              {isDarkMode && <div aria-hidden="true" className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />}

              <div className="space-y-4">
                <span className={`text-xs font-bold uppercase tracking-wider block text-left ${theme.textMuted}`}>How are you feeling?</span>

                <div className="grid grid-cols-4 gap-3">
                  {moods.map((mood) => {
                    const isActive = activeMood === mood.name;
                    return (
                      <button
                        key={mood.name}
                        onClick={() => handleMoodSelect(mood.name)}
                        aria-pressed={isActive}
                        className={`group flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-md ${
                          isActive
                            ? `bg-[#6366F1]/10 border-[#6366F1] ${isDarkMode ? "text-white" : "text-[#6366F1]"} shadow-[0_0_12px_rgba(99,102,241,0.2)]`
                            : `${isDarkMode ? "bg-white/2 border-white/5 text-neutral-400 hover:border-white/10 hover:text-white" : "bg-neutral-50 border-neutral-200/50 text-neutral-600 hover:bg-neutral-100 hover:text-black"}`
                        }`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">
                          {mood.icon}
                        </div>
                        <span className={`text-[10px] font-bold mt-2 tracking-wide ${isActive ? (isDarkMode ? "text-white" : "text-[#6366F1]") : (isDarkMode ? "text-stone-400" : "text-neutral-500")}`}>
                          {mood.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 border-t border-neutral-200/20 pt-4 text-left">
                <p className={`text-[11px] leading-relaxed ${theme.textMuted}`}>
                  Tap a mood to open your journal and log how you&apos;re really feeling right now.
                </p>
              </div>
            </div>

            {/* Card 2 & 3 Combined: Companion AI Invitation */}
            <div className={`${theme.card} lg:col-span-2 rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
              {isDarkMode && <div aria-hidden="true" className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />}

              <div className="space-y-4 max-w-md text-left relative z-10">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-neutral-100 border border-neutral-200/50 text-neutral-600"}`}>
                  AI Companion
                </span>
                <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading}`}>Companion AI</h2>
                <p className={`text-xs leading-relaxed font-light ${theme.textMuted}`}>
                  Meet your empathetic companion. Share your thoughts, vent safely, or practice guided mindfulness. A private, non-judgmental space designed to support your mental well-being.
                </p>
                <div className="pt-2">
                  <Link
                    href="/chat"
                    className={`font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full flex items-center justify-center gap-2 transition duration-300 w-fit shadow-md hover:scale-105 ${
                      isDarkMode ? "bg-white hover:bg-neutral-100 text-stone-950" : "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                    }`}
                  >
                    <ChatCircleDots weight="duotone" className="w-4 h-4" /> Chat with AI
                  </Link>
                </div>
              </div>

              {/* AI Liquid Orb Animation Container */}
              <div className="shrink-0 flex items-center justify-center w-36 h-36 relative z-10">
                <InteractiveLiquidOrb size={130} />
              </div>
            </div>

          </section>

          {/* Row 2: Recent Entries */}
          <section className="space-y-4 animate-fade-in-up [animation-delay:200ms]">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-bold tracking-wide ${theme.textHeading}`}>Recent Entries</h3>
              <Link href="/memories" className="text-[#6366F1] text-xs font-bold hover:underline flex items-center gap-1 group">
                View All Memories <CaretRight weight="bold" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {isLoading ? (
                <>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`relative rounded-3xl p-5 flex flex-col justify-between h-56 border animate-pulse ${
                      isDarkMode ? "bg-stone-900/40 border-white/5" : "bg-neutral-50 border-neutral-200"
                    }`}>
                      <div className="space-y-3">
                        <div className="h-3 w-24 bg-neutral-300 dark:bg-stone-700 rounded-full" />
                        <div className="h-6 w-3/4 bg-neutral-300 dark:bg-stone-700 rounded-full" />
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-neutral-300 dark:bg-stone-700 rounded-full" />
                          <div className="h-3 w-5/6 bg-neutral-300 dark:bg-stone-700 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : recentEntries.length === 0 ? (
                <div className={`col-span-full p-12 rounded-3xl border text-center text-sm font-semibold ${isDarkMode ? "bg-stone-900/40 border-white/5 text-stone-400" : "bg-neutral-50 border-neutral-200 text-neutral-500"}`}>
                  no entry added so far
                </div>
              ) : (
                recentEntries.slice(0, 3).map((entry) => {
                  const entryMood = moods.find((m) => m.name === entry.mood);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => handleViewEntry(entry)}
                      className={`${getMoodCardBg(entry.mood, isDarkMode)} relative rounded-3xl p-5 flex flex-col justify-between h-56 hover:scale-[1.02] hover:shadow-xl transition duration-300 text-left group cursor-pointer border ${entry.isNew ? "animate-pop-in" : ""}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                            <CalendarBlank weight="duotone" className="w-3.5 h-3.5" /> {formatEntryDate(entry.timestamp)}
                            <span className="opacity-30">•</span>
                            <Clock weight="duotone" className="w-3.5 h-3.5" /> {formatEntryTime(entry.timestamp)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEntry(entry);
                              }}
                              aria-label="Edit entry"
                              className={`p-1 rounded-full opacity-0 group-hover:opacity-100 transition ${
                                isDarkMode ? "hover:bg-white/10 text-neutral-400 hover:text-white" : "hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
                              }`}
                            >
                              <PencilSimple weight="bold" className="w-3 h-3" />
                            </button>
                            {entryMood && (
                              <span className="w-8 h-8 flex items-center justify-center shrink-0">
                                {entryMood.icon}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <h4 className={`font-journal text-2xl sm:text-[26px] leading-tight line-clamp-1 ${theme.textHeading} group-hover:text-[#6366F1] transition-colors pr-2`}>
                            {entry.title}
                          </h4>
                          {entry.favorite && <Star weight="fill" className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                        </div>
                        <p className={`text-xs line-clamp-3 leading-relaxed pr-12 ${theme.textMuted}`}>{entry.excerpt}</p>
                      </div>
                      <div className="flex gap-1.5 pt-2 flex-wrap pr-12">
                        {entry.tags.map((tag) => (
                          <span key={tag} className={`text-[9px] border px-2 py-0.5 rounded ${isDarkMode ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-200 text-neutral-600"}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      {entry.images && entry.images.length > 0 && (
                        <div className={`absolute -bottom-3 -right-3 w-14 h-14 p-1 pb-2.5 rotate-6 rounded-sm shadow-md ${isDarkMode ? "bg-stone-800" : "bg-white"}`}>
                          <img src={entry.images[0]} alt="" className="w-full h-full object-cover rounded-sm" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

            </div>
          </section>

          {/* Row 3: Weekly Mood Spectrum and Memory Lane */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch animate-fade-in-up [animation-delay:300ms]">

            {/* Column 1: Weekly Mood Spectrum */}
            <div className="lg:col-span-3 flex flex-col gap-3 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-stone-400 pl-1">
                Weekly Mood Spectrum
              </h3>
              <div className={`${theme.card} flex-1 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                {isDarkMode && <div aria-hidden="true" className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none animate-float-delayed" />}

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2">
                    <div className="space-y-2 max-w-xs">
                      <p className={`text-xs leading-relaxed font-light ${theme.textMuted}`}>
                        Check your consistency and streaks this week.
                      </p>

                      <div className="flex items-end gap-3 pt-6 h-20">
                        {weekDays.map((wd, idx) => {
                          const entry = recentEntries.find(e => getLocalDateString(e.timestamp) === wd.dateStr);
                          
                          let heightClass = "h-4"; // 15%
                          let bgClass = isDarkMode ? "bg-white/10" : "bg-neutral-200";
                          let shadowClass = "";
                          let moodLabel = "No Log";
                          let titleLabel = "";

                          if (entry) {
                            moodLabel = entry.mood;
                            titleLabel = entry.title;
                            switch (entry.mood) {
                              case "Happy":
                                heightClass = "h-18"; // 90%
                                bgClass = "bg-amber-400 dark:bg-amber-500";
                                shadowClass = "shadow-[0_0_10px_rgba(245,158,11,0.3)]";
                                break;
                              case "Good":
                                heightClass = "h-14"; // 70%
                                bgClass = "bg-emerald-400 dark:bg-emerald-500";
                                shadowClass = "shadow-[0_0_10px_rgba(16,185,129,0.3)]";
                                break;
                              case "Okay":
                                heightClass = "h-10"; // 50%
                                bgClass = "bg-sky-400 dark:bg-sky-500";
                                shadowClass = "shadow-[0_0_10px_rgba(14,165,233,0.3)]";
                                break;
                              case "Sad":
                                heightClass = "h-6"; // 30%
                                bgClass = "bg-indigo-400 dark:bg-indigo-500";
                                shadowClass = "shadow-[0_0_10px_rgba(99,102,241,0.3)]";
                                break;
                            }
                          }

                          return (
                            <div key={wd.dateStr} className="flex flex-col items-center gap-1.5 relative group">
                              {/* Tooltip */}
                              <div className={`absolute bottom-full mb-2 px-2.5 py-1.5 rounded-lg bg-stone-900/95 dark:bg-stone-950/95 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none z-30 shadow-xl border border-white/5 flex flex-col items-start gap-0.5 ${
                                idx === 0 
                                  ? "left-0 translate-x-0" 
                                  : idx === 6 
                                    ? "right-0 left-auto translate-x-0" 
                                    : "left-1/2 -translate-x-1/2"
                              }`}>
                                <span className="font-bold opacity-80">{wd.name} ({wd.day})</span>
                                <span className="font-extrabold flex items-center gap-1">
                                  Mood: {moodLabel}
                                </span>
                                {titleLabel && <span className="opacity-90 max-w-[120px] truncate">{titleLabel}</span>}
                              </div>

                              <div className={`w-4 rounded-full transition-all duration-300 ${heightClass} ${bgClass} ${shadowClass} group-hover:scale-y-110 cursor-pointer`} />
                              <span className="text-[9px] font-bold text-neutral-400 dark:text-stone-500 uppercase">{wd.name[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4 w-full md:w-auto">
                      <div className="border-l-2 border-orange-400 pl-4 py-1">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Dominant Mood</span>
                        <span className={`text-sm font-bold mt-0.5 block ${theme.textHeading}`}>{dominantMood}</span>
                      </div>

                      <div className="border-l-2 border-emerald-400 pl-4 py-1">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Consistency</span>
                        <span className={`text-sm font-bold mt-0.5 block ${theme.textHeading}`}>{streak} Day Streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Memory Lane */}
            <div className="lg:col-span-2 flex flex-col gap-3 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-stone-400 pl-1">
                Memory Lane
              </h3>
              <div className={`${theme.card} flex-1 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                {isDarkMode && <div aria-hidden="true" className="absolute top-0 right-0 w-24 h-24 bg-[#6366F1]/5 rounded-full blur-2xl pointer-events-none animate-float-slow" />}

                <div className="space-y-4 w-full flex-1 flex flex-col justify-center">
                  {throwbackEntry ? (
                    <div className="flex gap-4 items-start pt-2">
                      {/* Themed Date Box */}
                      <div className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center font-bold text-center border border-[#6366F1]/30 bg-[#6366F1]/5 text-[#6366F1] shadow-xs">
                        <span className="text-lg font-black leading-none">{new Date(throwbackEntry.timestamp).getDate()}</span>
                        <span className="text-[9px] font-black tracking-widest text-[#6366F1]/80 mt-0.5 leading-none">
                          {new Date(throwbackEntry.timestamp).toLocaleString("en-MY", { month: "short" }).toUpperCase()}
                        </span>
                      </div>

                      {/* Excerpt Details */}
                      <div className="flex-grow space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-neutral-400 capitalize">
                            {new Date(throwbackEntry.timestamp).toLocaleString("en-MY", { weekday: "long" })}
                          </span>
                          <span className="w-5 h-5 flex items-center justify-center shrink-0">
                            {moods.find((m) => m.name === throwbackEntry.mood)?.icon}
                          </span>
                        </div>
                        <h4 className={`text-base font-extrabold font-journal truncate ${theme.textHeading}`}>
                          {throwbackEntry.title}
                        </h4>
                        <p className={`text-xs line-clamp-2 leading-relaxed ${theme.textMuted}`}>
                          {throwbackEntry.excerpt}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={`h-24 rounded-2xl flex items-center justify-center border relative overflow-hidden ${isDarkMode ? "bg-stone-800/60 border-white/5" : "bg-neutral-50 border-neutral-200"}`}>
                      <span className="text-xs text-neutral-400 dark:text-stone-500 font-semibold">no entry added so far</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-200/20 flex justify-between items-center w-full mt-4">
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider block ${theme.textMuted}`}>Throwback Reminder</span>
                    <span className={`text-sm font-bold mt-0.5 block ${theme.textHeading}`}>
                      {throwbackEntry 
                        ? (Date.now() - throwbackEntry.timestamp > 300 * 24 * 60 * 60 * 1000 ? "Revisit 1 Year Ago" : "Revisit Memory")
                        : "no entry added so far"}
                    </span>
                  </div>
                  <Link
                    href="/memories"
                    className={`group w-8 h-8 rounded-full border flex items-center justify-center transition ${
                      isDarkMode ? "bg-white/5 border-white/10 hover:bg-[#6366F1] text-white" : "bg-neutral-100 border-neutral-300 hover:bg-[#6366F1] hover:text-white"
                    }`}
                  >
                    <ArrowRight weight="bold" className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>

          </section>

        </main>


      </div>

      <MoodEntryModal
        isOpen={moodModalOpen}
        mood={activeMoodObj}
        isDarkMode={isDarkMode}
        initialEntry={modalInitialEntry}
        isReadOnly={modalReadOnly}
        onClose={() => {
          setMoodModalOpen(false);
          setEditingEntryId(null);
          setSelectedTimestamp(null);
        }}
        onSubmit={handleMoodSubmit}
        onDelete={handleDeleteEntry}
      />

      {/* Save confirmation toast */}
      {savedToast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl animate-toast-in ${
            isDarkMode ? "bg-white text-stone-950" : "bg-[#1a202c] text-white"
          }`}
        >
          <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold">{savedToast}</span>
        </div>
      )}
    </div>
  );
}
