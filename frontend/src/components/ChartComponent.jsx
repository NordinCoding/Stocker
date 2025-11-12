import { Line } from "react-chartjs-2";

export default function ChartComponent({ intradayStock, eodStock, symbol, timeRange }) {
  
  // Choose dataset based on selected timeRange
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
        return eodStock.filter((data) => data.symbol === symbol).reverse();
      default:
        sourceData = eodStock;
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    }
    
    return sourceData
      .filter((data) => data.symbol === symbol)
      .filter((data) => new Date(data.time_epoch_ms) >= cutoffDate)
      .reverse();
  };

  const filteredData = getFilteredData();

  const chartData = {
    labels: filteredData.map((data) =>
      new Date(data.time_epoch_ms).toLocaleString()
    ),
    datasets: [
      {
        label: "",
        data: filteredData.map((data) =>
          Math.round(data.close * 100) / 100
        ),
        borderColor: "rgba(44, 181, 92, 1)",
        borderWidth: 1.5,
        fill: true,
        pointStyle: "circle",
        pointRadius: 0,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 200, 0, 700);
          gradient.addColorStop(0, "rgba(18, 208, 110, 0.4)");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          return gradient;
        },
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { display: false } 
      },
      y: {
        grid: { display: false, color: "gray" },
        ticks: { color: "gray", crossAlign: "far" },
      },
    },
  };

  return (
    <div style={{ height: "30em", width: "50em" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
