import { useContext, useState } from "react";
import { ButtonInfo, EnhancedPublicUser, PublicUser } from "../../utils/types";
import { UserContext } from "../../utils/userContext";
import { UserCard } from "./UserCard";
import SentRequestModal from "../Modals/SentRequestModal";
import { createPortal } from "react-dom";
import { User } from "@prisma/client";

interface SentCardProps {
  otherUser: EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
}

export const SentCard = (props: SentCardProps): JSX.Element => {
  const user = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  const handleManageSent = () => {
    setShowModal(true);
  };

  const connectButtonInfo: ButtonInfo = {
    text: "Manage",
    onPress: () => handleManageSent(),
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
        props.otherUser.outgoingRequest &&
        createPortal(
          <SentRequestModal
            user={user}
            otherUser={props.otherUser}
            onClose={() => setShowModal(false)}
            req={props.otherUser.outgoingRequest}
          />,
          document.body
        )}
    </>
  );
};
