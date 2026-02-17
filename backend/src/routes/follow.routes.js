import { Router } from "express";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
  getFollowStats,
} from "../controllers/follow.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  validateFollowUser,
  preventSelfFollow,
  checkUserExists,
  followRateLimit,
} from "../middlewares/follow.middlewares.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Public follow information (no auth required for reading, but GET doesn't need it in this case)
// GET /api/v1/follow/followers/:userId - Get followers of a user
router.route("/followers/:userId").get(validateFollowUser, getFollowers);

// GET /api/v1/follow/following/:userId - Get following list of a user
router.route("/following/:userId").get(validateFollowUser, getFollowing);

// GET /api/v1/follow/stats/:userId - Get follow statistics
router.route("/stats/:userId").get(validateFollowUser, getFollowStats);

// Protected follow actions (require authentication)

// POST /api/v1/follow/:userId - Follow a user
router
  .route("/:userId")
  .post(
    followRateLimit,
    validateFollowUser,
    preventSelfFollow,
    checkUserExists,
    followUser
  );

// DELETE /api/v1/follow/:userId - Unfollow a user
router
  .route("/:userId")
  .delete(followRateLimit, validateFollowUser, preventSelfFollow, unfollowUser);

// GET /api/v1/follow/is-following/:userId - Check if current user follows another user
router.route("/is-following/:userId").get(validateFollowUser, isFollowing);

export default router;
