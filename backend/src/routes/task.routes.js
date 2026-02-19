import { Router } from "express";
import {
  createTask,
  getTodayTasks,
  getTaskHistory,
  toggleTaskComplete,
  updateTaskTimer,
  deleteTask,
} from "../controllers/task.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  validateTaskBody,
  validateTaskIdParam,
  validateTimerBody,
} from "../middlewares/task.middlewares.js";

const router = Router();

// All task routes require authentication
router.use(verifyJWT);

router.route("/").post(validateTaskBody, createTask).get(getTodayTasks);

router.route("/history").get(getTaskHistory);

router.route("/:id/toggle").patch(validateTaskIdParam, toggleTaskComplete);

router
  .route("/:id/timer")
  .patch(validateTaskIdParam, validateTimerBody, updateTaskTimer);

router.route("/:id").delete(validateTaskIdParam, deleteTask);

export default router;
