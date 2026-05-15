import React from "react";
import DisplayBox from "./DisplayBox";

interface QuickStatsProps {
  totalConversationCount: number;
  totalWithMsgCount: number;
  avgConvWithMsg: number;
  avgMsg: number;
  groupCount: number;
  percentDriversInGroup: string;
  averageRidersPerGroup: number;
  percentRidersInGroup: string;
}

function QuickStats({
  totalConversationCount,
  totalWithMsgCount,
  avgConvWithMsg,
  avgMsg,
  groupCount,
  percentDriversInGroup,
  averageRidersPerGroup,
  percentRidersInGroup,
}: QuickStatsProps) {
  const conversationData = [
    {
      data: totalConversationCount,
      label: "Total Conversations",
    },
    {
      data: totalWithMsgCount,
      label: "Total Conversations with > 1 Message",
    },
    {
      data: Math.round(avgConvWithMsg * 10) / 10,
      label: "Avg Messages Per Conversation with > 1 Message",
    },
    {
      data: Math.round(avgMsg * 10) / 10,
      label: "Avg Messages ",
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
      data: averageRidersPerGroup,
      label: "Average Riders Per Group",
    },
  ];

  return (
    <div className="relative flex  w-full flex-col justify-evenly space-y-4">
      <DisplayBox data={conversationData} title="Conversations" />
      <DisplayBox data={groupData} title="Group" />
    </div>
  );
}

export default QuickStats;
