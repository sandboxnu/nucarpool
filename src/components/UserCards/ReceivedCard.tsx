import {
  ButtonInfo,
  EnhancedPublicUser,
  PublicUser,
  User,
} from "../../utils/types";
import { UserCard } from "./UserCard";
import { useContext, useState } from "react";
import { UserContext } from "../../utils/userContext";
import { createPortal } from "react-dom";
import ReceivedRequestModal from "../Modals/ReceivedRequestModal";

interface ReceivedCardProps {
  otherUser: EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
}
export const ReceivedCard = (props: ReceivedCardProps): JSX.Element => {
  const user = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  const handleManageReceived = () => {
    setShowModal(true);
  };

  const connectButtonInfo: ButtonInfo = {
    text: "Manage",
    onPress: () => handleManageReceived(),
    color: "bg-sky-900",
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
        props.otherUser.incomingRequest &&
        createPortal(
          <ReceivedRequestModal
            user={user}
            otherUser={props.otherUser}
            onClose={() => setShowModal(false)}
            req={props.otherUser.incomingRequest}
          />,
          document.body
        )}
    </>
  );
};
