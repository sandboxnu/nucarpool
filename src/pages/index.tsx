import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RiFocus3Line } from "react-icons/ri";
import { ToastProvider } from "react-toast-notifications";
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
import type {
  PublicUser,
  EnhancedPublicUser,
  Request,
  User,
} from "../utils/types";
import {
  CarpoolAddress,
  CarpoolFeature,
  FiltersState,
  GeoJsonUsers,
} from "../utils/types";
import { Role } from "@prisma/client";
import {
  useGetDirections,
  viewRoute,
  clearDirections,
  clearMarkers,
} from "../utils/map/viewRoute";
import { MapConnectPortal } from "../components/MapConnectPortal";
import useSearch from "../utils/search";
import AddressCombobox from "../components/Map/AddressCombobox";
import updateUserLocation from "../utils/map/updateUserLocation";
import { MapLegend } from "../components/MapLegend";
import Image from "next/image";
import BlueSquare from "../../public/user-dest.png";
import BlueCircle from "../../public/blue-circle.png";
import VisibilityToggle from "../components/Map/VisibilityToggle";
import updateCompanyLocation from "../utils/map/updateCompanyLocation";
import MessagePanel from "../components/Messages/MessagePanel";
import InactiveBlocker from "../components/Map/InactiveBlocker";
import updateGeoJsonUsers from "../utils/map/updateGeoJsonUsers";
import useIsMobile from "../utils/useIsMobile";
import updateStartLocation from "../utils/map/updateStartLocation";
import clearRiderStartMarkers from "../utils/map/clearRiderStartMarkers";

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
        destination: "/profile/setup",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

