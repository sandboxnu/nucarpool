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
import {
  buildLineChartData,
  countRole,
  filterDataForLineChart,
  generateWeekLabels,
  getDaysFrequency,
  getMinMaxDates,
} from "../../utils/adminDataUtils";
import { format, startOfWeek } from "date-fns";
import { ConfigProvider, Slider } from "antd";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function AdminData() {
  const [loading, setLoading] = useState<boolean>(true);
  const [sliderRange, setSliderRange] = useState<number[]>([0, 0]);
  const [minDate, setMinDate] = useState<number>(0);
  const [maxDate, setMaxDate] = useState<number>(0);

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
      const { minDate, maxDate } = getMinMaxDates(users, groups, requests);
      setMinDate(minDate);
      setMaxDate(maxDate);
      setSliderRange([
        startOfWeek(minDate).getTime(),
        startOfWeek(maxDate).getTime(),
      ]);
      setLoading(false);
    }
  }, [users, groups, messages, requests, conversations]);

  const activeUsers = users.filter((user) => user.status === "ACTIVE");

  const drivers = activeUsers.filter((user) => user.role === "DRIVER");

  const riders = activeUsers.filter((user) => user.role === "RIDER");

  // day frequency chart data
  const { riderDayCount, driverDayCount } = getDaysFrequency(drivers, riders);

  // line chart data
  const {
    filteredActiveUsers,
    filteredInactiveUsers,
    filteredGroups,
    filteredRequests,
    filteredDriverRequests,
    filteredRiderRequests,
  } = filterDataForLineChart(users, groups, requests, sliderRange);

  const allDates = [
    ...users.map((user) => user.dateCreated),
    ...filteredGroups.map((group) => group.dateCreated),
    ...filteredRequests.map((request) => request.dateCreated),
  ];

  const weekLabels = generateWeekLabels(allDates);

  const {
    activeUserCount,
    inactiveUserCount,
    groupCounts,
    requestCount,
    driverRequestCount,
    riderRequestCount,
  } = buildLineChartData(
    filteredActiveUsers,
    filteredInactiveUsers,
    filteredGroups,
    filteredRequests,
    filteredDriverRequests,
    filteredRiderRequests,
    weekLabels,
  );
  const formatter = (value: any) => format(new Date(value), "MMM dd, yyyy");
  const onSliderChange = (value: number[]) => {
    setSliderRange(value);
  };

  // Quick Stats data
  const totalCountWithMsg = 0;
  const totalCount = 0;
  const totalConversationCount = conversations ? conversations.length : 0;

  const conversationsWithMessage = conversations?.filter(
    (conversation) => conversation._count.messages > 1,
  );
  const avgConvWithMsg = conversationsWithMessage
    ? conversationsWithMessage.reduce(
        (acc, curr) => acc + curr._count.messages,
        totalCountWithMsg,
      ) / conversationsWithMessage.length
    : 0;
  const avgMsg = conversations
    ? conversations.reduce(
        (acc, curr) => acc + curr._count.messages,
        totalCount,
      ) / conversations.length
    : 0;
  const totalWithMsgCount = conversationsWithMessage
    ? conversationsWithMessage.length
    : 0;

  const groupCount = groups.filter((group) => group._count.carpoolSearches > 1).length;
  const ridersInGroup = activeUsers.filter(
    (user) => user.role === "RIDER" && user.carpoolId && user.carpoolId !== "",
  );
  const driversInGroup = activeUsers.filter(
    (user) => user.role === "DRIVER" && user.carpoolId && user.carpoolId !== "",
  );
  const totalDrivers = activeUsers.filter(
    (user) => user.role === "DRIVER",
  ).length;
  const totalRiders = activeUsers.length - totalDrivers;
  const percentDriversInGroup =
    Math.round((driversInGroup.length / totalDrivers) * 1000) / 10 + "%";
  const percentRidersInGroup =
    Math.round((ridersInGroup.length / totalRiders) * 1000) / 10 + "%";
  const averageRidersPerGroup =
    Math.round((ridersInGroup.length / groupCount) * 10) / 10;
  const activeOnboardedUsers = activeUsers.filter((user) => user.isOnboarded);
  const activeNotOnboardedUsers = activeUsers.filter(
    (user) => !user.isOnboarded,
  );
  const inactiveOnboardedUsers = users.filter(
    (user) => user.status !== "ACTIVE" && user.isOnboarded,
  );
  const inactiveNotOnboardedUsers = users.filter(
    (user) => user.status !== "ACTIVE" && !user.isOnboarded,
  );

  const totalAO = activeOnboardedUsers.length;
  const totalANO = activeNotOnboardedUsers.length;
  const totalIO = inactiveOnboardedUsers.length;
  const totalINO = inactiveNotOnboardedUsers.length;

  const driverAO = countRole(activeOnboardedUsers, "DRIVER");
  const driverANO = countRole(activeNotOnboardedUsers, "DRIVER");
  const driverIO = countRole(inactiveOnboardedUsers, "DRIVER");
  const driverINO = countRole(inactiveNotOnboardedUsers, "DRIVER");

  const riderAO = countRole(activeOnboardedUsers, "RIDER");
  const riderANO = countRole(activeNotOnboardedUsers, "RIDER");
  const riderIO = countRole(inactiveOnboardedUsers, "RIDER");
  const riderINO = countRole(inactiveNotOnboardedUsers, "RIDER");

  const viewerAO = totalAO - driverAO - riderAO;
  const viewerANO = totalANO - driverANO - riderANO;
  const viewerIO = totalIO - driverIO - riderIO;
  const viewerINO = totalINO - driverINO - riderINO;

  // line chart
  const buildLineChartCSV = () => {
    const headers = [
      "Date",
      "ActiveUserCount",
      "InactiveUserCount",
      "GroupCounts",
      "RequestCount",
      "DriverRequestCount",
      "RiderRequestCount",
    ];
    const csvRows = [headers.join(",")];

    weekLabels.forEach((dateLabel, index) => {
      const row = [
        format(dateLabel, "MMM dd yyyy"),
        activeUserCount[index] ?? "",
        inactiveUserCount[index] ?? "",
        groupCounts[index] ?? "",
        requestCount[index] ?? "",
        driverRequestCount[index] ?? "",
        riderRequestCount[index] ?? "",
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  };

  // user counts
  const buildUserCountsCSV = () => {
    const headers = [
      "Type",
      "Active Onboarded",
      "Active Not Onboarded",
      "Inactive Onboarded",
      "Inactive Not Onboarded",
    ];
    const csvRows = [headers.join(",")];

    csvRows.push(["Total", totalAO, totalANO, totalIO, totalINO].join(","));
    csvRows.push(
      ["Driver", driverAO, driverANO, driverIO, driverINO].join(","),
    );
    csvRows.push(["Rider", riderAO, riderANO, riderIO, riderINO].join(","));
    csvRows.push(
      ["Viewer", viewerAO, viewerANO, viewerIO, viewerINO].join(","),
    );

    return csvRows.join("\n");
  };

  // days frequency
  const buildDaysFrequencyCSV = () => {
    const headers = ["Day", "RiderCount", "DriverCount"];
    const csvRows = [headers.join(",")];
    const days = ["Su", "M", "Tu", "W", "Th", "F", "S"];

    days.forEach((day, i) => {
      csvRows.push(
        [day, riderDayCount[i] ?? "", driverDayCount[i] ?? ""].join(","),
      );
    });

    return csvRows.join("\n");
  };

  // quick stats
  const buildQuickStatsCSV = () => {
    const headers = [
      "Total Conversations",
      "Total Conversations With > 1 Message",
      "Avg Messages Per Conversation with > 1 Message",
      "Avg Messages",
      "Total Groups",
      "PercentDriversInGroup",
      "PercentRidersInGroup",
      "AverageRidersPerGroup",
    ];

    const row = [
      totalConversationCount,
      totalWithMsgCount,
      avgConvWithMsg,
      avgMsg,
      groupCount,
      percentDriversInGroup,
      percentRidersInGroup,
      averageRidersPerGroup,
    ].join(",");

    return [headers.join(","), row].join("\n");
  };

  const handleDownloadData = async () => {
    const zip = new JSZip();
    const dateRaw = new Date().toLocaleDateString();
    const date = dateRaw.replace(/\//g, "_");
    zip.file(`line_chart_${date}.csv`, buildLineChartCSV());
    zip.file(`user_counts_${date}.csv`, buildUserCountsCSV());
    zip.file(`days_frequency_${date}.csv`, buildDaysFrequencyCSV());
    zip.file(`quick_stats_${date}.csv`, buildQuickStatsCSV());
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `all_data_${date}.zip`);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className=" my-4 h-full w-full overflow-y-auto">
      <div className=" flex h-full w-full flex-col  space-y-4  px-8">
        <button
          onClick={handleDownloadData}
          className="self-start rounded bg-northeastern-red px-4 py-2 font-bold text-white hover:bg-red-700"
        >
          Download Data
        </button>
        <QuickStats
          totalConversationCount={totalConversationCount}
          totalWithMsgCount={totalWithMsgCount}
          avgConvWithMsg={avgConvWithMsg}
          avgMsg={avgMsg}
          groupCount={groupCount}
          percentDriversInGroup={percentDriversInGroup}
          averageRidersPerGroup={averageRidersPerGroup}
          percentRidersInGroup={percentRidersInGroup}
        />
        <BarChartUserCounts
          totalAO={totalAO}
          totalANO={totalANO}
          totalIO={totalIO}
          totalINO={totalINO}
          driverAO={driverAO}
          driverANO={driverANO}
          driverIO={driverIO}
          driverINO={driverINO}
          riderAO={riderAO}
          riderANO={riderANO}
          riderIO={riderIO}
          riderINO={riderINO}
          viewerAO={viewerAO}
          viewerANO={viewerANO}
          viewerIO={viewerIO}
          viewerINO={viewerINO}
        />
        <LineChartCount
          activeUserCount={activeUserCount}
          inactiveUserCount={inactiveUserCount}
          groupCounts={groupCounts}
          requestCount={requestCount}
          driverRequestCount={driverRequestCount}
          riderRequestCount={riderRequestCount}
          weekLabels={weekLabels}
        />
        <div className="w-full">
          <ConfigProvider
            theme={{
              token: {
                fontFamily: "Montserrat",
                fontSize: 16,
                colorPrimary: "#C8102E",
              },
            }}
          >
            <Slider
              range={{ draggableTrack: true }}
              min={startOfWeek(minDate).getTime()}
              max={startOfWeek(maxDate).getTime()}
              value={sliderRange}
              tooltip={{ formatter }}
              onChange={onSliderChange}
              step={7 * 24 * 60 * 60 * 1000}
            />
          </ConfigProvider>
          <div className="flex justify-between font-montserrat">
            <span>
              {format(startOfWeek(new Date(sliderRange[0])), "MMM dd, yyyy")}
            </span>
            <span>
              {format(startOfWeek(new Date(sliderRange[1])), "MMM dd, yyyy")}
            </span>
          </div>
        </div>
        <BarChartDaysFrequency
          riderDayCount={riderDayCount}
          driverDayCount={driverDayCount}
        />
      </div>
    </div>
  );
}

export default AdminData;
