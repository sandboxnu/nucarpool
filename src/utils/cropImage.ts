export default function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: any,
) {
  return new Promise<{ file: File; url: string }>((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return reject(new Error("Failed to get canvas context"));
      }

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "cropped-image.jpeg", {
              type: "image/jpeg",
            });
            const url = URL.createObjectURL(blob);
            resolve({ file, url });
          } else {
            reject(new Error("Canvas is empty"));
          }
        },
        "image/jpeg",
        0.7,
      );
    };

    image.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
}
