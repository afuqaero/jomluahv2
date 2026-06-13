"use client";

import { cloneElement, useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { X, ChatCircleDots, FloppyDisk } from "@phosphor-icons/react";

export type ModalMood = {
  name: string;
  icon: ReactElement<{ className?: string }>;
  color: string;
};

export type MoodEntryPayload = {
  mood: string;
  title: string;
  tags: string[];
  description: string;
};

const feelingTags = [
  "Grateful", "Anxious", "Excited", "Tired", "Hopeful", "Lonely",
  "Proud", "Overwhelmed", "Peaceful", "Frustrated", "Motivated", "Confused",
];

interface MoodEntryModalProps {
  isOpen: boolean;
  mood: ModalMood | null;
  isDarkMode: boolean;
  onClose: () => void;
  onSubmit: (entry: MoodEntryPayload, action: "save" | "continue") => void;
}

export default function MoodEntryModal({ isOpen, mood, isDarkMode, onClose, onSubmit }: MoodEntryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Reset the form each time a fresh logging session begins
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      setDescription("");
      setSelectedTags([]);
    }
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

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#6366F1]/40 ${
    isDarkMode
      ? "bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-[#6366F1]"
      : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-[#6366F1]"
  }`;

  const labelClass = `text-xs font-bold uppercase tracking-wider block ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`;

  const payload = (): MoodEntryPayload => ({ mood: mood.name, title, tags: selectedTags, description });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-fade"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mood-modal-title"
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl animate-modal-pop ${
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
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${mood.color} ${isDarkMode ? "bg-white/5" : "bg-neutral-100"}`}>
            {cloneElement(mood.icon, { className: "w-7 h-7" })}
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest block ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
              Logging mood
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
              className={inputClass}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <span className={labelClass}>What else are you feeling?</span>
            <div className="flex flex-wrap gap-2">
              {feelingTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    aria-pressed={active}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                      active
                        ? "bg-[#6366F1] border-[#6366F1] text-white shadow-md shadow-indigo-500/20"
                        : isDarkMode
                          ? "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"
                          : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="entry-description" className={labelClass}>
              What&apos;s on your mind?
            </label>
            <textarea
              id="entry-description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a little about why you're feeling this way..."
              className={`${inputClass} resize-none`}
            />
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
            <FloppyDisk weight="bold" className="w-4 h-4" /> Save Mood
          </button>
          <Link
            href="/chat"
            onClick={() => onSubmit(payload(), "continue")}
            className={`flex-1 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full border transition duration-300 hover:scale-[1.02] ${
              isDarkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
            }`}
          >
            <ChatCircleDots weight="duotone" className="w-4 h-4" /> Continue with AI Companion
          </Link>
        </div>
      </div>
    </div>
  );
}
