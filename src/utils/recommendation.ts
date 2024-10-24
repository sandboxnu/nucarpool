import { Role, Status, User } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import _ from "lodash";
import dayConversion from "./dayConversion";
import { MapUser } from "./types";

/** Type for storing recommendation scores associated with a particular user */
export type Recommendation = {
  id: string;
  score: number;
};

/** Maximum cutoffs for recommendation calculations */
const cutoffs = {
  startDistance: 4, // miles
  endDistance: 4, // miles
  startTime: 80, // minutes
  endTime: 80, // minutes
  days: 5,
};

/** Weights for each portion of the recommendation score */
const weights = {
  startDistance: 0.2,
  endDistance: 0.3,
  startTime: 0.15,
  endTime: 0.15,
  days: 0.2,
};

/** Provides a very approximate coordinate distance to mile conversion */
const coordToMile = (dist: number) => dist * 88;

export const distanceBasedRecs = (
  currentUser: User
): ((user: MapUser) => Recommendation | undefined) => {
  return (user: MapUser) => {
    if (
      (currentUser.role === "RIDER" &&
        (user.role === "RIDER" || user.seatAvail === 0)) ||
      (currentUser.role === "DRIVER" && user.role === "DRIVER") ||
      (currentUser.role === "DRIVER" && currentUser.seatAvail === 0) ||
      (currentUser.carpoolId && currentUser.carpoolId === user.carpoolId)
    ) {
      return undefined;
    }

    const startDistance = coordToMile(
      Math.sqrt(
        Math.pow(currentUser.startCoordLat - user.startCoordLat, 2) +
          Math.pow(currentUser.startCoordLng - user.startCoordLng, 2)
      )
    );

    const endDistance = coordToMile(
      Math.sqrt(
        Math.pow(currentUser.companyCoordLat - user.companyCoordLat, 2) +
          Math.pow(currentUser.companyCoordLng - user.companyCoordLng, 2)
      )
    );

    return {
      id: user.id,
      score: startDistance + endDistance,
    };
  };
};

/**
 * Generates a function that can be mapped across users to calculate recommendation scores relative to
 * a single user. If the score in any area exceeds predetermined cutoffs, the function will return undefined.
 * Scores are scaled to be between 0 and 1, where 0 indicates a perfect match.
 *
 * @param currentUser The user to generate a recommendation callback for
 * @returns A function that takes in a user and returns their score relative to `currentUser`
 */
