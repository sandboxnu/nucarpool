import React, { useCallback, useContext, useState } from "react";
import {
  EnhancedPublicUser,
  FiltersState,
  PublicUser,
  User,
} from "../../utils/types";
import { SidebarContent } from "./SidebarContent";
import Filters from "../Filters";
import { FaFilter } from "react-icons/fa6";
import CustomSelect from "./CustomSelect";
import { UserContext } from "../../utils/userContext";
import useIsMobile from "../../utils/useIsMobile";

interface ExploreSidebarProps {
  recs: EnhancedPublicUser[];
  favs: EnhancedPublicUser[];
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  defaultFilters: FiltersState;
  setSort: React.Dispatch<React.SetStateAction<string>>;
  sort: string;
  filters: FiltersState;
  disabled: boolean;
  viewRoute: (user: User, otherUser: PublicUser) => void;
  onViewRequest: (userId: string) => void;
  mobileSelectedUser: string | null;
  handleMobileExpand: (userId?: string) => void;
}

const ExploreSidebar = (props: ExploreSidebarProps) => {
  const user = useContext(UserContext);
  const isMobile = useIsMobile();
  const [curOption, setCurOption] = useState<"recommendations" | "favorites">(
    "recommendations",
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const getActiveFilters = () => {
    return {
      days: props.defaultFilters.days !== props.filters.days,
      dateOverlap:
        props.defaultFilters.dateOverlap !== props.filters.dateOverlap,
      startTime: props.defaultFilters.startTime !== props.filters.startTime,
      endTime: props.defaultFilters.endTime !== props.filters.endTime,
      startDistance:
        props.defaultFilters.startDistance !== props.filters.startDistance,
      endDistance:
        props.defaultFilters.endDistance !== props.filters.endDistance,
      favorites: props.defaultFilters.favorites !== props.filters.favorites,
      messaged: props.defaultFilters.messaged !== props.filters.messaged,
    };
  };
  const resetFilters = () => {
    if (!user) {
      return;
    }
    props.setFilters({
      ...props.defaultFilters,
      startDate: user.coopStartDate || props.filters.startDate,
      endDate: user.coopEndDate || props.filters.endDate,
      daysWorking: user.daysWorking,
    });
  };
  const activeFilters = getActiveFilters();
  const filtersActive = Object.values(activeFilters).some((value) => value);

  const sortOptions = [
    { value: "any", label: "Recommended" },
    { value: "distance", label: "Distance" },
    { value: "time", label: "Time" },
  ];
  return (
    <div className="z-10 flex h-full flex-shrink-0 flex-col bg-white text-left">
      <div className={`flex-row px-5 ${isMobile ? "py-0" : "py-3"}`}>
        {!isMobile && (
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
                setFiltersOpen(false);
              }}
            >
              Favorites
            </button>
          </div>
        )}

        {!filtersOpen &&
          !props.disabled &&
          curOption === "recommendations" &&
          !isMobile && (
            <div className="relative mx-4 mt-6 flex items-center justify-between">
              <CustomSelect
                value={props.sort}
                onChange={props.setSort}
                options={sortOptions}
                title={"Sort by"}
                className="!w-1/2"
              />
              <button
                className={`rounded-full p-3 ${
                  filtersActive
                    ? "bg-northeastern-red text-white"
                    : "bg-stone-100 text-black"
                }`}
                onClick={() => setFiltersOpen(true)}
              >
                <FaFilter className="text-xl " />
              </button>
            </div>
          )}
      </div>

      <div className="relative h-full w-full ">
        {filtersOpen ? (
          <Filters
            setFilters={props.setFilters}
            activeFilters={activeFilters}
            filters={props.filters}
            onClose={() => setFiltersOpen(false)}
            resetFilters={() => resetFilters()}
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
            mobileSelectedUser={props.mobileSelectedUser}
            handleMobileExpand={props.handleMobileExpand}
          />
        )}
      </div>
    </div>
  );
};

export default ExploreSidebar;
