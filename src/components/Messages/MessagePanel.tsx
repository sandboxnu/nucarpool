import React from "react";
import { User, EnhancedPublicUser, Message } from "../../utils/types";
import MessageHeader from "./MessageHeader";
import MessageContent from "./MessageContent";
import SendBar from "./SendBar";

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
  const handleSendMessage = (content: string) => {};

  const handleAcceptRequest = () => {};

  const handleRejectRequest = () => {};
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <MessageHeader
        selectedUser={selectedUser}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
      />
      <MessageContent currentUser={currentUser} messages={messages} />
      <SendBar onSendMessage={handleSendMessage} />
    </div>
  );
};

export default MessagePanel;
