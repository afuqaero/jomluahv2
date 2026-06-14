"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { useInactivityLogout } from "../lib/useInactivityLogout";
import {
  ChatCircleDots,
  Notebook,
  ClockCounterClockwise,
  SignOut,
  Moon,
  Sun,
  X,
  SquaresFour,
  GearSix,
  CaretLeft,
  CaretRight,
  Plus,
  BookOpen,
} from "@phosphor-icons/react";
import type { ThemeTokens } from "./useAppTheme";
import { HappyEmoji, GoodEmoji, OkayEmoji, SadEmoji } from "../dashboard/ResponsiveAssets";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/chat", label: "Companion AI", icon: ChatCircleDots },
  { href: "/journal", label: "Idea Board", icon: Notebook },
  { href: "/memories", label: "Memories", icon: ClockCounterClockwise },
];

interface AppSidebarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapsed: () => void;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  theme: ThemeTokens;
}

export default function AppSidebar({
  isDarkMode,
  onToggleDarkMode,
  isSidebarCollapsed,
  onToggleSidebarCollapsed,
  isSidebarOpen,
  onCloseSidebar,
  theme,
}: AppSidebarProps) {
  const pathname = usePathname();

  // Auto sign-out after a period of inactivity to protect private data on unattended devices.
  useInactivityLogout();

  // Allow closing the mobile drawer with Escape
  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseSidebar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, onCloseSidebar]);

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
      onClick={onCloseSidebar}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={navLinkClass(pathname === href, collapsed)}
    >
      <Icon weight="duotone" className={`${collapsed ? "w-[22px] h-[22px]" : "w-4 h-4"} shrink-0 transition-transform duration-200 group-hover:scale-110`} /> {!collapsed && label}
    </Link>
  ));

  const renderFooterLinks = (collapsed: boolean) => (
    <div className="space-y-2 pt-6 border-t border-neutral-200/20">
      <button
        onClick={onToggleDarkMode}
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
        onClick={async () => {
          await supabase.auth.signOut();
        }}
        title={collapsed ? "Logout" : undefined}
        aria-label={collapsed ? "Logout" : undefined}
        className={`group flex items-center gap-3 rounded-lg text-rose-500 hover:text-rose-700 text-sm font-bold transition ${collapsed ? "justify-center px-0 py-2" : "px-3 py-2"}`}
      >
        <SignOut weight="duotone" className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" /> {!collapsed && "Logout"}
      </Link>
    </div>
  );

  return (
    <>
      {/* Persistent Sidebar (desktop) */}
      <aside className={`hidden lg:flex lg:flex-col lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:border-r ${theme.sidebar} relative transition-[width] duration-300 ${
        isSidebarCollapsed ? "lg:w-24" : "lg:w-72"
      }`}>
        {/* Floating collapse/expand toggle — always anchored to the same spot on the sidebar's edge */}
        <button
          onClick={onToggleSidebarCollapsed}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-20 w-8 h-8 rounded-full border flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? "bg-[#1c1f2b] border-white/10 hover:bg-[#262a38] hover:border-white/20 text-neutral-300" 
              : "bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600"
          }`}
        >
          {isSidebarCollapsed ? <CaretRight weight="bold" className="w-4 h-4" /> : <CaretLeft weight="bold" className="w-4 h-4" />}
        </button>

        {/* Scrollable contents inside to prevent button clipping */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6 scrollbar-none h-full w-full">
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

            {/* Quote of the Day Card */}
            {!isSidebarCollapsed && (
              <div className="mt-6 px-3 animate-fade-in-up">
                <div className="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-[#6366F1] to-[#4F46E5] shadow-lg shadow-[#6366F1]/20 border-none text-center flex flex-col items-center justify-center">
                  <span className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 border border-white/25 text-white mb-3 select-none">
                    Quote of the Day
                  </span>
                  <p className="text-xs font-bold leading-relaxed italic">
                    &ldquo;Every entry brings you closer to understanding yourself.&rdquo;
                  </p>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-150 mt-1.5">
                    — UNKNOWN —
                  </span>
                  <p className="text-[9px] text-indigo-200/90 font-light mt-2 leading-relaxed max-w-[180px] mx-auto">
                    Take a deep breath and let this message guide your thoughts as you journal today.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-8">
            {renderFooterLinks(isSidebarCollapsed)}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer — desktop only accessible via drawer on lg:hidden pages */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Backdrop overlay */}
        <div
          onClick={onCloseSidebar}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          aria-hidden="true"
        />

        {/* Drawer content */}
        <aside className={`absolute left-0 top-0 bottom-0 w-72 ${theme.sidebar} p-6 flex flex-col justify-between transition-transform duration-300 transform shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="space-y-8">
            {/* Drawer Header with Close Button */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`text-xl font-bold tracking-tight ${theme.textHeading}`}>JomLuah</span>
              </div>
              <button
                onClick={onCloseSidebar}
                aria-label="Close menu"
                className={`p-2 rounded-lg border transition ${
                  isDarkMode ? "border-white/10 hover:bg-white/5 text-neutral-400" : "border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                }`}
              >
                <X weight="bold" className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Menu Links */}
            <nav className="space-y-1 text-left" aria-label="Main navigation">
              <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block px-3 mb-2">Overview</span>
              {renderNavLinks(false)}
            </nav>

            {/* Quote of the Day Card */}
            <div className="mt-4 px-3 animate-fade-in-up">
              <div className="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-[#6366F1] to-[#4F46E5] shadow-lg shadow-[#6366F1]/20 border-none text-center flex flex-col items-center justify-center">
                <span className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 border border-white/25 text-white mb-3 select-none">
                  Quote of the Day
                </span>
                <p className="text-xs font-bold leading-relaxed italic">
                  &ldquo;Every entry brings you closer to understanding yourself.&rdquo;
                </p>
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-150 mt-1.5">
                  — UNKNOWN —
                </span>
                <p className="text-[9px] text-indigo-200/90 font-light mt-2 leading-relaxed max-w-[180px] mx-auto">
                  Take a deep breath and let this message guide your thoughts as you journal today.
                </p>
              </div>
            </div>
          </div>

          {renderFooterLinks(false)}
        </aside>
      </div>
    </>
  );
}

