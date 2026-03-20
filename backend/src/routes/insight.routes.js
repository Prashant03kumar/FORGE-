import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { generateWeeklyInsight } from "../controllers/insight.controllers.js";

const router = Router();

router.use(verifyJWT); // Secure the route

router.route("/generate").get(generateWeeklyInsight);

export default router;
