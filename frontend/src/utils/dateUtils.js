// src/utils/dateUtils.js

/**
 * Calculates the "Forge Day".
 * If it's 2 AM Tuesday, it returns Monday's date string.
 */
export const getEffectiveDate = (date = new Date()) => {
  const d = new Date(date);
  const hour = d.getHours();

  // If before 4 AM, shift the logic back to the previous calendar day
  if (hour < 4) {
    d.setDate(d.getDate() - 1);
  }

  // Returns YYYY-MM-DD
  return d.toISOString().split("T")[0];
};

/**
 * Checks if the session should reset (e.g., if the user
 * last logged in on a different "Forge Day").
 */
export const shouldResetSession = (lastLoginDate) => {
  const currentForgeDay = getEffectiveDate();
  return lastLoginDate !== currentForgeDay;
};
