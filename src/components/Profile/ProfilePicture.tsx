import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { AiOutlineUser } from "react-icons/ai";

interface ProfilePictureProps {
  initialImageUrl?: string;
  onFileSelected: (file: File | null) => void;
}

const ProfilePicture = (props: ProfilePictureProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>(
    props.initialImageUrl || ""
  );
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const imageElement = useRef<HTMLImageElement>(null);
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (imageElement.current && previewUrl) {
      const cropperInstance = new Cropper(imageElement.current, {
        aspectRatio: 1,
        scalable: true,
        cropBoxResizable: true,
      });
      setCropper(cropperInstance);
    }
    return () => {
      cropper?.destroy();
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files?.[0];
    if (newFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(newFile);
      setShowModal(true);
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
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mt-2 block w-full text-sm text-gray-500
          drop-shadow-lg file:mr-4 file:rounded-full
          file:border-0 file:bg-northeastern-red
          file:px-4 file:py-2
          file:text-sm file:font-semibold
          file:text-white hover:file:bg-red-100"
      />
      {previewUrl && showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative mx-auto w-full max-w-xs  rounded bg-white">
            <img
              ref={imageElement}
              src={previewUrl}
              alt="Crop this image"
              style={{ display: "ruby", width: "100%" }}
            />
            <button
              onClick={handleCropClick}
              className="w-full  bg-northeastern-red  font-bold text-white hover:bg-red-700"
            >
              Crop Image
            </button>
          </div>
        </div>
      )}

      {previewUrl ? (
        <div className="h-40 w-40 overflow-hidden rounded-full">
          <Image
            src={croppedImageUrl}
            alt="Cropped Image"
            width={160}
            height={160}
            objectFit="cover"
          />
        </div>
      ) : (
        <AiOutlineUser className="h-40 w-40 rounded-full bg-gray-400" />
      )}
    </div>
  );
};

export default ProfilePicture;
