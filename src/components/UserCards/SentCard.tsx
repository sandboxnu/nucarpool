import { useContext, useState } from "react";
import { ButtonInfo, EnhancedPublicUser, PublicUser } from "../../utils/types";
import { UserContext } from "../../utils/userContext";
import { UserCard } from "./UserCard";
import SentRequestModal from "../Modals/SentRequestModal";
import { createPortal } from "react-dom";
import { User } from "@prisma/client";
import { getLatestMessageForRequest } from "../../utils/latestMessage";

interface SentCardProps {
  otherUser: EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
  onClick: () => void;
  selectedUser: EnhancedPublicUser | null;
}

export const SentCard = (props: SentCardProps): JSX.Element => {
  const user = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  const handleManageSent = () => {
    setShowModal(true);
  };
  const latestMessage =
    props.otherUser.outgoingRequest && user
      ? getLatestMessageForRequest(props.otherUser.outgoingRequest, user.id)
      : null;

  const isUnread = latestMessage ? !latestMessage.isRead : false;
  const connectButtonInfo: ButtonInfo = {
    text: "Manage",
    onPress: () => handleManageSent(),
    color: "bg-northeastern-red",
  };
  console.log(latestMessage);
  return (
    <>
      <div onClick={props.onClick} className="cursor-pointer">
        <UserCard
          otherUser={props.otherUser}
          message={latestMessage?.content}
          isUnread={isUnread}
          classname={
            props.selectedUser?.id === props.otherUser.id
              ? "border-l-northeastern-red drop-shadow-lg"
              : ""
          }
        />
      </div>
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
