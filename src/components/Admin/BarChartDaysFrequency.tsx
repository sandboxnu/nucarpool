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
  const activeUsers = users.filter((user) => user.status === "ACTIVE");

  const drivers = activeUsers.filter((user) => user.role === "DRIVER");

  const riders = activeUsers.filter((user) => user.role === "RIDER");
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

  const labels = ["Su", "M", "Tu", "W", "Th", "F", "S"];

  const barData: ChartData<"bar"> = {
    labels,

    datasets: [
      {
        label: "Riders",
        data: riderDayCount,
        backgroundColor: "#DA7D25",
      },
      {
        label: "Drivers",
        data: driverDayCount,
        backgroundColor: "#C8102E",
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "Days Carpooling Frequency",
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
        stacked: true,
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
        stacked: true,
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
    <div className="relative  w-full ">
      <div className="  flex h-[500px] flex-col">
        <Bar data={barData} options={barOptions} />
        <span className="w-full text-center font-lato text-sm text-gray-400">
          All bars currently only include active users aside from
          &quot;Inactive&quot;
        </span>
      </div>
    </div>
  );
}

export default BarChartUserCounts;
