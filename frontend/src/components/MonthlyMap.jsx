import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTasks } from "../context/TaskContext";

const MonthlyMap = () => {
  const { fetchCalendarMonth, getTodaysForgedHours } = useTasks();
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // zero-based
  const [dayMap, setDayMap] = useState({});

  const loadMonth = async (y, m) => {
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;
    try {
      const data = await fetchCalendarMonth(key);
      const map = {};
      data.forEach((r) => {
        const [yearStr, monthStr, dayStr] = r._id.split("-");
        const actDay = parseInt(dayStr, 10);
        map[actDay] = {
          count: r.count,
          totalHours: r.totalHours,
        };
      });
      setDayMap(map);
    } catch (err) {
      console.error("failed to load calendar data", err);
      setDayMap({});
    }
  };

  const { tasks } = useTasks();

  useEffect(() => {
    if (fetchCalendarMonth) {
      loadMonth(year, month);
    }
  }, [year, month, fetchCalendarMonth, tasks]);

  const prev = () => {
    const d = new Date(year, month - 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const next = () => {
    const d = new Date(year, month + 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month, 1).toLocaleString(undefined, {
    month: "short",
  });

  return (
    <div className="bg-[#fffaf5] dark:bg-gray-800 border border-orange-100/50 dark:border-gray-700 p-5 rounded-3xl shadow-sm h-full flex flex-col">
      {/* Header - Made more compact */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-800 dark:text-gray-100 font-bold text-base">
            Monthly Progress
          </h3>
          <span className="text-[9px] bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-orange-100 dark:border-gray-600 text-orange-400 font-bold">
            {monthLabel.toUpperCase()} {year}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={prev}
            className="p-1 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-400 dark:text-gray-500" />
          </button>
          <button
            onClick={next}
            className="p-1 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, index) => (
          <div
            key={index}
            className="text-center text-[10px] font-black text-gray-400 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* The Map Grid - Adjusted gaps for better fit */}
      <div className="flex-1 grid grid-cols-7 gap-y-3 gap-x-1 items-center content-start">
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          let info = dayMap[dayNum] || { count: 0, totalHours: 0 };
          
          // Override today's hours with the LIVE calculated context hours
          const isToday = year === now.getFullYear() && month === now.getMonth() && dayNum === now.getDate();
          if (isToday) {
            info.totalHours = getTodaysForgedHours();
          }

          const thresholdHours = 3; // only mark days with at least this many hours
          const isDone = info.totalHours >= thresholdHours;

          return (
            <div key={i} className="flex flex-col items-center justify-center">
              {isDone ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-[#FF6B00] rounded-full flex items-center justify-center bg-white dark:bg-gray-900 shadow-sm transition-transform hover:scale-110">
                  <span className="text-[#FF6B00] font-black text-[10px] sm:text-xs">
                    {Math.ceil(info.totalHours)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center h-8 sm:h-9 justify-center">
                  <span className="text-[11px] font-bold text-gray-300 dark:text-gray-600">
                    {dayNum}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer - Tightened margin */}
      <div className="mt-4 pt-3 border-t border-orange-100/50 dark:border-gray-700 flex justify-between items-center">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
          Consistency Rate
        </p>
        <p className="text-xs font-black text-[#FF6B00]">
          {daysInMonth > 0 ? Math.round(
            (Object.keys(dayMap).map(k => {
               const kInt = parseInt(k, 10);
               const isToday = year === now.getFullYear() && month === now.getMonth() && kInt === now.getDate();
               return isToday ? getTodaysForgedHours() : dayMap[k].totalHours;
            }).filter(h => h >= 3).length /
              daysInMonth) *
              100,
          ) : 0}
          %
        </p>
      </div>
    </div>
  );
};

export default MonthlyMap;
