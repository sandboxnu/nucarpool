import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { PublicUser, User } from "../../utils/types";
import _ from "lodash";
import { ConnectCard } from "../UserCards/ConnectCard";
import { SidebarContent } from "./SidebarContent";
import { favoritesRouter } from "../../server/router/user/favorites";

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
  recs: PublicUser[];
  favs: PublicUser[];
}

const ExploreSidebar = (props: ExploreSidebarProps) => {
  const [curOption, setCurOption] = useState<"recommendations" | "favorites">(
    "recommendations"
  );
  return (
    <div className="flex flex-col px-5 flex-shrink-0 h-full z-10 text-left bg-white">
      <div className="flex-row py-3">
        <div className="flex justify-center gap-3">
          <button
            className={
              curOption === "recommendations"
                ? "bg-northeastern-red rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              setCurOption("recommendations");
              clearMarkers();
            }}
          >
            Recommendations
          </button>
          <button
            className={
              curOption === "favorites"
                ? "bg-northeastern-red rounded-xl p-2 font-semibold text-xl text-white"
                : "rounded-xl p-2 font-semibold text-xl text-black"
            }
            onClick={() => {
              setCurOption("favorites");
              clearMarkers();
            }}
          >
            Favorites
          </button>
        </div>
      </div>
      <SidebarContent
        favoriteIds={props.favs.map((fav) => fav.id)}
        userCardList={curOption == "recommendations" ? props.recs : props.favs}
        card={"connect"}
      />
    </div>
  );
};

export default ExploreSidebar;
