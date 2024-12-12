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
    " py-2 relative items-center  flex gap-2 text-black font-montserrat text-xl lg:text-2xl  ";
  const selectedButton = " font-bold !text-northeastern-red";
  return (
    <div className="my-10 h-full w-full  ">
      <div className="mt-6 flex  w-full flex-col items-start  justify-center gap-6   lg:text-start">
        <button
          className={baseButton + (option === "user" && selectedButton)}
          onClick={() => setOption("user")}
        >
          {option === "user" && (
            <div className=" absolute h-full w-3  rounded-r-xl bg-northeastern-red "></div>
          )}
          <div
            className={`relative ml-4 w-12 lg:ml-12  ${
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
          {option === "carpool" && (
            <div className=" absolute left-0 h-full  w-3 rounded-r-xl bg-northeastern-red"></div>
          )}
          <div
            className={`relative ml-4 w-12 lg:ml-12  ${
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
          {option === "account" && (
            <div className=" absolute left-0 h-full  w-3 rounded-r-xl bg-northeastern-red"></div>
          )}
          <div
            className={`relative ml-4 w-12 lg:ml-12  ${
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
