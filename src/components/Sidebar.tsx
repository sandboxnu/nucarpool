import { User } from "@prisma/client";
import React from "react";
import Head from "next/head";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "./Spinner";

export const Sidebar = (users: User[] | undefined) => {
  // temp code to get the program to run
  let usersToBeDisplayed: User[];
  if (users == undefined) {
    usersToBeDisplayed = [];
  } else {
    usersToBeDisplayed = users;
  }

  return (
    <InfiniteScroll
      dataLength={usersToBeDisplayed.length}
      next={() => {}} // FIX ME
      hasMore={true}
      loader={<Spinner />}
      endMessage={<div></div>}
    >
      {usersToBeDisplayed.map(userToElem)}
    </InfiniteScroll>
  );
};

export const userToElem = (user: User) => {
  return (
    <>
      <Head>
        <title>{user.name}</title>
        <p>{user.startLocation}</p>
        <p>{user.companyName}</p>
        {/* Add user bar */}
        <p>{"Start: " + dateToTimeString(user.startTime)}</p>
        <p>{"End: " + dateToTimeString(user.endTime)}</p>
      </Head>
    </>
  );
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
