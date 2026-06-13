"use client";

import { cloneElement, useEffect, useState, type ReactElement } from "react";
import { X, FolderPlus, HeartStraight, MoonStars, Lightbulb, Target, BookBookmark, Compass, Check } from "@phosphor-icons/react";

export type FolderCoverOption = { id: string; cover: string; swatch: string };
export type FolderIconOption = { id: string; icon: ReactElement<{ className?: string }>; label: string };

export const coverOptions: FolderCoverOption[] = [
  { id: "rose", cover: "bg-gradient-to-br from-rose-400 to-pink-500", swatch: "bg-rose-400" },
  { id: "amber", cover: "bg-gradient-to-br from-amber-400 to-orange-500", swatch: "bg-amber-400" },
  { id: "violet", cover: "bg-gradient-to-br from-violet-400 to-purple-500", swatch: "bg-violet-400" },
  { id: "emerald", cover: "bg-gradient-to-br from-emerald-400 to-teal-500", swatch: "bg-emerald-400" },
  { id: "sky", cover: "bg-gradient-to-br from-sky-400 to-cyan-500", swatch: "bg-sky-400" },
  { id: "indigo", cover: "bg-gradient-to-br from-indigo-400 to-blue-500", swatch: "bg-indigo-400" },
];

export const iconOptions: FolderIconOption[] = [
  { id: "heart", icon: <HeartStraight weight="duotone" />, label: "Gratitude" },
  { id: "moon", icon: <MoonStars weight="duotone" />, label: "Dreams" },
  { id: "lightbulb", icon: <Lightbulb weight="duotone" />, label: "Ideas" },
  { id: "target", icon: <Target weight="duotone" />, label: "Goals" },
  { id: "book", icon: <BookBookmark weight="duotone" />, label: "Notes" },
  { id: "compass", icon: <Compass weight="duotone" />, label: "Explore" },
];

export type NewFolderPayload = {
  name: string;
  description: string;
  coverId: string;
  iconId: string;
};

interface NewFolderModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  onSubmit: (folder: NewFolderPayload) => void;
}

export default function NewFolderModal({ isOpen, isDarkMode, onClose, onSubmit }: NewFolderModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverId, setCoverId] = useState(coverOptions[0].id);
  const [iconId, setIconId] = useState(iconOptions[0].id);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
      setDescription("");
      setCoverId(coverOptions[0].id);
      setIconId(iconOptions[0].id);
    }
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

  const labelClass = `text-xs font-bold uppercase tracking-wider block ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`;
  const selectedCover = coverOptions.find((c) => c.id === coverId) ?? coverOptions[0];
  const selectedIcon = iconOptions.find((i) => i.id === iconId) ?? iconOptions[0];

  const handleCreate = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), coverId, iconId });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} aria-hidden="true" className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-fade" />

      {/* Wrapper, lets decorative tape spill over the panel edges */}
      <div className="relative w-full max-w-md animate-modal-pop">
        <div
          aria-hidden="true"
          className="absolute -top-3 left-12 w-20 h-7 -rotate-6 rounded-[2px] bg-amber-200/80 bg-[repeating-linear-gradient(125deg,rgba(255,255,255,0.5)_0px,rgba(255,255,255,0.5)_6px,transparent_6px,transparent_12px)] shadow-sm"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="folder-modal-title"
          className={`relative w-full rounded-3xl p-6 sm:p-8 shadow-2xl ${
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
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-md ${selectedCover.cover}`}>
              {cloneElement(selectedIcon.icon, { className: "w-7 h-7" })}
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest block ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                New notebook
              </span>
              <h2 id="folder-modal-title" className={`text-xl font-extrabold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                Start a new collection
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-5 text-left">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="folder-name" className={labelClass}>
                Notebook name
              </label>
              <input
                id="folder-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dream Log, Random Sparks..."
                className={`w-full font-journal text-2xl sm:text-3xl bg-transparent outline-none border-b-2 pb-1.5 transition focus:border-[#6366F1] ${
                  isDarkMode ? "border-white/10 text-white placeholder:text-neutral-600" : "border-neutral-200 text-neutral-900 placeholder:text-neutral-300"
                }`}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="folder-description" className={labelClass}>
                Description <span className="font-normal opacity-60">(optional)</span>
              </label>
              <input
                id="folder-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What kind of thoughts live here?"
                className={`w-full rounded-full border px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#6366F1]/40 ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-[#6366F1]"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-[#6366F1]"
                }`}
              />
            </div>

            {/* Cover color */}
            <div className="space-y-2">
              <span className={labelClass}>Cover color</span>
              <div className="flex gap-2">
                {coverOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setCoverId(option.id)}
                    aria-label={`Cover color ${option.id}`}
                    aria-pressed={coverId === option.id}
                    className={`w-9 h-9 rounded-full ${option.swatch} flex items-center justify-center transition ${
                      coverId === option.id ? "ring-2 ring-offset-2 ring-[#6366F1] " + (isDarkMode ? "ring-offset-stone-900" : "ring-offset-white") : "hover:scale-110"
                    }`}
                  >
                    {coverId === option.id && <Check weight="bold" className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <span className={labelClass}>Icon</span>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setIconId(option.id)}
                    aria-pressed={iconId === option.id}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                      iconId === option.id
                        ? "bg-[#6366F1] border-[#6366F1] text-white shadow-md shadow-indigo-500/20"
                        : isDarkMode
                          ? "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"
                          : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    {cloneElement(option.icon, { className: "w-3.5 h-3.5" })} {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!name.trim()}
              className={`w-full flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition duration-300 shadow-md hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                isDarkMode ? "bg-white hover:bg-neutral-100 text-stone-950" : "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
              }`}
            >
              <FolderPlus weight="bold" className="w-4 h-4" /> Create Notebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
