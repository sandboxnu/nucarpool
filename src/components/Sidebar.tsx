import React, { useState } from "react";
import { trpc } from "../utils/trpc";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "./Spinner";
import { Role, Status, User } from "@prisma/client";

type ScrollableList = {
  items: User[];
  idx: number;
};

export const Sidebar = ({
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
    companyName: "someone's house",
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
    <div className=" flex flex-col h-5/6 fixed z-10  text-right bg-white m-5">
      <div className="flex-row">
        <button onClick={() => setCurList(reccss)}>Recommendations</button>
        <button onClick={() => setCurList(favss)}>Favorites</button>
      </div>
      <div id="scrollableDiv" className="overflow-auto">
        <InfiniteScroll
          dataLength={curList.length}
          next={() => {
            return;
          }}
          hasMore={false}
          loader={<Spinner />}
          endMessage={<div>The end</div>}
        >
          {curList.map(userToElem)}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export const userToElem = (user: User) => {
  return (
    <div>
      <p>{user.name}</p>
      <p>{user.startLocation}</p>
      <p>{user.companyName}</p>
      {/* Add user bar */}
      <p>{"Start: " + dateToTimeString(user.startTime)}</p>
      <p>{"End: " + dateToTimeString(user.endTime)}</p>
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
