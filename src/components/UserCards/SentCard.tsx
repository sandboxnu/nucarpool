import { useContext, useState } from "react";
import { EnhancedPublicUser, Message, PublicUser } from "../../utils/types";
import { UserContext } from "../../utils/userContext";
import { UserCard } from "./UserCard";
import SentRequestModal from "../Modals/SentRequestModal";
import { createPortal } from "react-dom";
import { User } from "@prisma/client";
import React from 'react';

interface SentCardProps {
  otherUser: EnhancedPublicUser;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
  onClick: () => void;
  selectedUser: EnhancedPublicUser | null;
  isUnread: boolean;
  latestMessage?: Message;
}

export const SentCard = (props: SentCardProps): React.JSX.Element => {
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
        props.otherUser.outgoingRequest &&
        createPortal(
          <SentRequestModal
            user={user}
            otherUser={props.otherUser}
            onClose={() => setShowModal(false)}
            req={props.otherUser.outgoingRequest}
          />,
          document.body,
        )}
    </>
  );
};
