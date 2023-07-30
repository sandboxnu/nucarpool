import React, { useState } from "react";
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
    <div className="z-10 flex h-full flex-shrink-0 flex-col bg-white px-5 text-left">
      <div className="flex-row py-3">
        <div className="flex justify-center gap-3">
          <button
            className={
              curOption === "recommendations"
                ? "rounded-xl bg-northeastern-red p-2 text-xl font-semibold text-white"
                : "rounded-xl p-2 text-xl font-semibold text-black"
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
                ? "rounded-xl bg-northeastern-red p-2 text-xl font-semibold text-white"
                : "rounded-xl p-2 text-xl font-semibold text-black"
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
