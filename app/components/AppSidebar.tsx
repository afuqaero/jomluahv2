"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  CaretLineLeft,
  CaretLineRight,
  Plus,
} from "@phosphor-icons/react";
import type { ThemeTokens } from "./useAppTheme";

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
      <Icon weight="duotone" className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" /> {!collapsed && label}
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
      <aside className={`hidden lg:flex lg:flex-col lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto lg:border-r ${theme.sidebar} p-6 justify-between transition-[width] duration-300 ${
        isSidebarCollapsed ? "lg:w-24" : "lg:w-72"
      }`}>
        {/* Floating collapse/expand toggle — always anchored to the same spot on the sidebar's edge */}
        <button
          onClick={onToggleSidebarCollapsed}
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
          </div>

          {renderFooterLinks(false)}
        </aside>
      </div>
    </>
  );
}

/** Floating bottom navigation bar for mobile — replaces the hamburger menu. */
export function MobileBottomNav({ onNewEntry }: { onNewEntry?: () => void }) {
  const pathname = usePathname();

  return (
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
          onClick={onNewEntry}
          aria-label="New entry"
          className="w-12 h-12 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#6366F1]/30 transition duration-200 transform hover:scale-105 -mt-6"
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
