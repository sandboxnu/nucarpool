import { useState } from "react";
import Image from "next/image";

interface ProfilePictureProps {
  initialImageUrl?: string;
  onFileSelected: (file: File | null) => void;
}

const ProfilePicture = (props: ProfilePictureProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>(
    props.initialImageUrl || ""
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files?.[0];
    if (newFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(newFile);
      props.onFileSelected(newFile);
    } else {
      props.onFileSelected(null);
    }
  };

  return (
    <div>
      {previewUrl && (
        <div className="profile-picture-preview">
          <Image
            src={previewUrl}
            alt="Profile Picture Preview"
            width={100}
            height={100}
          />
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};

export default ProfilePicture;
