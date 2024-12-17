import React, { useState, useContext, useEffect } from "react";
import { EnhancedPublicUser, PublicUser } from "../../utils/types";
import MessageHeader from "./MessageHeader";
import MessageContent from "./MessageContent";
import SendBar from "./SendBar";
import { trpc } from "../../utils/trpc";
import { createRequestHandlers } from "../../utils/requestHandlers";
import { UserContext } from "../../utils/userContext";
import { User } from "@prisma/client";
import { toast } from "react-toastify";
import { trackRequestResponse } from "../../utils/mixpanel";

interface MessagePanelProps {
  selectedUser: EnhancedPublicUser;
  onMessageSent: (selectedUserId: string) => void;
  onCloseConversation: (userId: string) => void;
  onViewRouteClick: (user: User, otherUser: PublicUser) => void;
}

const MessagePanel = ({
  selectedUser,
  onMessageSent,
  onCloseConversation,
  onViewRouteClick,
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

  const { mutate: sendMessageNotification } =
    trpc.user.emails.sendMessageNotification.useMutation({
      onError: (error: any) => {
        toast.error(`Something went wrong: ${error.message}`);
      },
      onSuccess() {
        console.log("Message notification email sent successfully");
      },
    });

  const handleSendMessage = (content: string) => {
    const requestId =
      selectedUser.incomingRequest?.id || selectedUser.outgoingRequest?.id;
    if (!requestId) return;

    sendMessage.mutate({ requestId, content });

    // Send email notification
    if (user && user.email && selectedUser.email) {
      sendMessageNotification({
        senderName: user.preferredName || "",
        senderEmail: user.email,
        receiverName: selectedUser.preferredName || "",
        receiverEmail: selectedUser.email,
        messageText: content,
      });
    } else {
      console.error(
        "Unable to send message notification: Missing email address"
      );
    }
  };

  const { mutate: sendAcceptanceNotification } =
    trpc.user.emails.sendAcceptanceNotification.useMutation({
      onError: (error: any) => {
        toast.error(`Failed to send acceptance notification: ${error.message}`);
      },
      onSuccess() {
        console.log("Acceptance notification email sent successfully");
      },
    });

  const handleAccept = async () => {
    if (!user || !selectedUser) return;

    const request = selectedUser.incomingRequest;
    if (!request) return;

    trackRequestResponse('accept', user.role);
    
    await handleAcceptRequest(user, selectedUser, request);

    // Send acceptance notification email
    if (user.email && selectedUser.email) {
      sendAcceptanceNotification({
        senderName: user.preferredName || "",
        senderEmail: user.email,
        receiverName: selectedUser.preferredName || "",
        receiverEmail: selectedUser.email,
        isDriver: user.role === "DRIVER",
      });
    } else {
      console.error(
        "Unable to send acceptance notification: Missing email address"
      );
    }

    onCloseConversation(""); // Close the conversation after accepting
  };

  const handleReject = async () => {
    if (!user || !selectedUser) return;

    const request =
      selectedUser.incomingRequest || selectedUser.outgoingRequest;
    if (!request) return;

    trackRequestResponse('decline', user.role);

    await handleRejectRequest(user, selectedUser, request);
  };
  const handleMapSwitch = () => {
    setActiveTab("map");
  };
  useEffect(() => {
    if (user && selectedUser && activeTab === "map") {
      onViewRouteClick(user, selectedUser);
    }
  }, [user, selectedUser, activeTab, onViewRouteClick]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header and Tabs */}
      <div className="pointer-events-auto">
        <MessageHeader
          selectedUser={selectedUser}
          onAccept={handleAccept}
          onReject={handleReject}
          onClose={onCloseConversation}
          groupId={user!.carpoolId}
        />

        {/* Tab Strip */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            className={`flex-1 py-3 text-center text-lg font-medium ${
              activeTab === "message"
                ? "border-b-2 border-northeastern-red text-northeastern-red"
                : ""
            }`}
            onClick={() => setActiveTab("message")}
          >
            Message
          </button>
          <button
            className={` flex-1 py-3 text-center text-lg font-medium ${
              activeTab === "map"
                ? "border-b-2 border-northeastern-red text-northeastern-red"
                : ""
            }`}
            onClick={() => handleMapSwitch()}
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
