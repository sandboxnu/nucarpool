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
    "px-4 py-2 relative items-center  flex gap-2 text-northeastern-red font-montserrat text-xl  ";
  const selectedButton = " font-bold ";
  return (
    <div className="h-full w-full  ">
      <div className="mt-6 flex w-full flex-col items-start  justify-center gap-4 lg:ml-12  lg:text-start">
        <button
          className={baseButton + (option === "user" && selectedButton)}
          onClick={() => setOption("user")}
        >
          <div
            className={`relative  ${
              option === "user" &&
              " after:absolute after:inset-0 after:bg-northeastern-red after:mix-blend-screen "
            }
             `}
            style={{ width: "31.95px", height: "34.65px" }}
          >
            <Image
              src="/user.png"
              alt="user"
              className="absolute inset-0 h-full w-full object-cover grayscale"
              layout={"fill"}
            />
          </div>
          User Profile
        </button>
        <button
          className={baseButton + (option === "carpool" && selectedButton)}
          onClick={() => setOption("carpool")}
        >
          <div
            className={`relative  ${
              option === "carpool" &&
              " after:absolute after:inset-0 after:bg-northeastern-red after:mix-blend-screen "
            }
             `}
            style={{ width: "38.25px", height: "32.2px" }}
          >
            <Image
              src="/car.png"
              alt="car"
              className="absolute inset-0 h-full w-full object-cover grayscale"
              layout={"fill"}
            />
          </div>
          Carpool Details
        </button>
        <button
          className={baseButton + (option === "account" && selectedButton)}
          onClick={() => setOption("account")}
        >
          <div
            className={`relative  ${
              option === "account" &&
              " after:absolute after:inset-0 after:bg-northeastern-red after:mix-blend-screen "
            }
             `}
            style={{ width: "34.5px", height: "34.5px" }}
          >
            <Image
              src="/checkbox.png"
              alt="checkbox"
              className="absolute inset-0 h-full w-full object-cover grayscale"
              layout={"fill"}
            />
          </div>
          Account Status
        </button>
      </div>
    </div>
  );
};
export default ProfileSidebar;
