import React from "react";
import { EnhancedPublicUser } from "../../utils/types";
import { AiOutlineUser } from "react-icons/ai";
import Image from "next/image";
import useProfileImage from "../../utils/useProfileImage";
import useIsMobile from "../../utils/useIsMobile";

interface MessageHeaderProps {
  selectedUser: EnhancedPublicUser;
  onAccept: () => void;
  onReject: () => void;
  onClose: (userId: string) => void;
  groupId: string | null;
}

const MessageHeader = ({
  selectedUser,
  onAccept,
  onReject,
  onClose,
  groupId,
}: MessageHeaderProps) => {
  const hasIncomingRequest = !!selectedUser.incomingRequest;
  const hasOutgoingRequest = !!selectedUser.outgoingRequest;

  const ismobile = useIsMobile();

  const handleClose = () => {
    onClose("");
  };
  const { profileImageUrl, imageLoadError } = useProfileImage(selectedUser.id);

  if (ismobile) {
    return (
      <div className="relative flex items-center border-b bg-white py-4">
        <button className="absolute left-4 text-gray-600" onClick={handleClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="w-full text-center">
          <span className="pl-10 pr-10 font-montserrat font-semibold sm:text-lg md:text-xl lg:text-2xl">
            {selectedUser.preferredName}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b bg-white p-8">
      <div className="flex items-center">
        {profileImageUrl && !imageLoadError ? (
          <Image
            src={profileImageUrl}
            alt={`${selectedUser.preferredName}'s Profile Image`}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-contain"
          />
        ) : (
          <AiOutlineUser className="h-20 w-20 rounded-full bg-gray-200" />
        )}

        <span className="pl-10 pr-10 font-montserrat font-semibold sm:text-lg md:text-xl lg:text-2xl ">
          {selectedUser.preferredName}
        </span>
      </div>
      <div className="relative flex items-center justify-between">
        {(hasIncomingRequest && (!groupId || selectedUser.carpoolId !== groupId)) && (
          <>
            <button
              onClick={onReject}
              className="mr-10 rounded-lg border-2 border-black bg-white py-2 text-center text-lg font-medium  text-black hover:bg-gray-100 sm:px-8 md:px-12 lg:px-20"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              className=" mr-10 rounded-lg border-2 border-northeastern-red bg-northeastern-red py-2 text-center text-lg font-medium  text-white hover:bg-red-700 sm:px-8 md:px-12 lg:px-20"
            >
              Accept
            </button>
          </>
        )}
        {hasOutgoingRequest && !hasIncomingRequest && (!groupId || selectedUser.carpoolId !== groupId) && (
          <button
            onClick={onReject}
            className=" mr-10 rounded-lg border-2 border-black bg-white py-2 text-center text-lg font-medium text-black hover:bg-gray-100 md:px-12 lg:px-20"
          >
            Withdraw Request
          </button>
        )}
        {groupId && selectedUser.carpoolId === groupId && (
          <button
            onClick={onReject}
            className=" mr-10 rounded-lg border-2 border-black bg-white py-2 text-center text-lg font-medium text-black hover:bg-gray-100 md:px-12 lg:px-20"
          >
            Leave Conversation
          </button>
        )}

        <button
          onClick={handleClose}
          className=" h-14 w-14 cursor-pointer items-center  justify-center text-3xl text-black"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default MessageHeader;
