"use client";

import { cloneElement, useState, useEffect } from "react";
import {
  CaretLeft,
  Plus,
  Notebook,
  CalendarBlank,
  Clock,
  TrashSimple,
  ShieldCheck,
  Check,
  FileText,
  MagnifyingGlass,
  CheckSquare,
  Square,
  Funnel
} from "@phosphor-icons/react";
import { useAppTheme } from "../components/useAppTheme";
import AppSidebar, { MobileBottomNav, BackgroundDecor } from "../components/AppSidebar";
import NoteEditorModal, { type NotePayload } from "./NoteEditorModal";
import NewFolderModal, { coverOptions, iconOptions, type NewFolderPayload } from "./NewFolderModal";
import { supabase } from "../lib/supabaseClient";

type IdeaNote = {
  id: number | string;
  title: string;
  body: string;
  timestamp: number;
  completed?: boolean;
  isNew?: boolean;
};

type IdeaFolder = {
  id: number | string;
  name: string;
  description: string;
  coverId: string;
  iconId: string;
  type: "journal" | "todo";
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
    type: "journal",
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
    type: "journal",
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
    name: "Work Tasks",
    description: "Urgent check-ins and tasks.",
    coverId: "sky",
    iconId: "target",
    type: "todo",
    notes: [
      {
        id: 1,
        title: "Finalize FYP presentation slides",
        body: "",
        timestamp: new Date("2026-06-13T10:00:00+08:00").getTime(),
        completed: false,
      },
      {
        id: 2,
        title: "Revise literature review methodology",
        body: "",
        timestamp: new Date("2026-06-12T14:30:00+08:00").getTime(),
        completed: true,
      },
    ],
  },
  {
    id: 4,
    name: "Goals & Vision",
    description: "Where I'm headed, and why.",
    coverId: "emerald",
    iconId: "target",
    type: "journal",
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
  const [folders, setFolders] = useState<IdeaFolder[]>(initialFolders);
  const [activeFolderId, setActiveFolderId] = useState<number | string | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | string | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "journal" | "todo">("all");
  const [quickTodoText, setQuickTodoText] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [user, setUser] = useState<any>(null);

  const activeFolder = folders.find((folder) => folder.id === activeFolderId) ?? null;
  const editingNote = activeFolder?.notes.find((note) => note.id === editingNoteId) ?? null;

  // Load folders from Supabase (or fallback to localStorage) on mount
  useEffect(() => {
    const fetchUserAndFolders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data, error } = await supabase
          .from("folders")
          .select("*, notes(*)")
          .order("created_at", { ascending: true });
        if (!error && data && data.length > 0) {
          const mapped: IdeaFolder[] = data.map((f: any) => ({
            id: f.id,
            name: f.name,
            description: f.description,
            coverId: f.cover_id,
            iconId: f.icon_id,
            type: f.type,
            notes: (f.notes || []).map((n: any) => ({
              id: n.id,
              title: n.title,
              body: n.body || "",
              timestamp: new Date(n.timestamp).getTime(),
              completed: n.completed,
            })),
          }));
          setFolders(mapped);
        } else {
          // Seed DB with initial folders and notes
          for (const folder of initialFolders) {
            const { data: insertedFolder } = await supabase
              .from("folders")
              .insert({
                user_id: session.user.id,
                name: folder.name,
                description: folder.description,
                cover_id: folder.coverId,
                icon_id: folder.iconId,
                type: folder.type,
              })
              .select()
              .single();

            if (insertedFolder && folder.notes.length > 0) {
              for (const note of folder.notes) {
                await supabase.from("notes").insert({
                  folder_id: insertedFolder.id,
                  title: note.title,
                  body: note.body,
                  timestamp: new Date(note.timestamp).toISOString(),
                  completed: !!note.completed,
                });
              }
            }
          }
          // Query again after seeding
          const { data: seededData } = await supabase
            .from("folders")
            .select("*, notes(*)")
            .order("created_at", { ascending: true });
          if (seededData) {
            const mapped: IdeaFolder[] = seededData.map((f: any) => ({
              id: f.id,
              name: f.name,
              description: f.description,
              coverId: f.cover_id,
              iconId: f.icon_id,
              type: f.type,
              notes: (f.notes || []).map((n: any) => ({
                id: n.id,
                title: n.title,
                body: n.body || "",
                timestamp: new Date(n.timestamp).getTime(),
                completed: n.completed,
              })),
            }));
            setFolders(mapped);
          }
        }
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem("jomluah-folders");
        if (stored) {
          try {
            setFolders(JSON.parse(stored));
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
    fetchUserAndFolders();
  }, []);

  // Save folders to localStorage when they change (local only)
  useEffect(() => {
    if (!user) {
      localStorage.setItem("jomluah-folders", JSON.stringify(folders));
    }
  }, [folders, user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("newNote") === "true") {
      const folderIdParam = params.get("folderId");
      let targetFolder = folderIdParam ? folders.find((f) => String(f.id) === folderIdParam) : null;
      if (!targetFolder) {
        targetFolder = folders.find((f) => f.type === "journal") || folders[0];
      }
      if (targetFolder) {
        setActiveFolderId(targetFolder.id);
        setEditingNoteId(null);
        setNoteModalOpen(true);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [folders]);

  const noteModalInitial = editingNote
    ? { title: editingNote.title, body: editingNote.body, timestamp: editingNote.timestamp }
    : null;

  const handleOpenFolder = (id: number | string) => setActiveFolderId(id);
  const handleBackToFolders = () => {
    setActiveFolderId(null);
    setQuickTodoText("");
  };

  const handleNewNote = () => {
    setEditingNoteId(null);
    setNoteModalOpen(true);
  };

  const handleEditNote = (note: IdeaNote) => {
    if (activeFolder?.type === "todo") {
      handleToggleTodo(activeFolder.id, note.id);
      return;
    }
    setEditingNoteId(note.id);
    setNoteModalOpen(true);
  };

  const handleToggleTodo = async (folderId: number | string, noteId: number | string) => {
    let completedVal = false;
    const updated = folders.map((folder) => {
      if (folder.id !== folderId) return folder;
      return {
        ...folder,
        notes: folder.notes.map((note) => {
          if (note.id === noteId) {
            completedVal = !note.completed;
            return { ...note, completed: completedVal };
          }
          return note;
        }),
      };
    });

    if (user) {
      const { error } = await supabase
        .from("notes")
        .update({ completed: completedVal })
        .eq("id", noteId);
      if (error) {
        console.error("Error toggling todo:", error.message);
        return;
      }
    }
    setFolders(updated);
  };

  const handleQuickAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFolder || !quickTodoText.trim()) return;

    if (user) {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          folder_id: activeFolder.id,
          title: quickTodoText.trim(),
          body: "",
          timestamp: new Date().toISOString(),
          completed: false,
        })
        .select()
        .single();

      if (!error && data) {
        const newNote: IdeaNote = {
          id: data.id,
          title: data.title,
          body: data.body || "",
          timestamp: new Date(data.timestamp).getTime(),
          completed: data.completed,
          isNew: true,
        };
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === activeFolder.id
              ? { ...folder, notes: [newNote, ...folder.notes] }
              : folder
          )
        );
      }
    } else {
      const newNote: IdeaNote = {
        id: Date.now(),
        title: quickTodoText.trim(),
        body: "",
        timestamp: Date.now(),
        completed: false,
        isNew: true,
      };
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === activeFolder.id
            ? { ...folder, notes: [newNote, ...folder.notes] }
            : folder
        )
      );
    }
    setQuickTodoText("");
  };

  const closeNoteModal = () => {
    setNoteModalOpen(false);
    setEditingNoteId(null);
  };

  const handleSubmitNote = async (payload: NotePayload) => {
    if (!activeFolder) return;

    if (user) {
      if (editingNoteId !== null) {
        const { error } = await supabase
          .from("notes")
          .update({
            title: payload.title.trim(),
            body: payload.body,
            timestamp: new Date(payload.timestamp).toISOString(),
          })
          .eq("id", editingNoteId);

        if (!error) {
          setFolders((prev) =>
            prev.map((folder) => {
              if (folder.id !== activeFolder.id) return folder;
              return {
                ...folder,
                notes: folder.notes.map((note) =>
                  note.id === editingNoteId
                    ? { ...note, title: payload.title.trim(), body: payload.body, timestamp: payload.timestamp }
                    : note
                ),
              };
            })
          );
        }
      } else {
        const { data, error } = await supabase
          .from("notes")
          .insert({
            folder_id: activeFolder.id,
            title: payload.title.trim(),
            body: payload.body,
            timestamp: new Date(payload.timestamp).toISOString(),
            completed: false,
          })
          .select()
          .single();

        if (!error && data) {
          const newNote: IdeaNote = {
            id: data.id,
            title: data.title,
            body: data.body || "",
            timestamp: new Date(data.timestamp).getTime(),
            completed: data.completed,
            isNew: true,
          };
          setFolders((prev) =>
            prev.map((folder) =>
              folder.id === activeFolder.id
                ? { ...folder, notes: [newNote, ...folder.notes] }
                : folder
            )
          );
        }
      }
    } else {
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
            completed: false,
          };

          return { ...folder, notes: [newNote, ...folder.notes] };
        })
      );
    }

    closeNoteModal();
  };

  const handleDeleteNote = async () => {
    if (!activeFolder || editingNoteId === null) return;

    if (user) {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", editingNoteId);
      if (error) {
        console.error("Error deleting note:", error.message);
        return;
      }
    }

    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === activeFolder.id ? { ...folder, notes: folder.notes.filter((note) => note.id !== editingNoteId) } : folder
      )
    );
    closeNoteModal();
  };

  const handleCreateFolder = async (payload: NewFolderPayload) => {
    if (user) {
      const { data, error } = await supabase
        .from("folders")
        .insert({
          user_id: user.id,
          name: payload.name,
          description: payload.description || "A fresh space for new thoughts.",
          cover_id: payload.coverId,
          icon_id: payload.iconId,
          type: payload.type,
        })
        .select()
        .single();

      if (!error && data) {
        const newFolder: IdeaFolder = {
          id: data.id,
          name: data.name,
          description: data.description,
          coverId: data.cover_id,
          iconId: data.icon_id,
          type: data.type,
          notes: [],
          isNew: true,
        };
        setFolders((prev) => [...prev, newFolder]);
        setActiveFolderId(newFolder.id);
      }
    } else {
      const newFolder: IdeaFolder = {
        id: Date.now(),
        name: payload.name,
        description: payload.description || "A fresh space for new thoughts.",
        coverId: payload.coverId,
        iconId: payload.iconId,
        type: payload.type,
        notes: [],
        isNew: true,
      };
      setFolders((prev) => [...prev, newFolder]);
      setActiveFolderId(newFolder.id);
    }
    setFolderModalOpen(false);
  };

  const handleDeleteFolder = async (id: number | string) => {
    const folder = folders.find((f) => f.id === id);
    if (!folder) return;
    if (!window.confirm(`Delete "${folder.name}" and all its notes?`)) return;

    if (user) {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error deleting folder:", error.message);
        return;
      }
    }

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
        isSidebarOpen={false}
        onCloseSidebar={() => {}}
        theme={theme}
      />

      {/* Page Content */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-colors duration-500">
        <BackgroundDecor isDarkMode={isDarkMode} />

        <MobileBottomNav />

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

              {/* Conditionally render Todo Checklist or Journal Notes Grid */}
              {activeFolder.type === "todo" ? (
                <div className="space-y-4 max-w-3xl animate-fade-in-up [animation-delay:100ms] text-left">
                  {/* Quick add todo */}
                  <form onSubmit={handleQuickAddTodo} className="flex gap-2 w-full">
                    <input
                      type="text"
                      value={quickTodoText}
                      onChange={(e) => setQuickTodoText(e.target.value)}
                      placeholder="Add a new task..."
                      className={`flex-1 rounded-full px-4 py-2.5 text-sm outline-none border transition focus:ring-2 focus:ring-[#6366F1]/40 ${
                        isDarkMode
                          ? "bg-stone-900 border-white/10 text-white placeholder:text-stone-500 focus:border-[#6366F1]"
                          : "bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-[#6366F1]"
                      }`}
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.02]"
                    >
                      <Plus weight="bold" className="w-3.5 h-3.5" /> Add
                    </button>
                  </form>

                  {/* Filter & completed summary bar */}
                  <div className="flex items-center justify-between py-1 border-b border-neutral-200/20 dark:border-white/5">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${theme.textMuted}`}>
                      Tasks ({activeFolder.notes.filter((n) => n.completed).length} / {activeFolder.notes.length})
                    </span>
                    {activeFolder.notes.length > 0 && (
                      <button
                        onClick={() => setHideCompleted(!hideCompleted)}
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border transition ${
                          isDarkMode
                            ? "border-white/10 hover:bg-white/5 text-neutral-300"
                            : "border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                        }`}
                      >
                        {hideCompleted ? "Show Completed" : "Hide Completed"}
                      </button>
                    )}
                  </div>

                  {/* Todo list items */}
                  {activeFolder.notes.length === 0 ? (
                    <div className="text-center py-10">
                      <p className={`text-sm ${theme.textMuted}`}>No tasks in this notebook yet. Add one above!</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeFolder.notes
                        .filter((note) => !hideCompleted || !note.completed)
                        .map((note) => (
                          <div
                            key={note.id}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition duration-300 ${
                              isDarkMode
                                ? "bg-stone-900/40 border-white/5 text-stone-200"
                                : "bg-white border-neutral-100 text-neutral-800 shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                onClick={() => handleToggleTodo(activeFolder.id, note.id)}
                                className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                                  note.completed
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : isDarkMode
                                      ? "border-white/20 hover:border-white/40"
                                      : "border-neutral-300 hover:border-neutral-400"
                                }`}
                              >
                                {note.completed && <Check weight="bold" className="w-3.5 h-3.5" />}
                              </button>
                              <span className={`text-sm truncate ${note.completed ? "line-through opacity-45" : ""}`}>
                                {note.title}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setNoteModalOpen(true);
                              }}
                              className={`text-xs font-bold px-3 py-1 rounded-full border transition shrink-0 ml-4 ${
                                isDarkMode
                                  ? "border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white"
                                  : "border-neutral-200 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700"
                              }`}
                            >
                              Edit
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Notes grid for standard journals */
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
              )}
            </>
          ) : (
            <>
              {/* Idea Board header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in-up">
                <div className="text-left max-w-xl">
                  <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold mb-1.5 ${theme.textMuted}`}>
                    <Notebook weight="duotone" className="w-4 h-4 sm:w-5 sm:h-5 text-[#6366F1]" />
                    <span>Your private notebook place</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight">
                    Notebooks & <span className="font-extrabold text-[#6366F1] drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]">To-Dos</span>
                  </h1>
                  <p className={`text-sm mt-2 leading-relaxed ${theme.textMuted}`}>
                    Create customized spaces for journals, logs, and interactive checklists. Pin thoughts, plan checklists, and capture inspiration.
                  </p>
                </div>

                {/* Integrated Search Input for Notebooks */}
                <div className="w-full md:w-72 shrink-0">
                  <div className={`relative flex items-center gap-2 rounded-full px-4 py-2 border transition ${
                    isDarkMode ? "bg-white/5 border-white/10 focus-within:border-[#6366F1]" : "bg-neutral-50 border-neutral-200 focus-within:border-[#6366F1]"
                  }`}>
                    <MagnifyingGlass className={`w-4 h-4 ${isDarkMode ? "text-neutral-500" : "text-neutral-400"}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search notebooks..."
                      className="w-full bg-transparent outline-none text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-500"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 animate-fade-in-up pb-1 overflow-x-auto scrollbar-none w-full">
                {(["all", "journal", "todo"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-300 shrink-0 capitalize ${
                      filterType === t
                        ? "bg-[#6366F1] border-[#6366F1] text-white shadow-md shadow-indigo-500/20"
                        : isDarkMode
                          ? "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"
                          : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {t === "all" ? "All Spaces" : t === "todo" ? "To-Do Lists" : "Journals / Notes"}
                  </button>
                ))}
              </div>

              {/* Cross-notebook Notes & Tasks Search Results */}
              {searchQuery.trim() !== "" && (
                <div className="space-y-3 animate-fade-in-up text-left w-full mt-2">
                  <h3 className={`text-[10px] font-extrabold uppercase tracking-wider ${theme.textMuted}`}>
                    Matching Notes & Tasks ({
                      folders.flatMap(f => f.notes).filter(note =>
                        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        note.body.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length
                    })
                  </h3>
                  
                  {folders.flatMap(f => f.notes.map(note => ({ note, folder: f })))
                    .filter(({ note }) =>
                      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      note.body.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 ? (
                      <p className={`text-xs ${theme.textMuted}`}>No matching notes or tasks found.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {folders.flatMap(f => f.notes.map(note => ({ note, folder: f })))
                          .filter(({ note }) =>
                            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            note.body.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map(({ note, folder }) => {
                            const cover = coverFor(folder.coverId);
                            const icon = iconFor(folder.iconId);
                            return (
                              <button
                                key={note.id}
                                onClick={() => {
                                  setActiveFolderId(folder.id);
                                  if (folder.type !== "todo") {
                                    setEditingNoteId(note.id);
                                    setNoteModalOpen(true);
                                  }
                                }}
                                className={`flex flex-col p-4 rounded-2xl border text-left transition duration-300 hover:scale-[1.01] hover:shadow-md ${
                                  isDarkMode
                                    ? "bg-stone-900/40 border-white/5 hover:border-white/10"
                                    : "bg-white border-neutral-100 hover:border-neutral-200 shadow-sm"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full mb-2.5">
                                  <span className={`text-[9px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                                    {formatNoteDate(note.timestamp)}
                                  </span>
                                  
                                  {/* Notebook origin badge */}
                                  <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm ${cover.cover}`}>
                                    {cloneElement(icon.icon, { className: "w-3 h-3" })}
                                    {folder.name}
                                  </span>
                                </div>
                                
                                <h4 className={`text-sm font-extrabold ${theme.textHeading} truncate w-full`}>
                                  {note.title || "Untitled Note"}
                                </h4>
                                
                                {note.body && (
                                  <p className={`text-xs mt-1.5 leading-relaxed ${theme.textMuted} line-clamp-1`}>
                                    {note.body}
                                  </p>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    )}
                </div>
              )}

              {/* Notebooks compact grid on mobile / spacious on desktop */}
              <div className="w-full text-left mt-4 border-t border-neutral-200/20 dark:border-white/5 pt-4">
                <h3 className={`text-[10px] font-extrabold uppercase tracking-wider mb-3.5 ${theme.textMuted}`}>
                  Notebooks ({folders.filter((f) => {
                    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesType = filterType === "all" || f.type === filterType;
                    return matchesSearch && matchesType;
                  }).length})
                </h3>
              </div>
              <section className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 animate-fade-in-up [animation-delay:100ms] w-full">
                {folders
                  .filter((f) => {
                    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesType = filterType === "all" || f.type === filterType;
                    return matchesSearch && matchesType;
                  })
                  .map((folder) => {
                    const cover = coverFor(folder.coverId);
                    const icon = iconFor(folder.iconId);
                    return (
                      <div
                        key={folder.id}
                        className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden h-36 sm:h-48 w-full ${folder.isNew ? "animate-pop-in" : ""}`}
                      >
                        <button
                          onClick={() => handleOpenFolder(folder.id)}
                          className={`absolute inset-0 p-4 sm:p-5 flex flex-col justify-between text-left transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl ${cover.cover} text-white shadow-lg`}
                        >
                          {/* Spiral binding dots (hidden on mobile to save space) */}
                          <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between sm:flex hidden">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <span key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/30" />
                            ))}
                          </div>

                          <div className="sm:pl-6 pl-0 flex items-center justify-between">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                              {cloneElement(icon.icon, { className: "w-4.5 h-4.5 sm:w-5 sm:h-5" })}
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <span className="text-[7px] sm:text-[8px] uppercase font-extrabold tracking-wider bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-md">
                                {folder.type === "todo" ? "To-Do" : "Journal"}
                              </span>
                              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2 py-0.5 sm:py-1 rounded-full">
                                {folder.notes.length}
                              </span>
                            </div>
                          </div>

                          <div className="sm:pl-6 pl-0 space-y-0.5 sm:space-y-1">
                            <h3 className="font-journal text-xl sm:text-3xl leading-tight truncate">{folder.name}</h3>
                            <p className="text-[10px] sm:text-xs opacity-80 leading-snug line-clamp-1 sm:line-clamp-2">{folder.description}</p>
                          </div>
                        </button>

                        {/* Delete notebook (visible on hover) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          aria-label={`Delete ${folder.name} notebook`}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/15 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/30"
                        >
                          <TrashSimple weight="bold" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                {/* New Notebook placeholder */}
                <button
                  onClick={() => setFolderModalOpen(true)}
                  className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center h-36 sm:h-48 w-full transition duration-300 text-center gap-2 sm:gap-3 group ${
                    isDarkMode
                      ? "border-white/10 hover:border-[#6366F1]/50 bg-white/1 hover:bg-[#6366F1]/5"
                      : "border-neutral-300 hover:border-[#6366F1]/50 bg-neutral-50/50 hover:bg-[#6366F1]/5"
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition duration-300 group-hover:rotate-90 ${
                    isDarkMode ? "bg-white/5 border-white/10 group-hover:bg-[#6366F1]/10 group-hover:border-[#6366F1]" : "bg-white border-neutral-300 group-hover:border-[#6366F1]"
                  }`}>
                    <Plus weight="bold" className={`w-4 h-4 sm:w-5 sm:h-5 transition ${isDarkMode ? "text-neutral-400 group-hover:text-white" : "text-neutral-600 group-hover:text-[#6366F1]"}`} />
                  </div>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${theme.textHeading}`}>New Notebook</h4>
                    <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${theme.textMuted}`}>Start fresh</p>
                  </div>
                </button>
              </section>
            </>
          )}

        </main>

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
