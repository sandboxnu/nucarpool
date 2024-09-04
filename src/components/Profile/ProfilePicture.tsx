import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

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
          setShowModal(true); // Show modal for cropped image
        }
      }, "image/jpeg");
    }
  };

  const confirmCrop = () => {
    const blob = croppedImageUrl
      ? fetch(croppedImageUrl).then((res) => res.blob())
      : null;
    if (blob) {
      const file = new File([blob], "cropped-image.jpeg", {
        type: "image/jpeg",
      });
      props.onFileSelected(file);
    }
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mt-2 block w-full text-sm text-gray-500
          file:mr-4 file:rounded-full file:border-0
          file:bg-violet-50 file:px-4
          file:py-2 file:text-sm
          file:font-semibold file:text-violet-700
          hover:file:bg-violet-100"
      />
      {previewUrl && (
        <div className="relative mx-auto w-full max-w-xs">
          <img
            ref={imageElement}
            src={previewUrl}
            alt="Crop this image"
            style={{ display: "block", width: "100%" }}
          />
          <button
            onClick={handleCropClick}
            className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Crop Image
          </button>
        </div>
      )}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <Image
              src={croppedImageUrl}
              alt="Cropped Image"
              width={200}
              height={200}
              objectFit="contain"
            />
            <button onClick={confirmCrop} className="btn-confirm">
              Confirm
            </button>
            <button onClick={closeModal} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
