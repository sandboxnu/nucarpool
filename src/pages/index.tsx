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
import { browserEnv } from "../utils/env/browser";
import Header, { HeaderOptions } from "../components/Header";
import { getSession } from "next-auth/react";
import Spinner from "../components/Spinner";
import { UserContext } from "../utils/userContext";
import _ from "lodash";
import { SidebarPage } from "../components/Sidebar/Sidebar";
import { EnhancedPublicUser, PublicUser } from "../utils/types";
import { User } from "@prisma/client";
import { useGetDirections, viewRoute } from "../utils/map/viewRoute";
import { MapConnectPortal } from "../components/MapConnectPortal";

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
  const { data: recommendations = [] } =
    trpc.user.recommendations.me.useQuery();
  const { data: favorites = [] } = trpc.user.favorites.me.useQuery();
  const { data: requests = { sent: [], received: [] } } =
    trpc.user.requests.me.useQuery();

  const [mapState, setMapState] = useState<mapboxgl.Map>();
  const [sidebarType, setSidebarType] = useState<HeaderOptions>("explore");
  const [popupUser, setPopupUser] = useState<PublicUser | null>(null);
  const mapContainerRef = useRef(null);
  const [points, setPoints] = useState<[number, number][]>([]);

  useGetDirections({ points: points, map: mapState! });

  const extendPublicUser = (user: PublicUser): EnhancedPublicUser => {
    return {
      ...user,
      isFavorited: favorites.some((favs) => favs.id === user.id),
      incomingRequest: requests.received.find(
        (req) => req.fromUserId === user.id
      ),
      outgoingRequest: requests.sent.find((req) => req.toUserId === user.id),
    };
  };

  const onViewRouteClick = (user: User, otherUser: PublicUser) => {
    if (mapState) {
      viewRoute(user, otherUser, mapState);

      if (user.role === "RIDER") {
        setPoints([
          [otherUser.startPOICoordLng, otherUser.startPOICoordLat],
          [user.startCoordLng, user.startCoordLat],
          [user.companyCoordLng, user.companyCoordLat],
          [otherUser.companyCoordLng, otherUser.companyCoordLat],
        ]);
      } else {
        setPoints([
          [user.startCoordLng, user.startCoordLat],
          [otherUser.startPOICoordLng, otherUser.startPOICoordLat],
          [otherUser.companyCoordLng, otherUser.companyCoordLat],
          [user.companyCoordLng, user.companyCoordLat],
        ]);
      }
    }
  };
  const enhancedSentUsers = requests.sent.map((request: { toUser: any }) =>
    extendPublicUser(request.toUser!)
  );
  const enhancedReceivedUsers = requests.received.map(
    (request: { fromUser: any }) => extendPublicUser(request.fromUser!)
  );
  const enhancedRecs = _.differenceBy(
    recommendations,
    enhancedSentUsers,
    "id"
  ).map(extendPublicUser);
  const enhancedFavs = favorites.map(extendPublicUser);

  useEffect(() => {
    if (user && geoJsonUsers && mapContainerRef.current) {
      const newMap = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v10",
        center: [user.companyCoordLng, user.companyCoordLat],
        zoom: 10,
      });
      newMap.scrollZoom.disable();
      newMap.setMaxZoom(13);
      newMap.on("load", () => {
        addClusters(newMap, geoJsonUsers);
        addUserLocation(newMap, user);
        addMapEvents(newMap, user, setPopupUser);
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
        <ToastProvider
          placement="top-right"
          autoDismiss={true}
          newestOnTop={true}
        >
          <Head>
            <title>CarpoolNU</title>
          </Head>
          <div className="m-0 h-full max-h-screen w-full">
            <Header
              data={{ sidebarValue: sidebarType, setSidebar: setSidebarType }}
            />
            <div className="flex h-[91.5%] flex-auto">
              <div className="w-96">
                {mapState && (
                  <SidebarPage
                    sidebarType={sidebarType}
                    map={mapState}
                    recs={enhancedRecs}
                    favs={enhancedFavs}
                    received={enhancedReceivedUsers}
                    sent={enhancedSentUsers}
                    onViewRouteClick={onViewRouteClick}
                  />
                )}
              </div>

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
                >
                  <MapConnectPortal
                    otherUser={popupUser}
                    extendUser={extendPublicUser}
                    onViewRouteClick={onViewRouteClick}
                    onClose={() => {
                      setPopupUser(null);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </ToastProvider>
      </UserContext.Provider>
    </>
  );
};

export default Home;
