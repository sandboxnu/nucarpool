import { inferQueryOutput } from "./trpc";

export type ProfileFormInputs = {
  firstName: string;
  lastName: string;
  rdStatus: "rider" | "driver";
  seatsAvailability: number;
  companyName: string;
  companyAddress: string;
  status: "active" | "inactive";
};

export type User = inferQueryOutput<"user.me">;
export type GeoJsonUsers = inferQueryOutput<"mapbox.geoJsonUsersList">;
