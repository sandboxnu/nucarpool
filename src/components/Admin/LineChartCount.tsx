import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ChartData,
  ChartOptions,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { format, startOfWeek, differenceInWeeks, addWeeks } from "date-fns";
import { Slider, ConfigProvider } from "antd";

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import { TempUser, TempGroup } from "../../utils/types";
import {
  countCumulativeItemsPerWeek,
  filterItemsByDate,
} from "../../utils/adminDataUtils";

interface LineChartCountProps {
  users: TempUser[];
  groups: TempGroup[];
}

function LineChartCount({ users, groups }: LineChartCountProps) {
  const [sliderRange, setSliderRange] = useState<number[]>([0, 0]);
  const [minDate, setMinDate] = useState<number>(0);
  const [maxDate, setMaxDate] = useState<number>(0);

  useEffect(() => {
    if (users && groups) {
      const allTimestamps = [
        ...users.map((user) => user.dateCreated.getTime()),
        ...groups.map((group) => group.dateCreated.getTime()),
      ];

      if (allTimestamps.length > 0) {
        const minTimestamp = Math.min(...allTimestamps);
        const maxTimestamp = Math.max(...allTimestamps);

        setMinDate(minTimestamp);
        setMaxDate(maxTimestamp);
        setSliderRange([
          startOfWeek(minTimestamp).getTime(),
          startOfWeek(maxTimestamp).getTime(),
        ]);
      }
    }
  }, [users, groups]);

  const onSliderChange = (value: number[]) => {
    setSliderRange(value);
  };

  // Filter based on slider range
  const filteredUsers = filterItemsByDate(
    users,
    sliderRange[0],
    sliderRange[1]
  );
  const filteredGroups = filterItemsByDate(
    groups,
    sliderRange[0],
    sliderRange[1]
  );

  // Generate week labels
  const allDates = [
    ...filteredUsers.map((user) => user.dateCreated),
    ...filteredGroups.map((group) => group.dateCreated),
  ];

  let weekLabels: Date[] = [];
  if (allDates.length > 0) {
    const minWeekDate = startOfWeek(
      new Date(Math.min(...allDates.map((date) => date.getTime())))
    );
    const maxWeekDate = startOfWeek(
      new Date(Math.max(...allDates.map((date) => date.getTime())))
    );

    const weeksDifference = differenceInWeeks(maxWeekDate, minWeekDate) + 1;

    for (let i = 0; i < weeksDifference; i++) {
      const weekStart = addWeeks(minWeekDate, i);
      weekLabels.push(weekStart);
    }
  }

  const userCounts = countCumulativeItemsPerWeek(filteredUsers, weekLabels);
  const groupCounts = countCumulativeItemsPerWeek(filteredGroups, weekLabels);
  const lineData: ChartData<"line"> = {
    labels: weekLabels,
    datasets: [
      {
        label: "Users",
        data: userCounts,
        fill: false,
        backgroundColor: "#C8102E",
        borderColor: "#C8102E",
        tension: 0.1,
        pointRadius: 10,
        spanGaps: true,
      },
      {
        label: "Groups",
        data: groupCounts,
        fill: false,
        showLine: true,
        backgroundColor: "#C7EFB3",
        borderColor: "#C7EFB3",
        tension: 0.1,
        pointRadius: 10,
        spanGaps: true,
      },
    ],
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "Montserrat",
            size: 16,
            style: "normal",
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Cumulative Users and Current Groups Over Time",
        font: {
          family: "Montserrat",
          size: 18,
          style: "normal",
          weight: "bold",
        },
        color: "#000000",
      },
      tooltip: {
        enabled: true,
        titleFont: {
          family: "Montserrat",
          size: 16,
          style: "normal",
          weight: "normal",
        },
        bodyFont: {
          family: "Montserrat",
          size: 16,
          style: "normal",
          weight: "normal",
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "week",
          tooltipFormat: "MMM dd, yyyy",
          displayFormats: { week: "MMM dd" },
        },
        title: {
          display: true,
          text: "Date",
          font: {
            family: "Montserrat",
            size: 16,
            style: "normal",
            weight: "bold",
          },
        },
        ticks: {
          font: {
            family: "Montserrat",
            size: 12,
            style: "normal",
            weight: "normal",
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Cumulative Count",
          font: {
            family: "Montserrat",
            size: 16,
            style: "normal",
            weight: "bold",
          },
        },
        ticks: {
          font: {
            family: "Montserrat",
            size: 12,
            style: "normal",
            weight: "normal",
          },
          color: "#000000",
        },
      },
    },
  };

  const formatter = (value: any) => format(new Date(value), "MMM dd, yyyy");

  return (
    <div className="h-full w-full">
      {allDates.length > 0 ? (
        <div className="relative h-[calc(100%-4rem)] w-full">
          <Line data={lineData} options={lineOptions} />
        </div>
      ) : (
        <div>No data available for the selected date range.</div>
      )}
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
    </div>
  );
}

export default LineChartCount;
