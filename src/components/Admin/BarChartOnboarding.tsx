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

function BarChartOnboarding({ users }: BarChartOnboardingProps) {
  const countOnboarded = users.filter((user) => user.isOnboarded).length;
  const countNotOnboarded = users.length - countOnboarded;

  const barData: ChartData<"bar"> = {
    labels: ["Users"],
    datasets: [
      {
        label: "Onboarded",
        data: [countOnboarded],
        backgroundColor: "#C8102E",
      },
      {
        label: "Not Onboarded",
        data: [countNotOnboarded],
        backgroundColor: "#D3D3D3",
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
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
        text: "User Onboarding Status",
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

export default BarChartOnboarding;
