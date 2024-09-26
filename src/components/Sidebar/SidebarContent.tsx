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
  disabled: boolean;
  onCardClick: (user: EnhancedPublicUser) => void;
}

const emptyMessages = {
  recommendations: `We're unable to find any recommendations for you right now.
  We recommend reviewing your profile to make sure all information you've entered is accurate!`,
  disabledReq:
    "You are currently in Viewer mode, switch to Rider or Driver in profile to view Requests.",
  disabledRec:
    "You are currently in Viewer mode, to get recommendations select Driver or Rider in profile.",
  favorites: `You have no users currently favorited.
  Click the star icon on the upper-right side of a user's card to add them to your favorites!`,
  sent: "You have no current outgoing requests. Sent requests to other users through the recommendations dashbaord!",
  received: "You have no current incoming requests. Hold tight!",
};

const emptyMessage = (card: string, disabled: boolean): string => {
  switch (card) {
    case "recommendations":
      return disabled
        ? emptyMessages.disabledRec
        : emptyMessages.recommendations;
    case "favorites":
      return emptyMessages.favorites;
    case "sent":
      return disabled ? emptyMessages.disabledReq : emptyMessages.sent;
    case "received":
      return disabled ? emptyMessages.disabledReq : emptyMessages.received;
    default:
      return "";
  }
};

const renderUserCard = (
  subType: string,
  otherUser: EnhancedPublicUser,
  onViewRouteClick: (user: User, otherUser: PublicUser) => void,
  onCardClick: (user: EnhancedPublicUser) => void
): JSX.Element => {
  const handleClick = () => onCardClick(otherUser);
  switch (subType) {
    case "recommendations":
      return (
        <ConnectCard
          key={otherUser.id}
          otherUser={otherUser}
          onViewRouteClick={onViewRouteClick}
        />
      );
    case "favorites":
      return (
        <ConnectCard
          key={otherUser.id}
          otherUser={otherUser}
          onViewRouteClick={onViewRouteClick}
        />
      );
    case "sent":
      if (otherUser.outgoingRequest) {
        return (
          <SentCard
            key={otherUser.id}
            otherUser={otherUser}
            onViewRouteClick={onViewRouteClick}
            onClick={handleClick}
          />
        );
      }
    case "received":
      if (otherUser.incomingRequest) {
        return (
          <ReceivedCard
            key={otherUser.id}
            otherUser={otherUser}
            onViewRouteClick={onViewRouteClick}
            onClick={handleClick}
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
      {props.userCardList.length === 0 ||
      (props.disabled && props.subType !== "favorites") ? (
        <div className="m-4 text-center text-lg font-light">
          {emptyMessage(props.subType, props.disabled)}
        </div>
      ) : (
        props.userCardList.map((otherUser: EnhancedPublicUser) =>
          renderUserCard(
            props.subType,
            otherUser,
            props.onViewRouteClick,
            props.onCardClick
          )
        )
      )}
    </div>
  );
};
