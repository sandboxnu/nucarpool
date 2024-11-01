import React, { useState } from "react";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import _ from "lodash";
import { SidebarContent } from "./SidebarContent";
import { clearMarkers } from "../../utils/map/viewRoute";
import Filters from "../Filters";
import { FaFilter } from "react-icons/fa6";
import { mockSession } from "next-auth/client/__tests__/helpers/mocks";

interface ExploreSidebarProps {
  recs: EnhancedPublicUser[];
  favs: EnhancedPublicUser[];
  disabled: boolean;
  viewRoute: (user: User, otherUser: PublicUser) => void;
  onViewRequest: (userId: string) => void;
}

const ExploreSidebar = (props: ExploreSidebarProps) => {
  const [curOption, setCurOption] = useState<"recommendations" | "favorites">(
    "recommendations"
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

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
            }}
          >
            Favorites
          </button>
        </div>
        {filtersOpen ? null : (
          <div className="mt-3 flex justify-end">
            <button
              className="mr-5 rounded-full bg-gray-300 p-3"
              onClick={() => setFiltersOpen(true)}
            >
              <FaFilter className="text-xl" />
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        {filtersOpen ? (
          <Filters onClose={() => setFiltersOpen(false)} />
        ) : (
          <SidebarContent
            userCardList={
              curOption == "recommendations" ? props.recs : props.favs
            }
            subType={curOption}
            disabled={props.disabled}
            onViewRouteClick={props.viewRoute}
            onCardClick={() => {}}
            selectedUser={null}
            onViewRequest={props.onViewRequest}
          />
        )}
      </div>
    </div>
  );
};

export default ExploreSidebar;
