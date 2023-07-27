import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { RiFocus3Line } from "react-icons/ri";
import { ToastProvider, useToasts } from "react-toast-notifications";
import addClusters from "../utils/map/addClusters";
import addMapEvents from "../utils/map/addMapEvents";
import addUserLocation from "../utils/map/addUserLocation";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import DropDownMenu from "../components/DropDownMenu";
import { browserEnv } from "../utils/env/browser";
import Header, { HeaderOptions } from "../components/Header";
import { PublicUser, User } from "../utils/types";
import { toast, useToast } from "react-toastify";
import { getSession } from "next-auth/react";
import { emailSchema } from "../utils/email";
import Spinner from "../components/Spinner";
import { UserContext } from "../utils/userContext";
import _ from "lodash";
import { SidebarPage } from "../components/Sidebar/Sidebar";

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
    props: {}, // will be passed to the page component as props
  };
}

const Home: NextPage<any> = () => {
  //tRPC queries to fetch user related data
  const utils = trpc.useContext();
  const { data: geoJsonUsers, refetch: refetchGeoJsonUsers } =
    trpc.mapbox.geoJsonUserList.useQuery();
  const { data: user = null, refetch: refetchMe } = trpc.user.me.useQuery();

  //tRPC mutations to update user related data

  const [mapState, setMapState] = useState<mapboxgl.Map>();
  const [modalUser, setModalUser] = useState<PublicUser | null>(null);
  const [modalType, setModalType] = useState<string>("connect");
  const [sidebarType, setSidebarType] = useState<HeaderOptions>("explore");
  const mapContainerRef = useRef(null);

  // const handleRejectRequest = (fromUser: PublicUser) => {
  //   const userRequest = received.find(
  //     (request) => request.fromUser?.name === fromUser.name
  //   );
  //   if (userRequest) {
  //     handleDeleteRequest(userRequest);
  //   }
  // };

  // const handleAcceptRequest = (fromUser: PublicUser) => {
  //   // Must also handle group inclusion functionality here
  //   // When the carpooling page is complete
  //   const userRequest = received.find(
  //     (request) => request.fromUser?.name === fromUser.name
  //   );
  //   if (userRequest) {
  //     handleDeleteRequest(userRequest);
  //   }
  // };

  useEffect(() => {
    if (
      mapState === undefined &&
      user &&
      geoJsonUsers &&
      mapContainerRef.current
    ) {
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

  useEffect(() => {
    refetchMe();
    refetchGeoJsonUsers();
  }, []);

  // Don't forget about mapState

  if (!user) {
    return <Spinner />;
  }
  return (
    <>
      <UserContext.Provider value={user}>
        <Head>
          <title>Home</title>
        </Head>
        <div className="max-h-screen w-full h-full m-0">
          <Header
            data={{ sidebarValue: sidebarType, setSidebar: setSidebarType }}
          />
          <div className="flex flex-auto h-[91.5%]">
            <div className="w-96">
              <ToastProvider
                placement="bottom-right"
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
              className="flex justify-center items-center w-8 h-8 absolute z-10 right-[8px] bottom-[150px] rounded-md bg-white border-2 border-solid border-gray-300 shadow-sm hover:bg-gray-200"
              id="fly"
            >
              <RiFocus3Line />
            </button>
            <div className="relative flex-auto">
              <div
                ref={mapContainerRef}
                id="map"
                className={"flex-auto w-full h-full"}
              ></div>
            </div>
          </div>
        </div>
      </UserContext.Provider>
    </>
  );
};

export default Home;
