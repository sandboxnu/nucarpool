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
  const [showState, setShowState] = useState<Number>(0);
  const handleSendMessage = (content: string) => {};

  const handleAcceptRequest = () => {};

  const handleRejectRequest = () => {};
  return (
    <div className="flex h-full w-full flex-col bg-transparent ">
      <MessageHeader
        selectedUser={selectedUser}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />
      {showState == 1 ? (
        <>
          <MessageContent currentUser={currentUser} messages={messages} />
          <SendBar onSendMessage={handleSendMessage} />
        </>
      ) : (
        <> </>
      )}
    </div>
  );
};

export default MessagePanel;
