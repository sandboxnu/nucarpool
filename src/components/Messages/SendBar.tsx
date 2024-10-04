import React, { useState } from "react";
import Image from "next/image";
import sendIcon from "../../../public/sendIcon.png";

interface SendBarProps {
  onSendMessage: (content: string) => void;
}

const SendBar = ({ onSendMessage }: SendBarProps) => {
  const [messageContent, setMessageContent] = useState("");

  const handleSend = () => {
    if (messageContent.trim()) {
      onSendMessage(messageContent.trim());
      setMessageContent("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-6">
      <div className="mx-10 flex items-center overflow-hidden rounded-lg border bg-gray-100">
        <textarea
          className="flex-1 resize-none border-0 bg-gray-100 p-2 text-lg focus:outline-none"
          rows={1}
          placeholder="Type a message..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <div className="h-10 w-px  bg-gray-300" />
        <button onClick={handleSend} className="p-2 px-4 pt-3">
          <Image src={sendIcon} alt="Send" width={26} height={26} />
        </button>
      </div>
    </div>
  );
};

export default SendBar;
