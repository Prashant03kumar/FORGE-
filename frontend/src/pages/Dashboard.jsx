import React from "react";
import HeroQuoteCard from "../components/HeroQuoteCard";
import DailyChallenge from "../components/DailyChallenge";
import MonthlyMap from "../components/MonthlyMap";
import TaskList from "../components/TaskList";

const Dashboard = () => {
  return (
    // 'pr-10' ensures the gap from the right wall of the screen
    <div className="space-y-8 pr-10 pl-2 animate-in fade-in duration-700">
      {/* Top Row: 45% - 25% - 30% */}
      <div
        className="flex flex-col lg:grid gap-6 items-stretch"
        style={{
          gridTemplateColumns: "45% 25% 30%",
          columnGap: "1.5rem",
        }}
      >
        {/* Hero Quote Card */}
        <div className="h-full min-h-100">
          <HeroQuoteCard />
        </div>

        {/* Daily Challenge Card */}
        <div className="h-full">
          <DailyChallenge />
        </div>

        {/* Monthly Map */}
        <div className="h-full">
          <MonthlyMap />
        </div>
      </div>

      {/* Bottom Row: Task Management */}
      <div className="w-full pb-10">
        <TaskList />
      </div>
    </div>
  );
};

// IMPORTANT: This line fixes your 'does not provide an export named default' error
export default Dashboard;
