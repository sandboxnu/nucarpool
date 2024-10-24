import { useState } from "react";
import { useRouter } from "next/router";
import Spinner from "../Spinner";

const InactiveBlocker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleProfileClick = async () => {
    setIsLoading(true);
    await router.push("/profile");
    setIsLoading(false);
  };

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-md">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white ">
          <Spinner />
        </div>
      )}
      <div
        className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-lg"
        role="alert"
        aria-live="assertive"
      >
        <h1 className="mb-4 text-3xl font-bold">You are currently inactive</h1>
        <p className="text-lg font-medium">
          To view and interact with the map, please change your activity status
          in your profile.
        </p>
        <button
          onClick={handleProfileClick}
          className="mt-6 inline-block rounded-lg bg-northeastern-red px-9 py-3 text-lg font-medium text-white hover:bg-red-800"
        >
          Go to Profile
        </button>
      </div>
    </div>
  );
};

export default InactiveBlocker;
