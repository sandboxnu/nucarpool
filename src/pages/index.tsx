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

mapboxgl.accessToken = browserEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Home: NextPage<any> = () => {
  const { data: geoJsonUsers, isLoading: isLoadingGeoJsonUsers } =
    trpc.useQuery(["mapbox.geoJsonUsersList"]);
  const { data: user, isLoading: isLoadingUser } = trpc.useQuery(["user.me"]);
  const [isMap, setMap] = useState<boolean>(false);
  const { data: recommendations } = trpc.useQuery(["user.recommendations"]);

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
      {/* <ProfileModal userInfo={userInfo!} user={user!} /> */}
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
