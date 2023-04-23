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
  handleSent: (modalUser: PublicUser) => void;
  handleReceived: (modalUser: PublicUser) => void;
  handleFavorite: (otherUser: string, add: boolean) => void;
}

const RequestSidebar = (props: RequestSidebarProps) => {
  const [curList, setCurList] = useState<PublicUser[]>(props.sent ?? []);
  const [handleManage, setHandleManage] = useState<"sent" | "received">("sent");

  const passManageFunction = () => {
    if (handleManage === "sent") {
      return props.handleSent;
    } else {
      return props.handleReceived;
    }
  };

  useEffect(() => {
    setCurList(props.sent ?? []);
  }, [props.sent]);

  return (
    <div className="flex flex-col px-5 flex-shrink-0 h-full z-10 text-left bg-white">
      <div className="flex-row py-3">
        <div className="flex justify-center gap-3">
          <button
            className={
              curList == props.sent
                ? "bg-sky-900 rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              setCurList(props.sent ?? []);
              setHandleManage("sent");
              clearMarkers();
            }}
          >
            Received
          </button>
          <button
            className={
              curList == props.received
                ? "bg-sky-900 rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              setCurList(props.received ?? []);
              setHandleManage("received");
              clearMarkers();
            }}
          >
            Sent
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
