import {
  ButtonInfo,
  EnhancedPublicUser,
  PublicUser,
  User,
} from "../../utils/types";
import { getLatestMessageForRequest } from "../../utils/latestMessage";
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

  const handleManageReceived = () => {
    setShowModal(true);
  };

  const latestMessage =
    props.otherUser.incomingRequest && user
      ? getLatestMessageForRequest(props.otherUser.incomingRequest, user.id)
      : null;

  let isUnread = latestMessage ? !latestMessage.isRead : false;
  if (user?.id === latestMessage?.userId) {
    isUnread = false;
  }
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
