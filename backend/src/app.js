import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app = express();

// this will check the incoming request and log the method and URL before passing control to the next middleware or route handler.
app.use((req, res, next) => {
  console.log("🌍 Incoming request:", req.method, req.originalUrl);
  next();
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// -- Common middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import healthCheckRoutes from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import followRouter from "./routes/follow.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import { ApiResponse } from "./utils/ApiResponse.js";

// Use routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/follow", followRouter);

// Routes
app.use("/api/v1/health", healthCheckRoutes);

// 404 Handler - for undefined routes
app.use((req, res) => {
  res.status(404).json(new ApiResponse(404, null, "Route not found"));
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
