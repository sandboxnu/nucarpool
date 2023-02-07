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
import dayjs from "dayjs";

mapboxgl.accessToken = browserEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Home: NextPage<any> = () => {
  const { data: geoJsonUsers, isLoading: isLoadingGeoJsonUsers } =
    trpc.useQuery(["mapbox.geoJsonUsersList"]);
  const { data: user, isLoading: isLoadingUser } = trpc.useQuery(["user.me"]);
  const { data: recommendations } = trpc.useQuery(["user.recommendations"]);
  // const { data: favorites } = trpc.useQuery(["user.favourites"]);
  // Uncomment the above line and delete the below line for the final build
  const favorites = undefined;

  const [mapState, setMapState] = useState<mapboxgl.Map>();

  // const mockUser : User = {
  //   id: "",
  //   name: "Jeff",
  //   email: "asdf@gmail.com",
  //   emailVerified: null,
  //   image: null,
  //   bio: "",
  //   preferredName: "Jay",
  //   pronouns: "he/him",
  //   role: "DRIVER",
  //   status: "ACTIVE",
  //   seatAvail: 3,
  //   companyName: "Microsoft",
  //   companyAddress: "5 Cambridge Rd",
  //   companyCoordLng: -71.06,
  //   startCoordLat: 42.33,
  //   companyCoordLat: 42.35,
  //   startLocation: "Roxbury, MA 02120",
  //   startCoordLng: -71.1,
  //   isOnboarded: false,
  //   daysWorking: "0,0,1,1,1,1,1",
  //   startTime: dayjs("2018-04-13 09:00").toDate(),
  //   endTime: dayjs("2018-04-13 17:00").toDate(),
  // }
  useEffect(() => {
    if (mapState === undefined && user && geoJsonUsers) {
      const newMap = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v10",
        center: [user.companyCoordLng, user.companyCoordLat],
        zoom: 10,
      });

      newMap.on("load", () => {
        addClusters(newMap, geoJsonUsers);
        addUserLocation(newMap, user);
        addMapEvents(newMap, user);
      });
      setMapState(newMap);
    }
  }, [user, geoJsonUsers]);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      {/* <ProfileModal userInfo={userInfo!} user={user!}  /> */}
      <Sidebar
        reccs={recommendations ?? []}
        favs={favorites ?? []}
        map={mapState}
      />
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

export default ProtectedPage(Home);
