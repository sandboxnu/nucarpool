import { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { serverEnv } from "./env/server";
import { PublicUser } from "./types";

type POIData = {
  location: string;
  coordLng: number;
  coordLat: number;
};

export const toPublicUser = (user: User): PublicUser => {
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
    startPOILocation: user.startPOILocation,
    startPOICoordLng: user.startPOICoordLng,
    startPOICoordLat: user.startPOICoordLat,
    companyPOIAddress: user.companyPOIAddress,
    companyPOICoordLng: user.companyPOICoordLng,
    companyPOICoordLat: user.companyPOICoordLat,
  };
};

export const poiData = async (
  longitude: number,
  latitude: number
): Promise<POIData> => {
  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude}, ${latitude}.json?types=poi,locality&access_token=${serverEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
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
    location: data.features[0]?.properties.address || "NOT FOUND",
    coordLng: data.features[0]?.center[0] ?? -999,
    coordLat: data.features[0]?.center[1] ?? -999,
  };
};
