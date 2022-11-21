import { User } from "@prisma/client";

/**
 * Converts a comma separated string representing user's days working to a boolean array
 * @param user The user to calculate days for
 * @returns a boolean array corresponding to `user.daysWorking` - index 0 is Sunday
 */
const dayConversion = (user: User) => {
  return user.daysWorking.split(",").map((str) => str === "1");
};

export default dayConversion;
