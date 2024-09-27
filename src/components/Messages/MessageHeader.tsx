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
      <div className="flex   ">
        <button
          onClick={onAccept}
          className="mr-2 rounded-lg bg-northeastern-red px-8  text-center text-white hover:bg-red-700"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="mr-2 rounded-lg border-2 border-black  bg-white px-8 text-center text-black hover:bg-gray-300"
        >
          Reject
        </button>
        <FiMoreHorizontal className="j  inline-block h-10 w-20 space-x-10 justify-self-end" />{" "}
      </div>
    </div>
  );
};

export default MessageHeader;
