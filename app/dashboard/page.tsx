"use client";

import { cloneElement, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { RobotAvatar, HappyEmoji, GoodEmoji, OkayEmoji, SadEmoji } from "./ResponsiveAssets";

const THEME_STORAGE_KEY = "jomluah-theme";
const SIDEBAR_COLLAPSED_KEY = "jomluah-sidebar-collapsed";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/chat", label: "Companion AI", icon: ChatCircleDots },
  { href: "/journal", label: "Idea Board", icon: Notebook },
  { href: "/memories", label: "Memories", icon: ClockCounterClockwise },
];

type JournalEntry = {
  id: number;
  timestamp: number;
  title: string;
  mood: string;
  excerpt: string;
  tags: string[];
  favorite: boolean;
  isNew?: boolean;
  images?: string[];
};

const initialEntries: JournalEntry[] = [
  {
    id: 1,
    timestamp: new Date("2026-06-09T23:48:00+08:00").getTime(),
    title: "Midnight Reverie",
    mood: "Good",
    excerpt: "Thoughts about the shifting light across the city skyline at 2 AM. Balancing final documentation...",
    tags: ["Dreamy", "Cityscape"],
    favorite: true,
  },
  {
    id: 2,
    timestamp: new Date("2026-06-07T07:20:00+08:00").getTime(),
    title: "The Sound of Rain",
    mood: "Okay",
    excerpt: "Listening to the rhythm against the window. It feels like natural grounding white noise...",
    tags: ["Calm", "Nature"],
    favorite: false,
  },
  {
    id: 3,
    timestamp: new Date("2026-06-05T16:35:00+08:00").getTime(),
    title: "Project Breakthrough",
    mood: "Happy",
    excerpt: "Finally figured out the architecture for the new UI. The flow feels very organic and nice...",
    tags: ["Radiant", "Work"],
    favorite: false,
  },
];

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

