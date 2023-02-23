import { inferQueryOutput } from "./trpc";
import { Role } from "@prisma/client";
import { Status } from "@prisma/client";

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

// descripes a user's public data along with their POIs
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

export type User = inferQueryOutput<"user.me">;
export type GeoJsonUsers = inferQueryOutput<"mapbox.geoJsonUsersList">;
