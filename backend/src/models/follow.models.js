import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const FollowSchema = new Schema(
  {
    // The person who is clicking the "Follow" button
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The person being followed
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent a user from following the same person twice
// This is critical for data integrity!
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Apply the plugin for heavy social data queries
FollowSchema.plugin(mongooseAggregatePaginate);

const Follow = mongoose.model("Follow", FollowSchema);

export default Follow;
