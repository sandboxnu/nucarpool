import { useState, useEffect, useCallback } from "react";
import { trpc } from "./trpc";

const useProfileImage = (userId?: string) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [hasRefetched, setHasRefetched] = useState(false);

  const {
    data: presignedData,
    error: presignedError,
    refetch,
  } = trpc.user.getPresignedDownloadUrl.useQuery(
    { userId },
    { enabled: !profileImageUrl },
  );
  useEffect(() => {
    setProfileImageUrl(null);
    setImageLoadError(false);
    setHasRefetched(false);
  }, [userId]);
  const fetchImageUrl = useCallback(() => {
    if (presignedData?.url && !presignedError) {
      setProfileImageUrl(presignedData.url);
      setImageLoadError(false);
    } else {
      setImageLoadError(true);
      setProfileImageUrl(null);
    }
  }, [presignedData, presignedError]);

  useEffect(() => {
    fetchImageUrl();
  }, [fetchImageUrl]);

  useEffect(() => {
    if (!hasRefetched) {
      const timer = setTimeout(() => {
        refetch()
          .then(() => setHasRefetched(true))
          .catch((error) => {
            console.error("Error refetching profile image:", error);
          });
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [refetch, hasRefetched]);

  return { profileImageUrl, imageLoadError };
};

export default useProfileImage;
