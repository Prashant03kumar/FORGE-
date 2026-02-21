import React, { useMemo, useState } from "react";
import { CheckCircle2, Clock, Calendar, X } from "lucide-react";
import { useTasks } from "../context/TaskContext";

const monthName = (d) => d.toLocaleString(undefined, { month: "long" });

const History = () => {
  const { tasks } = useTasks();
  const [selectedTask, setSelectedTask] = useState(null);

  // Only consider forged tasks that have a forgedAt timestamp
  const completedTasks = tasks.filter(
    (t) => t.status === "forged" && t.forgedAt,
  );

  // Build last 3 months array (current month and previous two)
  const months = useMemo(() => {
    const now = new Date();
    const arr = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push({ year: d.getFullYear(), month: d.getMonth(), date: d });
    }
    return arr;
  }, []);

  // Group tasks by month -> day
  const grouped = useMemo(() => {
    const out = {};
    months.forEach(({ year, month }) => {
      const key = `${year}-${month}`;
      const tasksInMonth = completedTasks.filter((t) => {
        try {
          const d = new Date(t.forgedAt);
          return d.getFullYear() === year && d.getMonth() === month;
        } catch {
          return false;
        }
      });

      // Group by day number
      const byDay = tasksInMonth.reduce((acc, task) => {
        const day = new Date(task.forgedAt).getDate();
        acc[day] = acc[day] || [];
        acc[day].push(task);
        return acc;
      }, {});

      out[key] = { meta: { year, month }, byDay };
    });
    return out;
  }, [months, completedTasks]);

  const closeModal = () => setSelectedTask(null);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">
          Forge History
        </h1>
        <p className="text-gray-400 font-medium italic">
          Recent activity (last 3 months). Click any item to view timeline.
        </p>
      </header>

      <div className="space-y-8">
        {months.map(({ year, month, date }) => {
          const key = `${year}-${month}`;
          const info = grouped[key];
          const dayKeys = info
            ? Object.keys(info.byDay).sort((a, b) => b - a)
            : [];

          return (
            <section key={key}>
              <h2 className="text-lg font-black text-gray-700 mb-3">
                {monthName(date)} {year}
              </h2>

              {dayKeys.length > 0 ? (
                dayKeys.map((day) => (
                  <div key={day} className="mb-4">
                    <div className="text-sm font-bold text-gray-500 mb-2">
                      Day {day}
                    </div>
                    <ul className="space-y-2">
                      {info.byDay[day].map((task) => (
                        <li
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="cursor-pointer bg-white p-4 rounded-2xl border border-gray-100 flex items-center hover:shadow-md"
                        >
                          <div>
                            <div className="font-bold text-gray-800">
                              {task.title}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-100">
                  No activity in {monthName(date)}.
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Timeline Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800">
                  {selectedTask.title}
                </h3>
                <p className="text-xs text-gray-400">{selectedTask.desc}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-[10px] font-black text-gray-400 uppercase">
                  Planned
                </div>
                <div className="font-bold">{selectedTask.reminder || "-"}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-[10px] font-black text-gray-400 uppercase">
                  Started
                </div>
                <div className="font-bold">
                  {selectedTask.startTime ||
                    (selectedTask.startedAt
                      ? new Date(selectedTask.startedAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "—")}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-[10px] font-black text-[#FF6B00] uppercase">
                  Forged
                </div>
                <div className="font-bold">
                  {selectedTask.endTime ||
                    (selectedTask.forgedAt
                      ? new Date(selectedTask.forgedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
