import ExploreSidebar from "./ExploreSidebar";
import RequestSidebar from "./RequestSidebar";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import mapboxgl from "mapbox-gl";
import { viewRoute } from "../../utils/map/viewRoute";
import { HeaderOptions } from "../Header";
import { trpc } from "../../utils/trpc";
import _ from "lodash";
import { Request } from "@prisma/client";

interface SidebarProps {
  sidebarType: HeaderOptions;
  map: mapboxgl.Map;
  recs: EnhancedPublicUser[];
  favs: EnhancedPublicUser[];
  received: EnhancedPublicUser[];
  sent: EnhancedPublicUser[];
}

export const SidebarPage = (props: SidebarProps) => {
  const onViewRouteClick = (user: User, otherUser: PublicUser) => {
    return viewRoute(user, otherUser, props.map);
  };

  if (props.sidebarType === "explore") {
    return (
      <ExploreSidebar
        recs={props.recs}
        favs={props.favs}
        viewRoute={onViewRouteClick}
      />
    );
  } else {
    return (
      <RequestSidebar
        received={props.received.reverse()}
        sent={props.sent.reverse()}
        viewRoute={onViewRouteClick}
      />
    );
  }
};
