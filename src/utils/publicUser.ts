import { Location, CarpoolSearch } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { serverEnv } from "./env/server";
import { PublicUser, PoiData, User } from "./types";

/**
 * Converts the given ``User`` to a ``PublicUser``, as to hide sensitive data.
 *
 * @param user a rider or driver (merged User type from API).
 * @returns non-sensitive information about a user.
 */
export const convertToPublic = (user: User): PublicUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    bio: user.bio,
    preferredName: user.preferredName,
    pronouns: user.pronouns,
    role: user.role,
    status: user.status,
    seatAvail: user.seatAvail,
    companyName: user.companyName,
    daysWorking: user.daysWorking,
    startTime: user.startTime,
    endTime: user.endTime,
    coopEndDate: user.coopEndDate,
    coopStartDate: user.coopStartDate,
    startAddress:
      user.startCity && user.startState
        ? `${user.startCity}, ${user.startState}`
        : user.startAddress || "Exact Location Unavailable",
    startCoordLng: user.startCoordLng,
    startCoordLat: user.startCoordLat,
    companyAddress: user.companyAddress,
    companyCoordLng: user.companyCoordLng,
    companyCoordLat: user.companyCoordLat,
    carpoolId: user.carpoolId,
  };
};

/**
 * Converts a CarpoolSearch record (with relations) to a PublicUser.
 *
 * @param search an active CarpoolSearch record with user and location relations
 * @returns non-sensitive information about a user from CarpoolSearch
 */
 export const convertCarpoolSearchToPublic = (
  search: CarpoolSearch & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      bio: string;
      preferredName: string;
      pronouns: string;
    };
    homeLocation: Location | null;
    companyLocation: Location | null;
  }
): PublicUser => {
  return {
    id: search.user.id,
    name: search.user.name,
    email: search.user.email,
    image: search.user.image,
    bio: search.user.bio,
    preferredName: search.user.preferredName,
    pronouns: search.user.pronouns,
    role: search.role,
    status: search.status,
    seatAvail: search.seatsAvail,
    companyName: search.companyName,
    daysWorking: search.daysWorking,
    startTime: search.startTime,
    endTime: search.endTime,
    coopEndDate: search.endDate,
    coopStartDate: search.startDate,
    startAddress: search.homeLocation 
      ? `${search.homeLocation.city}, ${search.homeLocation.state}`
      : "Exact Location Unavailable",
    startCoordLng: search.homeLocation?.coordLng ?? 0,
    startCoordLat: search.homeLocation?.coordLat ?? 0,
    companyAddress: search.companyLocation?.streetAddress ?? "",
    companyCoordLng: search.companyLocation?.coordLng ?? 0,
    companyCoordLat: search.companyLocation?.coordLat ?? 0,
    carpoolId: search.carpoolId,
  };
};

export const roundCoord = (coord: number) => {
  return Math.round((coord + Number.EPSILON) * 100000) / 100000;
};

/**
 * Generates place of interest data given a point on the map.
 *
 * @param longitude the geographical longitude.
 * @param latitude the geographical latitude.
 * @returns non-specific location information (AKA POI).
 */
export const generatePoiData = async (
  longitude: number,
  latitude: number,
): Promise<PoiData> => {
  const endpoint = [
    "https://api.mapbox.com/geocoding/v5/mapbox.places/",
    longitude,
    ", ",
    latitude,
    ".json?types=poi&access_token=",
    serverEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  ].join("");
  const data = await fetch(endpoint)
    .then((response) => response.json())
    .catch((err) => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected error. Please try again.",
        cause: err,
      });
    });

  return {
    location: data.features[0]?.text || "NOT FOUND",
    coordLng: data.features[0]?.center[0] ?? -999,
    coordLat: data.features[0]?.center[1] ?? -999,
  };
};
