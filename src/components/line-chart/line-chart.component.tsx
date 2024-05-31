import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ data, type }: { data: any; type: string }) => {
  // Extract dates and clicks from the data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };
  const dates = data.map((entry: any) => formatDate(entry.keys[0]));
  const selectedData = data.map((entry: any) => type == "ctr" ? (entry[type] * 100) : entry[type]);

  const chartData = {
    labels: dates,
    datasets: [
      {
        data: selectedData,
        fill: false,
        borderColor: "#6210CC",
        tension: 0.1,
        pointBorderColor: "rgba(0,0,0,0)",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 8, 
        },
      },
      y: {
        ticks: {
          maxTicksLimit: 5,
        },
      },
    },
    aspectRatio: 1.5,
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
