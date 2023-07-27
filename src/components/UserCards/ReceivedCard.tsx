import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import Spinner from "../Spinner";
import { ButtonInfo } from "../../utils/types";
import { AbstractUserCard } from "./UserCard";
import { CardProps, ConnectCard } from "./ConnectCard";
import { SentCard } from "./SentCard";
import { useContext, useState } from "react";
import { UserContext } from "../../utils/userContext";
import { createPortal } from "react-dom";
import ReceivedRequestModal from "../Modals/ReceivedRequestModal";

export const ReceivedCard = (props: CardProps): JSX.Element => {
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
      <AbstractUserCard
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
