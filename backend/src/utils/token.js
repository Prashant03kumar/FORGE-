import crypto from "crypto";

/**
 * Generate a random token
 * @returns {string} The generated hex token
 */
export const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Calculate the expiry time for a token
 * @param {number} minutes Time to live in minutes
 * @returns {Date} Expiry Date object
 */
export const generateTokenExpiry = (minutes = 15) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
