import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "./Spinner";
import mapboxgl, { Marker } from "mapbox-gl";
import { PublicUser } from "../utils/types";

type ScrollableList = {
  items: PublicUser[];
  idx: number;
};

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
  reccs: PublicUser[] | undefined;
  favs: PublicUser[] | undefined;
  map: mapboxgl.Map | undefined;
}) => {
  const nurecs = requireNotUndefined(reccs);
  const nufavs = requireNotUndefined(favs);

  const [curList, setCurList] = useState<PublicUser[]>(nurecs);
  const userToElem = (user: PublicUser) => {
    return (
      <div className="bg-stone-100 text-left px-2.5 py-2.5 rounded-xl m-3.5 align-center break-words">
        <p className="font-bold">{user.name}</p>
        <div className="flex flex-row space-x-4">
          <div className="w-1/2">
            <p>{user.startPOILocation}</p>
            <p>{user.companyName}</p>
            <button
              onClick={() => viewRoute(user)}
              className="underline decoration-dashed"
            >
              View Route
            </button>
          </div>
          <div className="w-1/2">
            {/* Add user bar */}
            <div className="text-sm">
              <p>{"Start: " + dateToTimeString(user.startTime)}</p>
              <p>{"End: " + dateToTimeString(user.endTime)}</p>
            </div>
            <button className="bg-red-500 hover:bg-red-700 rounded-xl m-2 px-2 py-0.5 text-center text-white">
              Connect
            </button>
          </div>
        </div>
      </div>
    );
  };

  const viewRoute = (user: PublicUser) => {
    if (map !== undefined) {
      clearMarkers();

      const startMarker = new mapboxgl.Marker({ color: "#2ae916" })
        .setLngLat([user.startPOICoordLng, user.startPOICoordLat])
        .addTo(map);

      const endMarker = new mapboxgl.Marker({ color: "#f0220f" })
        .setLngLat([user.companyPOICoordLng, user.companyPOICoordLat])
        .addTo(map);

      previousMarkers.push(startMarker);
      previousMarkers.push(endMarker);

      map.fitBounds([
        [
          Math.min(user.startPOICoordLng, user.companyPOICoordLng) - 0.125,
          Math.max(user.startPOICoordLat, user.companyPOICoordLat) + 0.05,
        ],
        [
          Math.max(user.startPOICoordLng, user.companyPOICoordLng) + 0.05,
          Math.min(user.startPOICoordLat, user.companyPOICoordLat) - 0.05,
        ],
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full w-96 fixed z-10 text-left bg-white">
      <div className="flex-row">
        <button
          className="bg-stone-300 hover:bg-stone-400 rounded-xl m-2 px-2.5 py-0.5"
          onClick={() => {
            setCurList(nurecs);
            clearMarkers();
          }}
        >
          Recommendations
        </button>
        <button
          className="bg-stone-300 hover:bg-stone-400 rounded-xl m-2 px-2.5 py-0.5"
          onClick={() => {
            setCurList(nufavs);
            clearMarkers();
          }}
        >
          Favorites
        </button>
      </div>
      <div id="scrollableDiv" className="overflow-auto">
        <InfiniteScroll
          dataLength={curList.length}
          next={() => {
            return;
          }}
          hasMore={false}
          loader={<Spinner />}
          endMessage={<div></div>}
          scrollableTarget="scrollableDiv"
        >
          {curList.map(userToElem)}
        </InfiniteScroll>
      </div>
    </div>
  );
};

const requireNotUndefined = (lst: PublicUser[] | undefined) => {
  if (lst == undefined) {
    return [];
  }
  return lst;
};

const dateToTimeString = (date: Date | null) => {
  if (date == null) {
    return "N/A";
  } else {
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }
};

export default Sidebar;
