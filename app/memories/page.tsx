"use client";

import { cloneElement, useState, useEffect } from "react";
import {
  ClockCounterClockwise,
  CalendarBlank,
  Clock,
  PencilSimple,
  TrashSimple,
  MagnifyingGlass,
  Funnel,
  Sparkle,
  ArrowRight,
  BookOpen,
  Tag,
  Briefcase,
  Users,
  Smiley,
  House,
  CaretDown
} from "@phosphor-icons/react";
import { useAppTheme } from "../components/useAppTheme";
import AppSidebar, { MobileBottomNav, BackgroundDecor } from "../components/AppSidebar";
import MoodEntryModal, { type MoodEntryPayload, type ModalInitialEntry } from "../dashboard/MoodEntryModal";
import { HappyEmoji, GoodEmoji, OkayEmoji, SadEmoji } from "../dashboard/ResponsiveAssets";
import { supabase } from "../lib/supabaseClient";

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

const getDayNumber = (timestamp: number) => {
  return new Date(timestamp).getDate();
};

const getShortMonth = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("en-MY", { month: "short" }).toUpperCase();
};

const getRelativeDayName = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    // Return capitalized relative name, or formatted name
    const str = date.toLocaleString("en-MY", { weekday: "long" });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};

const getDayName = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("en-MY", { weekday: "long" }).toUpperCase();
};

const getTagIcon = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes("work") || t.includes("job") || t.includes("study") || t.includes("fyp")) {
    return <Briefcase className="w-3.5 h-3.5 shrink-0" />;
  }
  if (t.includes("family") || t.includes("friend") || t.includes("partner") || t.includes("love")) {
    return <Users className="w-3.5 h-3.5 shrink-0" />;
  }
  if (t.includes("home") || t.includes("house") || t.includes("grounding") || t.includes("nature")) {
    return <House className="w-3.5 h-3.5 shrink-0" />;
  }
  return <Tag className="w-3.5 h-3.5 shrink-0" />;
};

const getMoodCardBg = (moodName: string, isDarkMode: boolean) => {
  if (isDarkMode) {
    return "bg-stone-900 border border-white/5 shadow-xl";
  } else {
    return "bg-white border border-neutral-200/60 shadow-md";
  }
};

const formatEntryTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en-MY", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", minute: "2-digit", hour12: true }).format(timestamp);

