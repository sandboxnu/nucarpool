import React, { useState } from "react";
import { trpc } from "../utils/trpc";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "./Spinner";
import { Role, Status, User } from "@prisma/client";

type ScrollableList = {
  items: User[];
  idx: number;
};

const Sidebar = ({
  reccs,
  favs,
}: {
  reccs: User[] | undefined;
  favs: User[] | undefined;
}) => {
  const { data: users } = trpc.useQuery(["user.recommendations"]);
  // let reccs = requireNotUndefined(users);
  // ADD QUERY HERE
  // const { data: favs } = trpc.useQuery(["user.favorites"]);

  const reccss: User[] | undefined = new Array(50).fill({
    id: "2",
    name: `User ${2}`,
    email: `user${2}@hotmail.com`,
    emailVerified: new Date("2022-10-14 19:26:21"),
    image: null,
    bio: `My name is User ${2}. I like to drive`,
    pronouns: "they/them",
    role: "DRIVER",
    status: "ACTIVE" as Status,
    seatAvail: 0,
    companyName: "Sandbox Inc.",
    companyAddress: "360 Huntington Ave",
    companyCoordLng: 21,
    companyCoordLat: 21,
    startLocation: "Roxbury",
    startCoordLng: 21,
    startCoordLat: 21,
    isOnboarded: true,
    daysWorking: "0,1,1,1,1,1,0",
    startTime: new Date(),
    endTime: new Date(),
  });

  const favss: User[] | undefined = new Array(50).fill({
    id: "2",
    name: `User ${2}`,
    email: `user${2}@hotmail.com`,
    emailVerified: new Date("2022-10-14 19:26:21"),
    image: null,
    bio: `My name is User ${2}. I like to drive`,
    pronouns: "they/them",
    role: "DRIVER",
    status: "ACTIVE" as Status,
    seatAvail: 0,
    companyName: "a very long string of text that should wrap",
    companyAddress: "360 Huntington Ave",
    companyCoordLng: 21,
    companyCoordLat: 21,
    startLocation: "Roxbury",
    startCoordLng: 21,
    startCoordLat: 21,
    isOnboarded: true,
    daysWorking: "0,1,1,1,1,1,0",
    startTime: new Date(),
    endTime: new Date(),
  });

  const [curList, setCurList] = useState<User[]>(reccss);

  return (
    <div className="flex flex-col h-full w-1/4 fixed z-10 text-left bg-white">
      <div className="flex-row">
        <button
          className="bg-stone-300 hover:bg-stone-400 rounded-xl m-2 px-2.5 py-0.5"
          onClick={() => setCurList(reccss)}
        >
          Recommendations
        </button>
        <button
          className="bg-stone-300 hover:bg-stone-400 rounded-xl m-2 px-2.5 py-0.5"
          onClick={() => setCurList(favss)}
        >
          Favorites
        </button>
      </div>
      <div id="scrollableDiv" className="overflow-auto">
        <InfiniteScroll
          dataLength={curList.length}
          next={() => {
            return;
          }}
          hasMore={false}
          loader={<Spinner />}
          endMessage={<div></div>}
          scrollableTarget="scrollableDiv"
        >
          {curList.map(userToElem)}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export const userToElem = (user: User) => {
  return (
    <div className="bg-stone-100 text-left px-2.5 py-2.5 rounded-xl m-3.5 align-center break-words">
      <p className="font-bold">{user.name}</p>
      <div className="flex flex-row space-x-4">
        <div className="w-1/2">
          <p>{user.startLocation}</p>
          <p>{user.companyName}</p>
          <button className="underline decoration-dashed">View Route</button>
        </div>
        <div className="w-1/2">
          {/* Add user bar */}
          <div className="text-sm">
            <p>{"Start: " + dateToTimeString(user.startTime)}</p>
            <p>{"End: " + dateToTimeString(user.endTime)}</p>
          </div>
          <button className="bg-red-500 hover:bg-red-700 rounded-xl m-2 px-2 py-0.5 text-center text-white">
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

const requireNotUndefined = (lst: User[] | undefined) => {
  if (lst == undefined) {
    return [];
  }
  return lst;
};

const dateToTimeString = (date: Date | null) => {
  if (date == null) {
    return "N/A";
  } else {
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }
};

export default Sidebar;
