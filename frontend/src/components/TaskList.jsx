import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Clock,
  AlertCircle,
  CheckCircle2,
  Check,
  PlayCircle,
} from "lucide-react";
import AddTaskModal from "./AddTaskModal";
import { useTasks } from "../context/TaskContext";

// `displayTasks` is optional; when provided the list will be used
// instead of the raw `tasks` array from context. This allows parent
// components (Dashboard) to supply the filtered subset for the current
// session, preventing old entries from bleeding through.
const TaskList = ({ displayTasks }) => {
  const { tasks, addTask, startTask, forgeTask, deleteTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUndo, setShowUndo] = useState(null);
  const [countdown, setCountdown] = useState(5);
  // showAlertTask holds the task object when a forged-task popup should show
  const [showAlertTask, setShowAlertTask] = useState(null);

  // Sort tasks so running (in-progress) tasks appear first, then active, then forged
  const statusPriority = (s) => {
    if (s === "in-progress") return 0;
    if (s === "active") return 1;
    return 2; // forged
  };

  // determine which list of tasks to render; fall back to the
  // full context list when nothing is provided by props
  const tasksToRender = displayTasks || tasks;

  const activeTasks = [...tasksToRender].sort((a, b) => {
    const pa = statusPriority(a.status);
    const pb = statusPriority(b.status);
    if (pa !== pb) return pa - pb;
    // tie-breakers: prefer most recently started/forged, then newest id
    if (a.status === "in-progress" && b.status === "in-progress") {
      return (b.startedAt || 0) - (a.startedAt || 0);
    }
    if (a.status === "forged" && b.status === "forged") {
      return (b.forgedAt || 0) - (a.forgedAt || 0);
    }
    return b.id - a.id;
  });

  const handleStartTask = async (id) => {
    try {
      await startTask(id);
    } catch (err) {
      console.error("start failed", err);
    }
  };

  const handleToggle = (task) => {
    if (task.status === "forged") {
      // show popup with task details (forged time)
      setShowAlertTask(task);
      setTimeout(() => setShowAlertTask(null), 4000);
      return;
    }

    // 💡 FIX: Only start the UI countdown here. Do NOT forge yet.
    setCountdown(5);
    setShowUndo(task.id);
  };

  const undoComplete = () => {
    // 💡 FIX: Reset the UI state so forgeTask is never called
    setShowUndo(null);
    setCountdown(5);
  };

  useEffect(() => {
    let timer;
    if (showUndo && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (showUndo && countdown === 0) {
      // 💡 FIX: Now that 5s are up, permanently forge it in the context
      forgeTask(showUndo);
      setShowUndo(null);
    }
    return () => clearInterval(timer);
  }, [showUndo, countdown, forgeTask]);

  return (
    <div className="relative bg-white rounded-3xl shadow-sm border border-orange-100/50 overflow-hidden">
      {/* ALERTS */}
      {showAlertTask && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-100 bg-gray-900 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10 animate-in slide-in-from-top">
          <AlertCircle className="text-orange-500" size={28} />
          <div className="flex flex-col">
            <span className="text-base font-black">Task is Forged!</span>
            <span className="text-xs text-gray-400">
              Locked permanently. Create a new task to continue.
            </span>
            {showAlertTask.endTime && (
              <span className="text-xs text-gray-300 mt-1">
                Forged at {showAlertTask.endTime}
              </span>
            )}
          </div>
        </div>
      )}

      {showUndo && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-100 bg-[#FF6B00] text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={28} />
            <div className="flex flex-col">
              <span className="text-base font-black uppercase tracking-wider">
                Goal Achieved
              </span>
              <span className="text-[10px] font-bold text-orange-100 uppercase tracking-widest leading-none">
                Locking in {countdown}s
              </span>
            </div>
          </div>
          <button
            onClick={undoComplete}
            className="bg-white text-[#FF6B00] px-5 py-2.5 rounded-2xl text-xs font-black uppercase shadow-md"
          >
            Undo
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-8 flex justify-between items-center border-b border-gray-50">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            Today's Tasks
          </h2>
          <p className="text-gray-400 text-xs italic font-medium">
            Start the grind. Forge the result.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#FF6B00] text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg"
        >
          <Plus size={20} /> Add New Task
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
              <th className="p-6 w-24 text-center">Status</th>
              <th className="p-6">Task Details</th>
              <th className="p-6 hidden md:table-cell">Timeline</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activeTasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-orange-50/30 transition-colors"
              >
                <td className="p-6 text-center">
                  {task.status === "active" ? (
                    <button
                      onClick={() => handleStartTask(task.id)}
                      className="text-[#FF6B00]"
                      title="Start task"
                    >
                      <PlayCircle size={32} />
                    </button>
                  ) : task.status === "in-progress" ? (
                    <div
                      onClick={() => handleToggle(task)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center cursor-pointer mx-auto ${
                        task.id === showUndo
                          ? "border-orange-400 animate-pulse bg-orange-50"
                          : "border-gray-200"
                      }`}
                      title="Running"
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full bg-[#FF6B00]`}
                      />
                    </div>
                  ) : (
                    // forged
                    <div
                      onClick={() => handleToggle(task)}
                      className="w-8 h-8 rounded-xl border-2 border-gray-200 flex items-center justify-center cursor-pointer mx-auto bg-white text-[#FF6B00]"
                      title="Forged"
                    >
                      <Check size={16} />
                    </div>
                  )}
                </td>

                <td className="p-6">
                  <div className="flex flex-col">
                    <span
                      className={`text-lg font-bold ${task.status === "forged" ? "line-through text-gray-400" : "text-gray-700"}`}
                    >
                      {task.title}
                    </span>
                    <span className="text-xs text-gray-400 italic">
                      {task.desc}
                    </span>
                  </div>
                </td>

                <td className="p-6 hidden md:table-cell">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase">
                      <Clock size={12} /> Plan: {task.reminder}
                    </div>
                    {task.startTime && (
                      <div className="flex items-center gap-2 text-orange-500 font-bold text-[10px] uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />{" "}
                        Start: {task.startTime}
                      </div>
                    )}
                    {task.endTime && (
                      <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />{" "}
                        End: {task.endTime}
                      </div>
                    )}
                  </div>
                </td>

                <td className="p-6 text-right">
                  {task.status !== "forged" ? (
                    <div className="flex justify-end gap-1">
                      <button className="p-2 text-blue-400 hover:bg-blue-50 rounded-xl">
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await deleteTask(task.id);
                          } catch (err) {
                            console.error("delete failed", err);
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 uppercase tracking-widest">
                      Forged
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTask}
      />
    </div>
  );
};

export default TaskList;
