import React, { useState, useCallback, ReactNode } from "react";
import Image from "next/image";
import Cropper, { Point } from "react-easy-crop";
import { AiOutlineUser } from "react-icons/ai";
import getCroppedImg from "../../utils/cropImage";
import useProfileImage from "../../utils/useProfileImage";
import { createPortal } from "react-dom";
interface ProfilePictureProps {
  onFileSelected: (file: File | null) => void;
}
const ProfilePicture = ({ onFileSelected }: ProfilePictureProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);

  const [croppedArea, setCroppedArea] = useState();

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const { profileImageUrl, imageLoadError } = useProfileImage();

  const onCropComplete = useCallback(
    (croppedAreaPercentage: any, croppedAreaPixels: any) => {
      setCroppedArea(croppedAreaPercentage);
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleCancel = () => {
    setImageSrc("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMinZoom(1);
    setCroppedArea(undefined);
    setCroppedAreaPixels(null);
    setShowModal(false);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setShowModal(true);
    } else {
      onFileSelected(null);
    }
  };

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const { file, url } = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImageUrl(url);
      onFileSelected(file);
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const readFile = (file: File): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.readAsDataURL(file);
    });
  };
  const onMediaLoaded = useCallback(
    (mediaSize: { naturalWidth: number; naturalHeight: number }) => {
      const { naturalWidth, naturalHeight } = mediaSize;
      const cropWidth = 300;
      const cropHeight = 300;

      // Calculate minZoom to ensure the entire image fits into area but doesn't extend outside of it
      const widthRatio = cropWidth / naturalWidth;
      const heightRatio = cropHeight / naturalHeight;

      let newMinZoom = Math.min(widthRatio, heightRatio);
      if (widthRatio < 1 || heightRatio < 1) {
        // automatically scales to fit
        newMinZoom = 1;
      }
      setMinZoom(newMinZoom);
      setZoom(newMinZoom);

      setCrop({ x: 0, y: 0 }); // ReCenter
    },
    [],
  );
  const onCropChange = useCallback(
    (newCrop: Point) => {
      const boundedCrop = { x: newCrop.x, y: newCrop.y };
      const cropWidth = 300;
      const cropHeight = 300;
      const midWidth = cropWidth / 2;
      const midHeight = cropHeight / 2;
      const zoomIncrease = (zoom - minZoom) / minZoom;

      let maxHorizontalMovement = zoomIncrease * midWidth + midWidth;
      let maxVerticalMovement = zoomIncrease * midHeight + midHeight;

      boundedCrop.x = Math.min(
        Math.max(boundedCrop.x, -maxHorizontalMovement),
        maxHorizontalMovement,
      );

      boundedCrop.y = Math.min(
        Math.max(boundedCrop.y, -maxVerticalMovement),
        maxVerticalMovement,
      );

      setCrop(boundedCrop);
    },
    [zoom, minZoom],
  );

  return (
    <>
      {showModal &&
        imageSrc &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-8 border-gray-400 bg-white">
              <div className="relative h-96 w-full">
                <Cropper
                  image={imageSrc}
                  minZoom={minZoom}
                  maxZoom={10}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  showGrid={false}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  onMediaLoaded={onMediaLoaded}
                  cropSize={{ width: 300, height: 300 }}
                  cropShape="round"
                  restrictPosition={false}
                  objectFit="contain"
                  onCropChange={onCropChange}
                />
              </div>
              <div className="flex w-full items-stretch justify-between p-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mr-2 rounded-lg bg-gray-300 px-8 py-2 font-montserrat text-lg text-black"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCrop}
                  className="rounded-lg bg-northeastern-red px-8 py-2 font-montserrat text-lg text-white hover:bg-red-700"
                >
                  Crop Image
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <div className="mt-2 flex items-center">
        {croppedImageUrl ? (
          <div className="relative h-40 w-40 overflow-hidden rounded-full flex-shrink-0">
            <Image
              src={croppedImageUrl}
              alt="Cropped Image"
              layout="fill"
              objectFit="cover"
            />
          </div>
        ) : profileImageUrl && !imageLoadError ? (
          <div className="relative h-40 w-40 items-center justify-center overflow-hidden rounded-full flex-shrink-0">
            <Image
              src={profileImageUrl}
              alt="Profile Picture"
              objectFit="cover"
              layout="fill"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 w-40 rounded-full bg-gray-400 overflow-hidden flex-shrink-0">
            <AiOutlineUser className="h-28 w-28 text-white" />
          </div>
        )}

        <div className="ml-4">
          <label
            htmlFor="fileInput"
            className="border-1 ml-10 inline-block cursor-pointer rounded-lg border border-black bg-northeastern-red px-4 py-2 font-montserrat text-xl text-white hover:bg-red-700"
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
    </>
  );
};

export default ProfilePicture;
