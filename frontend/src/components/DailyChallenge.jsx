import React, { useState, useEffect } from "react";
import { Flame, Timer, CheckCircle2 } from "lucide-react";

const DailyChallenge = () => {
  const [goal, setGoal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedData = JSON.parse(localStorage.getItem("dailyForge")) || {};

    // If it's a new day, generate a new random goal (3-5)
    if (savedData.date !== today) {
      const randomGoal = Math.floor(Math.random() * 3) + 3; // Generates 3, 4, or 5
      const newData = { date: today, goal: randomGoal, progress: 0 };
      localStorage.setItem("dailyForge", JSON.stringify(newData));
      setGoal(randomGoal);
      setProgress(0);
    } else {
      setGoal(savedData.goal);
      setProgress(savedData.progress);
      if (savedData.progress >= savedData.goal) setIsCompleted(true);
    }
  }, []);

  const addHour = () => {
    if (progress < goal) {
      const newProgress = progress + 1;
      setProgress(newProgress);

      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(
        "dailyForge",
        JSON.stringify({ date: today, goal, progress: newProgress }),
      );

      if (newProgress >= goal) {
        setIsCompleted(true);
        // Here you would eventually call your backend to update the streak
      }
    }
  };

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
            : `Complete ${goal} hours of deep study to earn your streak.`}
        </p>
      </div>

      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div className="text-xs font-bold text-[#FF6B00]">
              {Math.round((progress / goal) * 100)}% Complete
            </div>
            <div className="text-xs font-bold text-gray-400">
              {progress} / {goal} hrs
            </div>
          </div>
          <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100">
            <div
              style={{ width: `${(progress / goal) * 100}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                isCompleted ? "bg-green-500" : "bg-[#FF6B00]"
              }`}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        {!isCompleted ? (
          <button
            onClick={addHour}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95"
          >
            <Timer size={20} />
            Log 1 Hour
          </button>
        ) : (
          <div className="w-full py-4 bg-green-50 text-green-600 rounded-2xl font-bold flex items-center justify-center gap-3 border border-green-100">
            <CheckCircle2 size={20} />
            Goal Achieved
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
