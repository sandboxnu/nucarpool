import { Menu, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Spinner from "./Spinner";
import React, { Fragment, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { useRouter } from "next/router";
import useProfileImage from "../utils/useProfileImage";

const DropDownMenu = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { profileImageUrl, imageLoadError } = useProfileImage();

  const logout = () => {
    signOut();
  };

  const handleProfileClick = async () => {
    setIsLoading(true);
    await router.push("/profile");
    setIsLoading(false);
  };

  return (
    <div className=" z-30">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <Spinner />
        </div>
      )}
      <Menu>
        <Menu.Button className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full">
          {profileImageUrl && !imageLoadError ? (
            <Image
              src={profileImageUrl}
              alt="Profile Image"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <AiOutlineUser className="h-14 w-14 rounded-full bg-gray-400" />
          )}
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          {session?.user && (
            <Menu.Items className="absolute  right-0 mt-2 w-56 origin-top-right divide-y divide-gray-300 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item
                as="div"
                className="flex flex-col  items-center justify-center p-6"
              >
                <h1 className="text-lg font-bold">{session.user.name}</h1>
                <p className="text-sm font-light text-gray-500">
                  {session.user.email}
                </p>
                <button
                  onClick={handleProfileClick}
                  className="mt-4 w-4/5 rounded-2xl border border-gray-300 bg-white px-3 py-2 text-center hover:bg-gray-100"
                >
                  Profile
                </button>
                <Link
                  href="https://carpoolnu.atlassian.net/servicedesk/customer/portal/1"
                  className="mt-4 w-4/5 rounded-2xl border border-gray-300 bg-white px-3 py-2 text-center hover:bg-gray-100"
                >
                  Feedback
                </Link>
              </Menu.Item>
              <Menu.Item
                as="div"
                className="flex flex-col items-center justify-center px-2 py-4"
              >
                <button
                  onClick={logout}
                  className="w-4/5 rounded border border-gray-300 bg-white px-3 py-2 text-center hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </Menu.Item>
            </Menu.Items>
          )}
        </Transition>
      </Menu>
    </div>
  );
};

export default DropDownMenu;
