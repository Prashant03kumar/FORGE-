// Utilities for handling Forge's "effective date" (4am cutoff)

/**
 * Returns the current Forge session date (YYYY-MM-DD) taking into
 * account the 4AM rollover logic used on the frontend.
 *
 * If the provided date is before 4am the previous day is returned.  The
 * function defaults to `new Date()` when no argument is supplied.
 */
export const getEffectiveDate = (date = new Date()) => {
  const d = new Date(date);
  const hour = d.getHours();

  if (hour < 4) {
    d.setDate(d.getDate() - 1);
  }

  return d.toISOString().split("T")[0];
};

/**
 * Helper used by some controllers to decide if a session should reset.
 * Not currently used but provided for symmetry with frontend utils.
 */
export const shouldResetSession = (lastLoginDate) => {
  const currentForgeDay = getEffectiveDate();
  return lastLoginDate !== currentForgeDay;
};
