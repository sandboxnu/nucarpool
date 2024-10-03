import React, { useState, useContext } from "react";
import { EnhancedPublicUser } from "../../utils/types";
import MessageHeader from "./MessageHeader";
import MessageContent from "./MessageContent";
import SendBar from "./SendBar";
import { trpc } from "../../utils/trpc";
import { createRequestHandlers } from "../../utils/requestHandlers";
import { UserContext } from "../../utils/userContext";

interface MessagePanelProps {
  selectedUser: EnhancedPublicUser;
  onMessageSent: (selectedUserId: string) => void;
  onCloseConversation: () => void;
}

const MessagePanel = ({
  selectedUser,
  onMessageSent,
  onCloseConversation,
}: MessagePanelProps) => {
  const [activeTab, setActiveTab] = useState<"message" | "map">("message");
  const utils = trpc.useContext();
  const user = useContext(UserContext);

  // Create request handlers
  const { handleAcceptRequest, handleRejectRequest } =
    createRequestHandlers(utils);

  const sendMessage = trpc.user.messages.sendMessage.useMutation({
    onSuccess: () => {
      onMessageSent(selectedUser.id);
    },
  });

  const handleSendMessage = (content: string) => {
    const requestId =
      selectedUser.incomingRequest?.id || selectedUser.outgoingRequest?.id;
    if (!requestId) return;

    sendMessage.mutate({ requestId, content });
  };

  const handleAccept = async () => {
    if (!user || !selectedUser) return;

    const request = selectedUser.incomingRequest;
    if (!request) return;

    await handleAcceptRequest(user, selectedUser, request);
    onCloseConversation(); // Close the conversation if needed
  };

  const handleReject = async () => {
    if (!user || !selectedUser) return;

    const request =
      selectedUser.incomingRequest || selectedUser.outgoingRequest;
    if (!request) return;

    await handleRejectRequest(user, selectedUser, request);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header and Tabs */}
      <div className="pointer-events-auto">
        <MessageHeader
          selectedUser={selectedUser}
          onAccept={handleAccept}
          onReject={handleReject}
        />

        {/* Tab Strip */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            className={`font-md flex-1 py-2 text-center text-lg ${
              activeTab === "message"
                ? "border-b-2 border-northeastern-red text-northeastern-red"
                : ""
            }`}
            onClick={() => setActiveTab("message")}
          >
            Message
          </button>
          <button
            className={`font-md flex-1 py-2 text-center text-lg ${
              activeTab === "map"
                ? "border-b-2 border-northeastern-red text-northeastern-red"
                : ""
            }`}
            onClick={() => setActiveTab("map")}
          >
            Map
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "message" && (
        <div className="pointer-events-auto flex h-0 flex-1 flex-col bg-white">
          <MessageContent selectedUser={selectedUser} />
          <SendBar onSendMessage={handleSendMessage} />
        </div>
      )}
    </div>
  );
};

export default MessagePanel;
