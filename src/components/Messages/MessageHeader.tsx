import React, { useEffect, useState } from "react";
import { EnhancedPublicUser } from "../../utils/types";
import { AiOutlineUser } from "react-icons/ai";
import { FiMoreHorizontal } from "react-icons/fi";
import { trpc } from "../../utils/trpc";
import Image from "next/image";

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
        {hasIncomingRequest && (
          <>
            <button
              onClick={onReject}
              className="mr-10 rounded-lg border-2 border-black bg-white px-20 py-2 text-center text-lg font-medium text-black hover:bg-gray-100"
            >
              Reject
            </button>
            <button
              onClick={onAccept}
              className="mr-10 rounded-lg bg-northeastern-red px-20 py-2 text-center text-lg font-medium text-white hover:bg-red-700"
            >
              Accept
            </button>
          </>
        )}
        {hasOutgoingRequest && !hasIncomingRequest && (
          <button
            onClick={onReject}
            className="mr-10 rounded-lg border-2 border-black bg-white px-20 py-2 text-center text-lg font-medium text-black hover:bg-gray-100"
          >
            Withdraw Request
          </button>
        )}

        <FiMoreHorizontal className="inline-block h-10 w-10" />
      </div>
    </div>
  );
};

export default MessageHeader;
