import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const TaskSchema = new Schema(
  {
    // 1. LINK TO USER
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 2. TASK DETAILS
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // optional reminder/time string from UI (e.g. "09:00 AM")
    reminder: {
      type: String,
      trim: true,
    },

    // 3. STATUS & TRACKING
    status: {
      type: String,
      enum: ["active", "in-progress", "forged"],
      default: "active",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },

    // 4. DATE & SESSION LOGIC
    // Calendar Date (e.g., 2024-05-21)
    date: {
      type: String,
      required: true,
    },
    // The "Forge Day" (e.g., if created at 2 AM, sessionDate is the previous day)
    sessionDate: {
      type: String,
      required: true,
    },

    // 5. PRECISE TIME TRACKING
    // Readable strings for UI display (e.g., "09:30 AM")
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    // ISO Dates for math/stats (e.g., calculating Peak Hours)
    startedAt: {
      type: Date,
    },
    forgedAt: {
      type: Date,
    },

    // For the Timer feature (minutes/hours accumulated)
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Improved Performance Indexing
// Added sessionDate to indexing for faster "Today's Tasks" queries
TaskSchema.index({ user: 1, sessionDate: 1, status: 1 });
TaskSchema.index({ user: 1, date: 1 });

TaskSchema.plugin(mongooseAggregatePaginate);

const Task = mongoose.model("Task", TaskSchema);

export default Task;
