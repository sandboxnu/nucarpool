import { User } from "@prisma/client"
import dayConversion from "./dayConversion"


export type Recommendation = {
  id: string,
  score: number
}

const cutoffs = {
  startDistance: 4,
  endDistance: 4,
  startTime: 1,
  endTime: 1,
  days: 3,
}

const weights = {
  startDistance: 0.20,
  endDistance: 0.30,
  startTime: 0.15,
  endTime: 0.15,
  days: 0.20
}

const coordToMile = (dist: number) => dist * 88

// TODO: Add documentation
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

    const deprioritizationFactor = currentUser.role === "DRIVER" && user.role === "DRIVER" ? 2 : 1;

    let finalScore = startDistance * weights.startDistance + 
      endDistance * weights.endDistance +
      days * weights.days + 
      deprioritizationFactor;
    
    if (startTime !== undefined && endTime !== undefined) {
      finalScore += startTime * weights.startTime + endTime * weights.endTime;
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