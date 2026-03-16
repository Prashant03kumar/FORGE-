import React, { useState, useEffect } from "react";
import { Flame, CheckCircle2 } from "lucide-react";
import { useTasks } from "../context/TaskContext";
import { getEffectiveDate } from "../utils/dateUtils";

const DailyChallenge = () => {
  const { getTodaysForgedHours, getTodaysForged, getSessionTasks } = useTasks();
  const [goal, setGoal] = useState(5);

  // Generate a stable daily goal (3–5 hrs) that persists across re-renders
  useEffect(() => {
    const today = getEffectiveDate();
    const savedData = JSON.parse(localStorage.getItem("dailyForge")) || {};

    if (savedData.date !== today) {
      const randomGoal = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
      localStorage.setItem(
        "dailyForge",
        JSON.stringify({ date: today, goal: randomGoal }),
      );
      setGoal(randomGoal);
    } else {
      setGoal(savedData.goal);
    }
  }, []);

  // Derive progress automatically from forged tasks
  const forgedHours = getTodaysForgedHours();
  const progress = Math.min(forgedHours, goal); // cap at goal
  const percentage = goal > 0 ? Math.round((progress / goal) * 100) : 0;
  const isCompleted = progress >= goal;

  // Extra info
  const forgedCount = getTodaysForged().length;
  const totalTasks = getSessionTasks().length;

  return (
    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-orange-50 rounded-2xl">
            <Flame
              className={`${isCompleted ? "text-[#FF6B00]" : "text-gray-300"} transition-colors`}
              size={28}
            />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
            Daily Objective
          </span>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {isCompleted ? "Challenge Forged!" : "Today's Grind"}
        </h3>
        <p className="text-gray-500 text-sm mb-8">
          {isCompleted
            ? "You've mastered today's goal. Streak maintained."
            : `Complete ${goal} hours of deep work to earn your streak.`}
        </p>
      </div>

      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div className="text-xs font-bold text-[#FF6B00]">
              {percentage}% Complete
            </div>
            <div className="text-xs font-bold text-gray-400">
              {progress} / {goal} hrs
            </div>
          </div>
          <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100">
            <div
              style={{ width: `${percentage}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                isCompleted ? "bg-green-500" : "bg-[#FF6B00]"
              }`}
            ></div>
          </div>
        </div>

        {/* Status Section */}
        {isCompleted ? (
          <div className="w-full py-4 bg-green-50 text-green-600 rounded-2xl font-bold flex items-center justify-center gap-3 border border-green-100">
            <CheckCircle2 size={20} />
            Goal Achieved
          </div>
        ) : (
          <div className="w-full py-3 bg-gray-50 text-gray-500 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 border border-gray-100">
            <Flame size={16} className="text-[#FF6B00]" />
            {forgedCount} of {totalTasks} task{totalTasks !== 1 ? "s" : ""}{" "}
            forged today
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
