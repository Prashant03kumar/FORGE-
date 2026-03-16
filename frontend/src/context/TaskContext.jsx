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
  const [loading, setLoading] = useState(false);
  const [currentForgeDay, setCurrentForgeDay] = useState(getEffectiveDate());

  // Helper to normalize server objects
  const normalize = (t) => {
    const { _id, description, ...rest } = t;
    return {
      id: _id || t.id,
      desc: description || t.desc || "",
      ...rest,
    };
  };

  // 1. SYNC TO LOCAL STORAGE (Background task)
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("forge_tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // 2. AUTO-RESET LOGIC (Check every minute for 4 AM)
  useEffect(() => {
    const interval = setInterval(() => {
      const latestDate = getEffectiveDate();
      if (latestDate !== currentForgeDay) {
        setCurrentForgeDay(latestDate);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentForgeDay]);

  // 3. THE "STABLE" LOAD FUNCTION (Prevents Loops)
  const loadTasks = useCallback(async () => {
    // Skip fetching if user is not authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("⚔️ No auth token found, skipping task fetch.");
      return;
    }

    setLoading(true);
    try {
      console.log("⚔️ Forging Data: Fetching from server...");
      const [todayRes, historyRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/tasks/history?limit=1000&page=1"),
      ]);

      const today = (todayRes.data.data || []).map(normalize);
      const historyTasks = (historyRes.data.data?.tasks || []).map(normalize);

      // Merge and dedupe
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
      console.error("Failed to load tasks:", err);
      const saved = localStorage.getItem("forge_tasks");
      if (saved) setTasks(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps = function never changes

  // 4. TRIGGER LOAD ONLY ON MOUNT OR DAY CHANGE
  useEffect(() => {
    loadTasks();
  }, [currentForgeDay, loadTasks]);

  // --- ACTIONS ---

  const addTask = async (newTask) => {
    try {
      const body = {
        title: newTask.title,
        description: newTask.desc,
        reminder: newTask.reminder,
      };
      const res = await api.post("/tasks", body);
      const task = normalize(res.data.data);
      setTasks((prev) => [task, ...prev]);
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

  // --- HELPERS ---

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

  // Calculate total hours worked today from forged tasks (startedAt → forgedAt)
  const getTodaysForgedHours = useCallback(() => {
    const forgedToday = tasks.filter(
      (t) => t.sessionDate === currentForgeDay && t.status === "forged",
    );

    let totalMs = 0;
    forgedToday.forEach((t) => {
      if (t.startedAt && t.forgedAt) {
        const started = new Date(t.startedAt).getTime();
        const forged = new Date(t.forgedAt).getTime();
        if (forged > started) {
          totalMs += forged - started;
        }
      }
    });

    // Convert ms to hours, round to 1 decimal
    return Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10;
  }, [tasks, currentForgeDay]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        currentForgeDay,
        getSessionTasks,
        getActiveTasks,
        getTodaysForged,
        getTodaysForgedHours,
        addTask,
        startTask,
        forgeTask,
        deleteTask,
        loadTasks, // Exposed if you need manual refresh
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
