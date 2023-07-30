import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { RiFocus3Line } from "react-icons/ri";
import { ToastProvider } from "react-toast-notifications";
import addClusters from "../utils/map/addClusters";
import addMapEvents from "../utils/map/addMapEvents";
import addUserLocation from "../utils/map/addUserLocation";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import DropDownMenu from "../components/DropDownMenu";
import { browserEnv } from "../utils/env/browser";
import Header, { HeaderOptions } from "../components/Header";
import { getSession } from "next-auth/react";
import Spinner from "../components/Spinner";
import { UserContext } from "../utils/userContext";
import _ from "lodash";
import { SidebarPage } from "../components/Sidebar/Sidebar";
import { MapLegend } from "../components/MapLegend";

mapboxgl.accessToken = browserEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (!session?.user) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }
  if (!session.user.isOnboarded) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

const Home: NextPage<any> = () => {
  const { data: geoJsonUsers } = trpc.mapbox.geoJsonUserList.useQuery();
  const { data: user = null } = trpc.user.me.useQuery();
  const [mapState, setMapState] = useState<mapboxgl.Map>();
  const [sidebarType, setSidebarType] = useState<HeaderOptions>("explore");
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (user && geoJsonUsers && mapContainerRef.current) {
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

  if (!user) {
    return <Spinner />;
  }
  return (
    <>
      <UserContext.Provider value={user}>
        <Head>
          <title>Home</title>
        </Head>
        <div className="m-0 h-full max-h-screen w-full">
          <Header
            data={{ sidebarValue: sidebarType, setSidebar: setSidebarType }}
          />
          <div className="flex h-[91.5%] flex-auto">
            <div className="w-96">
              <ToastProvider
                placement="top-right"
                autoDismiss={true}
                newestOnTop={true}
              >
                {mapState && (
                  <SidebarPage sidebarType={sidebarType} map={mapState} />
                )}
              </ToastProvider>
            </div>
            <DropDownMenu />
            <button
              className="absolute bottom-[150px] right-[8px] z-10 flex h-8 w-8 items-center justify-center rounded-md border-2 border-solid border-gray-300 bg-white shadow-sm hover:bg-gray-200"
              id="fly"
            >
              <RiFocus3Line />
            </button>
            <div className="relative flex-auto">
              <div
                ref={mapContainerRef}
                id="map"
                className={"h-full w-full flex-auto"}
              />
              <MapLegend role={user.role === "DRIVER" ? "Rider" : "Driver"} />
            </div>
          </div>
        </div>
      </UserContext.Provider>
    </>
  );
};

export default Home;
