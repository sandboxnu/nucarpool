import { addWeeks, differenceInWeeks, startOfWeek } from "date-fns";
import { TempGroup, TempRequest, TempUser } from "./types";
import _ from "lodash";

interface ItemWithDate {
  dateCreated: Date;
}
export const filterItemsByDate = (
  items: ItemWithDate[],
  startTimestamp: number,
  endTimestamp: number,
) => {
  return items.filter((item) => {
    const itemTimestamp = startOfWeek(item.dateCreated).getTime();
    return itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
  });
};
export const countCumulativeItemsPerWeek = (
  items: ItemWithDate[],
  weekLabels: Date[],
): (number | null)[] => {
  const counts: (number | null)[] = [];
  let cumulativeCount = 0;
  let prevCount = 0;
  let itemIndex = 0;
  const sortedItems = items
    .slice()
    .sort(
      (a, b) =>
        new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime(),
    );

  weekLabels.forEach((weekStart, index) => {
    const weekEnd = addWeeks(weekStart, 1);
    while (
      itemIndex < sortedItems.length &&
      new Date(sortedItems[itemIndex].dateCreated) < weekEnd
    ) {
      cumulativeCount++;
      itemIndex++;
    }

    if (index === 0 || cumulativeCount > prevCount) {
      counts.push(cumulativeCount);
    } else {
      counts.push(null);
    }
    prevCount = cumulativeCount;
  });

  return counts;
};

export function generateWeekLabels(allDates: Date[]): Date[] {
  let weekLabels: Date[] = [];

  if (allDates.length > 0) {
    const minWeekDate = startOfWeek(
      new Date(Math.min(...allDates.map((date) => date.getTime()))),
    );
    const maxWeekDate = startOfWeek(
      new Date(Math.max(...allDates.map((date) => date.getTime()))),
    );

    const weeksDifference = differenceInWeeks(maxWeekDate, minWeekDate) + 1;

    for (let i = 0; i < weeksDifference; i++) {
      const weekStart = addWeeks(minWeekDate, i);
      weekLabels.push(weekStart);
    }
  }

  return weekLabels;
}

export function getMinMaxDates(
  users: TempUser[],
  groups: TempGroup[],
  requests: TempRequest[],
): { minDate: number; maxDate: number } {
  const allTimestamps = [
    ...users.map((user) => user.dateCreated.getTime()),
    ...groups.map((group) => group.dateCreated.getTime()),
    ...requests.map((request) => request.dateCreated.getTime()),
  ];

  if (!allTimestamps.length) return { minDate: 0, maxDate: 0 };

  const minTimestamp = Math.min(...allTimestamps);
  const maxTimestamp = Math.max(...allTimestamps);

  return { minDate: minTimestamp, maxDate: maxTimestamp };
}

export function filterDataForLineChart(
  users: TempUser[],
  groups: TempGroup[],
  requests: TempRequest[],
  sliderRange: number[],
) {
  const activeUsers = users.filter((user) => user.status === "ACTIVE");
  const inactiveUsers = _.differenceBy(users, activeUsers);
  const riderRequests = requests.filter(
    (request) => request.fromUser.role === "RIDER",
  );
  const driverRequests = requests.filter(
    (request) => request.fromUser.role === "DRIVER",
  );

  const filteredActiveUsers = filterItemsByDate(
    activeUsers,
    sliderRange[0],
    sliderRange[1],
  );
  const filteredInactiveUsers = filterItemsByDate(
    inactiveUsers,
    sliderRange[0],
    sliderRange[1],
  );
  const filteredGroups = filterItemsByDate(
    groups,
    sliderRange[0],
    sliderRange[1],
  );
  const filteredRequests = filterItemsByDate(
    requests,
    sliderRange[0],
    sliderRange[1],
  );
  const filteredDriverRequests = filterItemsByDate(
    driverRequests,
    sliderRange[0],
    sliderRange[1],
  );
  const filteredRiderRequests = filterItemsByDate(
    riderRequests,
    sliderRange[0],
    sliderRange[1],
  );

  return {
    filteredActiveUsers,
    filteredInactiveUsers,
    filteredGroups,
    filteredRequests,
    filteredDriverRequests,
    filteredRiderRequests,
  };
}

export function buildLineChartData(
  filteredActiveUsers: ItemWithDate[],
  filteredInactiveUsers: ItemWithDate[],
  filteredGroups: ItemWithDate[],
  filteredRequests: ItemWithDate[],
  filteredDriverRequests: ItemWithDate[],
  filteredRiderRequests: ItemWithDate[],
  weekLabels: Date[],
) {
  const activeUserCount = countCumulativeItemsPerWeek(
    filteredActiveUsers,
    weekLabels,
  );
  const inactiveUserCount = countCumulativeItemsPerWeek(
    filteredInactiveUsers,
    weekLabels,
  );
  const groupCounts = countCumulativeItemsPerWeek(filteredGroups, weekLabels);
  const requestCount = countCumulativeItemsPerWeek(
    filteredRequests,
    weekLabels,
  );
  const driverRequestCount = countCumulativeItemsPerWeek(
    filteredDriverRequests,
    weekLabels,
  );
  const riderRequestCount = countCumulativeItemsPerWeek(
    filteredRiderRequests,
    weekLabels,
  );

  return {
    activeUserCount,
    inactiveUserCount,
    groupCounts,
    requestCount,
    driverRequestCount,
    riderRequestCount,
  };
}

export function getDaysFrequency(riders: TempUser[], drivers: TempUser[]) {
  const riderDayCount = [0, 0, 0, 0, 0, 0, 0];
  const driverDayCount = [0, 0, 0, 0, 0, 0, 0];

  riders.forEach((rider) => {
    rider.daysWorking.split(",").forEach((day, index) => {
      if (day === "1") {
        riderDayCount[index] += 1;
      }
    });
  });
  drivers.forEach((driver) => {
    driver.daysWorking.split(",").forEach((day, index) => {
      if (day === "1") {
        driverDayCount[index] += 1;
      }
    });
  });
  return {
    riderDayCount,
    driverDayCount,
  };
}

export function countRole(arr: TempUser[], role: string) {
  return arr.filter((u) => u.role === role).length;
}
