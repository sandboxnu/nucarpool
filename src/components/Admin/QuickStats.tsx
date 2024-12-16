import {
  TempConversation,
  TempGroup,
  TempRequest,
  TempUser,
} from "../../utils/types";
import React from "react";
import DisplayBox from "./DisplayBox";

interface QuickStatsProps {
  users: TempUser[];
  requests: TempRequest[];
  conversations: TempConversation[] | undefined;
  groups: TempGroup[];
}

function QuickStats({
  users,
  requests,
  groups,
  conversations,
}: QuickStatsProps) {
  const totalCountWithMsg = 0;
  const totalCount = 0;
  const totalConversationCount = conversations ? conversations.length : 0;

  const conversationsWithMessage = conversations?.filter(
    (conversation) => conversation._count.messages > 1
  );
  const avgConvWithMsg = conversationsWithMessage
    ? conversationsWithMessage.reduce(
        (acc, curr) => acc + curr._count.messages,
        totalCountWithMsg
      ) / conversationsWithMessage.length
    : 0;
  const avgMsg = conversations
    ? conversations.reduce(
        (acc, curr) => acc + curr._count.messages,
        totalCount
      ) / conversations.length
    : 0;
  const totalWithMsgCount = conversationsWithMessage
    ? conversationsWithMessage.length
    : 0;
  const activeUsers = users.filter((user) => user.status === "ACTIVE");

  const groupCount = groups.filter((group) => group._count.users > 1).length;
  const ridersInGroup = activeUsers.filter(
    (user) => user.role === "RIDER" && user.carpoolId && user.carpoolId !== ""
  );
  const driversInGroup = activeUsers.filter(
    (user) => user.role === "DRIVER" && user.carpoolId && user.carpoolId !== ""
  );
  const totalDrivers = activeUsers.filter(
    (user) => user.role === "DRIVER"
  ).length;
  const totalRiders = activeUsers.length - totalDrivers;
  const percentDriversInGroup =
    Math.round((driversInGroup.length / totalDrivers) * 1000) / 10 + "%";
  const percentRidersInGroup =
    Math.round((ridersInGroup.length / totalRiders) * 1000) / 10 + "%";
  const conversationData = [
    {
      data: totalConversationCount,
      label: "Total # of Conversations",
    },
    {
      data: totalWithMsgCount,
      label: "Total # of Conversations with > 1 messages sent",
    },
    {
      data: Math.round(avgConvWithMsg * 10) / 10,
      label: "Avg # of Msgs when > 1 messages sent",
    },
    {
      data: Math.round(avgMsg * 10) / 10,
      label: "Avg # of Msgs for all Conversations",
    },
  ];
  const groupData = [
    {
      label: "Total Groups",
      data: groupCount,
    },
    {
      data: percentDriversInGroup,
      label: "Drivers In a Group",
    },
    {
      data: percentRidersInGroup,
      label: "Riders In a Group",
    },
    {
      data: Math.round((ridersInGroup.length / groupCount) * 10) / 10,
      label: "Average # of riders per group",
    },
  ];

  return (
    <div className="relative flex h-full w-full flex-col justify-evenly space-y-4">
      <DisplayBox data={conversationData} title="Conversations" />
      <DisplayBox data={groupData} title="Group" />
    </div>
  );
}

export default QuickStats;
