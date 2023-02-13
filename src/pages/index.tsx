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
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

mapboxgl.accessToken = browserEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Home: NextPage<any> = () => {
  const { data: geoJsonUsers, isLoading: isLoadingGeoJsonUsers } =
    trpc.useQuery(["mapbox.geoJsonUsersList"]);
  const { data: user, isLoading: isLoadingUser } = trpc.useQuery(["user.me"]);
  const { data: recommendations } = trpc.useQuery(["user.recommendations"]);
  // const { data: favorites  = trpc.useQuery(["user.favorites"]);
  // Uncomment the above line and delete the below line for the final build
  const favorites = undefined;

  const [mapState, setMapState] = useState<mapboxgl.Map>();

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

  console.log(favorites);
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div className="max-h-screen w-full h-full m-0">
        <Header />
        {/* <ProfileModal userInfo={userInfo!} user={user!}  /> */}
        <div className="flex flex-auto h-[90%]">
          <div className="w-3/12">
            {mapState && (
              <Sidebar
                reccs={recommendations ?? []}
                favs={favorites ?? []}
                map={mapState}
              />
            )}
          </div>

          <DropDownMenu />
          <button
            className="flex justify-center items-center w-8 h-8 absolute z-10 right-[8px] bottom-[150px] rounded-md bg-white border-2 border-solid border-gray-300 shadow-sm hover:bg-gray-200"
            id="fly"
          >
            <RiFocus3Line />
          </button>
          {/* This is where the Mapbox puts its stuff */}

          <div id="map" className="flex-auto z-10"></div>
        </div>
      </div>
    </>
  );
};

export default ProtectedPage(Home);
