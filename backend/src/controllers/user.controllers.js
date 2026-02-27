import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

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
    const newUser = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatarUrl?.url || "",
      registeredAt: now,
      registrationYear: now.getFullYear(),
    });

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "User creation failed. Please try again.");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    console.error("Error during user registration", error);
    if (avatarUrl) {
      // If avatar was uploaded but user creation failed, delete the uploaded avatar to prevent orphaned files
      await deleteFromCloudinary(avatarUrl.public_id);
    }
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

// 10. Get users with search
// GET /api/v1/users/search?query=sachin
const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  // IF NO QUERY: Show "Suggested Forgers"
  if (!query) {
    const discoveryUsers = await User.aggregate([
      { $sample: { size: 5 } }, // Get 5 random users
      {
        $project: {
          // Only send public data
          username: 1,
          fullName: 1,
          avatar: 1,
          currentStreak: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, discoveryUsers, "Discovery: Suggested Forgers")
      );
  }

  // IF QUERY EXISTS: Perform Search
  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: "i" } },
      { fullName: { $regex: query, $options: "i" } },
    ],
  }).select("username fullName avatar currentStreak");

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users found successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  searchUsers,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getUserProfile,
};
