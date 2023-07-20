import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
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
import { PublicUser, ResolvedRequest, User } from "../utils/types";
import ConnectModal from "../components/ConnectModal";
import { toast } from "react-toastify";
import SentRequestModal from "../components/SentRequestModal";
import ReceivedRequestModal from "../components/ReceivedRequestModal";
import { getSession } from "next-auth/react";
import AlreadyConnectedModal from "../components/AlreadyConnectedModal";
import { emailSchema } from "../utils/email";
import ImprovedExploreSidebar from "../components/SidebarExplore";
import ImprovedRequestsSidebar from "../components/SidebarRequests";

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

const previousMarkers: mapboxgl.Marker[] = [];
const clearMarkers = () => {
  previousMarkers.forEach((marker) => marker.remove());
  previousMarkers.length = 0;
};

const Home: NextPage<any> = () => {
  //tRPC queries to fetch user related data
  const utils = trpc.useContext();
  const { data: geoJsonUsers, refetch: refetchGeoJsonUsers } =
    trpc.mapbox.geoJsonUserList.useQuery();
  const { data: user, refetch: refetchMe } = trpc.user.me.useQuery();
  const { data: recommendations, refetch: refetchRecs } =
    trpc.user.recommendations.me.useQuery();
  const { data: favorites, refetch: refetchFavs } =
    trpc.user.favorites.me.useQuery();
  const { data: requests, refetch: refetchRequests } =
    trpc.user.requests.me.useQuery();
  const { sent = [], received = [] } = requests ?? {};

  //tRPC mutations to update user related data
  const { mutate: createRequests } = trpc.user.requests.create.useMutation({
    onError: (error: any) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess() {
      utils.user.recommendations.me.invalidate();
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
      utils.user.recommendations.me.invalidate();
    },
  });

  const [mapState, setMapState] = useState<mapboxgl.Map>();
  const [modalUser, setModalUser] = useState<PublicUser | null>(null);
  const [modalType, setModalType] = useState<string>("connect");
  const [sidebarState, setSidebarState] = useState<HeaderOptions>("explore");
  const [startingRequestsTab, setStartingRequestsTab] = useState<
    "sent" | "received"
  >("sent");
  const [isDesktop, setIsDesktop] = useState<Boolean>(true);

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

  const changeSidebarState = (option: HeaderOptions) => {
    setSidebarState(option);
    setStartingRequestsTab("sent");
    clearMarkers();
  };

  const handleNavigateToRequests = (received: boolean) => {
    setSidebarState("requests");
    setStartingRequestsTab("received");
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
    const userRequest = received.find(
      (request) => request.fromUser?.name === fromUser.name
    );
    if (userRequest) {
      handleDeleteRequest(userRequest);
    }
  };

  const handleAcceptRequest = (fromUser: PublicUser) => {
    // Must also handle group inclusion functionality here
    // When the carpooling page is complete
    const userRequest = received.find(
      (request) => request.fromUser?.name === fromUser.name
    );
    if (userRequest) {
      handleDeleteRequest(userRequest);
    }
  };

  const handleDeleteRequest = (request: ResolvedRequest) => {
    deleteRequest({
      invitationId: request.id,
    });
  };

  const handleEmailConnect = (
    curUser: User,
    toUser: PublicUser,
    userMessage: string
  ) => {
    connectEmail(toUser.email, userMessage);
    createRequests({
      fromId: curUser.id,
      toId: toUser.id,
      message: userMessage,
    });
  };

  const connectEmail = async (email: string | null, message: string) => {
    if (user && email) {
      const msg: emailSchema = {
        destination: email,
        subject: "Carpool Connect Request",
        body: message,
      };

      const result = await fetch(`/api/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  }, [user, geoJsonUsers, sidebarState]);

  useEffect(() => {
    refetchMe();
    refetchRecs();
    refetchRequests();
    refetchFavs();
    refetchGeoJsonUsers();
  }, []);

  const handleFavorite = (favoriteId: string, add: boolean) => {
    if (!user) return;
    mutateFavorites({
      userId: user.id,
      favoriteId,
      add,
    });
  };

  useEffect(() => {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      setIsDesktop(false);
    } else {
      setIsDesktop(true);
    }
  }, [isDesktop]);

  const renderSidebar = (): JSX.Element => {
    if (sidebarState === "explore") {
      if (isDesktop) {
        return (
          <>
            {user && mapState && (
              <ImprovedExploreSidebar
                currentUser={user}
                map={mapState}
                favs={favorites ?? []}
                sent={
                  requests?.sent.map((req: { toUser: any }) => req.toUser!) ??
                  []
                }
                handleFavorite={handleFavorite}
                isDesktop={isDesktop}
                reccs={recommendations ?? []}
                handleConnect={handleConnect}
                previousMarkers={previousMarkers}
                clearMarkers={clearMarkers}
              />
            )}
          </>
        );
      } else {
        return (
          <div className="bg-white w-screen h-80 flex">
            {user && mapState && (
              <ImprovedExploreSidebar
                currentUser={user}
                map={mapState}
                favs={favorites ?? []}
                sent={
                  requests?.sent.map((req: { toUser: any }) => req.toUser!) ??
                  []
                }
                handleFavorite={handleFavorite}
                isDesktop={isDesktop}
                reccs={recommendations ?? []}
                handleConnect={handleConnect}
                previousMarkers={previousMarkers}
                clearMarkers={clearMarkers}
              />
            )}
          </div>
        );
      }
    } else {
      if (isDesktop) {
        return (
          <>
            {user && mapState && (
              <ImprovedRequestsSidebar
                currentUser={user}
                map={mapState}
                favs={favorites ?? []}
                sent={
                  requests?.sent.map((req: { toUser: any }) => req.toUser!) ??
                  []
                }
                handleFavorite={handleFavorite}
                isDesktop={isDesktop}
                received={
                  received.map((req: { fromUser: any }) => req.fromUser!) ?? []
                }
                startingTab={startingRequestsTab}
                handleSent={handleSentRequests}
                handleReceived={handleReceivedRequests}
                previousMarkers={previousMarkers}
                clearMarkers={clearMarkers}
              />
            )}
          </>
        );
      } else {
        return (
          <div className="bg-white w-screen h-80 flex">
            {user && mapState && (
              <ImprovedRequestsSidebar
                currentUser={user}
                map={mapState}
                favs={favorites ?? []}
                sent={
                  requests?.sent.map((req: { toUser: any }) => req.toUser!) ??
                  []
                }
                handleFavorite={handleFavorite}
                isDesktop={isDesktop}
                received={
                  received.map((req: { fromUser: any }) => req.fromUser!) ?? []
                }
                startingTab={startingRequestsTab}
                handleSent={handleSentRequests}
                handleReceived={handleReceivedRequests}
                previousMarkers={previousMarkers}
                clearMarkers={clearMarkers}
              />
            )}
          </div>
        );
      }
    }
  };

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div
        className={
          isDesktop
            ? "max-h-screen w-full h-full m-0 flex-col"
            : "max-h-screen w-full h-full m-0 flex-row"
        }
      >
        <Header
          isDesktop={isDesktop}
          data={{ sidebarValue: sidebarState, setSidebar: changeSidebarState }}
        />
        <div>
          <DropDownMenu isDesktop={isDesktop} />
          <button
            className={
              isDesktop
                ? "flex justify-center items-center w-8 h-8 absolute z-10 right-[8px] bottom-[150px] rounded-md bg-white border-2 border-solid border-gray-300 shadow-sm hover:bg-gray-200"
                : "flex justify-center items-center w-8 h-8 absolute z-10 right-[8px] top-[120px] rounded-md bg-white border-2 border-solid border-gray-300 shadow-sm hover:bg-gray-200"
            }
            id="fly"
          >
            <RiFocus3Line />
          </button>
        </div>

        <div
          className={
            isDesktop
              ? "flex flex-auto h-[91.5%]"
              : "flex flex-col-reverse h-[85.5%]"
          }
        >
          <div className={isDesktop ? "w-96" : "w-screen"}>
            {renderSidebar()}
          </div>

          <ToastProvider
            placement="bottom-right"
            autoDismiss={true}
            newestOnTop={true}
          >
            <div className="flex-auto justify-center w-full">
              <div id="map" className={"flex-auto w-full h-full"}></div>
              {user && modalUser && modalType === "connect" && (
                <ConnectModal
                  isDesktop={isDesktop}
                  currentUser={user}
                  userToConnectTo={modalUser}
                  handleEmailConnect={(message) => {
                    handleEmailConnect(user, modalUser, message);
                  }}
                  closeModal={() => {
                    setModalUser(null);
                  }}
                />
              )}
              {user && modalUser && modalType === "already-requested" && (
                <AlreadyConnectedModal
                  isDesktop={isDesktop}
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
                  isDesktop={isDesktop}
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
                  isDesktop={isDesktop}
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
          </ToastProvider>
        </div>
      </div>
    </>
  );
};

export default Home;
