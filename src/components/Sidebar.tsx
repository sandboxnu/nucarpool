import React, { useEffect, useState } from "react";
import { Role, Status, User } from "@prisma/client";
import mapboxgl, { Marker } from "mapbox-gl";
import UserCard from "./UserCard";

/**
 * TODO:
 * 1. Recommendations in index is undefined, and therefore sidebar receivees empty array for both Reccs and Favorites
 * 2. Add Prettier Tailwind omg please
 * 3. Inconsistency in Figma ? Connect vs Send Email?
 * 4. How is daysWorking stored? Currently a "0,0,1,1,1,1,1" but surely there's a better way? Forces me to loop through string?
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
    <div className="flex flex-col h-full w-96 fixed z-10 text-left bg-white">
      <div className="flex-row">
        <button
          className="bg-stone-300 hover:bg-stone-400 rounded-xl m-2 px-2.5 py-0.5"
          onClick={() => {
            setCurList(reccs ?? []);
            clearMarkers();
          }}
        >
          Recommendations
        </button>
        <button
          className="bg-stone-300 hover:bg-stone-400 rounded-xl m-2 px-2.5 py-0.5"
          onClick={() => {
            setCurList(favs ?? []);
            clearMarkers();
          }}
        >
          Favorites
        </button>
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
