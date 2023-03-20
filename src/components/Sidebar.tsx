import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { UserCard } from "./UserCard";
import { PublicUser, User } from "../utils/types";

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

interface SideBarProps {
  currentUser: User;
  reccs: PublicUser[];
  favs: PublicUser[];
  map: mapboxgl.Map;
  handleConnect: (modalUser: PublicUser) => void;
  handleFavorite: (otherUser: string, add: boolean) => void;
}

const Sidebar = (props: SideBarProps) => {
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
      <div id="scrollableDiv" className="overflow-auto">
        {curList.map((otherUser: PublicUser) => (
          <UserCard
            userToConnectTo={otherUser}
            key={otherUser.id}
            inputProps={{
              map: props.map,
              previousMarkers: previousMarkers,
              clearMarkers: clearMarkers,
            }}
            isFavorited={favIds.includes(otherUser.id)}
            handleConnect={props.handleConnect}
            handleFavorite={(add) => props.handleFavorite(otherUser.id, add)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
