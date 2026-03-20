import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useTheme } from "../context/ThemeContext";

const daysKey = (d) => d.toISOString().slice(0, 10);

const colorForCount = (n, isDark) => {
  if (!n || n === 0) return isDark ? "#374151" : "#F3F4F6";
  if (n <= 3) return isDark ? "#7c2d12" : "#FFE8D6"; // light bronze for 1-3 sparks
  if (n <= 5) return isDark ? "#c2410c" : "#FFB37B"; // darker for 4-5 sparks
  return "#FF6B00"; // master color 6+
};

const Profile = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { tasks, fetchStats } = useTasks();
  const [serverStats, setServerStats] = useState(null);

  useEffect(() => {
    if (fetchStats) {
      fetchStats()
        .then(setServerStats)
        .catch((err) => console.error("Failed to load stats", err));
    }
  }, [fetchStats]);

  // re-fetch stats whenever the local task list changes (e.g. user forges a task)
  useEffect(() => {
    if (fetchStats) {
      fetchStats()
        .then(setServerStats)
        .catch((e) => console.error(e));
    }
  }, [fetchStats, tasks]);

  const forged = useMemo(
    () => tasks.filter((t) => t.status === "forged" && t.forgedAt),
    [tasks],
  );

  // ... (Keep all your existing calculation logic here)
  // determine the first year to show based on when the user signed up
  const registrationYear = useMemo(() => {
    if (!user) return new Date().getFullYear();
    return (
      user.registrationYear ||
      (user.createdAt && new Date(user.createdAt).getFullYear()) ||
      new Date().getFullYear()
    );
  }, [user]);

  const yearOptions = useMemo(() => {
    const opts = [];
    const cur = new Date().getFullYear();
    for (let y = registrationYear; y <= cur; y++) {
      opts.push(y.toString());
    }
    return opts;
  }, [registrationYear]);

  const [selectedRange, setSelectedRange] = useState("");
  useEffect(() => {
    if (!selectedRange && yearOptions.length) {
      // default to the most recent year
      setSelectedRange(yearOptions[yearOptions.length - 1]);
    }
  }, [yearOptions, selectedRange]);

  const { startDate, endDate } = useMemo(() => {
    const y = parseInt(selectedRange, 10);
    if (!isNaN(y)) {
      return {
        startDate: new Date(y, 0, 1),
        endDate: new Date(y, 11, 31, 23, 59, 59),
      };
    }
    // fallback to current year if something weird happens
    const cur = new Date().getFullYear();
    return {
      startDate: new Date(cur, 0, 1),
      endDate: new Date(cur, 11, 31, 23, 59, 59),
    };
  }, [selectedRange]);

  const dayCounts = useMemo(() => {
    const map = {};
    forged.forEach((t) => {
      try {
        const d = new Date(t.forgedAt);
        if (d >= startDate && d <= endDate) {
          const k = daysKey(d);
          map[k] = (map[k] || 0) + 1;
        }
      } catch (e) {}
    });
    return map;
  }, [forged, startDate, endDate]);

  // client-side calculations (fallback)
  const totalSpark = Object.values(dayCounts).reduce((s, v) => s + v, 0);
  const totalActiveDays = Object.keys(dayCounts).length;
  const maxStreak = useMemo(() => {
    const keys = Object.keys(dayCounts).sort();
    if (!keys.length) return 0;
    let best = 1,
      cur = 1;
    for (let i = 1; i < keys.length; i++) {
      const prev = new Date(keys[i - 1]),
        curd = new Date(keys[i]);
      if ((curd - prev) / (1000 * 60 * 60 * 24) === 1) {
        cur += 1;
        if (cur > best) best = cur;
      } else cur = 1;
    }
    return best;
  }, [dayCounts]);

  const perDayHours = useMemo(() => {
    const per = {};
    forged.forEach((t) => {
      if (!t.startedAt || !t.forgedAt) return;
      const s = new Date(t.startedAt),
        e = new Date(t.forgedAt);
      if (e < startDate || s > endDate) return;
      const k = daysKey(s);
      per[k] = (per[k] || 0) + (e - s) / (1000 * 60 * 60);
    });
    return per;
  }, [forged, startDate, endDate]);

  const peek = useMemo(() => {
    const vals = Object.values(perDayHours);
    return vals.length ? Number(Math.max(...vals).toFixed(1)) : 0;
  }, [perDayHours]);

  // override with server stats when available
  const displayTotalSpark = serverStats ? serverStats.totalSpark : totalSpark;
  const displayMaxStreak = serverStats ? serverStats.maxStreak : maxStreak;
  let displayDailyPeak = serverStats
    ? Number(serverStats.dailyPeak.toFixed(1))
    : peek;

  // always ensure numeric with one decimal
  displayDailyPeak = Number(displayDailyPeak.toFixed(1));

  const monthsData = useMemo(() => {
    const arr = [];
    let cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (cur <= end) {
      const year = cur.getFullYear(),
        month = cur.getMonth();
      const dayArray = [];
      for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {
        const dt = new Date(year, month, d),
          k = daysKey(dt);
        dayArray.push({
          date: k,
          count: dt >= startDate && dt <= endDate ? dayCounts[k] || 0 : 0,
        });
      }
      arr.push({
        label: cur.toLocaleString(undefined, { month: "short" }),
        year,
        month,
        days: dayArray,
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return arr;
  }, [startDate, endDate, dayCounts]);

  const totalDaysRange = Math.max(
    1,
    Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)),
  );
  const consistencyPct = Math.round((totalActiveDays / totalDaysRange) * 100);

  return (
    /* FIXED: The container is now explicitly max-width 100vw and hides any horizontal bleed */
    <div className="w-full max-w-[90vw] min-h-screen bg-[#FCF9F6] dark:bg-gray-900 p-4 md:p-8 overflow-x-hidden rounded-3xl md:rounded-tl-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* SIDEBAR: Shrink-0 ensures it doesn't compress or push the layout */}
        <div className="w-full md:w-1/4 lg:w-75 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col items-center md:items-start text-center md:text-left">
            {/* Profile Avatar - shows uploaded image or placeholder */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover shadow-lg mb-4 border border-orange-400/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-[#ffae75] to-[#FF6B00] flex items-center justify-center text-white font-black text-2xl shadow-lg mb-4">
                {(user?.username || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="mb-4">
              <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">
                {user?.fullName || user?.username || "User"}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">
                @{(user?.username || "user").toLowerCase()}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-500/10 text-[#FF6B00] px-3 py-1 rounded-full text-[10px] font-black uppercase mb-6">
              {user?.role || "Member"}
            </div>
            <div className="w-full border-t border-gray-50 dark:border-gray-700 pt-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                About
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed line-clamp-3">
                {user?.bio || "No bio provided."}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN AREA: min-w-0 is the CSS secret to allowing flex-children to scroll horizontally */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* STATS: Fixed grid spacing for mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Days", val: totalActiveDays },
              { label: "Max Streak", val: displayMaxStreak },
              {
                label: "Consistency",
                val: `${consistencyPct}%`,
                color: "text-[#FF6B00]",
              },
              { label: "Daily Peak", val: `${displayDailyPeak.toFixed(1)}h` },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm"
              >
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider mb-1">
                  {stat.label}
                </p>
                <p
                  className={`text-xl font-black ${stat.color || "text-gray-800 dark:text-gray-100"}`}
                >
                  {stat.val}
                </p>
              </div>
            ))}
          </div>

          {/* ACTIVITY HEATMAP: The true fix for horizontal stretching */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-4xl p-5 md:p-8 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">
                  Activity Heatmap
                </h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">
                  Total Spark:{" "}
                  <span className="text-[#FF6B00]">{displayTotalSpark}</span>
                </p>
              </div>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="w-full sm:w-auto bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-3 py-2 text-xs font-black text-gray-500 dark:text-gray-300 uppercase outline-none"
              >
                {yearOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {/* FIXED INNER SCROLLER: 
                - w-full ensures it never stretches the parent.
                - overflow-x-auto allows the months to be wider than the screen.
            */}
            <div className="w-full overflow-x-auto pb-4 custom-scrollbar select-none">
              <div className="flex gap-6 min-w-max px-1">
                {monthsData.map((m) => (
                  <div key={`${m.year}-${m.month}`} className="shrink-0">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black mb-3 uppercase text-center border-b border-gray-50 dark:border-gray-700 pb-1">
                      {m.label}
                    </p>
                    <div className="grid grid-cols-7 gap-1.5">
                      {m.days.map((d) => (
                        <div
                          key={d.date}
                          className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 rounded-[3px] shadow-sm transition-transform active:scale-125"
                          style={{ background: colorForCount(d.count, isDark) }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-4 text-[9px] font-black text-gray-300 dark:text-gray-500 uppercase tracking-widest">
                <div className="flex gap-1 items-center">
                  <div className={`w-2.5 h-2.5 rounded-sm bg-[${isDark ? "#374151" : "#F3F4F6"}]`} /> 0
                  Forge
                </div>
                <div className="flex gap-1 items-center">
                  <div className={`w-2.5 h-2.5 rounded-sm bg-[${isDark ? "#7c2d12" : "#FFE8D6"}]`} /> 1–3
                </div>
                <div className="flex gap-1 items-center">
                  <div className={`w-2.5 h-2.5 rounded-sm bg-[${isDark ? "#c2410c" : "#FFB37B"}]`} /> 4–5
                </div>
                <div className="flex gap-1 items-center">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#FF6B00]" /> 6+
                  Master
                </div>
              </div>
              <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
                Peak Record:{" "}
                <span className="text-gray-800 dark:text-gray-100">{displayDailyPeak} HRS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
