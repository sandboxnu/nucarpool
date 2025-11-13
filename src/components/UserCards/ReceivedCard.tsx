import { EnhancedPublicUser, PublicUser, User } from "../../utils/types";
import { UserCard } from "./UserCard";
import { useEffect, useContext, useState } from "react";
import { UserContext } from "../../utils/userContext";
import { createPortal } from "react-dom";
import ReceivedRequestModal from "../Modals/ReceivedRequestModal";
import { Message } from "../../utils/types";
import React from 'react';

interface ReceivedCardProps {
  otherUser: EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
  onClick: () => void;
  selectedUser: EnhancedPublicUser | null;
  isUnread: boolean;
  latestMessage?: Message;
}
export const ReceivedCard = (props: ReceivedCardProps): React.JSX.Element => {
  const user = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div onClick={props.onClick} className="cursor-pointer">
        <UserCard
          otherUser={props.otherUser}
          message={props.latestMessage?.content}
          isUnread={props.isUnread}
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
          document.body,
        )}
    </>
  );
};
