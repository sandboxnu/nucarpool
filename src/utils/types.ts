import { Role } from "@prisma/client";
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

export type MapUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  status: Status;
  seatAvail: number;
  companyName: string;
  daysWorking: string;
  startTime: Date | null;
  endTime: Date | null;
  coopStartDate: Date | null;
  coopEndDate: Date | null;
  preferredName: string;
  startPOILocation: string;
  startPOICoordLng: number;
  startPOICoordLat: number;
  companyAddress: string;
  companyCoordLng: number;
  companyCoordLat: number;
  startCoordLat: number;
  startCoordLng: number;
  carpoolId: string | null;
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
  companyAddress: string;
  companyCoordLng: number;
  companyCoordLat: number;
  daysWorking: string;
  startTime: Date | null;
  endTime: Date | null;
  coopStartDate: Date | null;
  coopEndDate: Date | null;
  carpoolId: string | null;
};

export type EnhancedPublicUser = PublicUser & {
  isFavorited: boolean;
  incomingRequest?: Request;
  outgoingRequest?: Request;
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
  color: string;
};

export type ResolvedRequest = {
  fromUser: PublicUser | null;
  toUser: PublicUser | null;
  id: string;
};

type Admin = {
  iso_3166_1_alpha3: string;
  iso_3166_1: string;
};

export type Request = {
  id: string;
  message: string;
  fromUserId: string;
  toUserId: string;
  fromUser: User | PublicUser;
  toUser: User | PublicUser;
  conversation?: Conversation | null;
  conversationId: string | null;
  dateCreated: Date;
};

export type Conversation = {
  id: string;
  requestId: string;
  messages: Message[];
};

export type Message = {
  id: string;
  conversationId: string;
  content: string;
  isRead: boolean;
  userId: string;
  dateCreated: Date;
};

type Notification = {
  details: {
    message: string;
  };
  subtype: string;
  type: string;
  geometry_index_end: number;
  geometry_index_start: number;
};

type Leg = {
  via_waypoints: any[]; // Replace with appropriate type
  admins: Admin[];
  notifications: Notification[];
  weight_typical: number;
  duration_typical: number;
  weight: number;
  duration: number;
  steps: any[]; // Replace with appropriate type
  distance: number;
  summary: string;
};

type Waypoint = {
  distance: number;
  name: string;
  location: [number, number];
};

type Route = {
  weight_typical: number;
  duration_typical: number;
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
  legs: Leg[];
  geometry: string;
};

export type DirectionsResponse = {
  routes: Route[];
  waypoints: Waypoint[];
  code: string;
  uuid: string;
};
