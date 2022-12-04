import { Menu, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment } from "react";
import { AiOutlineUser } from "react-icons/ai";

const DropDownMenu = () => {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const logout = () => {
    signOut();
  };

  return (
    <div className="fixed z-10 right-2 top-2 text-right">
      <Menu>
        <Menu.Button className="rounded-full bg-gray-400 p-2">
          <AiOutlineUser className="w-8 h-8" />
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
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-300 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item
                as="div"
                className="flex flex-col justify-center items-center p-6"
              >
                <Image
                  alt="avatar"
                  src={session.user.image!}
                  width="100px"
                  height="100px"
                  className="rounded-full mb-2"
                />
                <h1 className="font-bold text-lg">{session.user.name}</h1>
                <p className="font-light text-sm text-gray-500">
                  {session.user.email}
                </p>
                <Link href="/profile">
                  <a className="w-4/5 rounded-2xl text-center bg-white border border-gray-300 px-3 py-2 hover:bg-gray-100 mt-4">
                    Profile
                  </a>
                </Link>
              </Menu.Item>
              <Menu.Item
                as="div"
                className="flex flex-col justify-center items-center py-4 px-2"
              >
                <button
                  onClick={logout}
                  className="w-4/5 rounded text-center bg-white border border-gray-300 px-3 py-2 hover:bg-gray-100"
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
