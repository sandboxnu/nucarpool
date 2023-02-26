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
import { PublicUser } from "../utils/types";
import ConnectModal from "../components/ConnectModal";

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

  const [modalUser, setModalUser] = useState<PublicUser | null>(null);
  // this will add backdrop-blur-sm when the modal is displayed via handleConnect
  const [mapOverlayCSS, setmapOverlayCSS] = useState<string>(
    "pointer-events-none absolute top-0 right-0 w-full h-full flex justify-center items-center"
  );

  const handleConnect = (userToConnectTo: PublicUser) => {
    setModalUser(userToConnectTo);
    setmapOverlayCSS(
      "pointer-events-auto absolute top-0 right-0 w-full h-full flex justify-center items-center backdrop-blur-sm"
    );
  };

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
      <div className="max-h-screen w-full h-full m-0">
        <Header />
        {/* <ProfileModal userInfo={userInfo!} user={user!}  /> */}
        <div className="flex flex-auto h-[91.5%]">
          <div className="w-96">
            {mapState && user && (
              <Sidebar
                currentUser={user}
                reccs={recommendations ?? []}
                favs={favorites ?? []}
                map={mapState}
                handleConnect={handleConnect}
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

          {/* map wrapper */}
          <div className="relative flex-auto">
            <div id="map" className={"flex-auto w-full h-full"}></div>
            {/* This div below overlays the map and will apply a blur over the map when the modal is open */}
            <div className={mapOverlayCSS}>
              {/* The connect modal will then overlay on top of the div which overlays the map */}
              {user && modalUser && (
                <ConnectModal
                  currentUser={user}
                  userToConnectTo={modalUser}
                  closeModal={() => {
                    setModalUser(null);
                    setmapOverlayCSS(
                      "pointer-events-none absolute top-0 right-0 w-full h-full flex justify-center items-center"
                    );
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProtectedPage(Home);
