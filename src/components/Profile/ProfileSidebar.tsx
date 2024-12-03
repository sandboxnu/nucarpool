import React from "react";

type ProfileSidebarProps = {
  option: "user" | "carpool" | "account";
  setOption: React.Dispatch<
    React.SetStateAction<"user" | "carpool" | "account">
  >;
};

const ProfileSidebar = ({ option, setOption }: ProfileSidebarProps) => {
  const baseButton = "px-4 py-2 text-northeastern-red font-montserrat text-xl ";
  const selectedButton = " font-bold underline underline-offset-8 ";
  return (
    <div className="h-full w-full  ">
      <div className="mt-6 flex flex-col items-start gap-4">
        <button
          className={baseButton + (option === "user" && selectedButton)}
          onClick={() => setOption("user")}
        >
          User Profile
        </button>
        <button
          className={baseButton + (option === "carpool" && selectedButton)}
          onClick={() => setOption("carpool")}
        >
          Carpool Details
        </button>
        <button
          className={baseButton + (option === "account" && selectedButton)}
          onClick={() => setOption("account")}
        >
          Account Status
        </button>
      </div>
    </div>
  );
};
export default ProfileSidebar;
