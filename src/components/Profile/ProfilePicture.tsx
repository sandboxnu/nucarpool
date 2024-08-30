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
  const imageElement = useRef<HTMLImageElement>(null);
  const [cropper, setCropper] = useState<Cropper | null>(null);

  useEffect(() => {
    if (imageElement.current && previewUrl) {
      const cropperInstance = new Cropper(imageElement.current, {
        aspectRatio: 1,
        scalable: true,
        cropBoxResizable: true,
        crop: () => {
          const canvas = cropperInstance.getCroppedCanvas();
          if (canvas) {
            canvas.toBlob((blob) => {
              if (blob) {
                const file = new File([blob], "cropped-image.jpeg", {
                  type: "image/jpeg",
                });
                props.onFileSelected(file);
              }
            }, "image/jpeg");
          }
        },
      });
      setCropper(cropperInstance);
    }

    return () => {
      if (cropper) {
        cropper.destroy();
      }
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

  return (
    <div>
      {previewUrl && (
        <div className="relative mx-auto w-full max-w-xs">
          <Image
            src={previewUrl}
            alt="Crop this image"
            layout="fill"
            objectFit="contain"
          />
          <img
            ref={imageElement}
            src={previewUrl}
            alt="Hidden crop target"
            style={{ display: "none" }}
          />
        </div>
      )}
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
    </div>
  );
};

export default ProfilePicture;
