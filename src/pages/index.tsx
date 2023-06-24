import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { RiFocus3Line } from "react-icons/ri";
import addClusters from "../utils/map/addClusters";
import addMapEvents from "../utils/map/addMapEvents";
import addUserLocation from "../utils/map/addUserLocation";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import DropDownMenu from "../components/DropDownMenu";
import { browserEnv } from "../utils/env/browser";
import ProtectedPage from "../utils/auth";
import Header, { HeaderOptions } from "../components/Header";
import { PublicUser, User } from "../utils/types";
import ConnectModal from "../components/ConnectModal";
import { toast } from "react-toastify";
import ExploreSidebar from "../components/ExploreSidebar";
import RequestSidebar from "../components/RequestSidebar";
import SentRequestModal from "../components/SentRequestModal";
import ReceivedRequestModal from "../components/ReceivedRequestModal";
import AlreadyConnectedModal from "../components/AlreadyConnectedModal";

mapboxgl.accessToken = browserEnv.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Home: NextPage<any> = () => {
  const utils = trpc.useContext();
  const { data: geoJsonUsers, isLoading: isLoadingGeoJsonUsers } =
    trpc.useQuery(["mapbox.geoJsonUsersList"]);
  const {
    data: user,
    isLoading: isLoadingUser,
    refetch,
  } = trpc.useQuery(["user.me"]);

  const { data: recommendations } = trpc.useQuery(["user.recommendations.me"]);
  const { data: favorites } = trpc.useQuery(["user.favorites.me"]);
  const { data: requests } = trpc.useQuery(["user.requests.me"]);
  const { mutate: mutateFavorites } = trpc.useMutation("user.favorites.edit", {
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.invalidateQueries(["user.favorites.me"]);
    },
  });

  const [mapState, setMapState] = useState<mapboxgl.Map>();

  const [modalUser, setModalUser] = useState<PublicUser | null>(null);
  const [modalType, setModalType] = useState<string>("connect");
  const [sidebarState, setSidebarState] = useState<HeaderOptions>("explore");
  const [startingRequestsTab, setStartingRequestsTab] = useState<0 | 1>(0);

  const handleConnect = (userToConnectTo: PublicUser) => {
    setModalUser(userToConnectTo);
    if (
      requests?.received.find((req) => req.fromUserId === userToConnectTo.id)
    ) {
      setModalType("already-requested");
    } else {
      setModalType("connect");
    }
  };

  const { mutate: mutateRequests } = trpc.useMutation("user.requests.create", {
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.invalidateQueries(["user.requests.me"]);
    },
  });

  const handleNavigateToRequests = (received: boolean) => {
    setSidebarState("requests");
    setStartingRequestsTab(received ? 1 : 0);
  };

  const handleEmailConnect = (curUser: User, toUser: PublicUser) => {
    connectEmail(toUser.email);
    mutateRequests({
      fromId: curUser.id,
      toId: toUser.id,
      message: "Not sure if we need this",
    });
  };
  const connectEmail = async (email: string | null) => {
    const msg = {
      to: email, // Replace with your recipient
      from: "devashishsood9@gmail.com", // Replace with your verified sender
      subject: "New Contact Message",
      text: `Dior Dior`,
    };

    const result = await fetch(`/api/sendEmail`, {
      method: "POST",
      body: JSON.stringify(msg),
    });
  };

  const handleSentRequests = (userToConnectTo: PublicUser) => {
    setModalUser(userToConnectTo);
    setModalType("sent");
  };

  const handleReceivedRequests = (userToConnectTo: PublicUser) => {
    setModalUser(userToConnectTo);
    setModalType("received");
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

  useEffect(() => {
    refetch();
  }, []);

  const handleFavorite = (favoriteId: string, add: boolean) => {
    if (!user) return;
    mutateFavorites({
      userId: user.id,
      favoriteId,
      add,
    });
  };

  const renderSidebar = () => {
    if (mapState && user) {
      if (sidebarState == "explore") {
        return (
          <ExploreSidebar
            currentUser={user}
            reccs={recommendations ?? []}
            favs={favorites ?? []}
            sent={requests?.sent.map((req) => req.toUser!) ?? []}
            map={mapState}
            handleConnect={handleConnect}
            handleFavorite={handleFavorite}
          />
        );
      } else {
        return (
          <RequestSidebar
            currentUser={user}
            sent={requests?.sent.map((req) => req.toUser!) ?? []}
            received={requests?.received.map((req) => req.fromUser!) ?? []}
            favs={favorites ?? []}
            map={mapState}
            startingTab={startingRequestsTab}
            setStartingTab={setStartingRequestsTab}
            handleSent={handleSentRequests}
            handleReceived={handleReceivedRequests}
            handleFavorite={handleFavorite}
          />
        );
      }
    }
  };

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div className="max-h-screen w-full h-full m-0">
        <Header
          data={{ sidebarValue: sidebarState, setSidebar: setSidebarState }}
        />
        {/* <ProfileModal userInfo={userInfo!} user={user!}  /> */}
        <div className="flex flex-auto h-[91.5%]">
          <div className="w-96">{mapState && user && renderSidebar()}</div>

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
            {user && modalUser && modalType === "connect" && (
              <ConnectModal
                currentUser={user}
                userToConnectTo={modalUser}
                handleEmailConect={() => handleEmailConnect(user, modalUser)}
                closeModal={() => {
                  setModalUser(null);
                }}
              />
            )}
            {user && modalUser && modalType === "already-requested" && (
              <AlreadyConnectedModal
                currentUser={user}
                userToConnectTo={modalUser}
                handleManageRequest={() => handleNavigateToRequests(true)}
                closeModal={() => {
                  setModalUser(null);
                }}
              />
            )}
            {user && modalUser && modalType === "sent" && (
              <SentRequestModal
                currentUser={user}
                userToConnectTo={modalUser}
                closeModal={() => {
                  setModalUser(null);
                }}
              />
            )}
            {user && modalUser && modalType === "received" && (
              <ReceivedRequestModal
                currentUser={user}
                userToConnectTo={modalUser}
                closeModal={() => {
                  setModalUser(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProtectedPage(Home);
