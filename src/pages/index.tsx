import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { RiFocus3Line } from "react-icons/ri";
import addClusters from "../utils/map/addClusters";
import addMapEvents from "../utils/map/addMapEvents";
import addUserLocation from "../utils/map/addUserLocation";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import DropDownMenu from "../components/DropDownMenu";
import { browserEnv } from "../utils/env/browser";
import Header, { HeaderOptions } from "../components/Header";
import { PublicUser, ResolvedRequest, User } from "../utils/types";
import ConnectModal from "../components/ConnectModal";
import { toast } from "react-toastify";
import ExploreSidebar from "../components/ExploreSidebar";
import RequestSidebar from "../components/RequestSidebar";
import SentRequestModal from "../components/SentRequestModal";
import ReceivedRequestModal from "../components/ReceivedRequestModal";
import { getSession } from "next-auth/react";
import AlreadyConnectedModal from "../components/AlreadyConnectedModal";
import { emailSchema } from "./api/email";

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
  const { data: geoJsonUsers } = trpc.mapbox.geoJsonUserList.useQuery();
  const { data: user, refetch } = trpc.user.me.useQuery();
  const { data: recommendations } = trpc.user.recommendations.me.useQuery();
  const { data: favorites } = trpc.user.favorites.me.useQuery();
  const { data: requests } = trpc.user.requests.me.useQuery();
  const { sent = [], received = [] } = requests ?? {};

  //tRPC mutations to update user related data
  const { mutate: createRequests } = trpc.user.requests.create.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.user.requests.me.invalidate();
    },
  });

  const { mutate: mutateFavorites } = trpc.user.favorites.edit.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.user.favorites.me.invalidate();
    },
  });

  const { mutate: deleteRequest } = trpc.user.requests.delete.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.user.requests.me.invalidate();
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
      requests?.received.find(
        (req: { fromUserId: string }) => req.fromUserId === userToConnectTo.id
      )
    ) {
      setModalType("already-requested");
    } else {
      setModalType("connect");
    }
  };

  const handleNavigateToRequests = (received: boolean) => {
    setSidebarState("requests");
    setStartingRequestsTab(received ? 1 : 0);
  };

  const handleWithdrawRequest = (toUser: PublicUser) => {
    const userRequest = sent.find(
      (request) => request.toUser?.name === toUser.name
    );
    if (userRequest) {
      handleDeleteRequest(userRequest);
    }
  };

  const handleRejectRequest = (fromUser: PublicUser) => {
    const userRequest = sent.find(
      (request) => request.fromUser?.name === fromUser.name
    );
    if (userRequest) {
      handleDeleteRequest(userRequest);
    }
  };

  const handleAcceptRequest = (fromUser: PublicUser) => {};

  const handleDeleteRequest = (request: ResolvedRequest) => {
    deleteRequest({
      invitationId: request.id,
    });
  };

  const handleEmailConnect = (curUser: User, toUser: PublicUser) => {
    connectEmail(toUser.email);
    createRequests({
      fromId: curUser.id,
      toId: toUser.id,
      message: "Not sure if we need this",
    });
    utils.user.requests.me.invalidate();
  };
  const connectEmail = async (email: string | null) => {
    if (user && email) {
      const msg: emailSchema = {
        destination: email,
        subject: "test",
        body: user?.bio,
      };

      const result = await fetch(`/api/email`, {
        method: "POST",
        body: JSON.stringify(msg),
      });
      console.log(result);
    } else {
      console.log("User email does not exist");
    }
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
            sent={
              requests?.sent.map((req: { toUser: any }) => req.toUser!) ?? []
            }
            map={mapState}
            handleConnect={handleConnect}
            handleFavorite={handleFavorite}
          />
        );
      } else {
        return (
          <RequestSidebar
            currentUser={user}
            sent={sent.map((req: { toUser: any }) => req.toUser!) ?? []}
            received={
              received.map((req: { fromUser: any }) => req.fromUser!) ?? []
            }
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
                handleWithdraw={() => handleWithdrawRequest(modalUser)}
                closeModal={() => {
                  setModalUser(null);
                }}
              />
            )}
            {user && modalUser && modalType === "received" && (
              <ReceivedRequestModal
                currentUser={user}
                userToConnectTo={modalUser}
                handleReject={() => handleRejectRequest(modalUser)}
                handleAccept={() => handleAcceptRequest(modalUser)}
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

export default Home;