const Home: NextPage<any> = () => {
  const initialFilters: FiltersState = {
    days: 0,
    flexDays: 1,
    startDistance: 20,
    endDistance: 20,
    daysWorking: "",
    startTime: 4,
    endTime: 4,
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now()),
    dateOverlap: 0,
    favorites: false,
    messaged: false,
  };
  const [tempOtherUser, setTempOtherUser] = useState<PublicUser | null>(null);
  const [tempOtherUserMarkerActive, setTempOtherUserMarkerActive] =
    useState(false);
  const [defaultFilters] = useState<FiltersState>(initialFilters);
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [sort, setSort] = useState<string>("any");
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [otherUser, setOtherUser] = useState<PublicUser | null>(null);
  const isMapInitialized = useRef(false);
  const [mapStateLoaded, setMapStateLoaded] = useState(false);
  const isMobile: boolean = useIsMobile();
  // const [mobileSidebarExpanded, setMobileSidebarExpanded] = useState<boolean>(false);
  const [mobileSelectedUserID, setmobileSelectedUserID] = useState<
    string | null
  >(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedFilters(filters);
    }, 300);

    handler();

    return () => {
      handler.cancel();
    };
  }, [filters]);

  const { data: geoJsonUsers } =
    trpc.mapbox.geoJsonUserList.useQuery(debouncedFilters);

  const { data: user = null } = trpc.user.me.useQuery();
  const { data: recommendations = [] } = trpc.user.recommendations.me.useQuery(
    {
      sort: sort,
      filters: filters,
    },
    { refetchOnMount: true },
  );
  const { data: favorites = [] } = trpc.user.favorites.me.useQuery(undefined, {
    refetchOnMount: true,
  });
  const requestsQuery = trpc.user.requests.me.useQuery(undefined, {
    refetchOnMount: "always",
  });
  const { data: requests = { sent: [], received: [] } } = requestsQuery;
  const utils = trpc.useContext();

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (userId !== "") {
      setOtherUser(null);
      if (sidebarRef.current) {
        sidebarRef.current.classList.remove("hidden");
      }
    }
  };

  const [mapState, setMapState] = useState<mapboxgl.Map>();
  const [sidebarType, setSidebarType] = useState<HeaderOptions>("explore");
  const [popupUsers, setPopupUsers] = useState<PublicUser[] | null>(null);
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
    [],
  );

  const [startingAddress, setStartingAddress] = useState("");
  const updateStartingAddress = useMemo(
    () => debounce(setStartingAddress, 250),
    [],
  );

  const extendPublicUser = useCallback(
    (user: PublicUser): EnhancedPublicUser => {
      const incomingReq = requests.received.find(
        (req) => req.fromUser?.id === user.id,
      );
      const outgoingReq = requests.sent.find(
        (req) => req.toUser?.id === user.id,
      );

      return {
        ...user,
        isFavorited: favorites.some((favs) => favs.id === user.id),
        incomingRequest:
          incomingReq?.fromUser && incomingReq?.toUser
            ? (incomingReq as any)
            : undefined,
        outgoingRequest:
          outgoingReq?.fromUser && outgoingReq?.toUser
            ? (outgoingReq as any)
            : undefined,
      };
    },
    [favorites, requests],
  );

  const handleMessageSent = (selectedUserId: string) => {
    utils.user.requests.me.invalidate();
    requestsQuery.refetch();
    setSelectedUserId(selectedUserId);
  };
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUser: EnhancedPublicUser | null = useMemo(() => {
    if (!selectedUserId || !requests) return null;
    const allRequests = [...requests.sent, ...requests.received];
    for (const request of allRequests) {
      if (!request.fromUser || !request.toUser) continue;

      const user: PublicUser =
        request.fromUser.id === selectedUserId
          ? request.fromUser
          : request.toUser;
      if (user.id === selectedUserId)
        return extendPublicUser(user) as EnhancedPublicUser;
    }
    return null;
  }, [selectedUserId, requests, extendPublicUser]);

  useEffect(() => {
    if (isMobile && sidebarRef.current) {
      if (selectedUser) {
        sidebarRef.current.classList.add("hidden");
      } else {
        sidebarRef.current.classList.remove("hidden");
      }
    }
  }, [selectedUser, isMobile]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef<number>(0);

  const enhancedSentUsers = requests.sent
    .filter((request) => request.toUser !== null)
    .map((request) => extendPublicUser(request.toUser!));

  const enhancedReceivedUsers = requests.received
    .filter((request) => request.fromUser !== null)
    .map((request) => extendPublicUser(request.fromUser!));
  const enhancedRecs = recommendations.map(extendPublicUser);
  const enhancedFavs = favorites.map(extendPublicUser);

  const onViewRouteClick = useCallback(
    (user: User, clickedUser: PublicUser) => {
      // clear rider start markers from group route when viewing individual routes
      if (mapState) {
        clearRiderStartMarkers(mapState);
      }

      // add null checks for required objects
      if (!geoJsonUsers || !mapState || !user || !clickedUser) {
        console.error("Required objects not available for route viewing");
        return;
      }

      // skip parts that might reset state if in request context
      const isInRequestContext =
        selectedUserId && selectedUserId === clickedUser.id;

      if (!isInRequestContext) {
        setOtherUser(clickedUser);
      }

      // validate user and clickedUser have required coordinate properties
      if (
        !isValidCoordinates(user.startCoordLng, user.startCoordLat) ||
        !isValidCoordinates(user.companyCoordLng, user.companyCoordLat) ||
        !isValidCoordinates(
          clickedUser.startCoordLng,
          clickedUser.startCoordLat,
        ) ||
        !isValidCoordinates(
          clickedUser.companyCoordLng,
          clickedUser.companyCoordLat,
        )
      ) {
        console.error("Invalid user coordinates for route viewing");
        return;
      }

      // add null check for geoJsonUsers.features
      const isOtherUserInGeoList =
        geoJsonUsers.features?.some(
          (f) => f.properties?.id === clickedUser.id,
        ) ?? false;

      const isPrevOtherUserInGeoList =
        geoJsonUsers.features?.some(
          (f) => f.properties?.id === tempOtherUser?.id,
        ) ?? false;

      const shouldRemoveMarker =
        tempOtherUserMarkerActive &&
        ((tempOtherUser && tempOtherUser.id !== clickedUser.id) ||
          isPrevOtherUserInGeoList);

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
      const userCoord =
        !isViewerAddressSelected && user.role === "VIEWER"
          ? undefined
          : {
              startLat: userStartLat,
              startLng: userStartLng,
              endLat: userCompanyLat,
              endLng: userCompanyLng,
            };

      if (user.role !== "VIEWER") {
        updateUserLocation(mapState, userStartLng, userStartLat);
        updateCompanyLocation(
          mapState,
          userCompanyLng,
          userCompanyLat,
          user.role,
          user.id,
          user,
          true,
        );
      }

      if (shouldRemoveMarker && tempOtherUser) {
        updateCompanyLocation(
          mapState,
          tempOtherUser.companyCoordLng,
          tempOtherUser.companyCoordLat,
          tempOtherUser.role,
          tempOtherUser.id,
          tempOtherUser,
          false,
          true,
        );
        setTempOtherUserMarkerActive(false);
        setTempOtherUser(null);
      }

      if (!isInRequestContext) {
        if (!isOtherUserInGeoList && selectedUserId === clickedUser.id) {
          updateCompanyLocation(
            mapState,
            clickedUser.companyCoordLng,
            clickedUser.companyCoordLat,
            clickedUser.role,
            clickedUser.id,
            clickedUser,
            false,
            false,
          );
          setTempOtherUserMarkerActive(true);
          setTempOtherUser(clickedUser);
        } else if (!isOtherUserInGeoList && selectedUserId !== clickedUser.id) {
          setOtherUser(null);
          return;
        }
      } else {
        // always show the user's marker when in request context
        updateCompanyLocation(
          mapState,
          clickedUser.companyCoordLng,
          clickedUser.companyCoordLat,
          clickedUser.role,
          clickedUser.id,
          clickedUser,
          false,
          false,
        );
      }

      const viewProps = {
        user,
        otherUser: clickedUser,
        map: mapState,
        userCoord,
        isMobile,
      };

      if (user.role === "RIDER") {
        setPoints([
          [clickedUser.startCoordLng, clickedUser.startCoordLat],
          [userStartLng, userStartLat],
          [userCompanyLng, userCompanyLat],
          [clickedUser.companyCoordLng, clickedUser.companyCoordLat],
        ]);
      } else if (
        user.role === "DRIVER" ||
        isViewerAddressSelected ||
        !!selectedUserId
      ) {
        setPoints([
          [userStartLng, userStartLat],
          [clickedUser.startCoordLng, clickedUser.startCoordLat],
          [clickedUser.companyCoordLng, clickedUser.companyCoordLat],
          [userCompanyLng, userCompanyLat],
        ]);
      } else {
        setPoints([
          [clickedUser.startCoordLng, clickedUser.startCoordLat],
          [clickedUser.companyCoordLng, clickedUser.companyCoordLat],
        ]);
      }

      viewRoute(viewProps);
    },
    [
      geoJsonUsers,
      selectedUserId,
      companyAddressSelected,
      startAddressSelected,
      mapState,
      tempOtherUser,
      tempOtherUserMarkerActive,
      isMobile,
    ],
  );

  const onViewGroupRoute = useCallback(
    (driver: PublicUser, riders: PublicUser[]) => {
      if (!mapState || !user) {
        console.error("Map or user not available for group route viewing");
        return;
      }

      // clear existing routes first
      clearDirections(mapState);
      clearMarkers(mapState);

      // helper function to calculate straight-line distance
      const calculateDistance = (
        coord1: [number, number],
        coord2: [number, number],
      ): number => {
        const [lng1, lat1] = coord1;
        const [lng2, lat2] = coord2;
        return Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2));
      };

      // create optimized waypoints using constraint-aware nearest neighbor
      const waypoints: [number, number][] = [
        [driver.startCoordLng, driver.startCoordLat], // driver start
      ];

      let currentLocation: [number, number] = [
        driver.startCoordLng,
        driver.startCoordLat,
      ];
      const remainingPickups = new Set(riders.map((rider) => rider.id));
      const completedDropoffs = new Set<string>();
      const pickedUpRiders = new Set<string>(); // track which riders are in car

      // map for quick rider lookup
      const riderMap = new Map(riders.map((rider) => [rider.id, rider]));

      while (remainingPickups.size > 0 || pickedUpRiders.size > 0) {
        // find all candidate points we can visit next
        const candidatePoints: Array<{
          type: "pickup" | "dropoff";
          riderId: string;
          coordinates: [number, number];
          distance: number;
        }> = [];

        // add all remaining pickups as candidates
        remainingPickups.forEach((riderId) => {
          const rider = riderMap.get(riderId)!;
          const distance = calculateDistance(currentLocation, [
            rider.startCoordLng,
            rider.startCoordLat,
          ]);
          candidatePoints.push({
            type: "pickup",
            riderId,
            coordinates: [rider.startCoordLng, rider.startCoordLat],
            distance,
          });
        });

        // add dropoffs only for riders already picked up
        pickedUpRiders.forEach((riderId) => {
          const rider = riderMap.get(riderId)!;
          const distance = calculateDistance(currentLocation, [
            rider.companyCoordLng,
            rider.companyCoordLat,
          ]);
          candidatePoints.push({
            type: "dropoff",
            riderId,
            coordinates: [rider.companyCoordLng, rider.companyCoordLat],
            distance,
          });
        });

        // sort candidates by distance
        candidatePoints.sort((a, b) => a.distance - b.distance);

        // find the closest valid candidate
        let chosenCandidate = null;

        for (const candidate of candidatePoints) {
          if (candidate.type === "dropoff") {
            // dropoffs always valid if rider is picked up
            chosenCandidate = candidate;
            break;
          } else {
            chosenCandidate = candidate;
            break;
          }
        }

        if (!chosenCandidate) break;

        // add chosen point to waypoints
        waypoints.push(chosenCandidate.coordinates);
        currentLocation = chosenCandidate.coordinates;

        // update state based on chosen point
        if (chosenCandidate.type === "pickup") {
          remainingPickups.delete(chosenCandidate.riderId);
          pickedUpRiders.add(chosenCandidate.riderId);
        } else {
          // dropoff
          pickedUpRiders.delete(chosenCandidate.riderId);
          completedDropoffs.add(chosenCandidate.riderId);
        }
      }

      // end route at driver destination
      waypoints.push([driver.companyCoordLng, driver.companyCoordLat]);

      console.log("Optimized route waypoints:", waypoints);

      // set points for the directions query
      setPoints(waypoints);

      // MARKER MANAGEMENT - Show markers for ALL group members
      if (user.role !== "VIEWER") {
        updateUserLocation(mapState, user.startCoordLng, user.startCoordLat);
        updateCompanyLocation(
          mapState,
          user.companyCoordLng,
          user.companyCoordLat,
          user.role,
          user.id,
          user,
          true,
        );
      }

      // driver's markers (if driver is not current user)
      if (driver.id !== user.id) {
        const driverName = driver.preferredName || driver.name || "Driver";

        // driver's start location
        updateStartLocation(
          mapState,
          driver.startCoordLng,
          driver.startCoordLat,
          driver.role,
          driver.id,
          driver,
          false,
          false,
          `${driverName} Start`,
        );

        // driver's company location
        updateCompanyLocation(
          mapState,
          driver.companyCoordLng,
          driver.companyCoordLat,
          driver.role,
          driver.id,
          driver,
          false,
          false,
          `${driverName} Dest.`,
        );
      }

      // each rider's markers (if rider is not current user)
      riders.forEach((rider, index) => {
        if (rider.id !== user.id) {
          const riderName =
            rider.preferredName || rider.name || `Rider ${index + 1}`;

          // rider's start location
          updateStartLocation(
            mapState,
            rider.startCoordLng,
            rider.startCoordLat,
            rider.role,
            rider.id,
            rider,
            false,
            false,
            `${riderName} Start`,
          );

          // rider's company location
          updateCompanyLocation(
            mapState,
            rider.companyCoordLng,
            rider.companyCoordLat,
            rider.role,
            rider.id,
            rider,
            false,
            false,
            `${riderName} Dest.`,
          );
        }
      });

      // fit map to show all group members' locations
      const allCoords = [
        [driver.startCoordLng, driver.startCoordLat],
        [driver.companyCoordLng, driver.companyCoordLat],
        ...riders.map((rider) => [rider.startCoordLng, rider.startCoordLat]),
        ...riders.map((rider) => [
          rider.companyCoordLng,
          rider.companyCoordLat,
        ]),
      ];

      const bounds = new mapboxgl.LngLatBounds();
      allCoords.forEach((coord) => {
        bounds.extend([coord[0], coord[1]]);
      });

      mapState.fitBounds(bounds, { padding: 50 });
    },
    [mapState, user],
  );

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileSidebarExpand = useCallback(
    (userId?: string) => {
      if (userId) {
        setmobileSelectedUserID(userId);
        setIsSidebarCollapsed(false); // Expand when viewing details
        const allUsers = [
          ...enhancedRecs,
          ...enhancedFavs,
          ...enhancedSentUsers,
          ...enhancedReceivedUsers,
        ];
        const selectedPublicUser = allUsers.find((u) => u.id === userId);

        if (selectedPublicUser && user && mapState && mapStateLoaded) {
          onViewRouteClick(user, selectedPublicUser);
        }
      } else {
        setmobileSelectedUserID(null);
      }
    },
    [
      enhancedRecs,
      enhancedFavs,
      enhancedSentUsers,
      enhancedReceivedUsers,
      user,
      mapState,
      mapStateLoaded,
      onViewRouteClick,
      setmobileSelectedUserID,
    ],
  );

  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (!isMobile || !sidebarRef.current || mobileSelectedUserID === null)
        return;

      const element = e.target as HTMLDivElement;
      const scrollTop = element.scrollTop;

      if (scrollTop < lastScrollTop.current && scrollTop < 10) {
        handleMobileSidebarExpand();
      }

      lastScrollTop.current = scrollTop;
    };

    const sidebarElement = sidebarRef.current;
    if (sidebarElement && isMobile) {
      sidebarElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (sidebarElement) {
        sidebarElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isMobile, mobileSelectedUserID, sidebarRef, handleMobileSidebarExpand]);

  // Helper function to validate coordinates
  const isValidCoordinates = (lng?: number, lat?: number): boolean => {
    return (
      lng !== undefined &&
      lat !== undefined &&
      !isNaN(lng) &&
      !isNaN(lat) &&
      isFinite(lng) &&
      isFinite(lat)
    );
  };

  useEffect(() => {
    if (user && user.role !== "VIEWER") {
      // update filter params
      setFilters((prev) => ({
        ...prev,
        startDate: user.coopStartDate ? user.coopStartDate : prev.startDate,
        endDate: user.coopEndDate ? user.coopEndDate : prev.endDate,
        daysWorking: user.daysWorking,
      }));
    }
  }, [user]);

  useEffect(() => {
    // Map initialization
    if (!isMapInitialized.current && user && mapContainerRef.current) {
      isMapInitialized.current = true;
      const isViewer = user.role === "VIEWER";
      const neuLat = 42.33907;
      const neuLng = -71.088748;
      const newMap = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v10",
        center: isViewer
          ? [neuLng, neuLat]
          : [user.companyCoordLng, user.companyCoordLat],
        zoom: 8,
      });

      newMap.on("load", () => {
        newMap.setMaxZoom(13);
        setMapState(newMap);
        addMapEvents(newMap, user, setPopupUsers);

        // Initial setting of user and company locations
        if (user.role !== "VIEWER") {
          updateUserLocation(newMap, user.startCoordLng, user.startCoordLat);
          updateCompanyLocation(
            newMap,
            user.companyCoordLng,
            user.companyCoordLat,
            user.role,
            user.id,
            user,
            true,
          );
        }
        setMapStateLoaded(true);
      });
    }
  }, [mapContainerRef, user]);

  useEffect(() => {
    if (!mapState) return;

    const handleResize = () => {
      // small delay to ensure container has resized
      setTimeout(() => {
        if (mapState) {
          mapState.resize();
        }
      }, 100);
    };

    // resize when window size changes
    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mapState, isMobile]);

  useEffect(() => {
    if (mapState && geoJsonUsers && mapStateLoaded) {
      updateGeoJsonUsers(mapState, geoJsonUsers);
    }
  }, [mapState, geoJsonUsers, mapStateLoaded]);

  useEffect(() => {
    setSelectedUserId(null);
    // Clear other user and related route data when sidebar type changes
    setOtherUser(null);
    // Reset collapsed state when switching tabs
    setIsSidebarCollapsed(false);
    if (tempOtherUserMarkerActive && tempOtherUser && mapState) {
      updateCompanyLocation(
        mapState,
        tempOtherUser.companyCoordLng,
        tempOtherUser.companyCoordLat,
        tempOtherUser.role,
        tempOtherUser.id,
        tempOtherUser,
        false,
        true,
      );
      setTempOtherUserMarkerActive(false);
      setTempOtherUser(null);
    }
    if (mapState) {
      clearDirections(mapState);
    }
  }, [sidebarType, tempOtherUser, tempOtherUserMarkerActive, mapState]);

  // initial route rendering
  useEffect(() => {
    if (
      user &&
      !otherUser &&
      mapState &&
      mapStateLoaded &&
      (user.role !== "VIEWER" ||
        (startAddressSelected.center[0] !== 0 &&
          companyAddressSelected.center[0] !== 0))
    ) {
      // Validate coordinates before proceeding
      const isViewerWithValidCoords =
        user.role === "VIEWER" &&
        isValidCoordinates(
          startAddressSelected.center[0],
          startAddressSelected.center[1],
        ) &&
        isValidCoordinates(
          companyAddressSelected.center[0],
          companyAddressSelected.center[1],
        );

      const isNonViewerWithValidCoords =
        user.role !== "VIEWER" &&
        isValidCoordinates(user.startCoordLng, user.startCoordLat) &&
        isValidCoordinates(user.companyCoordLng, user.companyCoordLat);

      if (!isViewerWithValidCoords && !isNonViewerWithValidCoords) {
        console.error("Invalid coordinates for initial route rendering");
        return;
      }

      let userCoord = {
        startLat: user.startCoordLat,
        startLng: user.startCoordLng,
        endLat: user.companyCoordLat,
        endLng: user.companyCoordLng,
      };

      if (user.role == "VIEWER") {
        userCoord = {
          startLng: startAddressSelected.center[0],
          startLat: startAddressSelected.center[1],
          endLng: companyAddressSelected.center[0],
          endLat: companyAddressSelected.center[1],
        };
      }

      if (tempOtherUserMarkerActive && tempOtherUser) {
        updateCompanyLocation(
          mapState,
          tempOtherUser.companyCoordLng,
          tempOtherUser.companyCoordLat,
          tempOtherUser.role,
          tempOtherUser.id,
          tempOtherUser,
          false,
          true,
        );
        setTempOtherUserMarkerActive(false);
        setTempOtherUser(null);
      }
      const viewProps = {
        user,
        otherUser: undefined,
        map: mapState,
        userCoord,
        isMobile,
      };

      // Set initial points for directions or route viewing
      setPoints([
        [userCoord.startLng, userCoord.startLat],
        [userCoord.endLng, userCoord.endLat],
      ]);
      viewRoute(viewProps);
    }
  }, [
    companyAddressSelected,
    mapState,
    mapStateLoaded,
    otherUser,
    startAddressSelected,
    user,
    tempOtherUser,
    tempOtherUserMarkerActive,
    isMobile,
  ]);
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
  useGetDirections({ points: points, map: mapState! });

  // Create a mobile banner component that will be added to the DOM
  const MobileBanner = () => {
    if (!isMobile) return null;

    return (
      <div
        className="absolute top-0 left-0 right-0 z-[9999] bg-yellow-100 text-black py-1 px-4 text-xs text-center"
        style={{
          width: "100%",
          position: "fixed",
          top: 0,
          zIndex: 9999,
        }}
      >
        For the full experience, try using CarpoolNU on desktop
      </div>
    );
  };

  if (!user) {
    return <Spinner />;
  }

  const viewerBox = (
    <div className="absolute left-0 top-0 z-10 m-2 flex min-w-[25rem] flex-col rounded-xl bg-white p-4 shadow-lg ">
      <h2 className="mb-4 text-xl">Search my route</h2>
      <div className="flex items-center space-x-4">
        <Image
          className="h-8 w-8"
          src={BlueCircle}
          alt="start"
          width={32}
          height={32}
        />
        <AddressCombobox
          name="startAddress"
          placeholder="Enter start address"
          addressSelected={startAddressSelected}
          addressSetter={setStartAddressSelected}
          addressSuggestions={startAddressSuggestions}
          addressUpdater={updateStartingAddress}
          className="flex-1"
        />
      </div>

      <div className="mt-4 flex items-center space-x-4">
        <Image
          className="h-8 w-8 "
          alt="end"
          src={BlueSquare}
          width={32}
          height={42}
        />
        <AddressCombobox
          name="companyAddress"
          placeholder="Enter company address"
          addressSelected={companyAddressSelected}
          addressSetter={setCompanyAddressSelected}
          addressSuggestions={companyAddressSuggestions}
          addressUpdater={updateCompanyAddress}
          className="flex-1 "
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
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
            />
          </Head>

          {/* Always render the banner outside of other containers */}
          <MobileBanner />

          <div className="m-0 h-full max-h-screen w-full">
            {!isMobile && (
              <Header
                data={{
                  sidebarValue: sidebarType,
                  setSidebar: setSidebarType,
                  disabled:
                    user.status === "INACTIVE" && user.role !== "VIEWER",
                }}
                onViewGroupRoute={onViewGroupRoute}
              />
            )}
            <div
              className={`flex h-[91.5%] overflow-hidden ${isMobile ? "mt-5" : ""}`}
            >
              {isMobile &&
                (sidebarType === "explore" || sidebarType === "requests") &&
                mobileSelectedUserID === null && (
                  <div
                    onClick={handleSidebarToggle}
                    className={`absolute left-1/2 z-30 -translate-x-1/2 transform cursor-pointer transition-all duration-300 ${
                      isSidebarCollapsed
                        ? "bottom-16"
                        : "bottom-[calc(100%-6rem)]"
                    }`}
                    style={{ padding: "12px 0" }}
                  >
                    <div className="h-2 w-20 rounded-full bg-gray-500 shadow-sm transition-colors hover:bg-gray-600"></div>
                  </div>
                )}
              <div
                ref={sidebarRef}
                className={`${
                  isMobile
                    ? `absolute left-0 z-20 w-full overflow-y-auto bg-white shadow-lg transition-all duration-300 rounded-t-3xl border-2 border-black ${
                        mobileSelectedUserID !== null
                          ? "bottom-12 h-[320px]"
                          : isSidebarCollapsed
                            ? "bottom-12 h-0 opacity-0 pointer-events-none"
                            : "bottom-12 h-[calc(100%-8.5rem)]"
                      }`
                    : "relative w-[25rem]"
                }`}
              >
                {isMobile && mobileSelectedUserID !== null && (
                  <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-3 py-2">
                    <button
                      onClick={() => handleMobileSidebarExpand()}
                      className="flex items-center text-northeastern-red"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                      <span className="font-medium">Back</span>
                    </button>
                  </div>
                )}

                {mapState && (
                  <SidebarPage
                    setSort={setSort}
                    sort={sort}
                    setFilters={setFilters}
                    filters={filters}
                    defaultFilters={defaultFilters}
                    sidebarType={sidebarType}
                    role={user.role}
                    map={mapState}
                    recs={enhancedRecs}
                    favs={enhancedFavs}
                    received={enhancedReceivedUsers}
                    sent={enhancedSentUsers}
                    onViewRouteClick={onViewRouteClick}
                    onUserSelect={handleUserSelect}
                    selectedUser={selectedUser}
                    mobileSelectedUser={mobileSelectedUserID}
                    handleMobileExpand={handleMobileSidebarExpand}
                    onViewGroupRoute={onViewGroupRoute}
                    collapseSidebar={(collapsed) =>
                      setIsSidebarCollapsed(collapsed)
                    }
                  />
                )}
              </div>

              {!isMobile && (
                <button
                  className="absolute bottom-[150px] right-[8px] z-10 flex h-8 w-8 items-center justify-center rounded-md border-2 border-solid border-gray-300 bg-white shadow-sm hover:bg-gray-200"
                  id="fly"
                >
                  <RiFocus3Line />
                </button>
              )}
              <div className="relative flex-auto">
                {/* Message Panel */}
                {selectedUser && (
                  <div className=" pointer-events-none absolute inset-0 z-10 h-full w-full">
                    <MessagePanel
                      selectedUser={selectedUser}
                      onMessageSent={handleMessageSent}
                      onViewRouteClick={onViewRouteClick}
                      onCloseConversation={handleUserSelect}
                    />
                  </div>
                )}

                {/* Map Container */}
                <div
                  ref={mapContainerRef}
                  id="map"
                  className="pointer-events-auto relative  z-0 h-full w-full flex-auto"
                >
                  {user.role === "VIEWER" && viewerBox}
                  {!isMobile && <MapLegend role={user.role} />}
                  {!isMobile && (
                    <MapConnectPortal
                      otherUsers={popupUsers}
                      extendUser={extendPublicUser}
                      onViewRouteClick={onViewRouteClick}
                      onViewRequest={handleUserSelect}
                      onClose={() => {
                        setPopupUsers(null);
                      }}
                    />
                  )}
                  {user.status === "INACTIVE" && user.role !== "VIEWER" && (
                    <InactiveBlocker />
                  )}
                </div>
                {/* Mobile: show reopen button when sidebar collapsed and user is on My Group page, to bring back My Group */}
                {isMobile &&
                  isSidebarCollapsed &&
                  sidebarType === "mygroup" && (
                    <button
                      onClick={() => {
                        setSidebarType("mygroup");
                        setIsSidebarCollapsed(false);
                        setmobileSelectedUserID(null);
                      }}
                      className="flex absolute bottom-16 left-1/2 -translate-x-1/2 transform z-30 items-center gap-1 rounded-full bg-white/90 px-4 py-2 shadow-md border border-gray-300 text-sm font-medium hover:bg-white transition-colors"
                      aria-label="Group Details"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                      <span>Group Details</span>
                    </button>
                  )}
                {isMobile && (
                  <Header
                    data={{
                      sidebarValue: sidebarType,
                      setSidebar: setSidebarType,
                      disabled:
                        user.status === "INACTIVE" && user.role !== "VIEWER",
                    }}
                    isMobile={true}
                    onViewGroupRoute={onViewGroupRoute}
                  />
                )}
              </div>
            </div>
          </div>
        </ToastProvider>
      </UserContext.Provider>
    </>
  );
};

export default Home;