export default function StudentDashboard() {
  const pathname = usePathname();
  const [activeMood, setActiveMood] = useState("Good");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>(initialEntries);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [modalReadOnly, setModalReadOnly] = useState(false);

  // Selected date states (for mock weekly calendar view)
  const [selectedDate, setSelectedDate] = useState("13");
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);

  // Device-type detection state
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Weekly mockup selector days
  const weekDays = [
    { name: "Mon", day: "08" },
    { name: "Tue", day: "09" },
    { name: "Wed", day: "10" },
    { name: "Thu", day: "11" },
    { name: "Fri", day: "12" },
    { name: "Sat", day: "13" },
    { name: "Sun", day: "14" },
  ];

  const handleDateClick = (dayStr: string) => {
    setSelectedDate(dayStr);
    const dateNum = Number(dayStr);
    // Set timestamp for June [dateNum], 2026 at 12:00 PM
    const newTimestamp = new Date(2026, 5, dateNum, 12, 0, 0).getTime();
    setSelectedTimestamp(newTimestamp);
    
    // Auto trigger new mood log for selected date
    handleMoodSelect(activeMood);
  };

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

  // Restore saved desktop sidebar collapse preference
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") {
      setIsSidebarCollapsed(true);
    }
  }, []);

  // Persist sidebar collapse preference whenever it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Restore saved theme preference
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      setIsDarkMode(stored === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Persist theme preference
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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

  const moods = [
    { name: "Happy", icon: <HappyEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-amber-300 to-orange-400" },
    { name: "Good", icon: <GoodEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-emerald-300 to-teal-400" },
    { name: "Okay", icon: <OkayEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-sky-300 to-cyan-400" },
    { name: "Sad", icon: <SadEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-blue-300 to-indigo-400" },
  ];

  const theme = {
    bg: isDarkMode ? "bg-stone-950 text-stone-200" : "bg-[#F0F2F6] text-[#4a5568]",
    card: isDarkMode ? "bg-stone-900/80 border-white/5 shadow-2xl" : "bg-white border border-neutral-200/50 shadow-lg shadow-neutral-100",
    textHeading: isDarkMode ? "text-stone-50" : "text-[#1a202c]",
    textMuted: isDarkMode ? "text-stone-400" : "text-neutral-500",
    subtleBg: isDarkMode ? "bg-white/2 border-white/5" : "bg-neutral-50 border-neutral-150",
    sidebar: isDarkMode ? "bg-stone-900 border-white/5 text-stone-200" : "bg-white border-neutral-200 text-[#4a5568]"
  };

  const malaysiaHour = now
    ? Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", hourCycle: "h23" }).format(now))
    : null;

  const greeting =
    malaysiaHour === null ? "Hello"
    : malaysiaHour < 5 ? "Good night"
    : malaysiaHour < 12 ? "Good morning"
    : malaysiaHour < 18 ? "Good afternoon"
    : malaysiaHour < 22 ? "Good evening"
    : "Good night";

  const GreetingIcon =
    malaysiaHour === null ? Sparkle
    : malaysiaHour < 5 ? MoonStars
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

  const todayQuote = dailyQuotes[now ? now.getDate() % dailyQuotes.length : 0];
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

  const handleMoodSubmit = (entry: MoodEntryPayload, action: "save" | "continue") => {
    const title = entry.title.trim() || `Feeling ${entry.mood}`;

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
      setMoodModalOpen(false);
      setEditingEntryId(null);
      setSelectedTimestamp(null);
      if (action === "save") setSavedToast(`"${title}" updated`);
      return;
    }

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
    setMoodModalOpen(false);
    setSelectedTimestamp(null);
    if (action === "save") setSavedToast(`"${newEntry.title}" added to your journal`);
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
            <span className="text-xl font-bold tracking-tight">JomLuah</span>

            {/* Robot Avatar */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center">
              <RobotAvatar className="w-16 h-16 drop-shadow-xl animate-float-slow" />
            </div>

            {/* Right side controls: Theme Toggle + Profile */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 flex items-center justify-center border border-white/10"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun weight="duotone" className="w-5 h-5" /> : <Moon weight="duotone" className="w-5 h-5" />}
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
                <p className="font-journal text-2xl leading-relaxed text-white font-bold transition-all duration-300 drop-shadow-sm">
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
              {recentEntries.slice(0, 2).map((entry) => {
                const entryMood = moods.find((m) => m.name === entry.mood);
                return (
                  <div
                    key={entry.id}
                    onClick={() => handleViewEntry(entry)}
                    className={`${theme.card} relative p-5 rounded-3xl shadow-md flex flex-col justify-between text-left cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-lg`}
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
                      <h4 className="text-xl font-extrabold text-neutral-800 dark:text-white font-journal">
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
              })}
            </div>
          </div>

          {/* Weekly Mood Spectrum & Memory Lane (Original) */}
          <div className="grid grid-cols-1 gap-6 pb-6">
            <div className={`${theme.card} rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider block ${theme.textMuted}`}>Weekly Mood Spectrum</h3>
              <p className={`text-xs leading-relaxed font-light mt-2 ${theme.textMuted}`}>
                Check your consistency and streaks this week.
              </p>
              <div className="flex items-end gap-3 pt-4 h-16">
                <div className={`w-3 rounded-full h-8 ${isDarkMode ? "bg-[#6366F1]/15" : "bg-neutral-200"}`} />
                <div className="w-3 bg-emerald-500/30 rounded-full h-12" />
                <div className={`w-3 rounded-full h-6 ${isDarkMode ? "bg-[#6366F1]/15" : "bg-neutral-200"}`} />
                <div className="w-3 bg-emerald-500/30 rounded-full h-14" />
                <div className={`w-3 rounded-full h-10 ${isDarkMode ? "bg-[#6366F1]/15" : "bg-neutral-200"}`} />
              </div>
            </div>
          </div>

        </div>

        {/* Floating Bottom Navigation */}
        <div className="fixed bottom-4 left-0 right-0 px-6 z-40">
          <div className="bg-white/70 dark:bg-stone-900/75 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full py-3 px-6 shadow-2xl flex items-center justify-between max-w-md mx-auto">
            
            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className={`p-2 transition duration-200 ${
                pathname === "/dashboard"
                  ? "text-[#6366F1]"
                  : "text-neutral-500 dark:text-stone-400 hover:text-[#6366F1]"
              }`}
              aria-label="Dashboard"
            >
              <SquaresFour weight="duotone" className="w-6 h-6" />
            </Link>

            {/* Companion AI Link */}
            <Link
              href="/chat"
              className={`p-2 transition duration-200 ${
                pathname === "/chat"
                  ? "text-[#6366F1]"
                  : "text-neutral-500 dark:text-stone-400 hover:text-[#6366F1]"
              }`}
              aria-label="Companion AI"
            >
              <ChatCircleDots weight="duotone" className="w-6 h-6" />
            </Link>

            {/* Floating Plus button */}
            <button
              onClick={() => handleMoodSelect(activeMood)}
              className="w-12 h-12 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#6366F1]/30 transition duration-200 transform hover:scale-105 -mt-6"
              aria-label="Log mood"
            >
              <span className="text-2xl font-light">+</span>
            </button>

            {/* Idea Board Link */}
            <Link
              href="/journal"
              className={`p-2 transition duration-200 ${
                pathname === "/journal"
                  ? "text-[#6366F1]"
                  : "text-neutral-500 dark:text-stone-400 hover:text-[#6366F1]"
              }`}
              aria-label="Idea Board"
            >
              <Notebook weight="duotone" className="w-6 h-6" />
            </Link>

            {/* Memories Link */}
            <Link
              href="/memories"
              className={`p-2 transition duration-200 ${
                pathname === "/memories"
                  ? "text-[#6366F1]"
                  : "text-neutral-500 dark:text-stone-400 hover:text-[#6366F1]"
              }`}
              aria-label="Memories"
            >
              <ClockCounterClockwise weight="duotone" className="w-6 h-6" />
            </Link>
          </div>
        </div>

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
        <MoodEntryModal isOpen={moodModalOpen} mood={activeMoodObj} isDarkMode={isDarkMode} initialEntry={modalInitialEntry} isReadOnly={modalReadOnly} onClose={() => { setMoodModalOpen(false); setEditingEntryId(null); setSelectedTimestamp(null); }} onSubmit={handleMoodSubmit} />
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

      {/* Persistent Sidebar (desktop) */}
      <aside className={`hidden lg:flex lg:flex-col lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto lg:border-r ${theme.sidebar} p-6 justify-between transition-[width] duration-300 ${
        isSidebarCollapsed ? "lg:w-24" : "lg:w-72"
      }`}>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`absolute top-1/2 -translate-y-1/2 right-3 z-10 w-7 h-7 rounded-full border flex items-center justify-center shadow-md transition-all duration-300 ${
            isDarkMode ? "bg-[#1c1f2b] border-white/10 hover:bg-[#262a38] hover:border-white/20 text-neutral-300" : "bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600"
          }`}
        >
          {isSidebarCollapsed ? <CaretLineRight weight="bold" className="w-3.5 h-3.5" /> : <CaretLineLeft weight="bold" className="w-3.5 h-3.5" />}
        </button>

        <div className="space-y-8">
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? "justify-center" : ""}`}>
            {!isSidebarCollapsed && <span className={`text-xl font-bold tracking-tight ${theme.textHeading}`}>JomLuah</span>}
          </div>

          <nav className="space-y-1 text-left" aria-label="Main navigation">
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block px-3 mb-2">Overview</span>
            )}
            {renderNavLinks(isSidebarCollapsed)}
          </nav>
        </div>

        <div className="space-y-2">
          {renderFooterLinks(isSidebarCollapsed)}
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          aria-hidden="true"
        />

        <aside className={`absolute left-0 top-0 bottom-0 w-72 ${theme.sidebar} p-6 flex flex-col justify-between transition-transform duration-300 transform shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`text-xl font-bold tracking-tight ${theme.textHeading}`}>JomLuah</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close menu"
                className={`p-2 rounded-lg border transition ${
                  isDarkMode ? "border-white/10 hover:bg-white/5 text-neutral-400" : "border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                }`}
              >
                <X weight="bold" className="w-4.5 h-4.5" />
              </button>
            </div>

            <nav className="space-y-1 text-left" aria-label="Main navigation">
              <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block px-3 mb-2">Overview</span>
              {renderNavLinks(false)}
            </nav>
          </div>

          {renderFooterLinks(false)}
        </aside>
      </div>

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

          {/* Greeting + Today's Reflection */}
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
                  {greeting}, <span className="font-extrabold text-[#6366F1] drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]">Ali</span>
                </h1>
              </div>

              {/* Weekly Date selector strip - Circular bubble designs (Desktop) */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                {weekDays.map((day) => {
                  const isSelected = day.day === selectedDate;
                  return (
                    <button
                      key={day.day}
                      onClick={() => handleDateClick(day.day)}
                      className={`w-11 h-11 rounded-full flex flex-col justify-center items-center transition-all duration-300 hover:scale-110 shrink-0 border ${
                        isSelected
                          ? "bg-[#6366F1]/15 border-[#6366F1]/30 text-[#6366F1] font-extrabold shadow-sm"
                          : `${isDarkMode ? "bg-stone-900/40 border-white/5 text-stone-400 hover:bg-white/5" : "bg-white border-neutral-200/50 text-neutral-500 hover:bg-neutral-50"}`
                      }`}
                    >
                      <span className="text-[8px] font-bold uppercase tracking-wide">{day.name}</span>
                      <span className="text-xs font-extrabold mt-0.5">{day.day}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Today's Reflection / Quote of the day */}
            <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 border max-w-md ${isDarkMode ? "bg-white/[0.03] border-white/5" : "bg-neutral-50 border-neutral-150"}`}>
              <Quotes weight="duotone" className="w-5 h-5 text-[#6366F1] shrink-0 mt-1" />
              <div className="text-left">
                <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${theme.textMuted}`}>Today&apos;s Reflection</span>
                <p className={`font-journal text-lg sm:text-xl leading-snug ${theme.textHeading}`}>&ldquo;{todayQuote.text}&rdquo;</p>
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

            {/* Card 2 & 3 Combined: Featured Sanctuary Space */}
            <div className={`${theme.card} lg:col-span-2 rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
              {isDarkMode && <div aria-hidden="true" className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />}

              <div className="space-y-4 max-w-md text-left relative z-10">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-neutral-100 border border-neutral-200/50 text-neutral-600"}`}>
                  Featured Space
                </span>
                <h2 className={`text-2xl md:text-3xl font-extrabold ${theme.textHeading}`}>Sanctuary Space</h2>
                <p className={`text-xs leading-relaxed font-light ${theme.textMuted}`}>
                  Take five minutes to breathe with our generative audio-visual landscape. Designed to reset your cognitive rhythm and alleviate campus stress levels.
                </p>
                <div className="pt-2">
                  <Link
                    href="/chat"
                    className={`font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full flex items-center justify-center gap-2 transition duration-300 w-fit shadow-md hover:scale-105 ${
                      isDarkMode ? "bg-white hover:bg-neutral-100 text-stone-950" : "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                    }`}
                  >
                    <ChatCircleDots weight="duotone" className="w-4 h-4" /> Enter Sanctuary
                  </Link>
                </div>
              </div>

              {/* Diary-themed illustration */}
              <JournalIllustration isDarkMode={isDarkMode} />
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

              {recentEntries.map((entry) => {
                const entryMood = moods.find((m) => m.name === entry.mood);
                return (
                  <div
                    key={entry.id}
                    onClick={() => handleViewEntry(entry)}
                    className={`${theme.card} relative rounded-3xl p-5 flex flex-col justify-between h-56 hover:scale-[1.02] hover:shadow-xl transition duration-300 text-left group cursor-pointer ${entry.isNew ? "animate-pop-in" : ""}`}
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
                        <h4 className={`font-journal text-2xl sm:text-[26px] leading-tight line-clamp-1 ${theme.textHeading} group-hover:text-[#6366F1] transition-colors`}>
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
              })}

            </div>
          </section>

          {/* Row 3: Weekly Mood Spectrum and Memory Lane */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch animate-fade-in-up [animation-delay:300ms]">

            {/* Card 1: Weekly Mood Spectrum */}
            <div className={`${theme.card} lg:col-span-3 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
              {isDarkMode && <div aria-hidden="true" className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none animate-float-delayed" />}

              <div className="space-y-4">
                <h3 className={`text-sm font-bold uppercase tracking-wider block ${theme.textMuted}`}>{"// Weekly Mood Spectrum"}</h3>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2">
                  <div className="space-y-2 max-w-xs">
                    <p className={`text-xs leading-relaxed font-light mt-2 ${theme.textMuted}`}>
                      Check your consistency and streaks this week.
                    </p>

                    <div className="flex items-end gap-3 pt-6 h-20">
                      <div className={`w-4 rounded-full h-10 ${isDarkMode ? "bg-[#6366F1]/15" : "bg-neutral-200"}`} />
                      <div className="w-4 bg-emerald-500/30 rounded-full h-16 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
                      <div className={`w-4 rounded-full h-8 ${isDarkMode ? "bg-[#6366F1]/15" : "bg-neutral-200"}`} />
                      <div className="w-4 bg-emerald-500/30 rounded-full h-20 shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
                      <div className={`w-4 rounded-full h-12 ${isDarkMode ? "bg-[#6366F1]/15" : "bg-neutral-200"}`} />
                    </div>
                  </div>

                  <div className="space-y-4 w-full md:w-auto">
                    <div className="border-l-2 border-orange-400 pl-4 py-1">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Top Theme</span>
                      <span className={`text-sm font-bold mt-0.5 block ${theme.textHeading}`}>Creative Growth</span>
                    </div>

                    <div className="border-l-2 border-emerald-400 pl-4 py-1">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Consistency</span>
                      <span className={`text-sm font-bold mt-0.5 block ${theme.textHeading}`}>4 Day Streak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Memory Lane */}
            <div className={`${theme.card} lg:col-span-2 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
              {isDarkMode && <div aria-hidden="true" className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none animate-float-slow" />}

              <div className="space-y-4">
                <h3 className={`text-sm font-bold uppercase tracking-wider block ${theme.textMuted}`}>{"// Memory Lane"}</h3>

                <div className={`h-28 rounded-2xl flex items-center justify-center border relative overflow-hidden ${isDarkMode ? "bg-stone-800/60 border-white/5" : "bg-neutral-50 border-neutral-200"}`}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#6366F1]/10 to-[#3b82f6]/10 flex items-center justify-center">
                    <ClockCounterClockwise weight="duotone" className="w-10 h-10 text-indigo-400/30" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <div>
                  <span className={`text-[10px] uppercase tracking-wider block ${theme.textMuted}`}>Throwback Reminder</span>
                  <span className={`text-sm font-bold mt-0.5 block ${theme.textHeading}`}>Revisit June 2025</span>
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

          </section>

        </main>


      </div>

      {/* Mood logging popup */}
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
