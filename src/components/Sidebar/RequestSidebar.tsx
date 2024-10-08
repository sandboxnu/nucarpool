import React, { useState } from "react";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import { SidebarContent } from "./SidebarContent";
import { clearMarkers } from "../../utils/map/viewRoute";

interface RequestSidebarProps {
  received: EnhancedPublicUser[];
  sent: EnhancedPublicUser[];
  viewRoute: (user: User, otherUser: PublicUser) => void;
  disabled: boolean;
}

const RequestSidebar = (props: RequestSidebarProps) => {
  const [curOption, setCurOption] = useState<"received" | "sent">("received");

  return (
    <div className="z-10 flex h-full flex-shrink-0 flex-col bg-white px-5 text-left">
      <div className="flex-row py-3">
        <div className="flex justify-center gap-3">
          <button
            className={
              curOption === "received"
                ? "rounded-xl bg-northeastern-red p-2 text-xl font-semibold text-white"
                : "rounded-xl p-2 text-xl font-semibold text-black"
            }
            onClick={() => {
              setCurOption("received");
              // don't see a reason for clearing markers
              //clearMarkers();
            }}
          >
            Received
          </button>
          <button
            className={
              curOption === "sent"
                ? "rounded-xl bg-northeastern-red p-2 text-xl font-semibold text-white"
                : "rounded-xl p-2 text-xl font-semibold text-black"
            }
            onClick={() => {
              setCurOption("sent");
              //clearMarkers();
            }}
          >
            Sent
          </button>
        </div>
      </div>
      <SidebarContent
        userCardList={curOption === "received" ? props.received : props.sent}
        subType={curOption}
        disabled={props.disabled}
        onViewRouteClick={props.viewRoute}
      />
    </div>
  );
};

export default RequestSidebar;
