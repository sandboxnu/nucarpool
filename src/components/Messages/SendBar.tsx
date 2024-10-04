import React, { useRef, useState } from "react";
import Image from "next/image";
import sendIcon from "../../../public/sendIcon.png";

interface SendBarProps {
  onSendMessage: (content: string) => void;
}

const SendBar = ({ onSendMessage }: SendBarProps) => {
  const [messageContent, setMessageContent] = useState("");
  const messageInputRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (messageContent.trim()) {
      onSendMessage(messageContent.trim());
      setMessageContent("");
      if (messageInputRef.current) {
        messageInputRef.current.textContent = "";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-6">
      <div className="mx-10 flex items-center overflow-hidden rounded-lg border bg-gray-100">
        <div
          contentEditable="true"
          className="w-full flex-1 resize-none border-0 bg-gray-100 p-2 text-lg focus:outline-none"
          placeholder="Type a message..."
          ref={messageInputRef}
          style={{
            minHeight: "20px",
            maxHeight: "100px",
            lineHeight: "normal",
            display: "inline-block",
            whiteSpace: "pre-wrap",
            overflowY: "auto",
            overflowWrap: "break-word",
          }}
          onInput={(e) => setMessageContent(e.currentTarget.textContent || "")}
          onKeyDown={handleKeyPress}
        ></div>
        <div className="h-10 w-px bg-gray-300" />
        <button onClick={handleSend} className=" p-2 px-4 pt-3">
          <Image src={sendIcon} alt="Send" width={26} height={26} />
        </button>
      </div>
    </div>
  );
};

export default SendBar;
