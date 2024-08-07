import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import { RiFocus3Line } from "react-icons/ri";
import { ToastProvider } from "react-toast-notifications";
import addClusters from "../utils/map/addClusters";
import addMapEvents from "../utils/map/addMapEvents";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { browserEnv } from "../utils/env/browser";
import Header, { HeaderOptions } from "../components/Header";
import { getSession } from "next-auth/react";
import Spinner from "../components/Spinner";
import { UserContext } from "../utils/userContext";
import _, { debounce } from "lodash";
import { SidebarPage } from "../components/Sidebar/Sidebar";
import {
  CarpoolAddress,
  CarpoolFeature,
  EnhancedPublicUser,
  PublicUser,
} from "../utils/types";
import { User } from "@prisma/client";
import { useGetDirections, viewRoute } from "../utils/map/viewRoute";
import { MapConnectPortal } from "../components/MapConnectPortal";
import useSearch from "../utils/search";
import AddressCombobox from "../components/Map/AddressCombobox";
import updateUserLocation from "../utils/map/updateUserLocation";
import { MapLegend } from "../components/MapLegend";
import Image from "next/image";
import BlueSquare from "../../public/blue-square.png";
import BlueCircle from "../../public/blue-circle.png";
import VisibilityToggle from "../components/Map/VisibilityToggle";
import updateCompanyLocation from "../utils/map/updateCompanyLocation";

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
  const { data: favorites = [] } = trpc.user.favorites.me.useQuery(undefined, {
    refetchOnMount: true,
  });
  const { data: requests = { sent: [], received: [] } } =
    trpc.user.requests.me.useQuery();
  const [otherUser, setOtherUser] = useState<PublicUser | null>(null);
  const [mapState, setMapState] = useState<mapboxgl.Map>();
  const [sidebarType, setSidebarType] = useState<HeaderOptions>("explore");
  const [popupUser, setPopupUser] = useState<PublicUser | null>(null);
  const mapContainerRef = useRef(null);
  const [points, setPoints] = useState<[number, number][]>([]);
  const [companyAddressSuggestions, setCompanyAddressSuggestions] = useState<
    CarpoolFeature[]
  >([]);
  const [startAddressSuggestions, setStartAddressSuggestions] = useState<
    CarpoolFeature[]
  >([]);

  const [companyAddressSelected, setCompanyAddressSelected] =
    useState<CarpoolAddress>({
      place_name: "",
      center: [0, 0],
    });
  const [startAddressSelected, setStartAddressSelected] =
    useState<CarpoolAddress>({
      place_name: "",
      center: [0, 0],
    });

  const [companyAddress, setCompanyAddress] = useState("");
  const updateCompanyAddress = useMemo(
    () => debounce(setCompanyAddress, 250),
    []
  );

  const [startingAddress, setStartingAddress] = useState("");
  const updateStartingAddress = useMemo(
    () => debounce(setStartingAddress, 250),
    []
  );

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
    setOtherUser(otherUser);
    const isViewerAddressSelected =
      companyAddressSelected.place_name !== "" &&
      startAddressSelected.place_name !== "";
    const companyCord: number[] = companyAddressSelected.center;
    const startCord: number[] = startAddressSelected.center;
    const userStartLng = isViewerAddressSelected
      ? startCord[0]
      : user.startCoordLng;
    const userStartLat = isViewerAddressSelected
      ? startCord[1]
      : user.startCoordLat;
    const userCompanyLng = isViewerAddressSelected
      ? companyCord[0]
      : user.companyCoordLng;
    const userCompanyLat = isViewerAddressSelected
      ? companyCord[1]
      : user.companyCoordLat;
    const userCoord = {
      startLat: userStartLat,
      startLng: userStartLng,
      endLat: userCompanyLat,
      endLng: userCompanyLng,
    };
    if (mapState) {
      updateUserLocation(mapState, userStartLng, userStartLat);
      updateCompanyLocation(mapState, userCompanyLng, userCompanyLat);
      const viewProps = {
        user,
        otherUser,
        map: mapState,
        userCoord,
      };

      if (otherUser.role === "DRIVER") {
        setPoints([
          [otherUser.startPOICoordLng, otherUser.startPOICoordLat],
          [userStartLng, userStartLat],
          [userCompanyLng, userCompanyLat],
          [otherUser.companyCoordLng, otherUser.companyCoordLat],
        ]);
      } else {
        setPoints([
          [userStartLng, userStartLat],
          [otherUser.startPOICoordLng, otherUser.startPOICoordLat],
          [otherUser.companyCoordLng, otherUser.companyCoordLat],
          [userCompanyLng, userCompanyLat],
        ]);
      }
      viewRoute(viewProps);
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
      const isViewer = user.role === "VIEWER";
      const neuLat = 42.33907;
      const neuLng = -71.088748;
      const newMap = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v10",
        center: isViewer
          ? [neuLng, neuLat]
          : [user.companyCoordLng, user.companyCoordLat],
        zoom: 10,
      });
      newMap.setMaxZoom(13);
      newMap.on("load", () => {
        addClusters(newMap, geoJsonUsers);
        updateUserLocation(newMap, user.startCoordLng, user.startCoordLat);
        updateCompanyLocation(
          newMap,
          user.companyCoordLng,
          user.companyCoordLat
        );
        addMapEvents(newMap, user, setPopupUser);
      });

      setMapState(newMap);
    }
  }, [user, geoJsonUsers]);

  // separate use effect for user location rendering
  useEffect(() => {
    if (mapState) {
      updateUserLocation(
        mapState,
        startAddressSelected.center[0],
        startAddressSelected.center[1]
      );
      updateCompanyLocation(
        mapState,
        companyAddressSelected.center[0],
        companyAddressSelected.center[1]
      );
      if (mapState.getLayer("route") && user && otherUser) {
        onViewRouteClick(user, otherUser);
      }
    }
  }, [companyAddressSelected, startAddressSelected]);
  useSearch({
    value: companyAddress,
    type: "address%2Cpostcode",
    setFunc: setCompanyAddressSuggestions,
  });

  useSearch({
    value: startingAddress,
    type: "address%2Cpostcode",
    setFunc: setStartAddressSuggestions,
  });
  if (!user) {
    return <Spinner />;
  }

  const viewerBox = (
    <div className="absolute left-0 top-0 z-10 m-2 flex min-w-[25rem] flex-col rounded-xl bg-white p-4 shadow-lg ">
      <div className="flex items-center space-x-4">
        <Image className="h-8 w-8" src={BlueSquare} width={32} height={32} />

        <AddressCombobox
          name="startAddress"
          placeholder="Input start address"
          addressSelected={startAddressSelected}
          addressSetter={setStartAddressSelected}
          addressSuggestions={startAddressSuggestions}
          addressUpdater={updateStartingAddress}
          className="flex-1"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Image className="h-8 w-8 " src={BlueCircle} width={32} height={32} />
        <AddressCombobox
          name="companyAddress"
          placeholder="Input company address"
          addressSelected={companyAddressSelected}
          addressSetter={setCompanyAddressSelected}
          addressSuggestions={companyAddressSuggestions}
          addressUpdater={updateCompanyAddress}
          className="flex-1 pt-4"
        />
      </div>
      <div className="flex items-center space-x-4">
        <VisibilityToggle
          map={mapState}
          style={{
            width: "100%",
            marginTop: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            borderColor: "black",
          }}
        />
      </div>
    </div>
  );
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
                    role={user.role}
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
                  {user.role === "VIEWER" && viewerBox}
                  <MapLegend role={user.role} />
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
