"use client";

import { cloneElement, useState } from "react";
import {
  CaretLeft,
  Plus,
  Notebook,
  CalendarBlank,
  Clock,
  TrashSimple,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useAppTheme } from "../components/useAppTheme";
import AppSidebar, { MobileMenuButton, BackgroundDecor } from "../components/AppSidebar";
import IdeaBoardIllustration from "../components/IdeaBoardIllustration";
import NoteEditorModal, { type NotePayload } from "./NoteEditorModal";
import NewFolderModal, { coverOptions, iconOptions, type NewFolderPayload } from "./NewFolderModal";

type IdeaNote = {
  id: number;
  title: string;
  body: string;
  timestamp: number;
  isNew?: boolean;
};

type IdeaFolder = {
  id: number;
  name: string;
  description: string;
  coverId: string;
  iconId: string;
  notes: IdeaNote[];
  isNew?: boolean;
};

const initialFolders: IdeaFolder[] = [
  {
    id: 1,
    name: "Gratitude Jar",
    description: "Little things that made today better.",
    coverId: "rose",
    iconId: "heart",
    notes: [
      {
        id: 1,
        title: "Morning coffee on the balcony",
        body: "The air was cool and the coffee was perfect. Five minutes of doing absolutely nothing felt like a small luxury.",
        timestamp: new Date("2026-06-12T08:05:00+08:00").getTime(),
      },
      {
        id: 2,
        title: "A kind message from Aina",
        body: "She checked in on me out of nowhere and it made my whole afternoon. Need to remember to do the same for others.",
        timestamp: new Date("2026-06-10T19:40:00+08:00").getTime(),
      },
    ],
  },
  {
    id: 2,
    name: "Dream Log",
    description: "Strange, vivid, half-remembered dreams.",
    coverId: "violet",
    iconId: "moon",
    notes: [
      {
        id: 1,
        title: "The library that kept growing",
        body: "Every door led to another reading room, shelves stretching up forever. I wasn't lost, just curious. Woke up feeling oddly calm.",
        timestamp: new Date("2026-06-11T06:50:00+08:00").getTime(),
      },
    ],
  },
  {
    id: 3,
    name: "Random Sparks",
    description: "Ideas worth coming back to.",
    coverId: "amber",
    iconId: "lightbulb",
    notes: [
      {
        id: 1,
        title: "Tiny ritual before bed",
        body: "What if I wrote one sentence about today, no matter how small, right before sleeping? Could be a nice way to close the day.",
        timestamp: new Date("2026-06-09T22:15:00+08:00").getTime(),
      },
      {
        id: 2,
        title: "Walk + voice notes",
        body: "Ideas come easier when walking. Maybe record quick voice notes during evening walks instead of trying to remember everything later.",
        timestamp: new Date("2026-06-06T17:30:00+08:00").getTime(),
      },
    ],
  },
  {
    id: 4,
    name: "Goals & Vision",
    description: "Where I'm headed, and why.",
    coverId: "emerald",
    iconId: "target",
    notes: [
      {
        id: 1,
        title: "This semester, one thing at a time",
        body: "Instead of juggling everything, pick the one task that matters most each day and actually finish it before moving on.",
        timestamp: new Date("2026-06-08T09:00:00+08:00").getTime(),
      },
    ],
  },
];

const formatNoteDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en-MY", { timeZone: "Asia/Kuala_Lumpur", month: "long", day: "numeric" }).format(timestamp);

