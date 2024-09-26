import React, { useState } from "react";

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
    <div className="flex items-center border-t p-4">
      <textarea
        className="mr-2 flex-1 resize-none rounded border p-2 focus:outline-none"
        rows={1}
        placeholder="Type your message..."
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button
        onClick={handleSend}
        className="rounded bg-northeastern-red px-4 py-2 text-white hover:bg-red-700"
      >
        Send
      </button>
    </div>
  );
};

export default SendBar;