export const calculateScore = (
  currentUser: User
): ((user: User) => Recommendation | undefined) => {
  const currentUserDays = dayConversion(currentUser);

  return (user: User) => {
    if (
      (currentUser.role === "RIDER" &&
        (user.role === "RIDER" || user.seatAvail === 0)) ||
      (currentUser.role === "DRIVER" && user.role === "DRIVER") ||
      (currentUser.role === "DRIVER" && currentUser.seatAvail === 0) ||
      (currentUser.carpoolId && currentUser.carpoolId === user.carpoolId)
    ) {
      return undefined;
    }

    const startDistance = coordToMile(
      Math.sqrt(
        Math.pow(currentUser.startCoordLat - user.startCoordLat, 2) +
          Math.pow(currentUser.startCoordLng - user.startCoordLng, 2)
      )
    );

    const endDistance = coordToMile(
      Math.sqrt(
        Math.pow(currentUser.companyCoordLat - user.companyCoordLat, 2) +
          Math.pow(currentUser.companyCoordLng - user.companyCoordLng, 2)
      )
    );

    const userDays = dayConversion(user);
    // get the number of days that both user A AND user B are NOT going in
    let days = currentUserDays
      .map((day, index) => !(day && userDays[index]))
      .reduce((prev, curr) => (curr ? prev + 1 : prev), 0);

    // if both users are going in all 5 days of the week, then weekend days off should not affect score
    if (
      days === 2 &&
      !currentUserDays[0] &&
      !currentUserDays[6] &&
      !userDays[0] &&
      !userDays[6]
    ) {
      days = 0;
    }

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
          currentUser.startTime.getMinutes() - user.startTime.getMinutes()
        );
      endTime =
        Math.abs(currentUser.endTime.getHours() - user.endTime.getHours()) *
          60 +
        Math.abs(currentUser.endTime.getMinutes() - user.endTime.getMinutes());
      if (startTime > cutoffs.startTime || endTime > cutoffs.endTime) {
        return undefined;
      }
    }

    if (
      startDistance > cutoffs.startDistance ||
      endDistance > cutoffs.endDistance ||
      days > cutoffs.days
    ) {
      return undefined;
    }

    let finalScore =
      (startDistance / cutoffs.startDistance) * weights.startDistance +
      (endDistance / cutoffs.endDistance) * weights.endDistance +
      (days / cutoffs.days) * weights.days;

    if (startTime !== undefined && endTime !== undefined) {
      finalScore +=
        (startTime / cutoffs.startTime) * weights.startTime +
        (endTime / cutoffs.endTime) * weights.endTime;
    } else {
      finalScore += weights.startTime + weights.endTime;
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
  companyPOICoordLng: number;
  companyCoordLat: number;
  companyPOICoordLat: number;
  startCoordLng: number;
  startPOICoordLng: number;
  startCoordLat: number;
  startPOICoordLat: number;
  daysWorking: string; // Format: S,M,T,W,R,F,S
  startTime: string;
  endTime: string;
  carpoolId?: string;
  coopStartDate: Date | null;
  coopEndDate: Date | null;
};

/**
 * Creates a full user object from a skeleton of critical user information
 *
 * @param userInfo an object containing user info that we want to switch up between users
 * @returns a full user object to insert into the database, with some fields hardcoded due to lack of significance
 */
export const generateUser = ({
  id,
  role,
  seatAvail = undefined,
  companyCoordLng,
  companyCoordLat,
  startCoordLng,
  startCoordLat,
  daysWorking,
  startTime,
  endTime,
  coopStartDate,
  coopEndDate,
}: GenerateUserInput & { id: string }) => {
  if (daysWorking.length != 13) {
    throw new Error("Given an invalid string for daysWorking");
  }

  dayjs.extend(utc);
  dayjs.extend(timezone);
  const [startHours, startMinutes] = startTime
    .split(":")
    .map((s) => _.toInteger(s));
  const startDate = dayjs
    .tz(`2022-11-01 ${startHours}:${startMinutes}00`, "UTC")
    .toDate();

  const [endHours, endMinutes] = endTime.split(":").map((s) => _.toInteger(s));
  const endDate = dayjs
    .tz(`2022-11-01 ${endHours}:${endMinutes}00`, "UTC")
    .toDate();

  const updated_obj = {
    id: id,
    name: `User ${id}`,
    email: `user${id}@hotmail.com`,
    emailVerified: new Date("2022-10-14 19:26:21"),
    image: null,
    bio: `My name is User ${id}. I like to drive`,
    pronouns: "they/them",
    preferredName: `User ${id}`,
    role: role,
    status: "ACTIVE" as Status,
    seatAvail: seatAvail || 0,
    companyName: "Sandbox Inc.",
    companyAddress: "360 Huntington Ave",
    companyCoordLng: companyCoordLng,
    companyCoordLat: companyCoordLat,
    startAddress: "Roxbury",
    startCoordLng: startCoordLng,
    startCoordLat: startCoordLat,
    companyPOIAddress: "Northeastern University",
    companyPOICoordLng: companyCoordLng,
    companyPOICoordLat: companyCoordLat,
    startPOILocation: "Greenfield Commons",
    startPOICoordLng: startCoordLng,
    startPOICoordLat: startCoordLat,
    isOnboarded: true,
    daysWorking: daysWorking,
    startTime: startDate,
    endTime: endDate,
    coopEndDate: coopEndDate,
    coopStartDate: coopStartDate,
    carpoolId: null,
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
