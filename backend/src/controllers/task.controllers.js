import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Task from "../models/task.models.js";

// Create a new task
const createTask = asyncHandler(async (req, res) => {
  const { title, description, date } = req.body;

  const taskDate = date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const newTask = await Task.create({
    user: req.user._id,
    title,
    description,
    date: taskDate,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newTask, "Task created successfully"));
});

// Get today's tasks for current user
const getTodayTasks = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const tasks = await Task.find({ user: req.user._id, date: today }).sort({
    createdAt: -1,
  });

  return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched"));
});

// Get past tasks (paginated)
const getTaskHistory = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id, date: { $lt: today } };

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
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

// Toggle completion status
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

// Update timeSpent on a task
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

export {
  createTask,
  getTodayTasks,
  getTaskHistory,
  toggleTaskComplete,
  updateTaskTimer,
  deleteTask,
};
