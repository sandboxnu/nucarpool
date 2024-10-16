import React, { useContext, useEffect, useRef } from "react";
import { EnhancedPublicUser } from "../../utils/types";
import { format, isSameDay } from "date-fns";
import { trpc } from "../../utils/trpc";
import { UserContext } from "../../utils/userContext";

interface MessageContentProps {
  selectedUser: EnhancedPublicUser;
}

const MessageContent = ({ selectedUser }: MessageContentProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const request = selectedUser.incomingRequest || selectedUser.outgoingRequest;
  const utils = trpc.useContext();
  const user = useContext(UserContext);

  const conversationMessages = request?.conversation?.messages || [];

  const initialMessage = {
    id: "initial",
    content: request?.message || "",
    conversationId: "initial",
    userId: request!.fromUserId,
    dateCreated: request?.dateCreated || new Date(),
    isRead: true,
  };
  let allMessages = [...conversationMessages];

  if (request?.message) {
    allMessages = [initialMessage, ...conversationMessages];
  }

  const markMessagesAsRead = trpc.user.messages.markMessagesAsRead.useMutation({
    onSuccess: () => {
      utils.user.requests.me.invalidate();
    },
    onError: (error) => {
      console.error("Failed to mark messages as read:", error);
    },
  });

  // Effect to mark messages as read when the component mounts
  useEffect(() => {
    if (user) {
      const unreadMessageIds = allMessages
        .filter(
          (message) =>
            !message.isRead &&
            message.userId !== user.id &&
            message.id !== "initial"
        )
        .map((message) => message.id);

      if (unreadMessageIds.length > 0) {
        markMessagesAsRead.mutate({ messageIds: unreadMessageIds });
      }
    }
  }, []);

  // Group messages by date
  const messagesByDate = [];
  let currentDate: Date | null = null;
  let currentMessages: typeof allMessages = [];

  allMessages.forEach((message) => {
    const messageDate = message.dateCreated
      ? new Date(message.dateCreated)
      : new Date();

    if (!currentDate || !isSameDay(currentDate, messageDate)) {
      if (currentMessages.length > 0) {
        messagesByDate.push({ date: currentDate, messages: currentMessages });
      }
      currentDate = messageDate;
      currentMessages = [message];
    } else {
      currentMessages.push(message);
    }
  });

  if (currentMessages.length > 0) {
    messagesByDate.push({ date: currentDate, messages: currentMessages });
  }

  const currentUserId = user?.id;

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto overflow-x-hidden bg-white p-4">
      {messagesByDate.map(({ date, messages }) => (
        <div key={date}>
          <div className="text-md my-2 text-center text-gray-500">
            {date ? format(date, "EEEE, MMMM d, yyyy") : ""}
          </div>
          {messages.map((message) => {
            const isFromCurrentUser = message.userId === currentUserId;
            const messageTime = message.dateCreated
              ? format(new Date(message.dateCreated), "h:mm aa")
              : "";

            return (
              <div
                key={message.id}
                className={`mb-4 flex flex-col ${
                  isFromCurrentUser ? "items-end pr-10" : "items-start pl-10"
                }`}
              >
                <span className="mb-1 text-xs text-gray-500">
                  {messageTime}
                </span>
                <div
                  className={`max-w-[50%] rounded-lg px-4 py-2 text-base
    sm:max-w-[50%] sm:text-sm
    md:max-w-[50%] md:text-base
    lg:max-w-[50%] lg:text-xl
    ${
      isFromCurrentUser
        ? "bg-northeastern-red text-white"
        : "bg-gray-200 text-black"
    }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageContent;
