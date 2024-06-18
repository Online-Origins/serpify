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

const LineChart = ({ data, type }: { data: any; type: string }) => {
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
        tension: 0.2,
        pointBorderColor: "rgba(0,0,0,1)",
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
    aspectRatio: aspectRatio,
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
