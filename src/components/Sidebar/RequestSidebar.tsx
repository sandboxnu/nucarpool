import React, { Dispatch, SetStateAction, useState } from "react";
import mapboxgl from "mapbox-gl";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import { SidebarContent } from "./SidebarContent";

/**
 * TODO:
 * 2. Add Prettier Tailwind omg please
 * 5. onClick StarButton with Favorites
 */

const previousMarkers: mapboxgl.Marker[] = [];
const clearMarkers = () => {
  previousMarkers.forEach((marker) => marker.remove());
  previousMarkers.length = 0;
};

interface RequestSidebarProps {
  received: EnhancedPublicUser[];
  sent: EnhancedPublicUser[];
  viewRoute: (user: User, otherUser: PublicUser) => void;
}

const RequestSidebar = (props: RequestSidebarProps) => {
  const [curOption, setCurOption] = useState<"received" | "sent">("received");

  return (
    <div className="flex flex-col px-5 flex-shrink-0 h-full z-10 text-left bg-white">
      <div className="flex-row py-3">
        <div className="flex justify-center gap-3">
          <button
            className={
              curOption === "received"
                ? "bg-sky-900 rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              setCurOption("received");
              clearMarkers();
            }}
          >
            Received
          </button>
          <button
            className={
              curOption === "sent"
                ? "bg-sky-900 rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              setCurOption("sent");
              clearMarkers();
            }}
          >
            Sent
          </button>
        </div>
      </div>
      <SidebarContent
        userCardList={curOption === "received" ? props.received : props.sent}
        card={curOption}
        onViewRouteClick={props.viewRoute}
      />
    </div>
  );
};

export default RequestSidebar;
