"use client";

import { cloneElement, useEffect, useState, type ReactElement } from "react";
import { X, FloppyDisk, CalendarBlank, TrashSimple } from "@phosphor-icons/react";

export type NoteEditorInitial = {
  title: string;
  body: string;
  timestamp: number;
};

export type NotePayload = {
  title: string;
  body: string;
  timestamp: number;
};

const toDatetimeLocalValue = (ms: number) => {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromDatetimeLocalValue = (value: string) => {
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? Date.now() : ms;
};

interface NoteEditorModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  folderName: string;
  folderCover: string;
  folderIcon: ReactElement<{ className?: string }>;
  initialEntry?: NoteEditorInitial | null;
  onClose: () => void;
  onSubmit: (note: NotePayload) => void;
  onDelete?: () => void;
}

export default function NoteEditorModal({
  isOpen,
  isDarkMode,
  folderName,
  folderCover,
  folderIcon,
  initialEntry,
  onClose,
  onSubmit,
  onDelete,
}: NoteEditorModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [timestamp, setTimestamp] = useState(() => Date.now());

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(initialEntry?.title ?? "");
      setBody(initialEntry?.body ?? "");
      setTimestamp(initialEntry?.timestamp ?? Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialEntry);
  const labelClass = `text-xs font-bold uppercase tracking-wider block ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`;

  const handleSave = () => {
    onSubmit({ title, body, timestamp });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} aria-hidden="true" className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-fade" />

      {/* Wrapper, lets decorative tape spill over the panel edges */}
      <div className="relative w-full max-w-xl max-h-[90vh] animate-modal-pop">
        {/* Washi tape decorations */}
        <div
          aria-hidden="true"
          className="absolute -top-3 left-10 w-20 h-7 -rotate-6 rounded-[2px] bg-rose-300/80 bg-[repeating-linear-gradient(125deg,rgba(255,255,255,0.55)_0px,rgba(255,255,255,0.55)_6px,transparent_6px,transparent_12px)] shadow-sm"
        />
        <div
          aria-hidden="true"
          className="absolute -top-2 right-16 w-16 h-6 rotate-6 rounded-[2px] bg-amber-200/80 bg-[repeating-linear-gradient(125deg,rgba(255,255,255,0.5)_0px,rgba(255,255,255,0.5)_6px,transparent_6px,transparent_12px)] shadow-sm"
        />

        {/* Panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="note-modal-title"
          className={`relative w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl ${
            isDarkMode ? "bg-stone-900 border border-white/10" : "bg-white border border-neutral-200"
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className={`absolute top-4 right-4 p-2 rounded-full border transition ${
              isDarkMode ? "border-white/10 hover:bg-white/5 text-neutral-400" : "border-neutral-200 hover:bg-neutral-50 text-neutral-500"
            }`}
          >
            <X weight="bold" className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 pr-10 text-left">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-md ${folderCover}`}>
              {cloneElement(folderIcon, { className: "w-7 h-7" })}
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest block ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                {isEditing ? "Editing note" : "New note"} &middot; {folderName}
              </span>
              <h2 id="note-modal-title" className={`text-xl font-extrabold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                {isEditing ? "Polish this thought" : "Capture this thought"}
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="mt-6 space-y-5 text-left">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="note-title" className={labelClass}>
                Title <span className="font-normal opacity-60">(optional)</span>
              </label>
              <input
                id="note-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this idea a name..."
                className={`w-full font-journal text-2xl sm:text-3xl bg-transparent outline-none border-b-2 pb-1.5 transition focus:border-[#6366F1] ${
                  isDarkMode ? "border-white/10 text-white placeholder:text-neutral-600" : "border-neutral-200 text-neutral-900 placeholder:text-neutral-300"
                }`}
              />
            </div>

            {/* Date & time */}
            <div className="space-y-1.5">
              <label htmlFor="note-date" className={labelClass}>
                When did you write this?
              </label>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 transition focus-within:ring-2 focus-within:ring-[#6366F1]/40 ${
                  isDarkMode ? "bg-white/5 border-white/10 focus-within:border-[#6366F1]" : "bg-neutral-50 border-neutral-200 focus-within:border-[#6366F1]"
                }`}
              >
                <CalendarBlank weight="bold" className={`w-3.5 h-3.5 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`} />
                <input
                  id="note-date"
                  type="datetime-local"
                  value={toDatetimeLocalValue(timestamp)}
                  onChange={(e) => setTimestamp(fromDatetimeLocalValue(e.target.value))}
                  style={{ colorScheme: isDarkMode ? "dark" : "light" }}
                  className={`bg-transparent outline-none text-xs font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}
                />
              </div>
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <label htmlFor="note-body" className={labelClass}>
                Write it out
              </label>
              <div className={`relative rounded-xl border overflow-hidden ${isDarkMode ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-200"}`}>
                <div aria-hidden="true" className={`absolute top-0 bottom-0 left-10 w-px ${isDarkMode ? "bg-rose-400/20" : "bg-rose-300/50"}`} />
                <textarea
                  id="note-body"
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Brainstorm freely — no judgement, no dates required..."
                  className={`w-full resize-none bg-transparent outline-none px-5 pl-14 py-3 font-journal text-lg sm:text-xl leading-7 focus:ring-2 focus:ring-[#6366F1]/30 ${
                    isDarkMode ? "text-white placeholder:text-neutral-500" : "text-neutral-900 placeholder:text-neutral-400"
                  }`}
                  style={{
                    backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, ${
                      isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.10)"
                    } 28px)`,
                    backgroundAttachment: "local",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition duration-300 shadow-md hover:scale-[1.02] ${
                isDarkMode ? "bg-white hover:bg-neutral-100 text-stone-950" : "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
              }`}
            >
              <FloppyDisk weight="bold" className="w-4 h-4" /> {isEditing ? "Save Changes" : "Add to Notebook"}
            </button>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="Delete note"
                className={`flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full border transition duration-300 hover:scale-[1.02] ${
                  isDarkMode ? "border-white/10 hover:bg-rose-500/10 text-rose-400" : "border-neutral-200 hover:bg-rose-50 text-rose-500"
                }`}
              >
                <TrashSimple weight="bold" className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
