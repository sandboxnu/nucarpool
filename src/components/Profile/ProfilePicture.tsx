import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { AiOutlineUser } from "react-icons/ai";
import { trpc } from "../../utils/trpc";

interface ProfilePictureProps {
  onFileSelected: (file: File | null) => void;
}

const ProfilePicture = (props: ProfilePictureProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const imageElement = useRef<HTMLImageElement>(null);
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Use tRPC to fetch the profile picture URL
  const {
    data: profilePictureData,
    isLoading,
    error,
  } = trpc.user.getPresignedDownloadUrl.useQuery();

  // Update previewUrl when profilePictureData is available
  useEffect(() => {
    if (profilePictureData?.url) {
      setPreviewUrl(profilePictureData.url);
    }
  }, [profilePictureData]);

  // Initialize the cropper when previewUrl changes
  useEffect(() => {
    let cropperInstance: Cropper | null = null;
    if (imageElement.current && previewUrl && showModal) {
      cropperInstance = new Cropper(imageElement.current, {
        aspectRatio: 1,
        scalable: true,
        cropBoxResizable: true,
      });
      setCropper(cropperInstance);
    }
    return () => {
      cropperInstance?.destroy();
      setCropper(null);
    };
  }, [previewUrl, showModal]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files?.[0];
    if (newFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setShowModal(true);
      };
      reader.readAsDataURL(newFile);
    } else {
      props.onFileSelected(null);
    }
  };

  const handleCropClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleCrop();
  };

  const handleCrop = () => {
    const canvas = cropper?.getCroppedCanvas();
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedUrl = URL.createObjectURL(blob);
          setCroppedImageUrl(croppedUrl);
          setShowModal(false);
          const file = new File([blob], "cropped-image.jpeg", {
            type: "image/jpeg",
          });
          props.onFileSelected(file);
        }
      }, "image/jpeg");
    }
  };

  return (
    <div>
      {previewUrl && showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative mx-auto w-full max-w-xs rounded bg-white">
            <img
              ref={imageElement}
              src={previewUrl}
              alt="Crop this image"
              style={{ display: "block", width: "100%" }}
            />
            <button
              onClick={handleCropClick}
              className="w-full bg-northeastern-red font-bold text-white hover:bg-red-700"
            >
              Crop Image
            </button>
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center">
        {croppedImageUrl ? (
          <div className="h-40 w-40 overflow-hidden rounded-full">
            <Image
              src={croppedImageUrl}
              alt="Cropped Image"
              width={160}
              height={160}
              objectFit="cover"
            />
          </div>
        ) : previewUrl ? (
          <div className="h-40 w-40 overflow-hidden rounded-full">
            <Image
              src={previewUrl}
              alt="Profile Picture"
              width={160}
              height={160}
              objectFit="cover"
            />
          </div>
        ) : (
          <AiOutlineUser className="h-40 w-40 rounded-full bg-gray-400" />
        )}

        <div className="ml-4">
          <label
            htmlFor="fileInput"
            className="ml-10 inline-block cursor-pointer rounded-full bg-northeastern-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Upload Profile Picture
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePicture;
