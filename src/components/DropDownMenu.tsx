import { Menu, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment } from "react";
import { AiOutlineUser } from "react-icons/ai";

const DropDownMenu = () => {
  const { data: session } = useSession();
  const logout = () => {
    signOut();
  };

  return (
    <div className="z-30">
      <Menu>
        <Menu.Button className="rounded-full bg-gray-400 p-2">
          <AiOutlineUser className="h-7 w-7" />
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
                className="flex flex-col items-center justify-center p-6"
              >
                <h1 className="text-lg font-bold">{session.user.name}</h1>
                <p className="text-sm font-light text-gray-500">
                  {session.user.email}
                </p>
                <Link href="/profile">
                  <a className="mt-4 w-4/5 rounded-2xl border border-gray-300 bg-white px-3 py-2 text-center hover:bg-gray-100">
                    Profile
                  </a>
                </Link>
                <Link href="https://docs.google.com/forms/d/e/1FAIpQLSfkbEiOsLIs55fUJgMlDcJ9YkbejTzotjSDXHciSn4tb_z0ug/viewform?usp=sf_link">
                  <a className="mt-4 w-4/5 rounded-2xl border border-gray-300 bg-white px-3 py-2 text-center hover:bg-gray-100">
                    Feedback
                  </a>
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
