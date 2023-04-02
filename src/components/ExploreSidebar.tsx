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

interface ExploreSidebarProps {
  currentUser: User;
  reccs: PublicUser[];
  favs: PublicUser[];
  map: mapboxgl.Map;
  handleConnect: (modalUser: PublicUser) => void;
  handleFavorite: (otherUser: string, add: boolean) => void;
}

const ExploreSidebar = (props: ExploreSidebarProps) => {
  const [curList, setCurList] = useState<PublicUser[]>(props.reccs ?? []);

  useEffect(() => {
    setCurList(props.reccs ?? []);
  }, [props.reccs]);

  const favIds = props.favs.map((fav) => fav.id);

  return (
    <div className="flex flex-col px-5 flex-shrink-0 h-full z-10 text-left bg-white">
      <div className="flex-row py-3">
        <div className="flex justify-center gap-3">
          <button
            className={
              curList == props.reccs
                ? "bg-northeastern-red rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              setCurList(props.reccs ?? []);
              clearMarkers();
            }}
          >
            Recommendations
          </button>
          <button
            className={
              curList == props.favs
                ? "bg-northeastern-red rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              setCurList(props.favs ?? []);
              clearMarkers();
            }}
          >
            Favorites
          </button>
        </div>
      </div>
      <AbstractSidebarPage
        currentUser={props.currentUser}
        userCardList={curList}
        rightButton={{
          text: "Connect",
          onPress: props.handleConnect,
          color: undefined,
        }}
        handleFavorite={props.handleFavorite}
        favs={props.favs}
        map={props.map}
      />
    </div>
  );
};

export default ExploreSidebar;
