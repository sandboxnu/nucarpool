import Link from "next/link";

const InactiveBlocker = () => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-md">
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
        <Link href="/profile">
          <a className="mt-6 inline-block rounded-lg bg-northeastern-red px-6 py-3 font-semibold text-white hover:bg-red-800">
            Go to Profile
          </a>
        </Link>
      </div>
    </div>
  );
};

export default InactiveBlocker;
