import { ApiError } from "./ApiError.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

/**
 * Send an email using Maileroo API
 * @param {string} to Recipient email
 * @param {string} subject Email subject
 * @param {string} html Email body (HTML format)
 * @param {string} text Email body (Plain text format - optional)
 */
export const sendEmail = async (to, subject, html, text = "") => {
  try {
    console.log("DEBUG ENV:", {
      API_KEY: process.env.MAILEROO_API_KEY,
      FROM_EMAIL: process.env.MAILEROO_FROM_EMAIL,
      FROM_NAME: process.env.MAILEROO_FROM_NAME,
    });
    const url = "https://smtp.maileroo.com/api/v2/emails";
    const apiKey = process.env.MAILEROO_API_KEY;
    const fromEmail = process.env.MAILEROO_FROM_EMAIL;
    const fromName = process.env.MAILEROO_FROM_NAME;

    if (!apiKey || !fromEmail) {
      throw new Error("Maileroo environment variables are not set properly.");
    }

    const payload = {
      to: [{ address: to }],
      from: { address: fromEmail, name: fromName || "FORGE Support" },
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]+>/g, ""),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Maileroo API Error:", data);
      throw new Error(data.message || "Failed to send email via Maileroo");
    }

    return data;
  } catch (error) {
    console.error("sendEmail Error:", error);
    throw new ApiError(500, "Invalid or unreachable email: " + error.message);
  }
};
