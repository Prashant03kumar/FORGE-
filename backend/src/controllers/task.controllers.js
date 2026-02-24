import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getEffectiveDate } from "../utils/dateUtils.js";
import Task from "../models/task.models.js";

// Create a new task
const createTask = asyncHandler(async (req, res) => {
  const { title, description, date, status, reminder } = req.body;

  // calendar date (defaults to today)
  const taskDate = date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  // forge session date (4am offset)
  const sessionDate = getEffectiveDate();

  const newTask = await Task.create({
    user: req.user._id,
    title,
    description,
    reminder,
    date: taskDate,
    sessionDate,
    // status will default to "active" unless overridden in body
    status: status || undefined,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newTask, "Task created successfully"));
});

// Get "today" (current forge-session) tasks for current user
const getTodayTasks = asyncHandler(async (req, res) => {
  const today = getEffectiveDate();

  const tasks = await Task.find({
    user: req.user._id,
    sessionDate: today,
  }).sort({
    createdAt: -1,
  });

  return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched"));
});

// Get past sessions/tasks (paginated). Uses sessionDate rather than calendar date.
const getTaskHistory = asyncHandler(async (req, res) => {
  const today = getEffectiveDate();
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id, sessionDate: { $lt: today } };

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .sort({ sessionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tasks, page, limit, total },
        "Task history fetched"
      )
    );
});

// Toggle completion status (legacy helper, kept for backward compatibility)
const toggleTaskComplete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) throw new ApiError(404, "Task not found");
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to modify this task");
  }

  task.isCompleted = !task.isCompleted;
  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task completion toggled"));
});

// Update timeSpent on a task (legacy helper)
const updateTaskTimer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { timeSpent, add } = req.body;

  const task = await Task.findById(id);
  if (!task) throw new ApiError(404, "Task not found");
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to modify this task");
  }

  if (typeof add === "number") {
    task.timeSpent = Math.max(0, (task.timeSpent || 0) + Number(add));
  } else if (typeof timeSpent === "number") {
    task.timeSpent = Math.max(0, Number(timeSpent));
  } else {
    throw new ApiError(400, "timeSpent or add (number) is required");
  }

  await task.save();

  return res.status(200).json(new ApiResponse(200, task, "Timer updated"));
});

// Get user statistics (maxStreak, totalSpark, dailyPeak)
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const pipeline = [
    { $match: { user: userId, status: "forged", forgedAt: { $exists: true } } },
    {
      $addFields: {
        day: {
          $dateToString: { format: "%Y-%m-%d", date: "$forgedAt" },
        },
        duration: {
          $cond: [
            { $and: ["$startedAt", "$forgedAt"] },
            {
              $divide: [
                { $subtract: ["$forgedAt", "$startedAt"] },
                1000 * 60 * 60,
              ],
            },
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: "$day",
        count: { $sum: 1 },
        totalHours: { $sum: "$duration" },
      },
    },
    { $sort: { _id: 1 } },
  ];

  let days = await Task.aggregate(pipeline).exec();

  // round the per-day totalHours to one decimal for client convenience
  days = days.map((r) => ({
    ...r,
    totalHours: Number((r.totalHours || 0).toFixed(1)),
  }));

  // compute derived metrics
  const totalSpark = days.reduce((s, r) => s + r.count, 0);
  let maxStreak = 0;
  let current = 0;
  let prev = null;
  days.forEach((r) => {
    const day = new Date(r._id);
    if (prev) {
      const diff = (day - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current += 1;
      } else {
        current = 1;
      }
    } else {
      current = 1;
    }
    if (current > maxStreak) maxStreak = current;
    prev = day;
  });

  let dailyPeak = days.reduce((m, r) => Math.max(m, r.totalHours || 0), 0);
  dailyPeak = Number(dailyPeak.toFixed(1)); // one decimal precision

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalSpark, maxStreak, dailyPeak, dailyStats: days },
        "Stats fetched"
      )
    );
});

// Fetch calendar-style data for a specific month (YYYY-MM)
const getCalendarMonth = asyncHandler(async (req, res) => {
  const { month } = req.params;
  const [yearStr, monStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const mon = parseInt(monStr, 10) - 1; // zero-based
  if (isNaN(year) || isNaN(mon) || mon < 0 || mon > 11) {
    throw new ApiError(400, "Invalid month format, expected YYYY-MM");
  }

  const start = new Date(year, mon, 1);
  const end = new Date(year, mon + 1, 0, 23, 59, 59, 999);

  const pipeline = [
    {
      $match: {
        user: req.user._id,
        status: "forged",
        forgedAt: { $gte: start, $lte: end },
      },
    },
    {
      $addFields: {
        day: {
          $dateToString: { format: "%Y-%m-%d", date: "$forgedAt" },
        },
        duration: {
          $cond: [
            { $and: ["$startedAt", "$forgedAt"] },
            {
              $divide: [
                { $subtract: ["$forgedAt", "$startedAt"] },
                1000 * 60 * 60,
              ],
            },
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: "$day",
        count: { $sum: 1 },
        totalHours: { $sum: "$duration" },
      },
    },
    { $sort: { _id: 1 } },
  ];

  let days = await Task.aggregate(pipeline).exec();
  days = days.map((r) => ({
    ...r,
    totalHours: Number((r.totalHours || 0).toFixed(1)),
  }));
  return res
    .status(200)
    .json(new ApiResponse(200, days, "Calendar data fetched"));
});

// Delete a task
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) throw new ApiError(404, "Task not found");
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to delete this task");
  }

  await task.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

// start a task (mark in-progress)
const startTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) throw new ApiError(404, "Task not found");
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to modify this task");
  }

  const now = new Date();
  task.status = "in-progress";
  task.startTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  task.startedAt = now;

  await task.save();
  return res.status(200).json(new ApiResponse(200, task, "Task started"));
});

// forge a task (mark completed for the day)
const forgeTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (!task) throw new ApiError(404, "Task not found");
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to modify this task");
  }

  const now = new Date();
  task.status = "forged";
  task.endTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  task.forgedAt = now;

  await task.save();

  // update user stats: increment totalSpark and log activity day
  try {
    const User = await import("../models/user.models.js").then((m) => m.User);
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalSpark: 1 },
      $addToSet: { activityLog: task.sessionDate },
    });
  } catch (e) {
    console.error("failed to update user spark/activity", e);
  }

  return res.status(200).json(new ApiResponse(200, task, "Task forged"));
});

// generic update (title/description/date etc.)
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = {};

  // only allow certain fields
  ["title", "description", "date", "reminder"].forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // if user changes the calendar date we should also adjust sessionDate
  if (updates.date) {
    updates.sessionDate = getEffectiveDate(updates.date);
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const task = await Task.findById(id);
  if (!task) throw new ApiError(404, "Task not found");
  if (task.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to modify this task");
  }

  Object.assign(task, updates);
  await task.save();

  return res.status(200).json(new ApiResponse(200, task, "Task updated"));
});

export {
  createTask,
  getTodayTasks,
  getTaskHistory,
  toggleTaskComplete,
  updateTaskTimer,
  deleteTask,
  startTask,
  forgeTask,
  updateTask,
  getStats,
  getCalendarMonth,
};
