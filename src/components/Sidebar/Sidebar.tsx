import ExploreSidebar from "./ExploreSidebar";
import RequestSidebar from "./RequestSidebar";
import { GroupPage } from "../GroupPage";
import {
  EnhancedPublicUser,
  FiltersState,
  PublicUser,
  User,
} from "../../utils/types";
import mapboxgl from "mapbox-gl";
import { viewRoute } from "../../utils/map/viewRoute";
import { HeaderOptions } from "../Header";
import { trpc } from "../../utils/trpc";
import _ from "lodash";
import { Request } from "@prisma/client";
import React from "react";

interface SidebarProps {
  sidebarType: HeaderOptions;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  setSort: React.Dispatch<React.SetStateAction<string>>;
  sort: string;
  filters: FiltersState;
  defaultFilters: FiltersState;
  map: mapboxgl.Map;
  role: string;
  recs: EnhancedPublicUser[];
  favs: EnhancedPublicUser[];
  received: EnhancedPublicUser[];
  sent: EnhancedPublicUser[];
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
  onUserSelect: (userId: string) => void;
  selectedUser: EnhancedPublicUser | null;
  mobileSelectedUser: string | null;
  handleMobileExpand: (userId?: string) => void;
  onViewGroupRoute?: (driver: PublicUser, riders: PublicUser[]) => void;
  collapseSidebar: (collapsed: boolean) => void;
}

export const SidebarPage = (props: SidebarProps) => {
  let disabled = false;
  if (props.role === "VIEWER") {
    disabled = true;
  }
  if (props.sidebarType === "explore") {
    return (
      <ExploreSidebar
        setFilters={props.setFilters}
        setSort={props.setSort}
        sort={props.sort}
        filters={props.filters}
        defaultFilters={props.defaultFilters}
        recs={props.recs}
        favs={props.favs}
        disabled={disabled}
        viewRoute={props.onViewRouteClick}
        onViewRequest={props.onUserSelect}
        mobileSelectedUser={props.mobileSelectedUser}
        handleMobileExpand={props.handleMobileExpand}
      />
    );
  } else if (props.sidebarType === "requests") {
    return (
      <RequestSidebar
        received={props.received.reverse()}
        sent={props.sent.reverse()}
        disabled={disabled}
        viewRoute={props.onViewRouteClick}
        onUserSelect={props.onUserSelect}
        selectedUser={props.selectedUser}
      />
    );
  } else if (props.sidebarType === "mygroup") {
    return (
      <GroupPage
        onClose={() => props.collapseSidebar(true)}
        onViewGroupRoute={props.onViewGroupRoute || (() => {})}
        isMobile={true}
      />
    );
  }
};
