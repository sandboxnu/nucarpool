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
  onClick: () => void;
  selectedUser: EnhancedPublicUser | null;
}
export const ReceivedCard = (props: ReceivedCardProps): JSX.Element => {
  const user = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  console.log(props.selectedUser);

  const handleManageReceived = () => {
    setShowModal(true);
  };

  // TODO: Need to create a leftButton props for UserCard component so that each card can have custom things

  const connectButtonInfo: ButtonInfo = {
    text: "Manage",
    onPress: () => handleManageReceived(),
    color: "bg-northeastern-red",
  };
  return (
    <>
      <div onClick={props.onClick} className="cursor-pointer">
        <UserCard
          otherUser={props.otherUser}
          message={props.otherUser.outgoingRequest?.message}
          classname={
            props.selectedUser?.id === props.otherUser.id
              ? "border-l-northeastern-red drop-shadow-lg"
              : ""
          }
        />
      </div>
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
