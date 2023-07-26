import { useToasts } from "react-toast-notifications";
import {
  User,
  EnhancedPublicUser,
  PublicUser,
  ButtonInfo,
} from "../../utils/types";
import { AbstractUserCard } from "./AbstractUserCard";
import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import ConnectModal from "../Modals/ConnectModal";
import { UserContext } from "../../utils/userContext";

export interface CardProps {
  otherUser: EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
}

export const ConnectCard = (props: CardProps): JSX.Element => {
  const user = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToasts();

  const handleExistingRequest = () => {
    addToast(
      "You already have an incoming carpool request from " +
        props.otherUser +
        ". Navigate to the received requests tab to connect with them!",
      { appearance: "info" }
    );
  };

  const handleConnect = (otherUser: EnhancedPublicUser) => {
    if (otherUser.incomingRequest) {
      handleExistingRequest();
    } else {
      setShowModal(true);
    }
  };

  const connectButtonInfo: ButtonInfo = {
    text: "Connect",
    onPress: () => handleConnect(props.otherUser),
    color: "bg-northeastern-red",
  };
  return (
    <>
      <AbstractUserCard
        otherUser={props.otherUser}
        rightButton={connectButtonInfo}
        onViewRouteClick={props.onViewRouteClick}
      />
      {showModal &&
        user &&
        createPortal(
          <ConnectModal
            user={user}
            otherUser={props.otherUser}
            onClose={() => setShowModal(false)}
          />,
          document.body
        )}
    </>
  );
};
