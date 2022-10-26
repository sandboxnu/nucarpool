import { User } from "@prisma/client"
import dayConversion from "./dayConversion"

/** Type for storing recommendation scores associated with a particular user */
export type Recommendation = {
  id: string,
  score: number
}

/** Maximum cutoffs for recommendation calculations */
const cutoffs = {
  startDistance: 4,
  endDistance: 4,
  startTime: 1,
  endTime: 1,
  days: 3,
}

/** Weights for each portion of the recommendation score */
const weights = {
  startDistance: 0.20,
  endDistance: 0.30,
  startTime: 0.15,
  endTime: 0.15,
  days: 0.20
}

/** Provides a very approximate coordinate distance to mile conversion */
const coordToMile = (dist: number) => dist * 88

/**
 * Generates a function that can be mapped across users to calculate recommendation scores relative to
 * a single user. If the score in any area exceeds predetermined cutoffs, the function will return undefined.
 * Scores are scaled to be between 0 and 1, where 0 indicates a perfect match.
 * 
 * @param currentUser The user to generate a recommendation callback for
 * @returns A function that takes in a user and returns their score relative to `currentUser`
 */
const calculateScore = (currentUser: User): ((user: User) => Recommendation | undefined) => {
  const currentUserDays = dayConversion(currentUser)

  return (user: User) => {
    if (currentUser.role === "RIDER" && (user.role === "RIDER" || user.seatAvail === 0)) {
      return undefined;
    }

    const startDistance = coordToMile(
      Math.sqrt(
      Math.pow(currentUser.startCoordLat - user.startCoordLat, 2) + 
      Math.pow(currentUser.startCoordLng - user.startCoordLng, 2)
    ));

    const endDistance = coordToMile(
      Math.sqrt(
      Math.pow(currentUser.companyCoordLat - user.companyCoordLat, 2) + 
      Math.pow(currentUser.companyCoordLng - user.companyCoordLng, 2)
    ));

    const userDays = dayConversion(user);
    const days = currentUserDays
      .map((day, index) => day && !userDays[index])
      .reduce((prev, curr) => curr ? prev + 1 : prev, 0);

    let startTime: number | undefined;
    let endTime: number | undefined;
    if (currentUser.startTime && currentUser.endTime && user.startTime && user.endTime) {
      startTime = Math.abs(currentUser.startTime.getHours() - user.startTime.getHours());
      endTime = Math.abs(currentUser.endTime.getHours() - user.endTime.getHours());
      if (startTime > cutoffs.startTime || endTime > cutoffs.endTime) {
        return undefined
      }
    }

    if (startDistance > cutoffs.startDistance || endDistance > cutoffs.endDistance || days > cutoffs.days) {
      return undefined
    }

    const deprioritizationFactor = currentUser.role === "DRIVER" && user.role === "DRIVER" ? 0.10 : 0;

    let finalScore = (startDistance / cutoffs.startDistance) * weights.startDistance + 
      (endDistance / cutoffs.endDistance) * weights.endDistance +
      (days / cutoffs.days) * weights.days + 
      deprioritizationFactor;
    
    if (startTime !== undefined && endTime !== undefined) {
      finalScore += (startTime / cutoffs.startTime) * weights.startTime + (endTime / cutoffs.endTime) * weights.endTime;
    } else {
      finalScore *= 1 / (weights.startTime + weights.endTime);
    }

    return {
      id: user.id,
      score: finalScore,
    };
  }
};

export default calculateScore;