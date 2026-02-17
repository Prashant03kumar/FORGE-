import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const healthCheck = asyncHandler(async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

  const healthData = {
    status: "Success",
    message: "Forge Server is live and healthy",
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  // Using your new ApiResponse class!
  return res
    .status(200)
    .json(new ApiResponse(200, healthData, "Health Check successful"));
});

export { healthCheck };
