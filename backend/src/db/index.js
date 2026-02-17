import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env", // Explicitly tell it where the file is
});

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );

    console.log(
      `\n✅✅ MongoDB connected ! DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("❌❌ MongoDB connection error ", error);
    process.exit(1);
  }
};

export default connectDB;
