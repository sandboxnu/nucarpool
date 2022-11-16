import { User } from "@prisma/client";
import React, { useState } from "react";
import Head from "next/head";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "./Spinner";

export const Sidebar = (recs: User[] | undefined) => {
  const users = requireNotUndefined(recs);
  // ADD QUERY HERE
  // const { data: favs } = trpc.useQuery(["user.favorites"]);
  const favs = requireNotUndefined(undefined);

  const [curList, setList] = useState<User[]>(users);
  const newSize = () => Math.min(5, curList.length);
  let listSize = newSize();

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
      <InfiniteScroll
        dataLength={listSize}
        next={() => {
          listSize = Math.min(listSize + 5, curList.length);
        }}
        hasMore={listSize < curList.length}
        loader={<Spinner />}
        endMessage={<div>The end</div>}
      >
        {curList.slice(0, listSize).map(userToElem)}
      </InfiniteScroll>
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
