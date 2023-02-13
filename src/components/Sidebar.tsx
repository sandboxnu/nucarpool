import React, { useEffect, useState } from "react";
import { Role, Status, User } from "@prisma/client";
import mapboxgl, { Marker } from "mapbox-gl";
import { UserCard } from "./UserCard";

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

const Sidebar = ({
  reccs,
  favs,
  map,
}: {
  reccs: User[];
  favs: User[];
  map: mapboxgl.Map;
}) => {
  const [curList, setCurList] = useState<User[]>(reccs ?? []);

  useEffect(() => {
    setCurList(reccs ?? []);
  }, [reccs]);

  return (
    <div className="flex flex-col px-5 flex-auto h-full z-10 text-left bg-white">
      <div className="flex-row py-3">
        <div className="flex justify-center gap-3">
          <button
            className={
              curList == reccs
                ? "bg-northeastern-red rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              setCurList(reccs ?? []);
              clearMarkers();
            }}
          >
            Recommendations
          </button>
          <button
            className={
              curList == favs
                ? "bg-northeastern-red rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              setCurList(favs ?? []);
              clearMarkers();
            }}
          >
            Favorites
          </button>
        </div>
      </div>
      <div id="scrollableDiv" className="overflow-auto">
        {curList.map((user: User) => (
          <UserCard
            user={user}
            key={user.id}
            inputProps={{
              map: map,
              previousMarkers: previousMarkers,
              clearMarkers: clearMarkers,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
