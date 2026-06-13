"use client";

import { cloneElement, useEffect, useState, type ReactElement } from "react";
import { X, FloppyDisk, CalendarBlank, TrashSimple, CaretLeft, CaretRight } from "@phosphor-icons/react";

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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(5); // June
  const [pickerYear, setPickerYear] = useState(2026);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(initialEntry?.title ?? "");
      setBody(initialEntry?.body ?? "");
      const ts = initialEntry?.timestamp ?? Date.now();
      setTimestamp(ts);

      const d = new Date(ts);
      setPickerMonth(d.getMonth());
      setPickerYear(d.getFullYear());
      setShowDatePicker(false);
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentSelectedDate = new Date(timestamp);
  const selectedDay = currentSelectedDate.getDate();
  const selectedMonth = currentSelectedDate.getMonth();
  const selectedYear = currentSelectedDate.getFullYear();

  const totalDaysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(pickerYear, pickerMonth, 1).getDay();

  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => null);
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
            <div className="space-y-1.5 relative">
              <label className={labelClass}>
                When did you write this?
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
