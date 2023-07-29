import React from "react";
import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import Spinner from "../Spinner";
import { ConnectCard } from "../UserCards/ConnectCard";
import { ReceivedCard } from "../UserCards/ReceivedCard";
import { SentCard } from "../UserCards/SentCard";

interface SidebarContentProps {
  subType: string;
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
    case "recommendations":
      return emptyMessages.recommendations;
    case "favorites":
      return emptyMessages.favorites;
    case "sent":
      return emptyMessages.sent;
    case "received":
      return emptyMessages.received;
    default:
      return "";
  }
};

const renderUserCard = (
  subType: string,
  otherUser: EnhancedPublicUser,
  onViewRouteClick: (user: User, otherUser: PublicUser) => void
): JSX.Element => {
  switch (subType) {
    case "recommendations":
    case "favorites":
      return (
        <ConnectCard
          otherUser={otherUser}
          onViewRouteClick={onViewRouteClick}
        />
      );
    case "sent":
      if (otherUser.outgoingRequest) {
        return (
          <SentCard otherUser={otherUser} onViewRouteClick={onViewRouteClick} />
        );
      }
    case "received":
      if (otherUser.incomingRequest) {
        return (
          <ReceivedCard
            otherUser={otherUser}
            onViewRouteClick={onViewRouteClick}
          />
        );
      }
    default:
      return <Spinner />;
  }
};

export const SidebarContent = (props: SidebarContentProps) => {
  return (
    <div id="scrollableDiv" className="overflow-auto">
      {props.userCardList.length === 0 ? (
        <div className="m-4 text-center text-lg font-light">
          {emptyMessage(props.subType)}
        </div>
      ) : (
        props.userCardList.map((otherUser: EnhancedPublicUser) =>
          renderUserCard(props.subType, otherUser, props.onViewRouteClick)
        )
      )}
    </div>
  );
};
