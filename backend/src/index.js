import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CRITICAL: Load env variables FIRST before importing anything else
const envPath = path.resolve(__dirname, "../.env");
console.log("📄 Loading .env from:", envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("❌ Error loading .env file:", result.error);
} else {
  console.log("✅ .env loaded successfully");
  console.log(
    "   - CLOUDINARY_API_KEY:",
    process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Not set"
  );
  console.log(
    "   - CLOUDINARY_CLOUD_NAME:",
    process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Not set"
  );
  console.log(
    "   - CLOUDINARY_API_SECRET:",
    process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Not set"
  );
}

import app from "./app.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error ", err);
  });
