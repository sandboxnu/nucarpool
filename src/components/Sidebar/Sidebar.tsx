import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ExploreSidebar from "./ExploreSidebar";
import RequestSidebar from "./RequestSidebar";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import mapboxgl from "mapbox-gl";
import { viewRoute } from "../../utils/map/viewRoute";
import { extend } from "lodash";
import { HeaderOptions } from "../Header";
import { trpc } from "../../utils/trpc";
import _ from "lodash";
import { Request } from "@prisma/client";

interface SidebarProps {
  sidebarType: HeaderOptions;
  map: mapboxgl.Map;
}

const extendPublicUser = (
  user: PublicUser,
  favorites: PublicUser[],
  received: Request[],
  sent: Request[]
): EnhancedPublicUser => {
  return {
    ...user,
    isFavorited: favorites.some((favs) => favs.id === user.id),
    incomingRequest: received.find((req) => req.fromUserId === user.id),
    outgoingRequest: sent.find((req) => req.toUserId === user.id),
  };
};

export const SidebarPage = (props: SidebarProps) => {
  const { data: recommendations = [], refetch: refetchRecs } =
    trpc.user.recommendations.me.useQuery();
  const { data: favorites = [], refetch: refetchFavs } =
    trpc.user.favorites.me.useQuery();
  const {
    data: requests = { sent: [], received: [] },
    refetch: refetchRequests,
  } = trpc.user.requests.me.useQuery();

  useEffect(() => {
    refetchRecs();
    refetchRequests();
    refetchFavs();
  }, []);

  const extendPublicUserArray = (users: PublicUser[]): EnhancedPublicUser[] => {
    return users.map((user) =>
      extendPublicUser(user, favorites, requests.received, requests.sent)
    );
  };

  const enhancedSentUsers = extendPublicUserArray(
    requests.sent.map((request: { toUser: any }) => request.toUser!)
  );
  const enhancedReceivedUsers = extendPublicUserArray(
    requests.received.map((request: { fromUser: any }) => request.fromUser!)
  );
  const filteredRecs = _.differenceBy(recommendations, enhancedSentUsers, "id");
  const enhancedRecs = extendPublicUserArray(filteredRecs);
  const enhancedFavs = extendPublicUserArray(favorites);

  const onViewRouteClick = (user: User, otherUser: PublicUser) => {
    return viewRoute(user, otherUser, props.map);
  };

  if (props.sidebarType === "explore") {
    return (
      <ExploreSidebar
        recs={enhancedRecs}
        favs={enhancedFavs}
        viewRoute={onViewRouteClick}
      />
    );
  } else {
    return (
      <RequestSidebar
        received={enhancedReceivedUsers}
        sent={enhancedSentUsers}
        viewRoute={onViewRouteClick}
      />
    );
  }
};
