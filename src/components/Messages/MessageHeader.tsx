// MessageHeader.tsx

import React from "react";
import { EnhancedPublicUser } from "../../utils/types";
import { AiOutlineUser } from "react-icons/ai";

interface MessageHeaderProps {
  selectedUser: EnhancedPublicUser;
  onAccept: () => void;
  onReject: () => void;
}

const MessageHeader = ({
  selectedUser,
  onAccept,
  onReject,
}: MessageHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center">
        <AiOutlineUser className="h-10 w-10" rounded-full />

        <span className="text-xl font-semibold">{selectedUser.name}</span>
      </div>
      <div className="flex items-center">
        <button
          onClick={onAccept}
          className="mr-2 rounded bg-northeastern-red px-4 py-2 text-white hover:bg-red-700"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="mr-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Reject
        </button>
        <button className="text-gray-600 hover:text-gray-800">✕</button>
      </div>
    </div>
  );
};

export default MessageHeader;
