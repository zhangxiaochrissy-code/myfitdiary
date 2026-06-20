import React, { useState } from "react";
import { OOTDRecord } from "../types";
import { ChevronLeft, ChevronRight, Sparkles, Plus } from "lucide-react";

interface OOTDCalendarProps {
  records: OOTDRecord[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenCreateModal: (date: string) => void;
}

export default function OOTDCalendar({
  records,
  selectedDate,
  onSelectDate,
  onOpenCreateModal,
}: OOTDCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date("2026-06-20")); // Fixed anchor in 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "一月 January",
    "二月 February",
    "三月 March",
    "四月 April",
    "五月 May",
    "六月 June",
    "七月 July",
    "八月 August",
    "九月 September",
    "十月 October",
    "十一月 November",
    "十二月 December"
  ];

  // Helper to generate calendar days
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonthDays = getDaysInMonth(year, month - 1);

  const prevMonthLabel = () => {
    setCurrentDate(new Date(year, month - 1, 15));
  };

  const nextMonthLabel = () => {
    setCurrentDate(new Date(year, month + 1, 15));
  };

  // Find record for specific ISO date string
  const findRecordForDate = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return records.find((r) => r.date === formattedDate);
  };

  // Calendar render cells
  const cells: React.ReactNode[] = [];

  // Outbound empty cells (prev month)
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push(
      <div
        key={`prev-${day}`}
        className="h-20 lg:h-24 bg-gray-50/50 text-gray-400 p-1 border border-gray-100 flex flex-col justify-between opacity-40 cursor-not-allowed select-none"
      >
        <span className="text-xs font-mono font-medium">{day}</span>
      </div>
    );
  }

  // Active month cells
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const record = findRecordForDate(day);
    const isSelected = selectedDate === formattedDate;
    const isToday = day === 20 && month === 5 && year === 2026; // June 20, 2026 is today's local anchor

    // Beautiful linear styling representing color tones
    let blockBg = "bg-white";
    let thumbnailGradient = "";

    if (record) {
      if (record.imageBase64 === "gradient-casual") {
        thumbnailGradient = "from-amber-200 to-sky-300";
      } else if (record.imageBase64 === "gradient-romance") {
        thumbnailGradient = "from-pink-300 to-slate-800";
      } else if (record.imageBase64 === "gradient-office") {
        thumbnailGradient = "from-stone-300 to-orange-100";
      } else {
        thumbnailGradient = "from-purple-300 to-indigo-200";
      }
    }

    cells.push(
      <div
        id={`day-cell-${day}`}
        key={`day-${day}`}
        onClick={() => onSelectDate(formattedDate)}
        className={`group relative h-20 lg:h-24 p-1.5 border border-gray-100 flex flex-col justify-between cursor-pointer transition-all duration-300 select-none ${
          isSelected
            ? "bg-stone-900 border-stone-900 text-white shadow-md z-10 scale-[1.02]"
            : isToday
            ? "bg-amber-50/70 border-amber-300 hover:bg-stone-50"
            : "bg-white hover:bg-stone-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-mono font-semibold px-1 rounded-sm ${
              isSelected ? "bg-white/20 text-white" : isToday ? "bg-amber-400 text-amber-950" : "text-gray-700"
            }`}
          >
            {day}
          </span>
          {record && (
            <span className="text-xs filter drop-shadow-sm transform group-hover:scale-110 transition-transform">
              {record.mood || "✨"}
            </span>
          )}
        </div>

        {record ? (
          <div className="mt-1 w-full flex-grow flex items-end justify-between gap-1 overflow-hidden">
            {/* Visual Mini Outfit Tag preview */}
            <div className="flex-1 text-[10px] truncate leading-tight flex flex-col gap-0.5">
              <span className={`font-medium ${isSelected ? "text-stone-300" : "text-stone-600"}`}>
                👔 {record.items.top.type}
              </span>
              <span className={`font-medium ${isSelected ? "text-stone-400" : "text-stone-500"}`}>
                👖 {record.items.bottom.type}
              </span>
            </div>

            {/* Micro Graphic Representing Outfit Image */}
            <div
              className={`w-5 h-7 rounded-sm flex items-center justify-center overflow-hidden shrink-0 border border-stone-200/25 bg-gradient-to-tr ${
                thumbnailGradient || "from-stone-150 to-stone-200"
              }`}
            >
              {record.imageBase64 && !record.imageBase64.startsWith("gradient-") ? (
                <img
                  src={record.imageBase64}
                  alt="OOTD thumbnail"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-[8px] opacity-70">👚</div>
              )}
            </div>
          </div>
        ) : (
          <button
            id={`log-btn-day-${day}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenCreateModal(formattedDate);
            }}
            className={`w-full py-0.5 mt-auto flex items-center justify-center gap-0.5 rounded text-[10px] font-medium border border-dashed opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isSelected
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900"
            }`}
          >
            <Plus className="w-2.5 h-2.5" /> 记录 Look
          </button>
        )}
      </div>
    );
  }

  // Next month standard trail empty padding cells to make 42 grid slots
  const totalSlots = 42;
  const nextMonthCellsNeeded = totalSlots - cells.length;
  for (let i = 1; i <= nextMonthCellsNeeded; i++) {
    cells.push(
      <div
        key={`next-${i}`}
        className="h-20 lg:h-24 bg-gray-50/50 text-gray-300 p-1 border border-gray-100 flex flex-col justify-between opacity-30 cursor-not-allowed select-none"
      >
        <span className="text-xs font-mono font-medium">{i}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-stone-900 tracking-tight flex items-center gap-1.5">
            📅 衣橱穿搭日记 <span className="text-stone-400 font-mono text-sm leading-none font-normal">Closet Log</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">选择对应日期，查看或添加当天的 AI OOTD</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonthLabel}
            className="p-1 px-2 hover:bg-stone-100 rounded-lg border border-stone-200/80 text-stone-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-sans font-semibold text-stone-900 text-sm md:text-base min-w-[130px] text-center bg-stone-50 py-1 px-3.5 rounded-lg border border-stone-200/50">
            {year} 年 {monthNames[month].split(" ")[0]}
          </span>
          <button
            onClick={nextMonthLabel}
            className="p-1 px-2 hover:bg-stone-100 rounded-lg border border-stone-200/80 text-stone-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 bg-stone-100/35 p-1 rounded-xl border border-stone-200/40">
        {["周日 Sun", "周一 Mon", "周二 Tue", "周三 Wed", "周四 Thu", "周五 Fri", "周六 Sat"].map((w) => (
          <div key={w} className="py-2 text-center text-[11px] font-mono font-bold text-stone-500 text-uppercase tracking-wider">
            <span className="hidden sm:inline">{w.split(" ")[0]}</span>
            <span className="sm:hidden">{w.split(" ")[0].slice(-1)}</span>
          </div>
        ))}
        {cells}
      </div>

      <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-3">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 bg-amber-200 rounded-sm"></span> 今天 (June 20)
        </span>
        <button
          onClick={() => onOpenCreateModal(selectedDate)}
          className="flex items-center gap-1 text-stone-900 font-medium hover:underline"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          记录今天的全新 Look →
        </button>
      </div>
    </div>
  );
}
