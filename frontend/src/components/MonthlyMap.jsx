import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MonthlyMap = () => {
  const daysInMonth = 28;
  const completedDays = [
    1, 3, 5, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ];
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-[#fffaf5] border border-orange-100/50 p-5 rounded-3xl shadow-sm h-full flex flex-col">
      {/* Header - Made more compact */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-800 font-bold text-base">
            Monthly Progress
          </h3>
          <span className="text-[9px] bg-white px-2 py-0.5 rounded border border-orange-100 text-orange-400 font-bold">
            FEB 2026
          </span>
        </div>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-orange-50 rounded-md transition-colors">
            <ChevronLeft size={16} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-orange-50 rounded-md transition-colors">
            <ChevronRight size={16} className="text-gray-400" />
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
          const isDone = completedDays.includes(dayNum);

          return (
            <div key={i} className="flex flex-col items-center justify-center">
              {isDone ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-[#FF6B00] rounded-full flex items-center justify-center bg-white shadow-sm transition-transform hover:scale-110">
                  <span className="text-[#FF6B00] font-black text-[10px] sm:text-xs">
                    C
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center h-8 sm:h-9 justify-center">
                  <span className="text-[11px] font-bold text-gray-300">
                    {dayNum}
                  </span>
                  {dayNum < 15 && !isDone && (
                    <div className="w-1 h-1 bg-red-400 rounded-full mt-0.5" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer - Tightened margin */}
      <div className="mt-4 pt-3 border-t border-orange-100/50 flex justify-between items-center">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
          Consistency Rate
        </p>
        <p className="text-xs font-black text-[#FF6B00]">68%</p>
      </div>
    </div>
  );
};

export default MonthlyMap;
