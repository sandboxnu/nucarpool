import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { TempUser } from "../../utils/types";

interface BarChartOnboardingProps {
  users: TempUser[];
}

function BarChartUserCounts({ users }: BarChartOnboardingProps) {
  const totalCount = users.length;
  const countOnboarded = users.filter((user) => user.isOnboarded).length;
  const countNotOnboarded = totalCount - countOnboarded;
  const driverCount = users.filter((user) => user.role === "DRIVER").length;
  const riderCount = users.filter((user) => user.role === "RIDER").length;

  const viewerCount = totalCount - (driverCount + riderCount);
  const dataPoints = [
    totalCount,
    countOnboarded,
    countNotOnboarded,
    driverCount,
    riderCount,
    viewerCount,
  ];
  const barColors = [
    "#000000",
    "#FFA9A9",
    "#808080",
    "#C8102E",
    "#DA7D25",
    "#2454DD",
  ];
  const labels = [
    "Total",
    "Onboarded",
    "Not Onboarded",
    "Driver",
    "Rider",
    "Viewer",
  ];

  const barData: ChartData<"bar"> = {
    labels,

    datasets: [
      {
        label: "User Counts",
        data: dataPoints,
        backgroundColor: barColors,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "User Counts",
        font: {
          family: "Montserrat",
          size: 18,
          style: "normal",
          weight: "bold",
        },
        color: "#000000",
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: "Montserrat",
            size: 16,
            style: "normal",
            weight: "bold",
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Users",
          font: {
            family: "Montserrat",
            size: 16,
            style: "normal",
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <div className="h-full w-full ">
      <div className="relative h-full">
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
}

export default BarChartUserCounts;
