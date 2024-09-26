// MessageContent.tsx

import React, { useEffect, useRef } from "react";
import { User, Message } from "../../utils/types";

interface MessageContentProps {
  currentUser: User;
  messages: Message[] | undefined;
}

const MessageContent = ({ currentUser, messages }: MessageContentProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-white p-4">
      {messages?.map((message) => (
        <div
          key={message.id}
          className={`mb-4 flex ${
            message.userId === currentUser.id ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-xs rounded-lg px-4 py-2 ${
              message.userId === currentUser.id
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageContent;
