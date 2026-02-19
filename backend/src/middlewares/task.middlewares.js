import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const validateTaskBody = (req, res, next) => {
  const { title } = req.body;
  if (!title || String(title).trim() === "") {
    throw new ApiError(400, "Title is required");
  }
  next();
};

export const validateTaskIdParam = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Task ID is required");
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid task ID format");
  }
  next();
});

export const validateTimerBody = (req, res, next) => {
  const { timeSpent, add } = req.body;
  if (typeof add !== "number" && typeof timeSpent !== "number") {
    throw new ApiError(400, "Provide numeric 'timeSpent' or 'add' field");
  }
  next();
};
