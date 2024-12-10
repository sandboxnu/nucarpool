import React from "react";
import Image from "next/image";
import user from "../../../public/user.png";
import car from "../../../public/car.png";
import checkbox from "../../../public/checkbox.png";
type ProfileSidebarProps = {
  option: "user" | "carpool" | "account";
  setOption: React.Dispatch<
    React.SetStateAction<"user" | "carpool" | "account">
  >;
};

const ProfileSidebar = ({ option, setOption }: ProfileSidebarProps) => {
  const baseButton =
    "px-3 py-2 relative items-center  flex gap-2 text-northeastern-red font-montserrat text-xl lg:text-2xl  ";
  const selectedButton = " font-bold ";
  return (
    <div className="my-16 h-full w-full  ">
      <div className="mt-6 flex w-full flex-col items-start  justify-center gap-6 lg:ml-10  lg:text-start">
        <button
          className={baseButton + (option === "user" && selectedButton)}
          onClick={() => setOption("user")}
        >
          <div
            className={`relative  w-12  ${
              option === "user" &&
              " after:absolute after:inset-0 after:bg-northeastern-red after:mix-blend-screen "
            }
             `}
          >
            <div className="relative flex justify-center  ">
              <Image src={user} alt="user" />
            </div>
          </div>
          User Profile
        </button>
        <button
          className={baseButton + (option === "carpool" && selectedButton)}
          onClick={() => setOption("carpool")}
        >
          <div
            className={`relative w-12  ${
              option === "carpool" &&
              " after:absolute after:inset-0 after:bg-northeastern-red after:mix-blend-screen "
            }
             `}
          >
            <div className="relative flex justify-center  ">
              <Image src={car} alt="car" />
            </div>
          </div>
          Carpool Details
        </button>
        <button
          className={baseButton + (option === "account" && selectedButton)}
          onClick={() => setOption("account")}
        >
          <div
            className={`relative w-12  ${
              option === "account" &&
              " after:absolute after:inset-0 after:bg-northeastern-red after:mix-blend-screen "
            }
             `}
          >
            <div className="relative flex justify-center  ">
              <Image src={checkbox} alt="checkbox" />
            </div>
          </div>
          Account Status
        </button>
      </div>
    </div>
  );
};
export default ProfileSidebar;
