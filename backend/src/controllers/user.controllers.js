import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { sendEmail } from "../utils/mail.js";
import { generateToken, generateTokenExpiry } from "../utils/token.js";

// Generate access token and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User doesn't exist");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens."
    );
  }
};

// 1. Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Basic validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Strict email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Check for existing user
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(409, "Email or username already in use");
  }

  const avatarLocalPath = req.files ? req.files.avatar[0]?.path : null;

  let avatarUrl = null;
  if (avatarLocalPath) {
    avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  }
  // Create user
  try {
    const now = new Date();
    const verificationToken = generateToken();

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      avatar: avatarUrl?.url || "",
      registeredAt: now,
      registrationYear: now.getFullYear(),
      isVerified: false,
      verificationToken,
      tokenExpiry: generateTokenExpiry(15), // 15 mins
    });

    // Send Verification Email
    try {
      const verifyLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;
      const emailHtml = `<p>Hi ${fullName},</p><p>Please verify your email by clicking the link below:</p><a href="${verifyLink}">Verify Email</a>`;
      
      await sendEmail(newUser.email, "Verify your email", emailHtml);
    } catch (emailError) {
      // Rollback user creation
      await User.findByIdAndDelete(newUser._id);
      if (avatarUrl) {
        await deleteFromCloudinary(avatarUrl.public_id);
      }
      throw new ApiError(500, "Invalid or unreachable email. Registration failed.");
    }

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken -verificationToken -tokenExpiry"
    );

    if (!createdUser) {
      throw new ApiError(500, "User creation failed. Please try again.");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully. Please check your email to verify."));
  } catch (error) {
    console.error("Error during user registration", error);
    if (avatarUrl && !error?.message?.includes("unreachable email")) {
      // If avatar was uploaded but user creation failed, delete the uploaded avatar to prevent orphaned files
      await deleteFromCloudinary(avatarUrl.public_id);
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "User registration failed. Please try again.");
  }
});

// 2. Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  //Grab access token and refresh token
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );
  console.log("DEBUG: Access Token Value ->", accessToken);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken }, // Pass both here!
        "User logged in successfully"
      )
    );
});

// 2b. Verify Email
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  const user = await User.findOne({
    verificationToken: token,
    tokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.tokenExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"));
});

// 2c. Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return success anyway to prevent email enumeration
    return res.status(200).json(new ApiResponse(200, {}, "If an account with that email exists, a reset link has been sent."));
  }

  const resetToken = generateToken();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = generateTokenExpiry(15);
  await user.save({ validateBeforeSave: false });

  try {
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    const emailHtml = `<p>Hi ${user.fullName},</p><p>You requested a password reset. Click the link below to set a new password:</p><a href="${resetLink}">Reset Password</a><p>If you didn't request this, you can safely ignore this email.</p>`;
    
    await sendEmail(user.email, "Reset your password", emailHtml);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Failed to send password reset email");
  }

  return res.status(200).json(new ApiResponse(200, {}, "If an account with that email exists, a reset link has been sent."));
});

// 2d. Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save({ validateBeforeSave: true }); // trigger pre-save hook for password hash

  return res.status(200).json(new ApiResponse(200, {}, "Password has been reset successfully"));
});

// 3. Logout User
// We will implement this later when we have refresh token rotation in place.
//  For now, we can just clear the cookies on the client side to "log out" the user,
// since we are not implementing refresh token rotation yet.
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { returnDocument: "after" }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// 4. Refresh Token Rotation and Access Token Renewal
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(404, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfullys"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while refreshing access token"
    );
  }
});

// 5. change password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// 6. Get current user profile
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user details"));
});

// 7. Update user profile - supports fullName, email, and bio
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, bio } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "Fullname and email are required");
  }

  // Build update object with all provided fields
  const updateData = {
    fullName,
    email: email.toLowerCase(),
  };

  // Include bio if provided
  if (bio !== undefined) {
    updateData.bio = bio;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateData,
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

// 8. update avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "File is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar has been updated successfully"));
});

// 9. public user profile
// GET /api/v1/users/u/:username
const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username: username.toLowerCase() }).select(
    "-password -refreshToken"
  );

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched"));
});

// 10. Get users with search (paginated)
// GET /api/v1/users/search?query=sachin&page=1&limit=12
const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const skip = (page - 1) * limit;

  // IF NO QUERY: Show "Suggested Forgers"
  if (!query) {
    const discoveryUsers = await User.aggregate([
      { $sample: { size: 5 } },
      {
        $project: {
          username: 1,
          fullName: 1,
          avatar: 1,
          currentStreak: 1,
          totalSpark: 1,
          bio: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { users: discoveryUsers, total: discoveryUsers.length, page: 1, limit: 5 }, "Discovery: Suggested Forgers")
      );
  }

  // IF QUERY EXISTS: Perform Search with pagination
  const filter = {
    $or: [
      { username: { $regex: query, $options: "i" } },
      { fullName: { $regex: query, $options: "i" } },
    ],
  };

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("username fullName avatar currentStreak totalSpark bio")
      .skip(skip)
      .limit(limit)
      .sort({ totalSpark: -1 }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { users, total, page, limit }, "Users found successfully"));
});

export {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  searchUsers,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getUserProfile,
};
