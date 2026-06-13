"use client";

import { cloneElement, useEffect, useState, type ChangeEvent, type ReactElement } from "react";
import Link from "next/link";
import { X, ChatCircleDots, FloppyDisk, ImageSquare, CalendarBlank, PencilSimple, CaretLeft, CaretRight } from "@phosphor-icons/react";

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
  "Grateful", "Excited", "Tired", "Hopeful", "Peaceful",
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
  isReadOnly?: boolean;
  onClose: () => void;
  onSubmit: (entry: MoodEntryPayload, action: "save" | "continue") => void;
}

export default function MoodEntryModal({ isOpen, mood, isDarkMode, initialEntry, isReadOnly = false, onClose, onSubmit }: MoodEntryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [timestamp, setTimestamp] = useState(() => Date.now());
  const [localReadOnly, setLocalReadOnly] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(5); // June
  const [pickerYear, setPickerYear] = useState(2026);

  // Reset the form each time the modal opens, pre-filling from initialEntry when editing
  useEffect(() => {
    if (isOpen) {
      setTitle(initialEntry?.title ?? "");
      setDescription(initialEntry?.description ?? "");
      setSelectedTags(initialEntry?.tags ?? []);
      setCustomTags(initialEntry?.tags.filter((tag) => !feelingTags.includes(tag)) ?? []);
      setTagInput("");
      setImages(initialEntry?.images ?? []);
      const ts = initialEntry?.timestamp ?? Date.now();
      setTimestamp(ts);
      setLocalReadOnly(isReadOnly);
      
      const d = new Date(ts);
      setPickerMonth(d.getMonth());
      setPickerYear(d.getFullYear());
      setShowDatePicker(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isReadOnly]);

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

  // Date calculations for custom picker
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentSelectedDate = new Date(timestamp);
  const selectedDay = currentSelectedDate.getDate();
  const selectedMonth = currentSelectedDate.getMonth();
  const selectedYear = currentSelectedDate.getFullYear();

  // Days in current selected month/year for navigation
  const totalDaysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(pickerYear, pickerMonth, 1).getDay(); // 0 = Sun, 6 = Sat

  // Generate blank spots before day 1
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => null);
  // Generate days 1 to totalDaysInMonth
  const days = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const handlePrevMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear((y) => y - 1);
    } else {
      setPickerMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear((y) => y + 1);
    } else {
      setPickerMonth((m) => m + 1);
    }
  };

  const selectDay = (dayNum: number) => {
    const updated = new Date(timestamp);
    updated.setFullYear(pickerYear);
    updated.setMonth(pickerMonth);
    updated.setDate(dayNum);
    setTimestamp(updated.getTime());
  };

  const selectTimePart = (type: "hour" | "minute" | "ampm", val: string | number) => {
    const updated = new Date(timestamp);
    let h = updated.getHours();
    let m = updated.getMinutes();
    
    if (type === "hour") {
      const isPm = h >= 12;
      const targetH = Number(val);
      h = isPm ? (targetH === 12 ? 12 : targetH + 12) : (targetH === 12 ? 0 : targetH);
    } else if (type === "minute") {
      m = Number(val);
    } else if (type === "ampm") {
      const isPm = h >= 12;
      if (val === "AM" && isPm) {
        h = h - 12;
      } else if (val === "PM" && !isPm) {
        h = h + 12;
      }
    }
    updated.setHours(h);
    updated.setMinutes(m);
    setTimestamp(updated.getTime());
  };

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
            className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDarkMode
                ? "border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 text-stone-400 hover:text-rose-400"
                : "border-neutral-200 hover:bg-rose-50 hover:border-rose-200 text-neutral-500 hover:text-rose-600"
            }`}
          >
            <X weight="bold" className="w-5 h-5" />
          </button>

          {/* Edit button in read-only mode */}
          {localReadOnly && (
            <button
              onClick={() => setLocalReadOnly(false)}
              aria-label="Edit entry"
              className={`absolute top-4 right-16 w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 active:scale-95 ${
                isDarkMode
                  ? "border-white/10 hover:bg-[#6366F1]/10 hover:border-[#6366F1]/30 text-stone-400 hover:text-indigo-400"
                  : "border-neutral-200 hover:bg-indigo-50 hover:border-indigo-200 text-neutral-500 hover:text-[#6366F1]"
              }`}
            >
              <PencilSimple weight="bold" className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="flex items-center gap-3 pr-10 text-left">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              {cloneElement(mood.icon, { className: "w-9 h-9" })}
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest block ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                {localReadOnly ? "Viewing entry" : isEditing ? "Editing entry" : "Logging mood"}
              </span>
              <h2 id="mood-modal-title" className={`text-xl font-extrabold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                Feeling {mood.name}
              </h2>
            </div>
          </div>

          {/* Body */}
          {localReadOnly ? (
            <div className="mt-6 space-y-6 text-left">
              {/* Title */}
              {title && (
                <div className="space-y-1">
                  <h3 className={`font-journal text-3xl font-extrabold leading-tight ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                    {title}
                  </h3>
                </div>
              )}

              {/* Date & time */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-stone-400 uppercase tracking-widest flex items-center gap-1.5 bg-neutral-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-neutral-200/50 dark:border-white/5">
                  <CalendarBlank weight="duotone" className="w-3.5 h-3.5 text-[#6366F1]" />
                  {new Intl.DateTimeFormat("en-MY", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "long", timeStyle: "short" }).format(timestamp)}
                </span>
              </div>

              {/* Tags */}
              {selectedTags.length > 0 && (
                <div className="space-y-1.5">
                  <span className={labelClass}>Feeling tags</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                          isDarkMode
                            ? "bg-white/5 border-white/10 text-neutral-300"
                            : "bg-neutral-50 border-neutral-200 text-neutral-600"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="space-y-1.5">
                  <span className={labelClass}>Diary Entry</span>
                  <div className={`relative rounded-xl border overflow-hidden ${isDarkMode ? "bg-white/5 border-white/10" : "bg-neutral-50 border-neutral-200"}`}>
                    <div aria-hidden="true" className={`absolute top-0 bottom-0 left-10 w-px ${isDarkMode ? "bg-rose-400/20" : "bg-rose-300/50"}`} />
                    <div
                      className={`w-full px-5 pl-14 py-4 font-journal text-xl sm:text-2xl leading-7 ${
                        isDarkMode ? "text-stone-200" : "text-neutral-800"
                      }`}
                      style={{
                        backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, ${
                          isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.10)"
                        } 28px)`,
                        backgroundAttachment: "local",
                        minHeight: "150px"
                      }}
                    >
                      {description.split("\n").map((line, idx) => (
                        <p key={idx} className="min-h-[28px]">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Photos */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <span className={labelClass}>Photos</span>
                  <div className="flex flex-wrap gap-4 pt-2">
                    {images.map((src, index) => (
                      <div
                        key={index}
                        className={`relative w-24 h-24 sm:w-28 sm:h-28 p-1.5 pb-5 rounded-sm shadow-lg ${polaroidRotations[index % polaroidRotations.length]} ${
                          isDarkMode ? "bg-stone-800" : "bg-white"
                        }`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover rounded-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
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
              <div className="space-y-1.5 relative">
                <label className={labelClass}>
                  When did this happen?
                </label>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition hover:scale-[1.01] ${
                      isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    <CalendarBlank weight="bold" className="w-3.5 h-3.5 text-[#6366F1]" />
                    {new Intl.DateTimeFormat("en-MY", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "medium", timeStyle: "short" }).format(timestamp)}
                  </button>

                  {showDatePicker && (
                    <div className={`absolute left-0 mt-2 p-4 rounded-3xl border shadow-2xl z-50 w-80 animate-modal-pop text-left ${
                      isDarkMode ? "bg-stone-900 border-white/10 text-white" : "bg-white border-neutral-200 text-neutral-800"
                    }`}>
                      {/* Header */}
                      <div className="flex justify-between items-center mb-3">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className={`p-1.5 rounded-full border transition ${
                            isDarkMode ? "border-white/10 hover:bg-white/5" : "border-neutral-200 hover:bg-neutral-50"
                          }`}
                        >
                          <CaretLeft weight="bold" className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold">
                          {monthNames[pickerMonth]} {pickerYear}
                        </span>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className={`p-1.5 rounded-full border transition ${
                            isDarkMode ? "border-white/10 hover:bg-white/5" : "border-neutral-200 hover:bg-neutral-50"
                          }`}
                        >
                          <CaretRight weight="bold" className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Days of week header */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        <span>S</span>
                        <span>M</span>
                        <span>T</span>
                        <span>W</span>
                        <span>T</span>
                        <span>F</span>
                        <span>S</span>
                      </div>

                      {/* Days grid */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {calendarCells.map((dayVal, index) => {
                          if (dayVal === null) {
                            return <div key={`empty-${index}`} />;
                          }
                          const isSelected = selectedDay === dayVal && selectedMonth === pickerMonth && selectedYear === pickerYear;
                          return (
                            <button
                              key={`day-${dayVal}`}
                              type="button"
                              onClick={() => selectDay(dayVal)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition ${
                                isSelected
                                  ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/30"
                                  : isDarkMode
                                    ? "hover:bg-white/5 text-stone-200"
                                    : "hover:bg-neutral-100 text-neutral-700"
                              }`}
                            >
                              {dayVal}
                            </button>
                          );
                        })}
                      </div>

                      {/* Time Picker Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-200/50 dark:border-white/5 mt-3">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Time</span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Hour Selector */}
                          <select
                            value={currentSelectedDate.getHours() % 12 || 12}
                            onChange={(e) => selectTimePart("hour", Number(e.target.value))}
                            className={`rounded-xl border px-2 py-1 text-xs font-bold bg-transparent outline-none ${
                              isDarkMode ? "border-white/10 text-white" : "border-neutral-200 text-neutral-800"
                            }`}
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                              <option key={h} value={h} className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-neutral-800"}>
                                {String(h).padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                          <span className="text-xs font-bold">:</span>
                          
                          {/* Minute Selector */}
                          <select
                            value={currentSelectedDate.getMinutes()}
                            onChange={(e) => selectTimePart("minute", Number(e.target.value))}
                            className={`rounded-xl border px-2 py-1 text-xs font-bold bg-transparent outline-none ${
                              isDarkMode ? "border-white/10 text-white" : "border-neutral-200 text-neutral-800"
                            }`}
                          >
                            {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                              <option key={m} value={m} className={isDarkMode ? "bg-stone-900 text-white" : "bg-white text-neutral-800"}>
                                {String(m).padStart(2, "0")}
                              </option>
                            ))}
                          </select>

                          {/* AM/PM toggle */}
                          <button
                            type="button"
                            onClick={() => selectTimePart("ampm", currentSelectedDate.getHours() >= 12 ? "AM" : "PM")}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                              isDarkMode
                                ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-800"
                            }`}
                          >
                            {currentSelectedDate.getHours() >= 12 ? "PM" : "AM"}
                          </button>
                        </div>
                      </div>

                      {/* Done button */}
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(false)}
                          className="text-xs font-bold text-[#6366F1] hover:underline px-2 py-1"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
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
          )}

          {/* Actions */}
          {!localReadOnly && (
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
          )}
        </div>
      </div>
    </div>
  );
}
