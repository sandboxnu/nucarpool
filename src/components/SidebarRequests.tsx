import React, { useReducer } from "react";
import mapboxgl from "mapbox-gl";
import { ActionType, PublicUser, User } from "../utils/types";
import { AbstractUserCard } from "./AbstractUserCard";

const emptyMessages = {
  sent: `You have not sent any requests. Navigate to the Explore page to send requests to carpool!`,
  received: `You have not received any requests. Navigate to the Explore page to send requests to carpool!`,
};

interface ImprovedRequestsSidebarProps {
  currentUser: User;
  map: mapboxgl.Map;
  received: PublicUser[];
  favs: PublicUser[];
  sent: PublicUser[];
  handleFavorite: (otherUser: string, add: boolean) => void;
  handleSent: (modalUser: PublicUser) => void;
  handleReceived: (modalUser: PublicUser) => void;
  isDesktop: Boolean;
  startingTab: "sent" | "received";
  previousMarkers: mapboxgl.Marker[];
  clearMarkers: () => void;
}

interface SidebarState {
  currList: PublicUser[];
  sentStyling: string;
  selection: "sent" | "received";
  emptyMessage: string;
  receivedStyling: string;
  handleManage: (modalUser: PublicUser) => void;
  children: ImprovedRequestsSidebarProps;
}

const createInitalState = (
  props: ImprovedRequestsSidebarProps
): SidebarState => {
  if (props.startingTab === "sent") {
    return {
      currList: props.sent,
      sentStyling:
        "bg-blue-900 rounded-xl p-2 font-semibold text-xl text-white",
      selection: "sent",
      emptyMessage: emptyMessages["sent"],
      receivedStyling: "rounded-xl p-2 font-semibold text-xl text-black",
      handleManage: props.handleSent,
      children: props,
    };
  } else {
    return {
      currList: props.received,
      receivedStyling:
        "bg-blue-900 rounded-xl p-2 font-semibold text-xl text-white",
      selection: "received",
      emptyMessage: emptyMessages["received"],
      sentStyling: "rounded-xl p-2 font-semibold text-xl text-black",
      handleManage: props.handleReceived,
      children: props,
    };
  }
};

const reducer = (state: SidebarState, action: ActionType): SidebarState => {
  if (action.type === "clicked sent" && state.selection !== "sent") {
    state.children.clearMarkers();
    return {
      currList: state.children.sent,
      sentStyling:
        "bg-blue-900 rounded-xl p-2 font-semibold text-xl text-white",
      selection: "sent",
      emptyMessage: emptyMessages["sent"],
      receivedStyling: "rounded-xl p-2 font-semibold text-xl text-black",
      handleManage: state.children.handleSent,
      children: state.children,
    };
  }

  if (action.type === "clicked received" && state.selection !== "received") {
    state.children.clearMarkers();
    return {
      currList: state.children.received,
      sentStyling: "rounded-xl p-2 font-semibold text-xl text-black",
      selection: "received",
      emptyMessage: emptyMessages["received"],
      receivedStyling:
        "bg-blue-900 rounded-xl p-2 font-semibold text-xl text-white",
      handleManage: state.children.handleReceived,
      children: state.children,
    };
  }

  return {
    currList: state.currList,
    receivedStyling: state.receivedStyling,
    selection: state.selection,
    emptyMessage: state.emptyMessage,
    sentStyling: state.sentStyling,
    handleManage: state.handleManage,
    children: state.children,
  };
};

const ImprovedRequestsSidebar = (props: ImprovedRequestsSidebarProps) => {
  const [state, dispatch] = useReducer(reducer, createInitalState(props));

  const favIds = props.favs.map((fav) => fav.id);

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
          <button
            className={state.sentStyling}
            onClick={() => {
              dispatch({ type: "clicked sent" });
            }}
          >
            Sent
          </button>
          <button
            className={state.receivedStyling}
            onClick={() => {
              dispatch({ type: "clicked received" });
            }}
          >
            Received
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
                text: "Manage",
                onPress: state.handleManage,
                color: "bg-blue-900",
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

export default ImprovedRequestsSidebar;
