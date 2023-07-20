import { Request, Role } from "@prisma/client";
import { Status } from "@prisma/client";
import { Feature } from "geojson";
import type { AppRouter } from "../server/router";
import { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type PoiData = {
  location: string;
  coordLng: number;
  coordLat: number;
};

export type ProfileFormInputs = {
  firstName: string;
  lastName: string;
  rdStatus: "rider" | "driver";
  seatsAvailability: number;
  companyName: string;
  companyAddress: string;
  status: "active" | "inactive";
};

// describes a user's public data along with their POIs
export type PublicUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string;
  preferredName: string;
  pronouns: string;
  role: Role;
  status: Status;
  seatAvail: number;
  companyName: string;
  startPOILocation: string;
  startPOICoordLng: number;
  startPOICoordLat: number;
  companyPOIAddress: string;
  companyPOICoordLng: number;
  companyPOICoordLat: number;
  daysWorking: string;
  startTime: Date | null;
  endTime: Date | null;
};

export type User = RouterOutput["user"]["me"];
export type GeoJsonUsers = RouterOutput["mapbox"]["geoJsonUserList"];

export type CarpoolAddress = {
  place_name: string;
  center: [longitude: number, latitude: number];
};
export type CarpoolFeature = Feature & CarpoolAddress;

export type ButtonInfo = {
  text: string;
  onPress: (user: PublicUser) => void;
  color?: string;
};

export type ResolvedRequest = {
  fromUser: User | PublicUser | null;
  toUser: User | PublicUser | null;
  id: string;
};

export type ActionType = {
  type: string;
};
