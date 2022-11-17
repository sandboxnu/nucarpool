import { User } from "@prisma/client";
import React, { useState } from "react";
import Head from "next/head";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "./Spinner";

type ScrollableList = {
  items: User[];
  idx: number;
};

export const Sidebar = ({ reccs }: { reccs: User[] | undefined }) => {
  const users = requireNotUndefined(reccs);
  // ADD QUERY HERE
  // const { data: favs } = trpc.useQuery(["user.favorites"]);
  const favs = requireNotUndefined(undefined);
  const [curList, setList] = useState<User[]>(users);
  const [moreContents, setmoreContents] = useState<boolean>(true);
  const newSize = () => Math.min(10, curList.length);
  let listSize = newSize();

  const fetchMoreData = () => {
    if (curList.length >= 500) {
      setmoreContents(false);
      return;
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          setList(users);
          listSize = newSize();
        }}
      >
        Recommendations
      </button>
      <button
        onClick={() => {
          setList(favs);
          listSize = newSize();
        }}
      >
        Favorites
      </button>
      <div
        id="scrollableDiv"
        className="flex h-5/6 fixed z-10  text-right bg-white m-5 overflow-auto"
      >
        <InfiniteScroll
          dataLength={listSize}
          next={fetchMoreData}
          hasMore={moreContents}
          loader={<Spinner />}
          endMessage={<div>The end</div>}
          height=""
        >
          {curList.slice(0, listSize).map(userToElem)}
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
