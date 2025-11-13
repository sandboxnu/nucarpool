import React from "react";
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

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface LineChartCountProps {
  activeUserCount: (number | null)[];
  inactiveUserCount: (number | null)[];
  groupCounts: (number | null)[];
  requestCount: (number | null)[];
  driverRequestCount: (number | null)[];
  riderRequestCount: (number | null)[];
  weekLabels: Date[];
}

function LineChartCount({
  activeUserCount,
  inactiveUserCount,
  groupCounts,
  requestCount,
  driverRequestCount,
  riderRequestCount,
  weekLabels,
}: LineChartCountProps) {
  const lineData: ChartData<"line"> = {
    labels: weekLabels,
    datasets: [
      {
        label: "Active Users",
        data: activeUserCount,
        fill: false,
        backgroundColor: "#000000",
        borderColor: "#000000",
        tension: 0.1,
        pointRadius: 10,
        spanGaps: true,
      },
      {
        label: "Inactive Users",
        data: inactiveUserCount,
        fill: false,
        hidden: true,
        backgroundColor: "#808080",
        borderColor: "#808080",
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
      {
        label: "Requests",
        data: requestCount,
        fill: false,
        showLine: true,
        backgroundColor: "#FFA9A9",
        borderColor: "#FFA9A9",
        tension: 0.1,
        pointRadius: 10,
        spanGaps: true,
      },
      {
        label: "Rider Sent Requests",
        data: riderRequestCount,
        fill: false,
        showLine: true,
        hidden: true,
        backgroundColor: "#DA7D25",
        borderColor: "#DA7D25",
        tension: 0.1,
        pointRadius: 10,
        spanGaps: true,
      },
      {
        label: "Driver Sent Requests",
        data: driverRequestCount,
        fill: false,
        showLine: true,
        hidden: true,
        backgroundColor: "#C8102E",
        borderColor: "#C8102E",
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
      // @ts-ignore
      totalLabelPlugin: false,
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
        text: "Users, Groups and Requests Over Time",
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

  return (
    <div className=" w-full">
      {weekLabels.length > 0 ? (
        <div className="relative min-h-[600px]  w-full">
          <Line data={lineData} options={lineOptions} />
        </div>
      ) : (
        <div>No data available for the selected date range.</div>
      )}
    </div>
  );
}

export default LineChartCount;
