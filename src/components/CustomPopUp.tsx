import React from "react";
import { PublicUser } from "../utils/types";
import { FaRegBuilding, FaHome } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { AiOutlineHome } from "react-icons/ai";
import { Role, Status } from "@prisma/client";

const CustomPopUp = ({
  name,
  role,
  seatAvail,
  status,
  companyName,
  companyPOIAddress,
  email,
  startPOILocation,
}: PublicUser) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="font-bold text-base">{name}</div>
      <div className="flex flex-row space-x-2">
        <div
          className={`text-xs rounded-full py-1 px-3 ${
            status === Status.ACTIVE
              ? "bg-indigo-200 text-indigo-800"
              : "bg-gray-200 text-gray-800"
          } `}
        >
          {status === Status.ACTIVE ? "Active" : "Inactive"}
        </div>
        <div
          className={`text-xs rounded-full py-1 px-3 ${
            role === Role.RIDER
              ? "bg-sky-200 text-sky-800"
              : "bg-orange-200 text-orange-800"
          } `}
        >
          {role === Role.RIDER ? "Rider" : "Driver"}
        </div>
        {role === Role.DRIVER && (
          <div className="text-xs rounded-full py-1 px-3 bg-emerald-200 text-emerald-800">
            {seatAvail + " " + (seatAvail > 1 ? "seats" : "seat")}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex justify-center items-center shadow-md p-2 border border-gray-500 rounded-md">
            <FiMail className="w-4 h-4" />
          </div>
          <span>{email}</span>
        </div>

        <div className="flex items-start space-x-2">
          <div className="flex justify-center items-center shadow-md p-2 border border-gray-500 rounded-md">
            <FaRegBuilding className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium">{companyName}</div>
            <div className="text-xs">{companyPOIAddress}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex justify-center items-center shadow-md p-2 border border-gray-500 rounded-md">
            <AiOutlineHome className="w-4 h-4" />
          </div>
          <span>{startPOILocation}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomPopUp;
