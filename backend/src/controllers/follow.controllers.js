import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Follow from "../models/follow.models.js";
import { User } from "../models/user.models.js";

// 1. Follow a user
// POST /api/v1/follow/:userId
const followUser = asyncHandler(async (req, res) => {
  const followerId = req.user?._id; // Current logged-in user
  const followingId = req.params.userId; // User to follow

  // Validation
  if (!followingId) {
    throw new ApiError(400, "User ID is required");
  }

  if (followerId.toString() === followingId) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  // Check if user to follow exists
  const userToFollow = await User.findById(followingId);
  if (!userToFollow) {
    throw new ApiError(404, "User not found");
  }

  // Check if already following
  const alreadyFollowing = await Follow.findOne({
    follower: followerId,
    following: followingId,
  });

  if (alreadyFollowing) {
    throw new ApiError(400, "You are already following this user");
  }

  // Create follow relationship
  const followRelationship = await Follow.create({
    follower: followerId,
    following: followingId,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, followRelationship, "User followed successfully")
    );
});

// 2. Unfollow a user
// DELETE /api/v1/follow/:userId
const unfollowUser = asyncHandler(async (req, res) => {
  const followerId = req.user?._id;
  const followingId = req.params.userId;

  if (!followingId) {
    throw new ApiError(400, "User ID is required");
  }

  // Find and delete follow relationship
  const followRelationship = await Follow.findOneAndDelete({
    follower: followerId,
    following: followingId,
  });

  if (!followRelationship) {
    throw new ApiError(404, "You are not following this user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User unfollowed successfully"));
});

// 3. Get followers of a user
// GET /api/v1/follow/followers/:userId?page=1&limit=10
const getFollowers = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get followers with pagination
  const followers = await Follow.aggregate([
    { $match: { following: user._id } },
    {
      $lookup: {
        from: "users",
        localField: "follower",
        foreignField: "_id",
        as: "followerDetails",
      },
    },
    { $unwind: "$followerDetails" },
    {
      $project: {
        _id: "$followerDetails._id",
        username: "$followerDetails.username",
        fullName: "$followerDetails.fullName",
        avatar: "$followerDetails.avatar",
        createdAt: "$createdAt",
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  // Get total count
  const totalFollowers = await Follow.countDocuments({ following: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        followers,
        pagination: {
          page,
          limit,
          total: totalFollowers,
          pages: Math.ceil(totalFollowers / limit),
        },
      },
      "Followers fetched successfully"
    )
  );
});

// 4. Get following list of a user
// GET /api/v1/follow/following/:userId?page=1&limit=10
const getFollowing = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get following with pagination
  const following = await Follow.aggregate([
    { $match: { follower: user._id } },
    {
      $lookup: {
        from: "users",
        localField: "following",
        foreignField: "_id",
        as: "followingDetails",
      },
    },
    { $unwind: "$followingDetails" },
    {
      $project: {
        _id: "$followingDetails._id",
        username: "$followingDetails.username",
        fullName: "$followingDetails.fullName",
        avatar: "$followingDetails.avatar",
        createdAt: "$createdAt",
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  // Get total count
  const totalFollowing = await Follow.countDocuments({ follower: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        following,
        pagination: {
          page,
          limit,
          total: totalFollowing,
          pages: Math.ceil(totalFollowing / limit),
        },
      },
      "Following list fetched successfully"
    )
  );
});

// 5. Check if current user follows another user
// GET /api/v1/follow/is-following/:userId
const isFollowing = asyncHandler(async (req, res) => {
  const followerId = req.user?._id;
  const followingId = req.params.userId;

  if (!followingId) {
    throw new ApiError(400, "User ID is required");
  }

  const followRelationship = await Follow.findOne({
    follower: followerId,
    following: followingId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isFollowing: !!followRelationship },
        "Follow status fetched"
      )
    );
});

// 6. Get follow statistics for a user
// GET /api/v1/follow/stats/:userId
const getFollowStats = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get counts using aggregation for better performance
  const stats = await Follow.aggregate([
    {
      $facet: {
        followers: [{ $match: { following: user._id } }, { $count: "count" }],
        following: [{ $match: { follower: user._id } }, { $count: "count" }],
      },
    },
  ]);

  const followersCount = stats[0].followers[0]?.count || 0;
  const followingCount = stats[0].following[0]?.count || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userId,
        followers: followersCount,
        following: followingCount,
      },
      "Follow statistics fetched successfully"
    )
  );
});

export {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
  getFollowStats,
};
