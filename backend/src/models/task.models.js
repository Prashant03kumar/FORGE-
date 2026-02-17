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

    // 3. STATUS & TRACKING
    isCompleted: {
      type: Boolean,
      default: false,
    },

    // Date stored as "YYYY-MM-DD" for easy Heatmap grouping
    date: {
      type: String,
      required: true,
    },

    // For the Timer feature (minutes)
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Performance Indexing
TaskSchema.index({ user: 1, date: 1 });

// Apply Pagination Plugin for Aggregate Pipelines
TaskSchema.plugin(mongooseAggregatePaginate);

const Task = mongoose.model("Task", TaskSchema);

export default Task;
