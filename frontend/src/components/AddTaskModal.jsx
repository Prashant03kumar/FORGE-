import React, { useState } from "react";
import { X, Clock, AlignLeft, CheckCircle2 } from "lucide-react";

const AddTaskModal = ({ isOpen, onClose, onAdd }) => {
  const [task, setTask] = useState({ title: "", desc: "" });

  // State for the Digital Input Clock
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  if (!isOpen) return null;

  // Validation Logic
  const handleHourChange = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // Only numbers
    if (val === "") {
      setHour("");
      return;
    }

    let num = parseInt(val);
    if (num > 12) num = 12; // Max hour is 12
    if (num === 0) num = 1; // Min hour is 1

    setHour(num.toString().padStart(2, "0"));
  };

  const handleMinChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val === "") {
      setMinute("");
      return;
    }

    let num = parseInt(val);
    if (num > 59) num = 59; // Max minute is 59

    setMinute(num.toString().padStart(2, "0"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.title) return;

    // Ensure we don't send empty strings
    const finalHour = hour || "12";
    const finalMin = minute || "00";

    try {
      await onAdd({ ...task, reminder: `${finalHour}:${finalMin} ${period}` });
      onClose();
    } catch (err) {
      console.error("error creating task", err);
      // could show a toast here
    }
  };

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#FF6B00] p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
            <CheckCircle2 size={24} /> New Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Task Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest underline decoration-orange-200 underline-offset-4">
              Task Mission
            </label>
            <input
              autoFocus
              className="w-full text-lg font-bold border-b-2 border-gray-100 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:border-[#FF6B00] outline-none py-2 transition-colors placeholder:text-gray-200 dark:placeholder:text-gray-600"
              placeholder="e.g. Forging the API Logic"
              onChange={(e) => setTask({ ...task, title: e.target.value })}
            />
          </div>

          {/* ⌚ DIGITAL INPUT CLOCK SECTION */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} className="text-orange-500" /> Enter Time
            </label>

            <div className="flex items-center justify-center gap-3 select-none">
              {/* Hour Box */}
              <div className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  value={hour}
                  onChange={handleHourChange}
                  className="w-20 h-20 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#FF6B00] focus:bg-white dark:focus:bg-gray-800 rounded-2xl text-center text-3xl font-black text-gray-800 dark:text-gray-100 outline-none transition-all"
                  placeholder="12"
                />
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase">
                  Hour
                </span>
              </div>

              <span className="text-4xl font-black text-gray-300 dark:text-gray-600 mb-6">:</span>

              {/* Minute Box */}
              <div className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  value={minute}
                  onChange={handleMinChange}
                  className="w-20 h-20 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#FF6B00] focus:bg-white dark:focus:bg-gray-800 rounded-2xl text-center text-3xl font-black text-gray-800 dark:text-gray-100 outline-none transition-all"
                  placeholder="00"
                />
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase">
                  Minute
                </span>
              </div>

              {/* AM/PM Switch */}
              <div className="flex flex-col border-2 border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden ml-2 mb-6">
                {["AM", "PM"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-3 text-xs font-black transition-all ${
                      period === p
                        ? "bg-[#FF6B00] text-white shadow-inner"
                        : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <AlignLeft size={14} /> Description
            </label>
            <textarea
              className="w-full text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-500/20 resize-none h-20 border border-gray-100 dark:border-gray-700"
              placeholder="Optional notes for the forge..."
              onChange={(e) => setTask({ ...task, desc: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF6B00] text-white py-5 rounded-3xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-orange-100 active:scale-[0.98]"
          >
            Forge Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
