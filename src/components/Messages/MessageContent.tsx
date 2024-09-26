// MessageContent.tsx

import React, { useEffect, useRef } from "react";
import { User, Message, Conversation } from "../../utils/types";
interface MessageContentProps {
  currentUser: User;
  messages: Mess[] | undefined;
}
type Mess = {
  id: string;
  content: string;
  isRead: boolean;
  userId?: string | null;
};

const messages: Mess[] = [
  {
    id: "1",
    content: "Hey, how are you?",
    isRead: true,
    userId: "1", // Message from userId 1
  },
  {
    id: "2",
    content: "I'm good, thanks! How about you?",
    isRead: true,
    userId: "0", // Message from userId 0
  },
  {
    id: "3",
    content: "Doing well, just finishing up some work.",
    isRead: true,
    userId: "1",
  },
  {
    id: "4",
    content: "Nice! What are you working on?",
    isRead: true,
    userId: "0",
  },
  {
    id: "5",
    content: "Just a few React components for a project.",
    isRead: true,
    userId: "1",
  },
  {
    id: "6",
    content: "Sounds interesting!",
    isRead: false,
    userId: "0",
  },
  {
    id: "7",
    content: "Yeah, it’s fun. What about you? Any plans for the weekend?",
    isRead: true,
    userId: "1",
  },
  {
    id: "8",
    content: "Not yet, thinking about going hiking.",
    isRead: true,
    userId: "0",
  },
  {
    id: "9",
    content: "That sounds like a great idea. Have fun!",
    isRead: false,
    userId: "1",
  },
];

const MessageContent = ({ currentUser }: MessageContentProps) => {
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
            message.userId === "0" ? "justify-end pr-20" : "justify-start pl-20"
          }`}
        >
          <div
            className={`max-w-xs rounded-lg px-4 py-2 ${
              message.userId === "0"
                ? "bg-northeastern-red text-white"
                : "bg-gray-300 text-black"
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
