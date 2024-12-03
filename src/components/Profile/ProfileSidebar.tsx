import React from "react";
import Image from "next/image";

type ProfileSidebarProps = {
  option: "user" | "carpool" | "account";
  setOption: React.Dispatch<
    React.SetStateAction<"user" | "carpool" | "account">
  >;
};

const ProfileSidebar = ({ option, setOption }: ProfileSidebarProps) => {
  const baseButton =
    "px-4 py-2 flex gap-2 text-northeastern-red font-montserrat text-xl  ";
  const selectedButton = " font-bold ";
  return (
    <div className="h-full w-full  ">
      <div className="mt-6 flex flex-col items-start gap-4 text-center lg:items-center  lg:text-start">
        <button
          className={baseButton + (option === "user" && selectedButton)}
          onClick={() => setOption("user")}
        >
          <div
            className={`relative flex items-center ${
              option === "account" &&
              " after:absolute after:inset-0 after:bg-northeastern-red after:mix-blend-screen "
            }
             `}
          >
            <Image
              src="/user.png"
              alt="user"
              className="grayscale"
              height={34.65}
              width={31.95}
            />
          </div>
          User Profile
        </button>
        <button
          className={baseButton + (option === "carpool" && selectedButton)}
          onClick={() => setOption("carpool")}
        >
          <div
            className={`relative flex items-center ${
              option === "carpool" &&
              " after:absolute after:inset-0 after:bg-northeastern-red after:mix-blend-screen "
            }
             `}
          >
            <Image
              src="/car.png"
              alt="car"
              className="grayscale"
              height={32.2}
              width={38.25}
            />
          </div>
          Carpool Details
        </button>
        <button
          className={baseButton + (option === "account" && selectedButton)}
          onClick={() => setOption("account")}
        >
          <div
            className={`relative flex items-center ${
              option === "account" &&
              " after:absolute after:inset-0 after:bg-northeastern-red after:mix-blend-screen "
            }
             `}
          >
            <Image
              src="/checkbox.png"
              alt="checkbox"
              className="grayscale"
              height={34.5}
              width={34.5}
            />
          </div>
          Account Status
        </button>
      </div>
    </div>
  );
};
export default ProfileSidebar;
