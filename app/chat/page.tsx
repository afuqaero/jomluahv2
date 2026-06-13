"use client";

import { useState } from "react";
import { ChatCircleDots, ShieldCheck } from "@phosphor-icons/react";
import { useAppTheme } from "../components/useAppTheme";
import AppSidebar, { MobileMenuButton, BackgroundDecor } from "../components/AppSidebar";

export default function ChatPage() {
  const { isDarkMode, setIsDarkMode, isSidebarCollapsed, setIsSidebarCollapsed, theme } = useAppTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <BackgroundDecor isDarkMode={isDarkMode} />

        <MobileMenuButton isDarkMode={isDarkMode} onOpen={() => setIsSidebarOpen(true)} />

        <main className="relative z-10 my-6 sm:my-8 flex-grow max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">

          {/* Header */}
          <div className="text-left animate-fade-in-up">
            <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold mb-1.5 ${theme.textMuted}`}>
              <ChatCircleDots weight="duotone" className="w-4 h-4 sm:w-5 sm:h-5 text-[#6366F1]" />
              <span>Your supportive AI companion</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight">
              Companion <span className="font-extrabold text-[#6366F1] drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]">AI</span>
            </h1>
            <p className={`text-sm mt-2 max-w-md leading-relaxed ${theme.textMuted}`}>
              A calm space to talk things through, any time you need it.
            </p>
          </div>

          {/* Blank canvas, ready for the chat UI */}
          <div
            className={`flex-grow rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-3 min-h-[50vh] animate-fade-in-up [animation-delay:100ms] ${
              isDarkMode ? "border-white/10" : "border-neutral-300"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white shadow-md">
              <ChatCircleDots weight="duotone" className="w-7 h-7" />
            </div>
            <div>
              <h3 className={`font-journal text-2xl ${theme.textHeading}`}>Coming soon</h3>
              <p className={`text-xs mt-1 max-w-sm ${theme.textMuted}`}>The Companion AI chat experience is being designed — check back soon.</p>
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-neutral-200/10 pt-6 flex flex-col md:flex-row justify-between text-xs text-[#a0a5c0] gap-4">
          <span className="flex items-center gap-2">
            <ShieldCheck weight="duotone" className="w-4 h-4 text-[#6366F1] shrink-0" /> Active secure sandbox session for ali@student.uthm.edu.my
          </span>
          <div className="text-left md:text-right">
            <span>Final Year Project (PSM) • UTHM PCU Integration</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
