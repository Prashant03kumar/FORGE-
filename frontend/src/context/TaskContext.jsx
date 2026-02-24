import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getEffectiveDate } from "../utils/dateUtils";
import api from "../api/axios";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  // helper to normalize server objects to frontend shape
  const normalize = (t) => {
    const { _id, description, ...rest } = t;
    return {
      id: _id || t.id,
      desc: description || t.desc || "",
      ...rest,
    };
  };

  // Track the current forge day to force UI updates at 4 AM
  const [currentForgeDay, setCurrentForgeDay] = useState(getEffectiveDate());

  // 1. Keep LocalStorage synced (still useful as offline cache)
  useEffect(() => {
    localStorage.setItem("forge_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // 2. AUTO-RESET LOGIC: Check every minute if we've crossed the 4 AM threshold
  useEffect(() => {
    const interval = setInterval(() => {
      const latestDate = getEffectiveDate();
      if (latestDate !== currentForgeDay) {
        setCurrentForgeDay(latestDate); // This triggers a re-render of the Dashboard
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [currentForgeDay]);

  // create on server then update local state
  const addTask = async (newTask) => {
    try {
      const body = {
        title: newTask.title,
        description: newTask.desc,
        // reminder is frontend-only; store if you extend backend
        reminder: newTask.reminder,
      };
      const res = await api.post("/tasks", body);
      const task = normalize(res.data.data);
      setTasks((prev) => [...prev, task]);
      return task;
    } catch (err) {
      console.error("failed to create task", err);
      throw err;
    }
  };

  const startTask = async (id) => {
    try {
      const res = await api.patch(`/tasks/${id}/start`);
      const updated = normalize(res.data.data);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      console.error("failed to start task", err);
      throw err;
    }
  };

  const forgeTask = async (id) => {
    try {
      const res = await api.patch(`/tasks/${id}/forge`);
      const updated = normalize(res.data.data);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      console.error("failed to forge task", err);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("failed to delete task", err);
      throw err;
    }
  };

  // 4. BACKEND HELPERS (optional)
  const fetchStats = async () => {
    const res = await api.get("/tasks/stats");
    return res.data.data;
  };

  const fetchCalendarMonth = async (month) => {
    const res = await api.get(`/tasks/calendar/${month}`);
    return res.data.data;
  };

  // 2. LOAD LOGIC: fetch today's tasks whenever the forge day changes
  const loadTasks = useCallback(async () => {
    try {
      // load today's tasks and recent history concurrently
      const [todayRes, historyRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/tasks/history?limit=1000&page=1"),
      ]);
      const today = (todayRes.data.data || []).map(normalize);
      const historyTasks =
        (historyRes.data.data?.tasks || []).map(normalize) || [];

      // merge and dedupe by id (today's may overlap with history if same)
      const merged = [...today];
      const seen = new Set(merged.map((t) => t.id));
      historyTasks.forEach((t) => {
        if (!seen.has(t.id)) {
          merged.push(t);
          seen.add(t.id);
        }
      });

      setTasks(merged);
    } catch (err) {
      console.error("failed to load tasks", err);
      // fallback to localStorage if available
      const saved = localStorage.getItem("forge_tasks");
      if (saved) setTasks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, currentForgeDay]);

  // 3. IMPROVED HELPERS: Using currentForgeDay state to ensure reactivity
  // Get ALL tasks from the current session/forge-day, regardless of status
  // (active, in-progress, and forged all together)
  const getSessionTasks = useCallback(() => {
    return tasks.filter((t) => t.sessionDate === currentForgeDay);
  }, [tasks, currentForgeDay]);

  const getActiveTasks = useCallback(() => {
    return tasks.filter(
      (t) => t.sessionDate === currentForgeDay && t.status !== "forged",
    );
  }, [tasks, currentForgeDay]);

  const getTodaysForged = useCallback(() => {
    return tasks.filter(
      (t) => t.sessionDate === currentForgeDay && t.status === "forged",
    );
  }, [tasks, currentForgeDay]);

  return (
    <TaskContext.Provider
      value={{
        tasks, // The "Source of Truth" (all history)
        currentForgeDay, // Current date for UI labels
        getSessionTasks, // ALL tasks from current session (all statuses)
        getActiveTasks, // Only non-forged tasks for the current 4AM cycle
        getTodaysForged, // Only forged tasks for the current 4AM cycle
        addTask,
        startTask,
        forgeTask,
        deleteTask,
        // backend helpers
        fetchStats,
        fetchCalendarMonth,
      }}
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
