// ChartComponent.jsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ChartComponent({ type = "bar", data = {}, options = {} }) {
  // Provide default empty data to prevent Chart.js crashes
  const safeData = {
    labels: Array.isArray(data?.labels) ? data.labels : [],
    datasets: Array.isArray(data?.datasets) ? data.datasets : [],
  };

  if (!safeData.labels.length || !safeData.datasets.length) {
    // Optional: render a placeholder if no data
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          fontSize: 14,
          color: "#888",
        }}
      >
        No data available
      </div>
    );
  }

  // Choose the chart type
  switch (type) {
    case "line":
      return <Line data={safeData} options={options} />;
    case "pie":
      return <Pie data={safeData} options={options} />;
    case "doughnut":
      return <Doughnut data={safeData} options={options} />;
    case "bar":
    default:
      return <Bar data={safeData} options={options} />;
  }
}