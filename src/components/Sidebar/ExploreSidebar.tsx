import React, { useState } from "react";
import {
  EnhancedPublicUser,
  FiltersState,
  PublicUser,
  User,
} from "../../utils/types";
import _ from "lodash";
import { SidebarContent } from "./SidebarContent";
import { clearMarkers } from "../../utils/map/viewRoute";
import Filters from "../Filters";
import { FaFilter } from "react-icons/fa6";
import { mockSession } from "next-auth/client/__tests__/helpers/mocks";
import CustomSelect from "./CustomSelect";

interface ExploreSidebarProps {
  recs: EnhancedPublicUser[];
  favs: EnhancedPublicUser[];
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  setSort: React.Dispatch<React.SetStateAction<string>>;
  sort: string;
  filters: FiltersState;
  disabled: boolean;
  viewRoute: (user: User, otherUser: PublicUser) => void;
  onViewRequest: (userId: string) => void;
}

const ExploreSidebar = (props: ExploreSidebarProps) => {
  const [curOption, setCurOption] = useState<"recommendations" | "favorites">(
    "recommendations"
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sortOptions = [
    { value: "any", label: "Recommended" },
    { value: "distance", label: "Distance" },
    { value: "time", label: "Time" },
  ];
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

        {!filtersOpen && !props.disabled && curOption === "recommendations" && (
          <div className="relative mx-4 mt-6 flex items-center justify-between">
            <CustomSelect
              value={props.sort}
              onChange={props.setSort}
              options={sortOptions}
            />
            <button
              className="rounded-full bg-stone-100 p-3"
              onClick={() => setFiltersOpen(true)}
            >
              <FaFilter className="text-xl text-black " />
            </button>
          </div>
        )}
      </div>

      <div className="relative h-full">
        {filtersOpen ? (
          <Filters
            setFilters={props.setFilters}
            filters={props.filters}
            onClose={() => setFiltersOpen(false)}
          />
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
