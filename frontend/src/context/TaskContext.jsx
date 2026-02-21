import React, { createContext, useContext, useState, useEffect } from "react";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("forge_tasks");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: "Initial Forge",
            desc: "Setting up the workspace",
            reminder: "09:00 AM",
            status: "forged",
            endTime: "10:30 AM",
            forgedAt: new Date().toISOString(),
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("forge_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (newTask) => {
    const taskWithId = { ...newTask, id: Date.now(), status: "active" };
    setTasks((prev) => [...prev, taskWithId]);
  };

  const startTask = (id) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const iso = now.toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "in-progress",
              startTime: timeString,
              startedAt: iso,
            }
          : t,
      ),
    );
  };

  const forgeTask = (id) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const iso = now.toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "forged", endTime: timeString, forgedAt: iso }
          : t,
      ),
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, startTask, forgeTask, deleteTask }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
}
