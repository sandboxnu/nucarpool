import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { PublicUser, User } from "../utils/types";
import AbstractSidebarPage from "./AbstractSidebarPage";

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
  currentUser: User;
  sent: PublicUser[];
  received: PublicUser[];
  favs: PublicUser[];
  map: mapboxgl.Map;
  startingTab: 0 | 1;
  setStartingTab: (idx: 0 | 1) => void;
  handleSent: (modalUser: PublicUser) => void;
  handleReceived: (modalUser: PublicUser) => void;
  handleFavorite: (otherUser: string, add: boolean) => void;
}

const RequestSidebar = (props: RequestSidebarProps) => {
  const handleManage = props.startingTab == 0 ? "sent" : "received";
  const [curList, setCurList] = useState<PublicUser[]>([]);
  const passManageFunction = () => {
    if (props.startingTab === 0) {
      return props.handleSent;
    } else {
      return props.handleReceived;
    }
  };

  useEffect(() => {
    setCurList(handleManage === "sent" ? props.sent : props.received);
  }, [props.sent, props.received, handleManage]);

  return (
    <div className="flex flex-col px-5 flex-shrink-0 h-full z-10 text-left bg-white">
      <div className="flex-row py-3">
        <div className="flex justify-center gap-3">
          <button
            className={
              handleManage === "sent"
                ? "bg-sky-900 rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              props.setStartingTab(0);
              clearMarkers();
            }}
          >
            Sent
          </button>
          <button
            className={
              handleManage === "received"
                ? "bg-sky-900 rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              props.setStartingTab(1);
              clearMarkers();
            }}
          >
            Received
          </button>
        </div>
      </div>
      <AbstractSidebarPage
        currentUser={props.currentUser}
        userCardList={curList}
        rightButton={{
          text: "Manage",
          onPress: passManageFunction(),
          color: "bg-blue-900",
        }}
        handleFavorite={props.handleFavorite}
        favs={props.favs}
        map={props.map}
      />
    </div>
  );
};

export default RequestSidebar;
