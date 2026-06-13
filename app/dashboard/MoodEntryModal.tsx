"use client";

import { cloneElement, useEffect, useState, type ChangeEvent, type ReactElement } from "react";
import Link from "next/link";
import { X, ChatCircleDots, FloppyDisk, ImageSquare, CalendarBlank } from "@phosphor-icons/react";

export type ModalMood = {
  name: string;
  icon: ReactElement<{ className?: string }>;
  color: string;
};

export type ModalInitialEntry = {
  title: string;
  tags: string[];
  description: string;
  images: string[];
  timestamp: number;
};

export type MoodEntryPayload = {
  mood: string;
  title: string;
  tags: string[];
  description: string;
  images: string[];
  timestamp: number;
};

const feelingTags = [
  "Grateful", "Anxious", "Excited", "Tired", "Hopeful", "Lonely",
  "Proud", "Overwhelmed", "Peaceful", "Frustrated", "Motivated", "Confused",
];

const MAX_IMAGES = 4;
const polaroidRotations = ["-rotate-6", "rotate-3", "-rotate-2", "rotate-6"];

const toDatetimeLocalValue = (ms: number) => {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromDatetimeLocalValue = (value: string) => {
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? Date.now() : ms;
};

interface MoodEntryModalProps {
  isOpen: boolean;
  mood: ModalMood | null;
  isDarkMode: boolean;
  initialEntry?: ModalInitialEntry | null;
  onClose: () => void;
  onSubmit: (entry: MoodEntryPayload, action: "save" | "continue") => void;
}

export default function MoodEntryModal({ isOpen, mood, isDarkMode, initialEntry, onClose, onSubmit }: MoodEntryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [timestamp, setTimestamp] = useState(() => Date.now());

  // Reset the form each time the modal opens, pre-filling from initialEntry when editing
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(initialEntry?.title ?? "");
      setDescription(initialEntry?.description ?? "");
      setSelectedTags(initialEntry?.tags ?? []);
      setCustomTags(initialEntry?.tags.filter((tag) => !feelingTags.includes(tag)) ?? []);
      setTagInput("");
      setImages(initialEntry?.images ?? []);
      setTimestamp(initialEntry?.timestamp ?? Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Allow closing the popup with Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mood) return null;

  const isEditing = Boolean(initialEntry);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addCustomTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    setSelectedTags((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setCustomTags((prev) => (prev.includes(value) || feelingTags.includes(value) ? prev : [...prev, value]));
    setTagInput("");
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files)
      .slice(0, MAX_IMAGES - images.length)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setImages((prev) => (prev.length < MAX_IMAGES ? [...prev, reader.result as string] : prev));
          }
        };
        reader.readAsDataURL(file);
      });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const labelClass = `text-xs font-bold uppercase tracking-wider block ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`;

  const payload = (): MoodEntryPayload => ({
    mood: mood.name,
    title,
    tags: selectedTags,
    description,
    images,
    timestamp,
  });

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
          aria-labelledby="mood-modal-title"
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
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-md ${mood.color}`}>
              {cloneElement(mood.icon, { className: "w-7 h-7" })}
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest block ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                {isEditing ? "Editing entry" : "Logging mood"}
              </span>
              <h2 id="mood-modal-title" className={`text-xl font-extrabold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                Feeling {mood.name}
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="mt-6 space-y-5 text-left">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="entry-title" className={labelClass}>
                Title <span className="font-normal opacity-60">(optional)</span>
              </label>
              <input
                id="entry-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this moment a name..."
                className={`w-full font-journal text-2xl sm:text-3xl bg-transparent outline-none border-b-2 pb-1.5 transition focus:border-[#6366F1] ${
                  isDarkMode ? "border-white/10 text-white placeholder:text-neutral-600" : "border-neutral-200 text-neutral-900 placeholder:text-neutral-300"
                }`}
              />
            </div>

            {/* Date & time */}
            <div className="space-y-1.5">
              <label htmlFor="entry-date" className={labelClass}>
                When did this happen?
              </label>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 transition focus-within:ring-2 focus-within:ring-[#6366F1]/40 ${
                  isDarkMode ? "bg-white/5 border-white/10 focus-within:border-[#6366F1]" : "bg-neutral-50 border-neutral-200 focus-within:border-[#6366F1]"
                }`}
              >
                <CalendarBlank weight="bold" className={`w-3.5 h-3.5 ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`} />
                <input
                  id="entry-date"
                  type="datetime-local"
                  value={toDatetimeLocalValue(timestamp)}
                  onChange={(e) => setTimestamp(fromDatetimeLocalValue(e.target.value))}
                  style={{ colorScheme: isDarkMode ? "dark" : "light" }}
                  className={`bg-transparent outline-none text-xs font-semibold ${isDarkMode ? "text-white" : "text-neutral-900"}`}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <span className={labelClass}>What else are you feeling?</span>
              <div className="flex flex-wrap gap-2">
                {[...feelingTags, ...customTags].map((tag) => {
                  const active = selectedTags.includes(tag);
                  const isCustom = customTags.includes(tag);
                  return (
                    <span key={tag} className="relative inline-flex">
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        aria-pressed={active}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${isCustom ? "pr-6" : ""} ${
                          active
                            ? "bg-[#6366F1] border-[#6366F1] text-white shadow-md shadow-indigo-500/20"
                            : isDarkMode
                              ? "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"
                              : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        {tag}
                      </button>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => removeCustomTag(tag)}
                          aria-label={`Remove ${tag}`}
                          className={`absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition ${
                            active ? "text-white/70 hover:text-white" : isDarkMode ? "text-neutral-400 hover:text-white" : "text-neutral-400 hover:text-neutral-700"
                          }`}
                        >
                          <X weight="bold" className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </span>
                  );
                })}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="+ Add"
                  size={Math.max(5, tagInput.length + 2)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-[#6366F1]/40 ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-[#6366F1]"
                      : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-[#6366F1]"
                  }`}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="entry-description" className={labelClass}>
                What&apos;s on your mind?
              </label>
              <div className={`relative rounded-xl border overflow-hidden ${isDarkMode ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-200"}`}>
                <div aria-hidden="true" className={`absolute top-0 bottom-0 left-10 w-px ${isDarkMode ? "bg-rose-400/20" : "bg-rose-300/50"}`} />
                <textarea
                  id="entry-description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a little about why you're feeling this way..."
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

            {/* Photos */}
            <div className="space-y-2">
              <span className={labelClass}>
                Add a photo <span className="font-normal opacity-60">(up to {MAX_IMAGES})</span>
              </span>
              <div className="flex flex-wrap gap-3">
                {images.map((src, index) => (
                  <div
                    key={index}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 p-1.5 pb-4 rounded-sm shadow-md ${polaroidRotations[index % polaroidRotations.length]} ${
                      isDarkMode ? "bg-stone-800" : "bg-white"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover rounded-sm" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label="Remove photo"
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center shadow"
                    >
                      <X weight="bold" className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label
                    className={`w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed cursor-pointer transition ${
                      isDarkMode ? "border-white/10 hover:border-white/20 text-neutral-400" : "border-neutral-200 hover:border-neutral-300 text-neutral-400"
                    }`}
                  >
                    <ImageSquare weight="duotone" className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Add</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onSubmit(payload(), "save")}
              className={`flex-1 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition duration-300 shadow-md hover:scale-[1.02] ${
                isDarkMode ? "bg-white hover:bg-neutral-100 text-stone-950" : "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
              }`}
            >
              <FloppyDisk weight="bold" className="w-4 h-4" /> {isEditing ? "Save Changes" : "Save Mood"}
            </button>
            {!isEditing && (
              <Link
                href="/chat"
                onClick={() => onSubmit(payload(), "continue")}
                className={`flex-1 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full border transition duration-300 hover:scale-[1.02] ${
                  isDarkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                <ChatCircleDots weight="duotone" className="w-4 h-4" /> Continue with AI Companion
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
