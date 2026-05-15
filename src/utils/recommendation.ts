import { Role, Status, CarpoolSearch, Location } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import _ from "lodash";
import { MapUser } from "./types";
import { z } from "zod";

/** Type for storing recommendation scores associated with a particular user */
export type Recommendation = {
  id: string;
  score: number;
};

/** Default cutoffs for scoring recommendation calculations */
const cutoffs = {
  startDistance: 6, // miles
  endDistance: 6, // miles
  startTime: 80, // minutes
  endTime: 80, // minutes
};

/** Weights for each portion of the recommendation score */
const weights = {
  startDistance: 0.2,
  endDistance: 0.4,
  startTime: 0.1,
  endTime: 0.1,
  days: 0.1,
  overlap: 0.1,
};

export type FInputs = {
  startDistance: number; // max 19, greater = any
  endDistance: number;
  startTime: number; // max = 3 hours (180min), greater = any
  endTime: number;
  days: number; /// 0 for any, 1 for exact
  flexDays: number; // minimum # of days to match
  startDate: Date;
  endDate: Date;
  dateOverlap: number; // 0 any, 1 partial, 2 full
  daysWorking: string;
};

/** Provides a very approximate coordinate distance to mile conversion */
const coordToMile = (dist: number) => dist * 88;

interface CommonUser {
  id: string;
  role: string;
  seatAvail: number;
  coopStartDate: Date | null;
  coopEndDate: Date | null;
  startCoordLat: number;
  startCoordLng: number;
  companyCoordLat: number;
  companyCoordLng: number;
  carpoolId?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  daysWorking: string;
}

// Type for CarpoolSearch with relations
type CarpoolSearchWithLocations = CarpoolSearch & {
  user: { id: string };
  homeLocation: Location | null;
  companyLocation: Location | null;
};

/**
 * Converts a CarpoolSearch to the CommonUser interface for scoring
 */
const carpoolSearchToCommonUser = (search: CarpoolSearchWithLocations): CommonUser => {
  return {
    id: search.user.id,
    role: search.role,
    seatAvail: search.seatsAvail,
    coopStartDate: search.startDate,
    coopEndDate: search.endDate,
    startCoordLat: search.homeLocation?.coordLat ?? 0,
    startCoordLng: search.homeLocation?.coordLng ?? 0,
    companyCoordLat: search.companyLocation?.coordLat ?? 0,
    companyCoordLng: search.companyLocation?.coordLng ?? 0,
    carpoolId: search.carpoolId,
    startTime: search.startTime,
    endTime: search.endTime,
    daysWorking: search.daysWorking,
  };
};

/**
 * Converts a comma separated string representing user's days working to a boolean array
 * @param user The user to calculate days for
 * @returns a boolean array corresponding to `user.daysWorking` - index 0 is Sunday
 */
const dayConversion = (user: CommonUser) => {
  return user.daysWorking.split(",").map((str) => str === "1");
};

/**
 * Generates a function that can be mapped across users to calculate recommendation scores relative to
 * a single user. If the score in any area exceeds predetermined cutoffs, the function will return undefined.
 * Scores are scaled to be between 0 and 1, where 0 indicates a perfect match.
 *
 * @param currentUser The user to generate a recommendation callback for
 * @param inputs The filter inputs to replace 'cutoffs'
 * @param sort The parameter to score by
 * @returns A function that takes in a user and returns their score relative to `currentUser`
 */
