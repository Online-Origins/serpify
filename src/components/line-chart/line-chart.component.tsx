import React, { useEffect, useState } from "react";
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

const LineChart = ({ data, type, dataPrev }: { data: any; type: string, dataPrev: any }) => {
  const [aspectRatio, setAspectRatio] = useState(1.5);

  // Check the width of the window and change the aspect ratio of the chart
  useEffect(() => {
    const handleResize = () => {
      setAspectRatio(window.innerWidth < 1800 ? 1.1 : 1.5);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Extract dates and clicks from the data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if(dataPrev) {
    return date.toLocaleDateString("en-US", { day: "numeric" });
    }
  };
  const dates = data.map((entry: any) => formatDate(entry.keys[0]));
  const selectedData = data.map((entry: any) => type == "ctr" ? (entry[type] * 100) : entry[type]);
  const selectedDataPrev = dataPrev.map((entry: any) => type == "ctr" ? (entry[type] * 100) : entry[type]);

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: "Last 30 days",
        data: selectedData,
        fill: false,
        borderColor: "#6210CC",
        tension: 0.2,
        pointBorderColor: "rgb(98, 16, 204)",
      },
      {
        label: "Previous 30 days",
        data: selectedDataPrev,
        fill: false,
        borderColor: "rgba(98, 16, 204, .2)",
        tension: 0.2,
        pointBorderColor: "rgba(98, 16, 204, 0)",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
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
    aspectRatio: aspectRatio,
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
