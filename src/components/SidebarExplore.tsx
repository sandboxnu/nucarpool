import React, { useReducer } from "react";
import mapboxgl from "mapbox-gl";
import { ActionType, PublicUser, User } from "../utils/types";
import { AbstractUserCard } from "./AbstractUserCard";
import _ from "lodash";

const emptyMessages = {
  recommendations: `We're unable to find any recommendations for you right now.
    We recommend reviewing your profile to make sure all information you've entered is accurate!`,
  favorites: `You have no users currently favorited.
    Click the star icon on the upper-right side of a user's card to add them to your favorites!`,
  sent: `You have not sent any requests. Navigate to the Explore page to send requests to carpool!`,
  received: `You have not received any requests. Navigate to the Explore page to send requests to carpool!`,
};

interface ImprovedExploreSidebarProps {
  currentUser: User;
  map: mapboxgl.Map;
  reccs: PublicUser[];
  favs: PublicUser[];
  sent: PublicUser[];
  handleFavorite: (otherUser: string, add: boolean) => void;
  handleConnect: (modalUser: PublicUser) => void;
  isDesktop: Boolean;
  previousMarkers: mapboxgl.Marker[];
  clearMarkers: () => void;
}

interface SidebarState {
  currList: PublicUser[];
  recStyling: string;
  selection: "recommendations" | "favorites";
  emptyMessage: string;
  favStyling: string;
  children: ImprovedExploreSidebarProps;
}

const createInitalState = (
  props: ImprovedExploreSidebarProps
): SidebarState => {
  const filteredRecs = (): PublicUser[] => {
    return _.differenceBy(props.reccs, props.sent, "id");
  };
  return {
    currList: filteredRecs(),
    recStyling:
      "bg-northeastern-red rounded-xl p-2 font-semibold text-xl text-white",
    selection: "recommendations",
    emptyMessage: emptyMessages["recommendations"],
    favStyling: "rounded-xl p-2 font-semibold text-xl text-black",
    children: props,
  };
};

const reducer = (state: SidebarState, action: ActionType): SidebarState => {
  const filteredRecs = (): PublicUser[] => {
    return _.differenceBy(state.children.reccs, state.children.sent, "id");
  };
  if (
    action.type === "clicked recommendations" &&
    state.selection !== "recommendations"
  ) {
    state.children.clearMarkers();
    return {
      currList: filteredRecs(),
      recStyling:
        "bg-northeastern-red rounded-xl p-2 font-semibold text-xl text-white",
      selection: "recommendations",
      emptyMessage: emptyMessages["recommendations"],
      favStyling: "rounded-xl p-2 font-semibold text-xl text-black",
      children: state.children,
    };
  }

  if (action.type === "clicked favorites" && state.selection !== "favorites") {
    state.children.clearMarkers();
    return {
      currList: state.children.favs,
      recStyling: "rounded-xl p-2 font-semibold text-xl text-black",
      selection: "favorites",
      emptyMessage: emptyMessages["favorites"],
      favStyling:
        "bg-northeastern-red rounded-xl p-2 font-semibold text-xl text-white",
      children: state.children,
    };
  }

  return {
    currList: state.currList,
    favStyling: state.favStyling,
    selection: state.selection,
    emptyMessage: state.emptyMessage,
    recStyling: state.recStyling,
    children: state.children,
  };
};

const ImprovedExploreSidebar = (props: ImprovedExploreSidebarProps) => {
  const [state, dispatch] = useReducer(reducer, createInitalState(props));

  const favIds = props.favs.map((fav) => fav.id);

  const handleRecClick = () => {
    dispatch({ type: "clicked recommendations" });
  };

  const handleFavClick = () => {
    dispatch({ type: "clicked favorites" });
  };

  return (
    <div
      className={
        props.isDesktop
          ? "flex flex-col px-5 flex-shrink-0 h-full z-10 text-left bg-white"
          : "flex flex-col px-5 flex-shrink-0 w-full z-10 text-left bg-white"
      }
    >
      <div className="flex-row py-3">
        <div className="flex justify-center gap-3">
          <button className={state.recStyling} onClick={handleRecClick}>
            Recommendations
          </button>
          <button className={state.favStyling} onClick={handleFavClick}>
            Favorites
          </button>
        </div>
      </div>
      <div
        id="scrollableDiv"
        className={props.isDesktop ? "overflow-auto" : "flex overflow-x-auto"}
      >
        {state.currList.length !== 0 &&
          state.currList.map((otherUser: PublicUser) => (
            <AbstractUserCard
              userCardObj={otherUser}
              key={otherUser.id}
              isFavorited={favIds.includes(otherUser.id)}
              handleFavorite={(add: boolean) =>
                props.handleFavorite(otherUser.id, add)
              }
              rightButton={{
                text: "Connect",
                onPress: props.handleConnect,
                color: undefined,
              }}
              inputProps={{
                map: props.map,
                previousMarkers: state.children.previousMarkers,
                clearMarkers: state.children.clearMarkers,
              }}
            />
          ))}
        {state.currList.length === 0 && (
          <div className="text-center text-lg font-light m-4">
            <p className={props.isDesktop ? "w-[270px]" : "w-full"}>
              {state.emptyMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedExploreSidebar;
