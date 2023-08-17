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
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
}

export const SidebarPage = (props: SidebarProps) => {
  if (props.sidebarType === "explore") {
    return (
      <ExploreSidebar
        recs={props.recs}
        favs={props.favs}
        viewRoute={props.onViewRouteClick}
      />
    );
  } else {
    return (
      <RequestSidebar
        received={props.received.reverse()}
        sent={props.sent.reverse()}
        viewRoute={props.onViewRouteClick}
      />
    );
  }
};
