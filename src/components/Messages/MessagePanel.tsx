import React, { useState } from "react";
import { User, EnhancedPublicUser, Message } from "../../utils/types";
import MessageHeader from "./MessageHeader";
import MessageContent from "./MessageContent";
import SendBar from "./SendBar";
import { HeaderOptions } from "../Header";

interface MessagePanelProps {
  currentUser: User;
  selectedUser: EnhancedPublicUser;
  messages: Message[] | undefined;
}

const MessagePanel = ({
  currentUser,
  selectedUser,
  messages,
}: MessagePanelProps) => {
  const [showState, setShowState] = useState<Number>(1);
  const handleSendMessage = (content: string) => {};

  const handleAcceptRequest = () => {};
  const clickHandler = () => {
    if (showState) {
      setShowState(0);
    } else {
      setShowState(1);
    }
  };

  const handleRejectRequest = () => {};
  let className = "bg-white";
  if (showState == 0) {
    className = "bg-transparent ";
  }
  return (
    <div className={"flex h-full w-full   flex-col "}>
      <button className="pointer-events-auto" onClick={clickHandler}>
        {" "}
        Map
      </button>
      <MessageHeader
        selectedUser={selectedUser}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />
      {showState == 1 ? (
        <div className={className + " pointer-events-none"}>
          <MessageContent currentUser={currentUser} messages={messages} />
          <SendBar onSendMessage={handleSendMessage} />
        </div>
      ) : (
        <> </>
      )}
    </div>
  );
};

export default MessagePanel;
