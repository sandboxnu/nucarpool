import React, { useEffect, useState } from "react";
import { EnhancedPublicUser } from "../../utils/types";
import { AiOutlineUser } from "react-icons/ai";
import { FiMoreHorizontal } from "react-icons/fi";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import getRouteFromAssetPath from "next/dist/shared/lib/router/utils/get-route-from-asset-path";

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
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const hasIncomingRequest = !!selectedUser.incomingRequest;
  const hasOutgoingRequest = !!selectedUser.outgoingRequest;
  const { data: presignedData, error: presignedError } =
    trpc.user.getPresignedDownloadUrl.useQuery({ userId: selectedUser.id });
  useEffect(() => {
    if (presignedData?.url) {
      setProfileImageUrl(presignedData.url);
    } else {
      setProfileImageUrl("");
    }
  }, [presignedData]);
  const handleClose = (e: React.MouseEvent) => {
    onClose("");
  };
  useEffect(() => {
    setImageLoadError(false);
  }, [profileImageUrl]);
  return (
    <div className="flex items-center justify-between border-b bg-white p-8">
      <div className="flex items-center">
        {profileImageUrl && !imageLoadError ? (
          <Image
            src={profileImageUrl}
            alt={`${selectedUser.preferredName}'s Profile Image`}
            width={80}
            height={80}
            onError={() => setImageLoadError(true)}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <AiOutlineUser className="h-20 w-20 rounded-full bg-gray-200" />
        )}

        <span className="pl-10 font-medium sm:text-lg md:text-xl lg:text-2xl ">
          {selectedUser.preferredName}
        </span>
      </div>
      <div className="flex">
        {hasIncomingRequest && !groupId && (
          <>
            <button
              onClick={onReject}
              className="mr-10 rounded-lg border-2 border-black bg-white py-2 text-center text-lg font-medium  text-black hover:bg-gray-100 sm:px-10 md:px-12 lg:px-20"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              className=" mr-10 rounded-lg bg-northeastern-red  py-2 text-center text-lg font-medium  text-white hover:bg-red-700 sm:px-10 md:px-12 lg:px-20"
            >
              Accept
            </button>
          </>
        )}
        {hasOutgoingRequest && !hasIncomingRequest && !groupId && (
          <button
            onClick={onReject}
            className=" mr-10 rounded-lg border-2 border-black bg-white py-2 text-center text-lg font-medium text-black hover:bg-gray-100 md:px-12 lg:px-20"
          >
            Withdraw Request
          </button>
        )}
        {groupId && (
          <button
            onClick={onReject}
            className=" mr-10 rounded-lg border-2 border-black bg-white py-2 text-center text-lg font-medium text-black hover:bg-gray-100 md:px-12 lg:px-20"
          >
            Leave Conversation
          </button>
        )}

        <button
          onClick={handleClose}
          className="flex h-14 w-14 cursor-pointer items-center  justify-center text-3xl text-black"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default MessageHeader;
