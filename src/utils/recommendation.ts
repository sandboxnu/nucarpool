import { User } from "@prisma/client"
import { isInteger } from "lodash"
import dayConversion from "./dayConversion"


type Recommendation = {
  id: string,
  score: number
}

const startDistWeight = 10
const companyDistWeight = 20
const daysWeight = 1
const timeWeight = 5

const weightSum = startDistWeight + companyDistWeight + daysWeight + timeWeight

// TODO: Add documentation
const calculateScore = (currentUser: User): ((user: User) => Recommendation) => {
  const currentUserDays = dayConversion(currentUser)

  return (user: User) => {
    const startDistDiff = Math.sqrt(
      Math.pow(currentUser.startCoordLat - user.startCoordLat, 2) + 
      Math.pow(currentUser.startCoordLng - user.startCoordLng, 2)
    )

    const companyDistDiff = Math.sqrt(
      Math.pow(currentUser.companyCoordLat - user.companyCoordLat, 2) + 
      Math.pow(currentUser.companyCoordLng - user.companyCoordLng, 2)
    )

    const userDays = dayConversion(user)
    const daysScore = currentUserDays
      .map((day, index) => day && !userDays[index])
      .reduce((prev, curr) => curr ? prev + 1 : prev, 0)

    let timeScore: number | undefined
    if (currentUser.startTime && currentUser.endTime && user.startTime && user.endTime) {
      timeScore = Math.max(0, Math.abs(currentUser.startTime.getHours() - user.startTime.getHours()) - 0.5) + 
        Math.max(0, Math.abs(currentUser.endTime.getHours() - user.endTime.getHours()) - 0.5)
    }

    const deprioritizationFactor = currentUser.role === "DRIVER" && user.role === "DRIVER" ? 2 : 1

    let finalScore = startDistDiff * startDistWeight + 
      companyDistDiff * companyDistWeight +
      daysScore * daysWeight + 
      deprioritizationFactor;
    
    if (timeScore) {
      finalScore += timeScore + timeWeight;
    } else {
      finalScore *= (weightSum / (weightSum - timeWeight));
    }

    return {
      id: user.id,
      score: finalScore
    }
  }
};

export default calculateScore;