// MessageHeader.tsx

import React from "react";
import { EnhancedPublicUser } from "../../utils/types";
import { AiOutlineUser } from "react-icons/ai";
import { FiMoreHorizontal } from "react-icons/fi";

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
        <AiOutlineUser className="h-14 w-14 rounded-full bg-gray-500" />

        <span className="pl-10 text-xl font-semibold">{selectedUser.name}</span>
      </div>
      <div className="flex items-center">
        <button
          onClick={onAccept}
          className="mr-2 rounded-xl bg-northeastern-red px-4 py-2 text-center text-white hover:bg-red-700"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="mr-2 rounded-xl bg-white px-4 py-2 text-center text-black hover:bg-gray-300"
        >
          Reject
        </button>
        <FiMoreHorizontal className="inline-block" />{" "}
      </div>
    </div>
  );
};

export default MessageHeader;
