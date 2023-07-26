import { useContext, useState } from "react";
import { ButtonInfo, EnhancedPublicUser } from "../../utils/types";
import { UserContext } from "../../utils/userContext";
import { AbstractUserCard } from "./AbstractUserCard";
import { CardProps } from "./ConnectCard";
import SentRequestModal from "../Modals/SentRequestModal";
import { createPortal } from "react-dom";

export const SentCard = (props: CardProps): JSX.Element => {
  const user = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  const handleManageSent = (otherUser: EnhancedPublicUser) => {
    setShowModal(true);
  };

  const connectButtonInfo: ButtonInfo = {
    text: "Manage",
    onPress: () => handleManageSent(props.otherUser),
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
        createPortal(
          <SentRequestModal
            user={user}
            otherUser={props.otherUser}
            onClose={() => setShowModal(false)}
          />,
          document.body
        )}
    </>
  );
};
