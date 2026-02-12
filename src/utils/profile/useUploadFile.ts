import { trpc } from "../trpc";

export const useUploadFile = (selectedFile: File | null) => {
  const { data: presignedData, error } = trpc.user.getPresignedUrl.useQuery(
    {
      contentType: selectedFile?.type || "",
    },
    { enabled: !!selectedFile },
  );
  const uploadFile = async () => {
    if (presignedData?.url && selectedFile) {
      const url = presignedData.url;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }
    }
  };

  return { uploadFile, error };
};
