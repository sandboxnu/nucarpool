import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import Spinner from "../Spinner";
import { ButtonInfo } from "../../utils/types";
import { AbstractUserCard } from "./AbstractUserCard";
interface CardProps {
  otherUser: EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
}

const handleConnect = (otherUser: EnhancedPublicUser) => {
  // setModalUser(otherUser);
  if (otherUser.incomingRequest) {
    // setModalType("already-requested");
  } else {
    // setModalType("connect");
  }
};

const handleManageReceived = (otherUser: EnhancedPublicUser) => {
  // setModalUser(otherUser)
  // setModalType("received")
};

const handleManageSent = (otherUser: EnhancedPublicUser) => {
  // setModalUser(otherUser)
  // setModalType("sent")
};

export const ConnectCard = (props: CardProps): JSX.Element => {
  const connectButtonInfo: ButtonInfo = {
    text: "Connect",
    onPress: () => handleConnect(props.otherUser),
    color: "bg-northeastern-red",
  };
  return (
    <AbstractUserCard
      otherUser={props.otherUser}
      rightButton={connectButtonInfo}
      onViewRouteClick={props.onViewRouteClick}
    />
  );
};

export const ReceivedCard = (props: CardProps): JSX.Element => {
  const connectButtonInfo: ButtonInfo = {
    text: "Manage",
    onPress: () => handleManageReceived(props.otherUser),
    color: "bg-sky-900",
  };
  return (
    <AbstractUserCard
      otherUser={props.otherUser}
      rightButton={connectButtonInfo}
      onViewRouteClick={props.onViewRouteClick}
    />
  );
};

export const SentCard = (props: CardProps): JSX.Element => {
  const connectButtonInfo: ButtonInfo = {
    text: "Manage",
    onPress: () => handleManageSent(props.otherUser),
    color: "bg-sky-900",
  };
  return (
    <AbstractUserCard
      otherUser={props.otherUser}
      rightButton={connectButtonInfo}
      onViewRouteClick={props.onViewRouteClick}
    />
  );
};

export const renderUserCard = (
  cardType: string,
  otherUser: EnhancedPublicUser,
  onViewRouteClick: (user: User, otherUser: PublicUser) => void
): JSX.Element => {
  switch (cardType) {
    case "connect":
    case "favorite":
      return (
        <ConnectCard
          otherUser={otherUser}
          onViewRouteClick={onViewRouteClick}
        />
      );
    case "sent":
      return (
        <SentCard otherUser={otherUser} onViewRouteClick={onViewRouteClick} />
      );
    case "received":
      return (
        <ReceivedCard
          otherUser={otherUser}
          onViewRouteClick={onViewRouteClick}
        />
      );
    default:
      return <Spinner />;
  }
};
