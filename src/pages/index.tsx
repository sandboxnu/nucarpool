import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { RiFocus3Line } from "react-icons/ri";
import addClusters from "../utils/map/addClusters";
import addMapEvents from "../utils/map/addMapEvents";
import addUserLocation from "../utils/map/addUserLocation";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import DropDownMenu from "../components/DropDownMenu";
import { browserEnv } from "../utils/env/browser";
import ProtectedPage from "../utils/auth";
import { Role, Status, User } from "@prisma/client";
import Sidebar from "../components/Sidebar";

mapboxgl.accessToken = browserEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Home: NextPage<any> = () => {
  const { data: geoJsonUsers, isLoading: isLoadingGeoJsonUsers } =
    trpc.useQuery(["mapbox.geoJsonUsersList"]);
  const { data: user, isLoading: isLoadingUser } = trpc.useQuery(["user.me"]);
  const [isMap, setMap] = useState<boolean>(false);
  // const { data: recommendations } = trpc.useQuery(["user.recommendations"]);
  // const { data: favs } = trpc.useQuery(["user.favourites"]);
  // Uncomment the above line for the final build
  // Temporarily creating a list of recs in order to test the sidebar
  const recommendations: User[] | undefined = new Array(50).fill({
    id: "2",
    name: `User ${2}`,
    email: `user${2}@hotmail.com`,
    emailVerified: new Date("2022-10-14 19:26:21"),
    image: null,
    bio: `My name is User ${2}. I like to drive`,
    pronouns: "they/them",
    role: "DRIVER",
    status: "ACTIVE" as Status,
    seatAvail: 0,
    companyName: "Sandbox Inc.",
    companyAddress: "360 Huntington Ave",
    companyCoordLng: 21,
    companyCoordLat: 21,
    startLocation: "Roxbury",
    startCoordLng: 21,
    startCoordLat: 21,
    isOnboarded: true,
    daysWorking: "0,1,1,1,1,1,0",
    startTime: new Date(),
    endTime: new Date(),
  });

  const favorites: User[] | undefined = new Array(50).fill({
    id: "2",
    name: `User ${2}`,
    email: `user${2}@hotmail.com`,
    emailVerified: new Date("2022-10-14 19:26:21"),
    image: null,
    bio: `My name is User ${2}. I like to drive`,
    pronouns: "they/them",
    role: "DRIVER",
    status: "ACTIVE" as Status,
    seatAvail: 0,
    companyName: "Random house on the hill",
    companyAddress: "360 Huntington Ave",
    companyCoordLng: 21,
    companyCoordLat: 21,
    startLocation: "Roxbury",
    startCoordLng: 21,
    startCoordLat: 21,
    isOnboarded: true,
    daysWorking: "0,1,1,1,1,1,0",
    startTime: new Date(),
    endTime: new Date(),
  });
  // end of temporary code

  useEffect(() => {
    if (!isMap && user && geoJsonUsers) {
      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v10",
        center: [user.companyCoordLng, user.companyCoordLat],
        zoom: 10,
      });

      map.on("load", () => {
        addClusters(map, geoJsonUsers);
        addUserLocation(map, user);
        addMapEvents(map, user);
      });
      setMap(true);
    }
  }, [isMap, user, geoJsonUsers]);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      {/* <ProfileModal userInfo={userInfo!} user={user!}  /> */}
      <Sidebar reccs={recommendations} favs={favorites} />
      <DropDownMenu />
      <button
        className="flex justify-center items-center w-8 h-8 absolute z-10 right-[8px] bottom-[150px] rounded-md bg-white border-2 border-solid border-gray-300 shadow-sm hover:bg-gray-200"
        id="fly"
      >
        <RiFocus3Line />
      </button>
      {/* This is where the Mapbox puts its stuff */}
      <div id="map" className="h-screen"></div>
    </>
  );
};

export const userToElem = (user: User) => {
  return (
    <>
      <Head>
        <title>{user.name}</title>
        <p>{user.startLocation}</p>
        <p>{user.companyName}</p>
        {/* Add user bar */}
        <p>{"Start: " + dateToTimeString(user.startTime)}</p>
        <p>{"End: " + dateToTimeString(user.endTime)}</p>
      </Head>
    </>
  );
};

const dateToTimeString = (date: Date | null) => {
  if (date == null) {
    return "N/A";
  } else {
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }
};

export default ProtectedPage(Home);
