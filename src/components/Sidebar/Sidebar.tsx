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

interface SidebarProps {
  sidebarType: HeaderOptions;
  map: mapboxgl.Map;
}

const extendPublicUser = (
  user: PublicUser,
  favorites: PublicUser[],
  received: PublicUser[]
): EnhancedPublicUser => {
  return {
    ...user,
    isFavorited: favorites.some((favs) => favs.id === user.id),
    incomingRequest: received.some((req) => req.id === user.id),
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

  const sent = requests.sent.map((request: { toUser: any }) => request.toUser!);
  const received = requests.received.map(
    (request: { fromUser: any }) => request.fromUser
  );
  const filteredRecs = _.differenceBy(recommendations, sent, "id");

  const extendPublicUserArray = (users: PublicUser[]): EnhancedPublicUser[] => {
    return users.map((user) => extendPublicUser(user, favorites, received));
  };

  const enhancedRecs = extendPublicUserArray(filteredRecs);
  const enhancedFavs = extendPublicUserArray(favorites);
  const enhancedSent = extendPublicUserArray(sent);
  const enhancedReceived = extendPublicUserArray(received);

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
        received={enhancedReceived}
        sent={enhancedSent}
        viewRoute={onViewRouteClick}
      />
    );
  }
};
