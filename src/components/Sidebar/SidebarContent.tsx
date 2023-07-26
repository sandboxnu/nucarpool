import React, { Dispatch, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import { renderUserCard } from "../UserCards/UserCard";

/**
 * TODO:
 * 2. Add Prettier Tailwind omg please
 * 5. onClick StarButton with Favorites
 */

interface SidebarContentProps {
  card: string;
  userCardList: EnhancedPublicUser[];
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
}

const emptyMessages = {
  recommendations: `We're unable to find any recommendations for you right now.
  We recommend reviewing your profile to make sure all information you've entered is accurate!`,
  favorites: `You have no users currently favorited.
  Click the star icon on the upper-right side of a user's card to add them to your favorites!`,
  sent: "You have no current outgoing requests. Sent requests to other users through the recommendations dashbaord!",
  received: "You have no current incoming requests. Hold tight!",
};

const emptyMessage = (card: string): string => {
  switch (card) {
    case "connect":
      return emptyMessages.recommendations;
    case "favorite":
      return emptyMessages.favorites;
    case "sent":
      return emptyMessages.sent;
    case "received":
      return emptyMessages.received;
    default:
      return "";
  }
};

export const SidebarContent = (props: SidebarContentProps) => {
  return (
    <div id="scrollableDiv" className="overflow-auto">
      {props.userCardList.length === 0 ? (
        <div className="text-center text-lg font-light m-4">
          {emptyMessage(props.card)}
        </div>
      ) : (
        props.userCardList.map((otherUser: EnhancedPublicUser) =>
          renderUserCard(props.card, otherUser, props.onViewRouteClick)
        )
      )}
    </div>
  );
};

// props.userCardList.map((otherUser: PublicUser) => (
//   <AbstractUserCard
//     userCardObj={otherUser}
//     key={otherUser.id}
//     isFavorited={favIds.includes(otherUser.id)}
//     handleFavorite={(add: boolean) =>
//       props.handleFavorite(otherUser.id, add)
//     }
//     leftButton={props.leftButton}
//     rightButton={props.rightButton}
//     inputProps={{ // We can use dispatch to reduce prop drilling here
//       map: props.map, // All of this
//       previousMarkers: previousMarkers,
//       clearMarkers: clearMarkers,
//     }}
//   />
