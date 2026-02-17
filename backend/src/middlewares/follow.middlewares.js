import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

// Validate if userId parameter is a valid MongoDB ObjectId
export const validateFollowUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  next();
});

// Prevent a user from following themselves
export const preventSelfFollow = asyncHandler(async (req, res, next) => {
  const followerId = req.user?._id;
  const followingId = req.params.userId;

  if (followerId.toString() === followingId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  next();
});

// Check if the target user exists
export const checkUserExists = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Attach user to request for later use if needed
  req.targetUser = user;
  next();
});

// Rate limiting for follow actions (optional - prevents spam follows/unfollows)
const followAttemptsMap = new Map();

export const followRateLimit = (req, res, next) => {
  const userId = req.user?._id.toString();
  const key = `${userId}-follow`;

  const now = Date.now();
  const attempts = followAttemptsMap.get(key) || [];

  // Remove attempts older than 1 minute
  const recentAttempts = attempts.filter((time) => now - time < 60000);

  if (recentAttempts.length >= 5) {
    throw new ApiError(
      429,
      "Too many follow/unfollow actions. Please try again later."
    );
  }

  recentAttempts.push(now);
  followAttemptsMap.set(key, recentAttempts);

  next();
};
