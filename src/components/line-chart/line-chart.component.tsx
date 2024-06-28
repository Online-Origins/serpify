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
import { useSharedContext } from "@/context/SharedContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({
  data,
  type,
  dataPrev,
}: {
  data: any;
  type: string;
  dataPrev: any;
}) => {
  const [aspectRatio, setAspectRatio] = useState(1.5);
  const { analyticsPeriod } = useSharedContext();
  const [periodText, setPeriodText] = useState<string>("");

  // Check the width of the window and change the aspect ratio of the chart
  useEffect(() => {
    const handleResize = () => {
      setAspectRatio(window.innerWidth < 1800 ? 1.1 : 1.5);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to get one object per 7 days
  const getWeeklyData = (data: any[]) => {
    const result = [];
    for (let i = 0; i < data.length; i += 7) {
      result.push(data[i]);
    }
    return result;
  };

  // Function to fill up dataPrev with empty items if shorter than data
  const fillDataPrev = (data: any[], dataPrev: any[]) => {
    if (data && dataPrev) {
      const difference = data.length - dataPrev.length;
      if (difference > 0) {
        const emptyItems = Array(difference).fill(null);
        dataPrev = emptyItems.concat(dataPrev);
      }
    }
    return dataPrev;
  };

  // Reduce data and dataPrev if their length is greater than 150
  if (data && data.length > 150) {
    data = getWeeklyData(data);
    dataPrev = getWeeklyData(dataPrev);
  }

  // Fill dataPrev if necessary
  dataPrev = fillDataPrev(data, dataPrev);

  // Extract dates and clicks from the data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  const dates = data.map((entry: any) => formatDate(entry.keys[0]));
  const selectedData = data.map((entry: any) =>
    type == "ctr" ? entry[type] * 100 : entry[type]
  );
  const selectedDataPrev = dataPrev.map((entry: any) =>
    entry ? (type == "ctr" ? entry[type] * 100 : entry[type]) : null
  );

  useEffect(() => {
    if (data.length > 0) {
      setPeriodText(analyticsPeriod);
    }
  }, [data]);

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: periodText,
        data: selectedData,
        fill: false,
        borderColor: "#6210CC",
        tension: 0.2,
        pointBorderColor: "rgb(98, 16, 204)",
      },
      {
        label: periodText.replace("Last", "Previous"),
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
