import React, { Dispatch, SetStateAction, useState } from "react";
import mapboxgl from "mapbox-gl";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import _ from "lodash";
import { SidebarContent } from "./SidebarContent";
import { clearMarkers } from "../../utils/map/viewRoute";

/**
 * TODO: Add Prettier Tailwind omg please
 */

interface ExploreSidebarProps {
  recs: EnhancedPublicUser[];
  favs: EnhancedPublicUser[];
  viewRoute: (user: User, otherUser: PublicUser) => void;
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
        userCardList={curOption == "recommendations" ? props.recs : props.favs}
        subType={curOption}
        onViewRouteClick={props.viewRoute}
      />
    </div>
  );
};

export default ExploreSidebar;
