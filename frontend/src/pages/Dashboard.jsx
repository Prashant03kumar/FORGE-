import React from "react";
import HeroQuoteCard from "../components/HeroQuoteCard";
import DailyChallenge from "../components/DailyChallenge";
import MonthlyMap from "../components/MonthlyMap";
import TaskList from "../components/TaskList";
import { useTasks } from "../context/TaskContext"; // Import the hook

const Dashboard = () => {
  // We pull currentForgeDay just to show the user which "session" they are in
  const { currentForgeDay, getSessionTasks } = useTasks();

  // Get ALL tasks from the current session (regardless of status)
  // TaskList will sort them: active/in-progress at top, forged at bottom
  const sessionTasksForToday = getSessionTasks();

  return (
    /* FIXED: Added 'max-w-full' and 'overflow-x-hidden' to ensure 
       the dashboard never stretches the mobile screen.
    */
    <div className="space-y-8 pr-4 lg:pr-10 pl-2 animate-in fade-in duration-700 max-w-full overflow-x-hidden">
      {/* Session Indicator - Useful for debugging the 4 AM reset */}
      <div className="flex items-center gap-2 px-2">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Active Session: {currentForgeDay}
        </p>
      </div>

      {/* Top Row: Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[45%_25%_30%] gap-6 items-stretch">
        {/* Hero Quote Card */}
        <div className="min-h-62.5">
          <HeroQuoteCard />
        </div>

        {/* Daily Challenge Card */}
        <div>
          <DailyChallenge />
        </div>

        {/* Monthly Map */}
        <div>
          <MonthlyMap />
        </div>
      </div>

      {/* Bottom Row: Task Management */}
      <div className="w-full pb-10">
        {/* Pass ALL tasks from today (all statuses) so they stay visible;
            TaskList will sort them (pending/in-progress first, completed last)
        */}
        <TaskList displayTasks={sessionTasksForToday} />
      </div>
    </div>
  );
};

export default Dashboard;