export default function MemoriesPage() {
  const { isDarkMode, setIsDarkMode, isSidebarCollapsed, setIsSidebarCollapsed, theme } = useAppTheme();
  
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>("All");
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  
  // Mood entry modal states
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<number | string | null>(null);
  const [activeMood, setActiveMood] = useState("Good");
  const [modalReadOnly, setModalReadOnly] = useState(false);
  const [user, setUser] = useState<any>(null);

  const moods = [
    { name: "Happy", icon: <HappyEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-amber-300 to-orange-400" },
    { name: "Good", icon: <GoodEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-emerald-300 to-teal-400" },
    { name: "Okay", icon: <OkayEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-sky-300 to-cyan-400" },
    { name: "Sad", icon: <SadEmoji className="w-7 h-7" />, color: "bg-gradient-to-br from-blue-300 to-indigo-400" },
  ];

  // Load entries from Supabase (or fallback to localStorage) on mount
  useEffect(() => {
    const fetchUserAndEntries = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .order("timestamp", { ascending: false });
        if (!error && data && data.length > 0) {
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
          setEntries(mapped);
        }
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem("jomluah-entries");
        if (stored) {
          try {
            setEntries(JSON.parse(stored));
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
    fetchUserAndEntries();
  }, []);

  // Save entries to localStorage when modified (for local mode)
  const saveToStorage = (updated: JournalEntry[]) => {
    setEntries(updated);
    if (!user) {
      localStorage.setItem("jomluah-entries", JSON.stringify(updated));
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setActiveMood(entry.mood);
    setEditingEntryId(entry.id);
    setModalReadOnly(false);
    setMoodModalOpen(true);
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setActiveMood(entry.mood);
    setEditingEntryId(entry.id);
    setModalReadOnly(true);
    setMoodModalOpen(true);
  };

  const handleDeleteEntry = async (entryId: number | string) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      if (user) {
        const { error } = await supabase
          .from("journal_entries")
          .delete()
          .eq("id", entryId);
        if (error) {
          console.error("Error deleting entry:", error.message);
          return;
        }
      }
      const updated = entries.filter((e) => e.id !== entryId);
      saveToStorage(updated);
    }
  };

  const handleMoodSubmit = async (payload: MoodEntryPayload, action: "save" | "continue") => {
    const title = payload.title.trim() || `Feeling ${payload.mood}`;
    
    if (editingEntryId !== null) {
      if (user) {
        const { error } = await supabase
          .from("journal_entries")
          .update({
            timestamp: new Date(payload.timestamp).toISOString(),
            title,
            mood: payload.mood,
            excerpt: payload.description.trim() || "No additional notes for this entry.",
            tags: payload.tags,
            images: payload.images,
          })
          .eq("id", editingEntryId);
        if (error) {
          console.error("Error updating entry:", error.message);
          return;
        }
      }
      const updated = entries.map((existing) =>
        existing.id === editingEntryId
          ? {
              ...existing,
              timestamp: payload.timestamp,
              title,
              mood: payload.mood,
              excerpt: payload.description.trim() || "No additional notes for this entry.",
              tags: payload.tags,
              images: payload.images,
            }
          : existing
      );
      saveToStorage(updated);
    }
    setMoodModalOpen(false);
    setEditingEntryId(null);
  };

  const activeMoodObj = moods.find((m) => m.name === activeMood) ?? null;
  const editingEntry = editingEntryId !== null ? entries.find((entry) => entry.id === editingEntryId) ?? null : null;

  const modalInitialEntry: ModalInitialEntry | null = editingEntry
    ? {
        title: editingEntry.title,
        tags: editingEntry.tags,
        description: editingEntry.excerpt,
        images: editingEntry.images ?? [],
        timestamp: editingEntry.timestamp,
      }
    : null;

  // Group entries by month-year
  const getGroupedEntries = () => {
    const filtered = entries.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMood = selectedMoodFilter === "All" || e.mood === selectedMoodFilter;
      return matchesSearch && matchesMood;
    });

    // Sort descending by timestamp
    const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);

    const grouped: { [key: string]: JournalEntry[] } = {};
    sorted.forEach((e) => {
      const date = new Date(e.timestamp);
      const monthName = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      const key = `${monthName} ${year}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(e);
    });

    return { grouped, list: sorted };
  };

  const { grouped: groupedEntries, list: filteredList } = getGroupedEntries();
  const monthsList = Object.keys(groupedEntries);

  // Flashbacks / Memory Lane highlight section (entries around 1 month or 1 year ago)
  const getFlashbackEntries = () => {
    const nowMs = Date.now();
    const oneMonthAgo = nowMs - 30 * 24 * 60 * 60 * 1000;
    const oneYearAgo = nowMs - 365 * 24 * 60 * 60 * 1000;
    
    // Find closest entries to these dates within limits
    const margin = 7 * 24 * 60 * 60 * 1000; // 7 days window
    return entries.filter((e) => {
      const diffMonth = Math.abs(e.timestamp - oneMonthAgo);
      const diffYear = Math.abs(e.timestamp - oneYearAgo);
      return diffMonth < margin || diffYear < margin;
    });
  };

  const getThrowbackEntry = () => {
    if (entries.length === 0) return null;
    const nowMs = Date.now();
    const oneMonthAgo = nowMs - 30 * 24 * 60 * 60 * 1000;
    const oneYearAgo = nowMs - 365 * 24 * 60 * 60 * 1000;
    
    const sorted = [...entries].sort((a, b) => {
      const distA = Math.min(Math.abs(a.timestamp - oneYearAgo), Math.abs(a.timestamp - oneMonthAgo));
      const distB = Math.min(Math.abs(b.timestamp - oneYearAgo), Math.abs(b.timestamp - oneMonthAgo));
      return distA - distB;
    });
    return sorted[0];
  };

  const flashbacks = getFlashbackEntries();
  const throwbackEntry = getThrowbackEntry();

  const scrollToMonth = (monthKey: string) => {
    const el = document.getElementById(`month-${monthKey.replace(/\s+/g, "-")}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} font-sans antialiased flex transition-colors duration-500 pb-20 sm:pb-0`}>

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
      <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-colors duration-500">
        <BackgroundDecor isDarkMode={isDarkMode} />

        <MobileBottomNav />

        <main className="relative z-10 my-4 sm:my-6 flex-grow max-w-5xl mx-auto w-full flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight">
                Your <span className="font-extrabold text-[#6366F1] drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]">Memories</span>
              </h1>
              <p className={`text-xs sm:text-sm mt-1 max-w-md leading-relaxed ${theme.textMuted}`}>
                Revisit your historical reflections, moods, and captured milestones over time.
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {/* Search bar & custom Month Filter dropdown */}
              <div className={`relative flex items-center gap-2 rounded-full pl-4 pr-3 py-1.5 border transition ${
                isDarkMode ? "bg-white/5 border-white/10 focus-within:border-[#6366F1]" : "bg-white border-neutral-200 focus-within:border-[#6366F1]"
              }`}>
                <MagnifyingGlass className={`w-4 h-4 ${isDarkMode ? "text-neutral-500" : "text-neutral-400"}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memories..."
                  className="bg-transparent outline-none text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-500 w-full sm:w-32 md:w-40"
                />
                
                {monthsList.length > 0 && (
                  <div className="relative flex items-center">
                    <div className="h-4 w-px bg-neutral-300 dark:bg-white/10 mx-1.5" />
                    
                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                      className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-[#6366F1] font-semibold transition-colors shrink-0"
                    >
                      <span>{selectedMonth || "Month"}</span>
                      <CaretDown weight="bold" className={`w-3 h-3 transition-transform duration-200 ${isMonthDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Custom Dropdown List */}
                    {isMonthDropdownOpen && (
                      <>
                        {/* Invisible overlay backdrop to close dropdown */}
                        <div
                          onClick={() => setIsMonthDropdownOpen(false)}
                          className="fixed inset-0 z-[40]"
                        />
                        
                        <div className={`absolute right-0 top-full mt-2.5 w-40 py-2 rounded-2xl border shadow-xl z-[50] animate-modal-pop text-left ${
                          isDarkMode ? "bg-stone-900 border-white/10 text-stone-200" : "bg-white border-neutral-150 text-neutral-800"
                        }`}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMonth("");
                              setIsMonthDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-white/5 text-neutral-500 transition-colors"
                          >
                            All Months
                          </button>
                          {monthsList.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setSelectedMonth(m);
                                scrollToMonth(m);
                                setIsMonthDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-white/5 hover:text-[#6366F1] transition-colors"
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mood Filter Pill selector */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
                {["All", "Happy", "Good", "Okay", "Sad"].map((moodName) => (
                  <button
                    key={moodName}
                    onClick={() => setSelectedMoodFilter(moodName)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                      selectedMoodFilter === moodName
                        ? "bg-[#6366F1] border-[#6366F1] text-white"
                        : isDarkMode
                          ? "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"
                          : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {moodName}
                  </button>
                ))}
              </div>
            </div>
          </div>



          {/* Main Timeline Column */}
          <div className="space-y-12 text-left w-full">
              {/* Big Throwback Card */}
              {throwbackEntry && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkle weight="fill" className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>Throwback Memory</h3>
                  </div>
                  
                  <div
                    onClick={() => handleViewEntry(throwbackEntry)}
                    className={`relative rounded-3xl p-6 md:p-8 border cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${getMoodCardBg(throwbackEntry.mood, isDarkMode)}`}
                  >
                    {/* Glow badge */}
                    <div className="absolute top-0 right-0 p-4 bg-[#6366F1]/10 rounded-bl-3xl text-xs font-extrabold uppercase text-[#6366F1] tracking-widest">
                      {Date.now() - throwbackEntry.timestamp > 300 * 24 * 60 * 60 * 1000 ? "1 Year Ago" : "Throwback"}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      
                      {/* Left: Date Box */}
                      <div className="w-14 h-14 shrink-0 rounded-2xl flex flex-col items-center justify-center font-bold text-center border border-[#6366F1]/30 bg-[#6366F1]/5 text-[#6366F1] shadow-xs">
                        <span className="text-xl font-black leading-none">{getDayNumber(throwbackEntry.timestamp)}</span>
                        <span className="text-[10px] font-black tracking-widest text-[#6366F1]/80 mt-0.5 leading-none">{getShortMonth(throwbackEntry.timestamp)}</span>
                      </div>

                      {/* Right: Mood + Title + Text */}
                      <div className="flex-1 text-left space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border shadow-2xs ${
                            isDarkMode ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200"
                          }`}>
                            {moods.find((m) => m.name === throwbackEntry.mood) && (
                              <span className="w-7 h-7 flex items-center justify-center">
                                {moods.find((m) => m.name === throwbackEntry.mood)?.icon}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className={`text-xl md:text-2xl font-extrabold font-journal leading-tight ${theme.textHeading}`}>
                              {throwbackEntry.title}
                            </h3>
                            <span className="text-[10px] font-bold text-neutral-400">
                              {getRelativeDayName(throwbackEntry.timestamp)} &bull; {formatEntryTime(throwbackEntry.timestamp)}
                            </span>
                          </div>
                        </div>

                        {throwbackEntry.images && throwbackEntry.images.length > 0 && (
                          <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 my-2">
                            <img
                              src={throwbackEntry.images[0]}
                              alt={throwbackEntry.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <p className={`text-sm md:text-base font-journal leading-relaxed ${theme.textMuted}`}>
                          {throwbackEntry.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {throwbackEntry.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-full text-xs font-semibold font-sans ${
                                isDarkMode 
                                  ? "bg-white/5 border-white/10 text-stone-300" 
                                  : "bg-neutral-50 border-neutral-150 text-neutral-600"
                              }`}
                            >
                              {getTagIcon(tag)}
                              {tag.toLowerCase()}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
              {monthsList.length === 0 ? (
                <div className={`flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed ${isDarkMode ? "border-white/10 bg-white/[0.01]" : "border-neutral-250 bg-neutral-50/50"}`}>
                  <BookOpen className="w-12 h-12 text-[#6366F1] mb-3 opacity-60" />
                  <h4 className={`text-lg font-bold ${theme.textHeading}`}>No Memories Logged</h4>
                  <p className={`text-xs max-w-xs mt-1 ${theme.textMuted}`}>
                    Log your daily emotions and details on the dashboard to populate your memories canvas.
                  </p>
                </div>
              ) : (
                monthsList.map((monthKey) => (
                  <div
                    key={monthKey}
                    id={`month-${monthKey.replace(/\s+/g, "-")}`}
                    className="space-y-6 scroll-mt-6"
                  >
                    {/* Month marker */}
                    <div className="flex items-center gap-3 border-b border-neutral-200/20 dark:border-white/5 pb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                      <h2 className={`text-lg font-extrabold uppercase tracking-widest ${theme.textHeading}`}>
                        {monthKey}
                      </h2>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 ${theme.textMuted}`}>
                        {groupedEntries[monthKey].length} entries
                      </span>
                    </div>

                    {/* Timeline stack container */}
                    <div className="space-y-8 relative">
                      {groupedEntries[monthKey].map((entry) => {
                        const entryMood = moods.find((m) => m.name === entry.mood);
                        const hasImages = entry.images && entry.images.length > 0;
                        const dayNum = getDayNumber(entry.timestamp);
                        const monthShort = getShortMonth(entry.timestamp);
                        const relativeDay = getRelativeDayName(entry.timestamp);
                        const dayName = getDayName(entry.timestamp);

                        return (
                          <div key={entry.id} className="space-y-3 group">

                            {/* Entry Card */}
                            <div className={`rounded-3xl p-5 shadow-xs transition duration-300 ${getMoodCardBg(entry.mood, isDarkMode)}`}>
                              
                              <div className="space-y-4">
                                
                                {/* Top Content Row inside Card (Date Box + Emoji + Title + Time + Actions) */}
                                <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                                  
                                  <div className="flex items-center gap-3 text-left">
                                    {/* Date box inside card - themed indigo */}
                                    <div className="w-14 h-14 shrink-0 rounded-2xl flex flex-col items-center justify-center font-bold text-center border border-[#6366F1]/30 bg-[#6366F1]/5 text-[#6366F1] shadow-xs">
                                      <span className="text-xl font-black leading-none">{dayNum}</span>
                                      <span className="text-[10px] font-black tracking-widest text-[#6366F1]/80 mt-0.5 leading-none">{monthShort}</span>
                                    </div>

                                    {/* Mood emoji circular wrapper */}
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border shadow-2xs ${
                                      isDarkMode ? "bg-white/5 border-white/10" : "bg-neutral-100 border-neutral-200"
                                    }`}>
                                      {entryMood && (
                                        <span className="w-7 h-7 flex items-center justify-center">
                                          {entryMood.icon}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <h4
                                        onClick={() => handleViewEntry(entry)}
                                        className={`text-lg sm:text-xl font-bold font-journal leading-tight cursor-pointer hover:text-[#6366F1] transition-colors ${theme.textHeading}`}
                                      >
                                        {entry.title}
                                      </h4>
                                      <span className="text-[10px] font-bold text-neutral-400">
                                        {relativeDay} &bull; {formatEntryTime(entry.timestamp)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                                    <button
                                      onClick={() => handleEditEntry(entry)}
                                      aria-label="Edit entry"
                                      className={`p-1.5 rounded-full border transition hover:scale-105 ${
                                        isDarkMode
                                          ? "bg-white/5 border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white"
                                          : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                                      }`}
                                    >
                                      <PencilSimple weight="bold" className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEntry(entry.id)}
                                      aria-label="Delete entry"
                                      className={`p-1.5 rounded-full border transition hover:scale-105 ${
                                        isDarkMode
                                          ? "bg-white/5 border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 text-neutral-400 hover:text-rose-400"
                                          : "bg-neutral-50 border-neutral-200 hover:bg-rose-50 hover:border-rose-200 text-neutral-500 hover:text-rose-500"
                                      }`}
                                    >
                                      <TrashSimple weight="bold" className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                </div>

                                {/* Uploaded image shown below title if available */}
                                {hasImages && (
                                  <div
                                    onClick={() => handleViewEntry(entry)}
                                    className="w-full h-48 sm:h-60 rounded-2xl overflow-hidden cursor-pointer shadow-sm relative border border-black/5 dark:border-white/5"
                                  >
                                    <img
                                      src={entry.images![0]}
                                      alt={entry.title}
                                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                                    />
                                  </div>
                                )}

                                {/* Excerpt body text */}
                                <p
                                  onClick={() => handleViewEntry(entry)}
                                  className={`text-sm font-journal leading-relaxed cursor-pointer pr-4 ${theme.textMuted}`}
                                >
                                  {entry.excerpt}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {entry.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-full text-xs font-semibold font-sans transition ${
                                        isDarkMode 
                                          ? "bg-white/5 border-white/10 text-stone-300" 
                                          : "bg-neutral-50 border-neutral-150 text-neutral-600"
                                      }`}
                                    >
                                      {getTagIcon(tag)}
                                      {tag.toLowerCase()}
                                    </span>
                                  ))}
                                </div>

                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
          </div>

        </main>

      </div>

      {/* Mood logging modal */}
      {activeMoodObj && (
        <MoodEntryModal
          isOpen={moodModalOpen}
          mood={activeMoodObj}
          isDarkMode={isDarkMode}
          initialEntry={modalInitialEntry}
          isReadOnly={modalReadOnly}
          onClose={() => {
            setMoodModalOpen(false);
            setEditingEntryId(null);
          }}
          onSubmit={handleMoodSubmit}
        />
      )}
    </div>
  );
}