export const calculateScore = (
  currentUserSearch: CarpoolSearchWithLocations,
  inputs: FInputs,
  sort: string,
): ((userSearch: CarpoolSearchWithLocations) => Recommendation | undefined) => {
  const currentUser = carpoolSearchToCommonUser(currentUserSearch);
  const currentUserDays = inputs.daysWorking
    .split(",")
    .map((str) => str === "1");

  return (userSearch: CarpoolSearchWithLocations) => {
    const user = carpoolSearchToCommonUser(userSearch);
    
    if (
      (currentUser.role === "RIDER" &&
        (user.role === "RIDER" || user.seatAvail === 0)) ||
      (currentUser.role === "DRIVER" && user.role === "DRIVER") ||
      user.role === "VIEWER" ||
      (currentUser.carpoolId && currentUser.carpoolId === user.carpoolId)
    ) {
      return undefined;
    }

    const startDistance = coordToMile(
      Math.sqrt(
        Math.pow(currentUser.startCoordLat - user.startCoordLat, 2) +
          Math.pow(currentUser.startCoordLng - user.startCoordLng, 2),
      ),
    );

    const endDistance = coordToMile(
      Math.sqrt(
        Math.pow(currentUser.companyCoordLat - user.companyCoordLat, 2) +
          Math.pow(currentUser.companyCoordLng - user.companyCoordLng, 2),
      ),
    );
    const userDays = dayConversion(user);
    // check number of days users both go in, also count number of days current user goes in
    const daysHelper = currentUserDays.reduce(
      (acc, currentUserDay, index) => {
        if (currentUserDay) {
          acc.currentUserDays++;

          if (userDays[index]) {
            acc.bothUsersDays++;
          }
        }
        return acc;
      },
      { currentUserDays: 0, bothUsersDays: 0 },
    );
    let startTime: number | undefined;
    let endTime: number | undefined;
    if (
      currentUser.startTime &&
      currentUser.endTime &&
      user.startTime &&
      user.endTime
    ) {
      startTime =
        Math.abs(currentUser.startTime.getHours() - user.startTime.getHours()) *
          60 +
        Math.abs(
          currentUser.startTime.getMinutes() - user.startTime.getMinutes(),
        );
      endTime =
        Math.abs(currentUser.endTime.getHours() - user.endTime.getHours()) *
          60 +
        Math.abs(currentUser.endTime.getMinutes() - user.endTime.getMinutes());
      if (
        (startTime > inputs.startTime * 60 && inputs.startTime < 4) ||
        (endTime > inputs.endTime * 60 && inputs.endTime < 4)
      ) {
        return undefined;
      }
    }

    if (
      (startDistance > inputs.startDistance && inputs.startDistance < 20) ||
      (endDistance > inputs.endDistance && inputs.endDistance < 20) ||
      (inputs.days == 1 &&
        daysHelper.bothUsersDays !== daysHelper.currentUserDays) ||
      (inputs.days === 2 && daysHelper.bothUsersDays < inputs.flexDays)
    ) {
      return undefined;
    }
    const currentStart = inputs.startDate;
    const currentEnd = inputs.endDate;
    const userStart = user.coopStartDate;
    const userEnd = user.coopEndDate;
    let dateScore = 1;
    let partialOverlap = false;
    let fullOverlap = false;
    if (currentStart && currentEnd && userStart && userEnd) {
      partialOverlap = !(
        (userStart < currentStart && userEnd < currentStart) ||
        (userEnd > currentEnd && userStart > currentEnd)
      );
      fullOverlap = userStart <= currentStart && userEnd >= currentEnd;
      if (inputs.dateOverlap !== 0) {
        if (inputs.dateOverlap === 1 && !partialOverlap) {
          return undefined;
        } else if (inputs.dateOverlap === 2 && !fullOverlap) {
          return undefined;
        }
      }
    } else if (inputs.dateOverlap !== 0) {
      return undefined;
    }

    if (fullOverlap) {
      dateScore = 0;
    } else if (partialOverlap) {
      dateScore = 0.5;
    }
    let sDistanceScore;
    let eDistanceScore;
    let finalScore = 0;
    let daysScore;
    // Sorting portion
    if (sort == "any") {
      sDistanceScore =
        startDistance > cutoffs.startDistance
          ? 1
          : startDistance / cutoffs.startDistance;
      eDistanceScore =
        endDistance > cutoffs.endDistance
          ? 1
          : endDistance / cutoffs.endDistance;
      daysScore = 1 - daysHelper.bothUsersDays / daysHelper.currentUserDays;
      finalScore =
        (startDistance / cutoffs.startDistance) * weights.startDistance +
        (endDistance / cutoffs.endDistance) * weights.endDistance +
        daysScore * weights.days +
        dateScore * weights.overlap;

      if (startTime !== undefined && endTime !== undefined) {
        let eTimeScore =
          endTime > cutoffs.endTime ? 1 : endTime / cutoffs.endTime;
        let sTimeScore =
          startTime > cutoffs.startTime ? 1 : startTime / cutoffs.startTime;

        finalScore +=
          sDistanceScore * weights.startDistance +
          eDistanceScore * weights.endDistance +
          sTimeScore * weights.startTime +
          eTimeScore * weights.endTime +
          daysScore * weights.days;
      } else {
        finalScore +=
          weights.startTime +
          weights.endTime +
          sDistanceScore * weights.startDistance +
          eDistanceScore * weights.endDistance;
      }
    } else if (sort === "distance") {
      finalScore = startDistance + endDistance;
    } else if (sort === "time") {
      if (startTime !== undefined && endTime !== undefined) {
        let eTimeScore =
          endTime > cutoffs.endTime ? 1 : endTime / cutoffs.endTime;
        let sTimeScore =
          startTime > cutoffs.startTime ? 1 : startTime / cutoffs.startTime;
        finalScore = eTimeScore + sTimeScore;
      }
    }

    return {
      id: user.id,
      score: finalScore,
    };
  };
};

export type GenerateUserInput = {
  role: Role;
  seatAvail?: number;
  companyCoordLng: number;
  companyCoordLat: number;
  startCoordLng: number;
  startCoordLat: number;
  daysWorking: string; // Format: S,M,T,W,R,F,S
  startTime: string;
  endTime: string;
  carpoolId?: string;
  coopStartDate: Date | null;
  coopEndDate: Date | null;
  companyAddress?: string;
  startAddress?: string;
  companyStreet?: string;
  companyCity?: string;
  companyState?: string;
  startStreet?: string;
  startCity?: string;
  startState?: string;
};

/**
 * Creates a full user object from a skeleton of critical user information
 *
 * @param userInfo an object containing user info that we want to switch up between users
 * @returns a full user object to insert into the database, with some fields hardcoded due to lack of significance
 */
export const generateUser = ({
  id,
}: GenerateUserInput & { id: string }) => {
  const updated_obj = {
    id: id,
    name: `User ${id}`,
    email: `user${id}@hotmail.com`,
    emailVerified: new Date("2022-10-14 19:26:21"),
    image: null,
    bio: `My name is User ${id}. I like to drive`,
    pronouns: "they/them",
    preferredName: `User ${id}`,
    isOnboarded: true,
    licenseSigned: true,
    dateCreated: new Date(),
    dateModified: new Date(),
  };
  return {
    where: { id: id },
    update: updated_obj,
    create: updated_obj,
  };
};
