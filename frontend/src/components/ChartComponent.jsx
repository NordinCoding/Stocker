import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

export default function ChartComponent({
  intradayStock,
  eodStock,
  symbol,
  timeRange,
  websocketStock
}) {

  const [livePoint, setLivePoint] = useState(null);

  useEffect(() => {
    setLivePoint(null);
  }, [symbol]);

  // Listen for websocket updates
  useEffect(() => {
    if (!websocketStock) return;

    const update = Array.isArray(websocketStock)
      ? websocketStock.find(s => s.symbol === symbol)
      : websocketStock.symbol === symbol ? websocketStock : null;

    if (update && update.symbol === symbol) {
      setLivePoint({
        time: Date.now(),
        price: update.price
      });
    }
  }, [websocketStock, symbol]);

  // Filter which dataset to use based on which option was chosen
  const getFilteredData = () => {
    let sourceData;
    let cutoffDate = new Date();

    switch (timeRange) {
      case "1D":
        sourceData = intradayStock;
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        break;
      case "1W":
        sourceData = intradayStock;
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case "1M":
        sourceData = eodStock;
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case "3M":
        sourceData = eodStock;
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        break;
      case "1Y":
        sourceData = eodStock;
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      case "YTD":
        return eodStock.filter((d) => d.symbol === symbol).reverse();
      default:
        sourceData = eodStock;
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    }

    return sourceData
      .filter((d) => d.symbol === symbol)
      .filter((d) => new Date(d.time_epoch_ms) >= cutoffDate)
      .reverse();
  };

  const filteredData = getFilteredData();

  // Add live websocket price at the end of the dataset
  const shouldUseLive = timeRange === "1D" || timeRange === "1W";

  const liveData =
    livePoint && shouldUseLive
      ? [
          ...filteredData,
          {
            time_epoch_ms: livePoint.time,
            close: livePoint.price,
          }
        ]
      : filteredData;

  const chartData = {
    labels: liveData.map((d) =>
      new Date(d.time_epoch_ms).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "",
        data: liveData.map((d) => Math.round(d.close * 100) / 100),
        borderColor: "rgba(44, 181, 92, 1)",
        borderWidth: 1.5,
        fill: true,
        pointRadius: 0,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 200, 0, 500);
          gradient.addColorStop(0, "rgba(18, 208, 110, 0.4)");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          return gradient;
        },
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const item = liveData[index];
            return new Date(item.time_epoch_ms).toLocaleString();
          }
        }
      }
    },
    animation: false,
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { display: false } 
      },
      y: { 
        position: 'right',
        grid: { display: false }, 
        ticks: { color: "gray" } 
      },
    },
  };

  return (
    <div style={{ height: "30em", width: "50em" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