const formatNoteTime = (timestamp: number) =>
  new Intl.DateTimeFormat("en-MY", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", minute: "2-digit", hour12: true }).format(timestamp);

export default function IdeaBoardPage() {
  const { isDarkMode, setIsDarkMode, isSidebarCollapsed, setIsSidebarCollapsed, theme } = useAppTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [folders, setFolders] = useState<IdeaFolder[]>(initialFolders);
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);

  const activeFolder = folders.find((folder) => folder.id === activeFolderId) ?? null;
  const editingNote = activeFolder?.notes.find((note) => note.id === editingNoteId) ?? null;

  const noteModalInitial = editingNote
    ? { title: editingNote.title, body: editingNote.body, timestamp: editingNote.timestamp }
    : null;

  const handleOpenFolder = (id: number) => setActiveFolderId(id);
  const handleBackToFolders = () => setActiveFolderId(null);

  const handleNewNote = () => {
    setEditingNoteId(null);
    setNoteModalOpen(true);
  };

  const handleEditNote = (note: IdeaNote) => {
    setEditingNoteId(note.id);
    setNoteModalOpen(true);
  };

  const closeNoteModal = () => {
    setNoteModalOpen(false);
    setEditingNoteId(null);
  };

  const handleSubmitNote = (payload: NotePayload) => {
    if (!activeFolder) return;

    setFolders((prev) =>
      prev.map((folder) => {
        if (folder.id !== activeFolder.id) return folder;

        if (editingNoteId !== null) {
          return {
            ...folder,
            notes: folder.notes.map((note) =>
              note.id === editingNoteId
                ? { ...note, title: payload.title.trim(), body: payload.body, timestamp: payload.timestamp }
                : note
            ),
          };
        }

        const newNote: IdeaNote = {
          id: Date.now(),
          title: payload.title.trim(),
          body: payload.body,
          timestamp: payload.timestamp,
          isNew: true,
        };

        return { ...folder, notes: [newNote, ...folder.notes] };
      })
    );

    closeNoteModal();
  };

  const handleDeleteNote = () => {
    if (!activeFolder || editingNoteId === null) return;
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === activeFolder.id ? { ...folder, notes: folder.notes.filter((note) => note.id !== editingNoteId) } : folder
      )
    );
    closeNoteModal();
  };

  const handleCreateFolder = (payload: NewFolderPayload) => {
    const newFolder: IdeaFolder = {
      id: Date.now(),
      name: payload.name,
      description: payload.description || "A fresh space for new thoughts.",
      coverId: payload.coverId,
      iconId: payload.iconId,
      notes: [],
      isNew: true,
    };
    setFolders((prev) => [...prev, newFolder]);
    setFolderModalOpen(false);
    setActiveFolderId(newFolder.id);
  };

  const handleDeleteFolder = (id: number) => {
    const folder = folders.find((f) => f.id === id);
    if (!folder) return;
    if (!window.confirm(`Delete "${folder.name}" and all its notes?`)) return;
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (activeFolderId === id) setActiveFolderId(null);
  };

  const coverFor = (id: string) => coverOptions.find((c) => c.id === id) ?? coverOptions[0];
  const iconFor = (id: string) => iconOptions.find((i) => i.id === id) ?? iconOptions[0];

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

          {activeFolder ? (
            <>
              {/* Folder header */}
              <div className="space-y-4 animate-fade-in-up">
                <button
                  onClick={handleBackToFolders}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#6366F1] hover:underline group"
                >
                  <CaretLeft weight="bold" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" /> All Notebooks
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${coverFor(activeFolder.coverId).cover}`}>
                      {cloneElement(iconFor(activeFolder.iconId).icon, { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <h2 className={`font-journal text-3xl sm:text-4xl leading-tight ${theme.textHeading}`}>{activeFolder.name}</h2>
                      <p className={`text-xs mt-0.5 ${theme.textMuted}`}>{activeFolder.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleNewNote}
                      className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition duration-300 shadow-md hover:scale-[1.02] ${
                        isDarkMode ? "bg-white hover:bg-neutral-100 text-stone-950" : "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                      }`}
                    >
                      <Plus weight="bold" className="w-3.5 h-3.5" /> New Note
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(activeFolder.id)}
                      aria-label="Delete notebook"
                      className={`p-2.5 rounded-full border transition ${
                        isDarkMode ? "border-white/10 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400" : "border-neutral-200 hover:bg-rose-50 text-neutral-400 hover:text-rose-500"
                      }`}
                    >
                      <TrashSimple weight="bold" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up [animation-delay:100ms]">
                {activeFolder.notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleEditNote(note)}
                    className={`${theme.card} relative rounded-3xl p-5 flex flex-col justify-between h-48 hover:scale-[1.02] hover:shadow-xl transition duration-300 text-left ${note.isNew ? "animate-pop-in" : ""}`}
                  >
                    <div className="space-y-2">
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                        <CalendarBlank weight="duotone" className="w-3.5 h-3.5" /> {formatNoteDate(note.timestamp)}
                        <span className="opacity-30">•</span>
                        <Clock weight="duotone" className="w-3.5 h-3.5" /> {formatNoteTime(note.timestamp)}
                      </span>
                      <h4 className={`font-journal text-2xl leading-tight line-clamp-1 ${theme.textHeading}`}>
                        {note.title || "Untitled"}
                      </h4>
                      <p className={`font-journal text-base leading-relaxed line-clamp-3 ${theme.textMuted}`}>
                        {note.body || "Nothing written yet — tap to add your thoughts."}
                      </p>
                    </div>
                  </button>
                ))}

                {/* New Note placeholder */}
                <button
                  onClick={handleNewNote}
                  className={`border-2 border-dashed rounded-3xl p-5 flex flex-col items-center justify-center h-48 transition duration-300 text-center gap-3 group ${
                    isDarkMode
                      ? "border-white/10 hover:border-[#6366F1]/50 bg-white/1 hover:bg-[#6366F1]/5"
                      : "border-neutral-300 hover:border-[#6366F1]/50 bg-neutral-50/50 hover:bg-[#6366F1]/5"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition duration-300 group-hover:rotate-90 ${
                    isDarkMode ? "bg-white/5 border-white/10 group-hover:bg-[#6366F1]/10 group-hover:border-[#6366F1]" : "bg-white border-neutral-300 group-hover:border-[#6366F1]"
                  }`}>
                    <Plus weight="bold" className={`w-5 h-5 transition ${isDarkMode ? "text-neutral-400 group-hover:text-white" : "text-neutral-600 group-hover:text-[#6366F1]"}`} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wider ${theme.textHeading}`}>New Note</h4>
                    <p className={`text-xs mt-1 ${theme.textMuted}`}>Capture a thought</p>
                  </div>
                </button>
              </section>
            </>
          ) : (
            <>
              {/* Idea Board header */}
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6 animate-fade-in-up">
                <div className="text-left max-w-xl">
                  <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold mb-1.5 ${theme.textMuted}`}>
                    <Notebook weight="duotone" className="w-4 h-4 sm:w-5 sm:h-5 text-[#6366F1]" />
                    <span>Your private idea space</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight">
                    Idea <span className="font-extrabold text-[#6366F1] drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]">Board</span>
                  </h1>
                  <p className={`text-sm mt-2 leading-relaxed ${theme.textMuted}`}>
                    A freeform space for thoughts, brainstorms and lists — no dates, no mood tracking. Organise whatever&apos;s on your mind into its own notebook.
                  </p>
                </div>
                <IdeaBoardIllustration isDarkMode={isDarkMode} />
              </div>

              {/* Notebooks grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up [animation-delay:100ms]">
                {folders.map((folder) => {
                  const cover = coverFor(folder.coverId);
                  const icon = iconFor(folder.iconId);
                  return (
                    <div
                      key={folder.id}
                      className={`group relative rounded-3xl overflow-hidden h-48 ${folder.isNew ? "animate-pop-in" : ""}`}
                    >
                      <button
                        onClick={() => handleOpenFolder(folder.id)}
                        className={`absolute inset-0 p-5 flex flex-col justify-between text-left transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl ${cover.cover} text-white shadow-lg`}
                      >
                        {/* Spiral binding dots */}
                        <div className="absolute left-3 top-6 bottom-6 flex flex-col justify-between">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/30" />
                          ))}
                        </div>

                        <div className="pl-6 flex items-center justify-between">
                          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                            {cloneElement(icon.icon, { className: "w-5 h-5" })}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-full">
                            {folder.notes.length} {folder.notes.length === 1 ? "note" : "notes"}
                          </span>
                        </div>

                        <div className="pl-6 space-y-1">
                          <h3 className="font-journal text-3xl leading-tight">{folder.name}</h3>
                          <p className="text-xs opacity-80 leading-snug line-clamp-2">{folder.description}</p>
                        </div>
                      </button>

                      {/* Delete notebook (visible on hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        aria-label={`Delete ${folder.name} notebook`}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/15 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/30"
                      >
                        <TrashSimple weight="bold" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {/* New Notebook placeholder */}
                <button
                  onClick={() => setFolderModalOpen(true)}
                  className={`border-2 border-dashed rounded-3xl p-5 flex flex-col items-center justify-center h-48 transition duration-300 text-center gap-3 group ${
                    isDarkMode
                      ? "border-white/10 hover:border-[#6366F1]/50 bg-white/1 hover:bg-[#6366F1]/5"
                      : "border-neutral-300 hover:border-[#6366F1]/50 bg-neutral-50/50 hover:bg-[#6366F1]/5"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition duration-300 group-hover:rotate-90 ${
                    isDarkMode ? "bg-white/5 border-white/10 group-hover:bg-[#6366F1]/10 group-hover:border-[#6366F1]" : "bg-white border-neutral-300 group-hover:border-[#6366F1]"
                  }`}>
                    <Plus weight="bold" className={`w-5 h-5 transition ${isDarkMode ? "text-neutral-400 group-hover:text-white" : "text-neutral-600 group-hover:text-[#6366F1]"}`} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wider ${theme.textHeading}`}>New Notebook</h4>
                    <p className={`text-xs mt-1 ${theme.textMuted}`}>Start a fresh collection</p>
                  </div>
                </button>
              </section>
            </>
          )}

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

      {/* Note editor popup */}
      {activeFolder && (
        <NoteEditorModal
          isOpen={noteModalOpen}
          isDarkMode={isDarkMode}
          folderName={activeFolder.name}
          folderCover={coverFor(activeFolder.coverId).cover}
          folderIcon={iconFor(activeFolder.iconId).icon}
          initialEntry={noteModalInitial}
          onClose={closeNoteModal}
          onSubmit={handleSubmitNote}
          onDelete={editingNote ? handleDeleteNote : undefined}
        />
      )}

      {/* New notebook popup */}
      <NewFolderModal
        isOpen={folderModalOpen}
        isDarkMode={isDarkMode}
        onClose={() => setFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}
