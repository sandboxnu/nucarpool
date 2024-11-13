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
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const imageElement = useRef<HTMLImageElement>(null);
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const [showModal, setShowModal] = useState(false);

  // fetch the profile picture URL
  const {
    data: profilePictureData,
    isLoading,
    error,
  } = trpc.user.getPresignedDownloadUrl.useQuery({ userId: undefined });

  // Update previewUrl when profilePictureData is available
  useEffect(() => {
    if (profilePictureData?.url) {
      setPreviewUrl(profilePictureData.url);
    }
  }, [profilePictureData]);

  // Reset imageLoadError when the image URLs change
  useEffect(() => {
    setImageLoadError(false);
  }, [croppedImageUrl, previewUrl]);

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

  const modalContentRef = useRef<HTMLDivElement>(null);

  // use effect for modal click
  useEffect(() => {
    if (showModal) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          modalContentRef.current &&
          !modalContentRef.current.contains(event.target as Node)
        ) {
          setShowModal(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showModal]);

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
          <div
            ref={modalContentRef}
            className="relative mx-auto inline-block rounded bg-white text-center"
          >
            <img
              ref={imageElement}
              src={previewUrl}
              alt="Crop this image"
              style={{ display: "block", maxWidth: "50vw", maxHeight: "50vh" }}
            />
            <button
              onClick={handleCropClick}
              className="w-full rounded-b bg-northeastern-red p-2 text-white hover:bg-red-700"
            >
              Crop Image
            </button>
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center">
        {croppedImageUrl && !imageLoadError ? (
          <div className="h-40 w-40 overflow-hidden rounded-full">
            <Image
              src={croppedImageUrl}
              alt="Cropped Image"
              width={160}
              height={160}
              objectFit="cover"
              onError={() => setImageLoadError(true)}
            />
          </div>
        ) : previewUrl && !imageLoadError ? (
          <div className="h-40 w-40 overflow-hidden rounded-full">
            <Image
              src={previewUrl}
              alt="Index Picture"
              width={160}
              height={160}
              objectFit="cover"
              onError={() => setImageLoadError(true)}
            />
          </div>
        ) : (
          <AiOutlineUser className="h-40 w-40 rounded-full bg-gray-400" />
        )}

        <div className="ml-4">
          <label
            htmlFor="fileInput"
            className="text-md ml-10 inline-block cursor-pointer rounded-full bg-northeastern-red px-4 py-2  text-white hover:bg-red-700"
          >
            Upload Index Picture
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
