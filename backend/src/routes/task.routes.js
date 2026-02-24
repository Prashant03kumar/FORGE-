import { Router } from "express";
import {
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
} from "../controllers/task.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  validateTaskBody,
  validateTaskIdParam,
  validateTimerBody,
  validateMonthParam,
} from "../middlewares/task.middlewares.js";

const router = Router();

// All task routes require authentication
router.use(verifyJWT);

router.route("/").post(validateTaskBody, createTask).get(getTodayTasks);

router.route("/stats").get(getStats);

router.route("/history").get(getTaskHistory);

router.route("/calendar/:month").get(validateMonthParam, getCalendarMonth);

// legacy helpers (still available)
router.route("/:id/toggle").patch(validateTaskIdParam, toggleTaskComplete);

router
  .route("/:id/timer")
  .patch(validateTaskIdParam, validateTimerBody, updateTaskTimer);

// actions that match the new frontend workflow
router.route("/:id/start").patch(validateTaskIdParam, startTask);
router.route("/:id/forge").patch(validateTaskIdParam, forgeTask);

// generic update/delete
router
  .route("/:id")
  .patch(validateTaskIdParam, validateTaskBody, updateTask)
  .delete(validateTaskIdParam, deleteTask);

export default router;
