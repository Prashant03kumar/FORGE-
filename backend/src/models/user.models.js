import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    avatar: { type: String, default: "" },
    refreshToken: { type: String }, // For secure long-term sessions

    // Fields added to help with heatmap/year options
    // when a user signs up we capture the year they registered and the
    // exact date.  This allows the front‑end to start the heatmap from
    // the registration year instead of always showing “Current” or
    // trying to infer from activity.
    registeredAt: { type: Date, default: Date.now },
    registrationYear: {
      type: Number,
      default: () => new Date().getFullYear(), // year of signup
    },

    // Consistency Tracking
    currentStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },

    // cumulative sparks (for quick access)
    totalSpark: { type: Number, default: 0 },

    // Heatmap: Array of strings "YYYY-MM-DD"
    activityLog: [{ type: String }],

    // Bio for profile
    bio: { type: String, maxLength: 150 },

    // The Forge Oracle insight
    weeklyInsight: {
      content: { type: String },
      generatedAt: { type: Date },
      rawStats: { type: Object }
    },
  },
  { timestamps: true }
);

//We have schema so before saving the user password we need password encryption

UserSchema.pre("save", async function () {
  // make sure registrationYear is always present (for legacy docs)
  if (!this.registrationYear) {
    const base = this.registeredAt || this.createdAt || new Date();
    this.registrationYear = new Date(base).getFullYear();
  }

  if (!this.isModified("password")) return; // Only hash if password is new or changed
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error("Error hashing password", error);
    throw error; // Prevent saving if hashing fails
  }
});

// add custome function to compare password
UserSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Why these methods in UserSchema?
// Because we want to generate JWT tokens that include user info (like _id, email, username) whenever a user logs in or refreshes their session. By adding these methods directly to the User schema,
// we can easily call them on any user instance to create access and refresh tokens that are securely signed with our secret keys and have appropriate expiration times.
// This keeps our authentication logic organized and reusable across our application.
// In simple meaning, these methods allow us to create secure tokens that represent the user's identity and session, which we can use for authentication and authorization throughout our app.
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
UserSchema.methods.generateRefreshToken = function () {
  // long lived access token
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", UserSchema); // Mongo db create 'users'
