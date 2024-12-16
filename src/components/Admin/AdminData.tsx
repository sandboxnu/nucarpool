import React, { useEffect, useState } from "react";
import Spinner from "../Spinner";
import { trpc } from "../../utils/trpc";
import {
  TempUser,
  TempGroup,
  TempConversation,
  TempMessage,
  TempRequest,
} from "../../utils/types";
import BarChartUserCounts from "./BarChartUserCounts";
import LineChartCount from "./LineChartCount";
import BarChartDaysFrequency from "./BarChartDaysFrequency";
import QuickStats from "./QuickStats";

function AdminData() {
  const [loading, setLoading] = useState<boolean>(true);
  const { data: users = [] } =
    trpc.user.admin.getAllUsers.useQuery<TempUser[]>();
  const { data: groups = [] } =
    trpc.user.admin.getCarpoolGroups.useQuery<TempGroup[]>();
  const { data: conversations } =
    trpc.user.admin.getConversationsMessageCount.useQuery<TempConversation[]>();
  const { data: messages = [] } =
    trpc.user.admin.getMessages.useQuery<TempMessage[]>();
  const { data: requests = [] } =
    trpc.user.admin.getRequests.useQuery<TempRequest[]>();

  useEffect(() => {
    if (users && groups && messages && requests && conversations) {
      setLoading(false);
    }
  }, [users, groups, messages, requests, conversations]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="relative my-4 h-full w-full">
      <div className=" flex h-full flex-col  space-y-4  px-8">
        <div className=" h-[600px] w-full">
          <QuickStats
            groups={groups}
            requests={requests}
            conversations={conversations}
            users={users}
          />
        </div>
        <div className=" h-[500px] ">
          <BarChartUserCounts users={users} />
        </div>
        <div className=" h-[500px]">
          <LineChartCount users={users} groups={groups} requests={requests} />
        </div>
        <div className=" h-[500px]">
          <BarChartDaysFrequency users={users} />
        </div>
      </div>
    </div>
  );
}

export default AdminData;
