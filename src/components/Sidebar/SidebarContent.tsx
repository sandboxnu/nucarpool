import React, { useContext } from "react";
import {
  EnhancedPublicUser,
  Message,
  PublicUser,
  User,
} from "../../utils/types";
import Spinner from "../Spinner";
import { ConnectCard } from "../UserCards/ConnectCard";
import { ReceivedCard } from "../UserCards/ReceivedCard";
import { SentCard } from "../UserCards/SentCard";
import {
  getCardSortingData,
  getLatestMessageForRequest,
} from "../../utils/latestMessage";
import { UserContext } from "../../utils/userContext";
import useIsMobile from "../../utils/useIsMobile";

interface SidebarContentProps {
  subType: string;
  userCardList: EnhancedPublicUser[];
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
  disabled: boolean;
  onCardClick: (userId: string) => void;
  selectedUser: EnhancedPublicUser | null;
  onViewRequest: (userId: string) => void;
  mobileSelectedUser?: string | null;
  handleMobileExpand?: (userId?: string) => void;
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
  sent: "You have no current outgoing requests. Send requests to other users through the recommendations sidebar!",
  received: "You have no current incoming requests. Hold tight!",
  all: "You have no incoming or outgoing requests. Send a request or hold tight!",
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
    case "all":
      return disabled ? emptyMessages.disabledReq : emptyMessages.all;
    default:
      return "";
  }
};

const renderUserCard = (
  subType: string,
  otherUser: EnhancedPublicUser,
  onViewRouteClick: (user: User, otherUser: PublicUser) => void,
  onCardClick: (userId: string) => void,
  selectedUser: EnhancedPublicUser | null,
  onViewRequest: (userId: string) => void,
  isUnread: boolean,
  latestMessage: Message | undefined,
  handleMobileExpand?: (userId?: string) => void,
  mobileSelectedUser?: string | null,
): React.JSX.Element => {
  const handleClick = () => onCardClick(otherUser.id);
  switch (subType) {
    case "recommendations":
      return (
        <ConnectCard
          key={otherUser.id}
          otherUser={otherUser}
          onViewRouteClick={onViewRouteClick}
          onViewRequest={onViewRequest}
          handleMobileExpand={handleMobileExpand}
          mobileSelectedUser={mobileSelectedUser}
        />
      );
    case "favorites":
      return (
        <ConnectCard
          key={otherUser.id}
          otherUser={otherUser}
          onViewRouteClick={onViewRouteClick}
          onViewRequest={onViewRequest}
          handleMobileExpand={handleMobileExpand}
          mobileSelectedUser={mobileSelectedUser}
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
            selectedUser={selectedUser}
            isUnread={isUnread}
            latestMessage={latestMessage}
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
            selectedUser={selectedUser}
            isUnread={isUnread}
            latestMessage={latestMessage}
          />
        );
      }
    case "all":
      if (otherUser.incomingRequest) {
        return (
          <ReceivedCard
            key={otherUser.id}
            otherUser={otherUser}
            onViewRouteClick={onViewRouteClick}
            onClick={handleClick}
            selectedUser={selectedUser}
            isUnread={isUnread}
            latestMessage={latestMessage}
          />
        );
      } else if (otherUser.outgoingRequest) {
        return (
          <SentCard
            key={otherUser.id}
            otherUser={otherUser}
            onViewRouteClick={onViewRouteClick}
            onClick={handleClick}
            selectedUser={selectedUser}
            isUnread={isUnread}
            latestMessage={latestMessage}
          />
        );
      }
    default:
      return <Spinner />;
  }
};

export const SidebarContent = (props: SidebarContentProps) => {
  const user = useContext(UserContext);
  const isMobile = useIsMobile();
  if (!user) return null;

  const sortedUserCards = props.userCardList
    .map((otherUser) => {
      const request = otherUser.incomingRequest || otherUser.outgoingRequest;

      if (!request) {
        return { otherUser, isUnread: false, latestActivityDate: new Date(0) };
      }
      const latestMessage = getLatestMessageForRequest(request, user.id);

      const { isUnread, latestActivityDate } = getCardSortingData(
        user.id,
        request,
        latestMessage,
      );

      return { otherUser, isUnread, latestActivityDate, latestMessage };
    })
    .sort((a, b) => {
      return b.latestActivityDate.getTime() - a.latestActivityDate.getTime();
    });

  const filteredSortedUserCards =
    isMobile && props.mobileSelectedUser
      ? sortedUserCards.filter(
          ({ otherUser }) => otherUser.id === props.mobileSelectedUser,
        )
      : sortedUserCards;

  const renderedUserCards = filteredSortedUserCards.map(
    ({ otherUser, isUnread, latestMessage }) =>
      renderUserCard(
        props.subType,
        otherUser,
        props.onViewRouteClick,
        props.onCardClick,
        props.selectedUser,
        props.onViewRequest,
        isUnread,
        !latestMessage ? undefined : latestMessage,
        props.handleMobileExpand,
        props.mobileSelectedUser,
      ),
  );

  return (
    <div className="relative h-full px-3.5">
      <div
        className={`relative h-full ${isMobile && props.mobileSelectedUser === null ? "overflow-y-scroll" : isMobile && props.mobileSelectedUser !== null ? "overflow-hidden" : "overflow-y-scroll"} pb-32 scrollbar scrollbar-track-stone-100 scrollbar-thumb-busy-red scrollbar-track-rounded-full scrollbar-thumb-rounded-full`}
      >
        {props.userCardList.length === 0 ||
        (props.disabled && props.subType !== "favorites") ? (
          <div className="m-4 text-center text-lg font-light">
            {emptyMessage(props.subType, props.disabled)}
          </div>
        ) : (
          renderedUserCards
        )}
      </div>
    </div>
  );
};
