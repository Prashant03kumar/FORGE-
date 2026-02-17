import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  changeCurrentPassword,
  searchUsers,
  updateAccountDetails,
  updateUserAvatar,
  getUserProfile,
} from "../controllers/user.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router();

// Unsecured routes
router.route("/register").post(
  (req, res, next) => {
    console.log("🚀 Register route hit");
    next();
  },
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/search").get(searchUsers);
router.route("/u/:username").get(getUserProfile);

// Secured routes (require authentication) can be added here, e.g.:
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

export default router;
