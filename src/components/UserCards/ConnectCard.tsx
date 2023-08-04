import { useToasts } from "react-toast-notifications";
import {
  User,
  EnhancedPublicUser,
  PublicUser,
  ButtonInfo,
} from "../../utils/types";
import { UserCard } from "./UserCard";
import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import ConnectModal from "../Modals/ConnectModal";
import { UserContext } from "../../utils/userContext";

interface ConnectCardProps {
  otherUser: EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
  onClose?: () => void;
}

export const ConnectCard = (props: ConnectCardProps): JSX.Element => {
  const user = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useToasts();

  const handleExistingReceivedRequest = () => {
    addToast(
      "You already have an incoming carpool request from " +
        props.otherUser.preferredName +
        ". Navigate to the received requests tab to connect with them!",
      { appearance: "info" }
    );
  };

  const handleExistingSentRequest = () => {
    addToast(
      "You already have an incoming carpool request from " +
        props.otherUser.preferredName +
        ". Navigate to the received requests tab to connect with them!",
      { appearance: "info" }
    );
  };

  const handleConnect = (otherUser: EnhancedPublicUser) => {
    if (otherUser.incomingRequest) {
      handleExistingReceivedRequest();
    } else if (otherUser.outgoingRequest) {
      handleExistingSentRequest();
    } else {
      setShowModal(true);
    }
  };

  const onClose = () => {
    props.onClose?.();
    setShowModal(false);
  };

  const connectButtonInfo: ButtonInfo = {
    text: "Connect",
    onPress: () => handleConnect(props.otherUser),
    color: "bg-northeastern-red",
  };
  return (
    <>
      <UserCard
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
            onClose={onClose}
          />,
          document.body
        )}
    </>
  );
};