/** Floating bottom navigation bar for mobile — replaces the hamburger menu. */
export function MobileBottomNav({ onNewEntry }: { onNewEntry?: (moodName?: string) => void }) {
  const pathname = usePathname();
  const [showPopup, setShowPopup] = useState(false);
  const [menuStep, setMenuStep] = useState<"main" | "mood" | "notebook">("main");
  const [folders, setFolders] = useState<any[]>([]);

  useEffect(() => {
    const loadFolders = async () => {
      if (!showPopup) return;
      setMenuStep("main");
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from("folders")
          .select("id, name, type")
          .order("created_at", { ascending: true });
        if (!error && data) {
          setFolders(data);
          return;
        }
      }

      const stored = localStorage.getItem("jomluah-folders");
      if (stored) {
        try {
          setFolders(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        setFolders([
          { id: 1, name: "Gratitude Jar", type: "journal" },
          { id: 2, name: "Dream Log", type: "journal" },
          { id: 3, name: "Work Tasks", type: "todo" },
          { id: 4, name: "Goals & Vision", type: "todo" }
        ]);
      }
    };
    loadFolders();
  }, [showPopup]);

  // Handle ESC key to close the popup
  useEffect(() => {
    if (!showPopup) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPopup(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPopup]);

  const handleAction = (url: string, isJournalAction = false, moodParam?: string) => {
    setShowPopup(false);
    if (isJournalAction && onNewEntry && pathname === "/dashboard") {
      onNewEntry(moodParam);
    } else {
      window.location.href = url;
    }
  };

  const moodsList = [
    { name: "Happy", icon: <HappyEmoji className="w-7 h-7" />, color: "from-amber-300 to-orange-400" },
    { name: "Good", icon: <GoodEmoji className="w-7 h-7" />, color: "from-emerald-300 to-teal-400" },
    { name: "Okay", icon: <OkayEmoji className="w-7 h-7" />, color: "from-sky-300 to-cyan-400" },
    { name: "Sad", icon: <SadEmoji className="w-7 h-7" />, color: "from-blue-300 to-indigo-400" },
  ];

  return (
    <>
      {/* Backdrop */}
      {showPopup && (
        <div
          onClick={() => setShowPopup(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-45 animate-backdrop-fade"
        />
      )}

      {/* Pop-up options */}
      {showPopup && (
        <div className="fixed bottom-24 left-0 right-0 px-6 z-50 animate-modal-pop">
          <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-neutral-200/50 dark:border-white/10 rounded-3xl p-5 shadow-2xl max-w-xs mx-auto space-y-3 text-left">
            
            {menuStep === "main" && (
              <>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 dark:text-stone-500 mb-2 px-1">
                  What would you like to do?
                </h4>
                
                {/* Create Journal */}
                <button
                  onClick={() => setMenuStep("mood")}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl transition hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-stone-100"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="journalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818CF8" />
                          <stop offset="100%" stopColor="#4F46E5" />
                        </linearGradient>
                      </defs>
                      <path d="M4 3h12a3 3 0 013 3v12a3 3 0 01-3 3H4V3z" fill="url(#journalGrad)" />
                      <rect x="2" y="5" width="2" height="1.5" rx="0.5" fill="#C7D2FE" />
                      <rect x="2" y="9" width="2" height="1.5" rx="0.5" fill="#C7D2FE" />
                      <rect x="2" y="13" width="2" height="1.5" rx="0.5" fill="#C7D2FE" />
                      <rect x="2" y="17" width="2" height="1.5" rx="0.5" fill="#C7D2FE" />
                      <path d="M12 8.5c-.8-1-2.2-1.3-3-.3a2.2 2.2 0 000 3.2l3 3.1 3-3.1a2.2 2.2 0 000-3.2c-.8-1-2.2-.7-3 .3z" fill="#FFF" opacity="0.9" />
                      <path d="M17 5.5l.5.8.8.5-.8.5-.5.8-.5-.8-.8-.5.8-.5.5-.8z" fill="#FBBF24" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold block">Log Mood & Journal</span>
                    <span className="text-[10px] text-neutral-500 dark:text-stone-400 block -mt-0.5">Write down your feelings</span>
                  </div>
                </button>
 
                {/* Create Note */}
                <button
                  onClick={() => setMenuStep("notebook")}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl transition hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-stone-100"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="noteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#34D399" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                      <path d="M6 3h8l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" fill="url(#noteGrad)" />
                      <path d="M14 3v5h5L14 3z" fill="#A7F3D0" opacity="0.9" />
                      <line x1="7" y1="11" x2="13" y2="11" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                      <line x1="7" y1="14" x2="15" y2="14" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                      <line x1="7" y1="17" x2="11" y2="17" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                      <circle cx="15" cy="17" r="1.5" fill="#FFF" opacity="0.9" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold block">Add Notebook Note</span>
                    <span className="text-[10px] text-neutral-500 dark:text-stone-400 block -mt-0.5">Capture a thought or task</span>
                  </div>
                </button>
 
                {/* Chat with Companion AI */}
                <button
                  onClick={() => handleAction("/chat")}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl transition hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-stone-100"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FBBF24" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                        <linearGradient id="aiCore" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFF" />
                          <stop offset="100%" stopColor="#FFE082" />
                        </linearGradient>
                      </defs>
                      <circle cx="12" cy="12" r="9" fill="url(#aiGrad)" />
                      <circle cx="12" cy="12" r="5" fill="url(#aiCore)" />
                      <path d="M12 4a8 8 0 018 8" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
                      <path d="M12 20a8 8 0 01-8-8" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
                      <path d="M18 6.5l.5.5.5-.5-.5-.5-.5.5z" fill="#FFF" />
                      <path d="M6 17.5l.5.5.5-.5-.5-.5-.5.5z" fill="#FFF" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold block">Chat with AI</span>
                    <span className="text-[10px] text-neutral-500 dark:text-stone-400 block -mt-0.5">Talk to your companion</span>
                  </div>
                </button>
              </>
            )}

            {menuStep === "mood" && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setMenuStep("main")}
                    className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 dark:text-stone-400"
                  >
                    <CaretLeft weight="bold" className="w-4 h-4" />
                  </button>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 dark:text-stone-500">
                    How are you feeling?
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {moodsList.map((mood) => (
                    <button
                      key={mood.name}
                      onClick={() => handleAction(`/dashboard?newJournal=true&mood=${mood.name}`, true, mood.name)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl border border-neutral-200/50 dark:border-white/5 bg-neutral-50 dark:bg-white/2 hover:scale-105 transition-all duration-200"
                    >
                      <div className="w-10 h-10 flex items-center justify-center mb-1 transition-transform duration-200 hover:scale-110">
                        {mood.icon}
                      </div>
                      <span className="text-xs font-bold text-neutral-800 dark:text-stone-200">{mood.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {menuStep === "notebook" && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setMenuStep("main")}
                    className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 dark:text-stone-400"
                  >
                    <CaretLeft weight="bold" className="w-4 h-4" />
                  </button>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 dark:text-stone-500">
                    Choose a Notebook folder
                  </h4>
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleAction(`/journal?newNote=true&folderId=${folder.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 text-left border border-transparent hover:border-neutral-200/50 dark:hover:border-white/5 transition"
                    >
                      <span className="text-xs font-bold text-neutral-800 dark:text-stone-200 line-clamp-1">{folder.name}</span>
                      <span className="text-[10px] text-neutral-400 dark:text-stone-500 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 font-semibold shrink-0 uppercase tracking-wider">
                        {folder.type || "notebook"}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      )}

      <div className="lg:hidden fixed bottom-4 left-0 right-0 px-6 z-40">
        <div className="bg-white/70 dark:bg-stone-900/75 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full py-3 px-6 shadow-2xl flex items-center justify-between max-w-md mx-auto">

          {/* Dashboard */}
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            className={`p-2 transition duration-200 ${
              pathname === "/dashboard" ? "text-[#6366F1]" : "text-neutral-500 dark:text-stone-400 hover:text-[#6366F1]"
            }`}
          >
            <SquaresFour weight="duotone" className="w-6 h-6" />
          </Link>

          {/* Companion AI */}
          <Link
            href="/chat"
            aria-label="Companion AI"
            className={`p-2 transition duration-200 ${
              pathname === "/chat" ? "text-[#6366F1]" : "text-neutral-500 dark:text-stone-400 hover:text-[#6366F1]"
            }`}
          >
            <ChatCircleDots weight="duotone" className="w-6 h-6" />
          </Link>

          {/* Floating Plus CTA */}
          <button
            onClick={() => setShowPopup(!showPopup)}
            aria-label="New entry menu"
            className={`w-12 h-12 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#6366F1]/30 transition duration-300 transform hover:scale-105 -mt-6 ${
              showPopup ? "rotate-45" : ""
            }`}
          >
            <Plus weight="bold" className="w-5 h-5" />
          </button>

          {/* Idea Board */}
          <Link
            href="/journal"
            aria-label="Idea Board"
            className={`p-2 transition duration-200 ${
              pathname === "/journal" ? "text-[#6366F1]" : "text-neutral-500 dark:text-stone-400 hover:text-[#6366F1]"
            }`}
          >
            <Notebook weight="duotone" className="w-6 h-6" />
          </Link>

          {/* Memories */}
          <Link
            href="/memories"
            aria-label="Memories"
            className={`p-2 transition duration-200 ${
              pathname === "/memories" ? "text-[#6366F1]" : "text-neutral-500 dark:text-stone-400 hover:text-[#6366F1]"
            }`}
          >
            <ClockCounterClockwise weight="duotone" className="w-6 h-6" />
          </Link>

        </div>
      </div>
    </>
  );
}

export function BackgroundDecor({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <>
      {/* Background radial highlights — warm amber/rose "lamplight" glow for a cozy journal-at-night feel */}
      {isDarkMode && (
        <>
          <div aria-hidden="true" className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.10)_0%,transparent_70%)] pointer-events-none blur-3xl animate-float-slow" />
          <div aria-hidden="true" className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.07)_0%,transparent_70%)] pointer-events-none blur-3xl animate-float-delayed" />
        </>
      )}

      {/* Subtle grid background overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.015] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </>
  );
}
