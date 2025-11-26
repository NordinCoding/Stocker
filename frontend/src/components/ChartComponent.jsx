import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { COMPANY_NAMES } from '../utils/stockData';

export default function ChartComponent({
  intradayStock,
  eodStock,
  selectedSymbol,
  timeRange,
  websocketStock,
  setTimeRange,
  displayStock,
}) {

  const [livePoint, setLivePoint] = useState(null);

  useEffect(() => {
    setLivePoint(null);
  }, [selectedSymbol]);

  // Listen for websocket updates
  useEffect(() => {
    if (!websocketStock) return;

    const update = Array.isArray(websocketStock)
      ? websocketStock.find(s => s.symbol === symbol)
      : websocketStock.symbol === selectedSymbol ? websocketStock : null;

    if (update && update.symbol === selectedSymbol) {
      setLivePoint({
        time: Date.now(),
        price: update.price
      });
    }
  }, [websocketStock, selectedSymbol]);

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
        return eodStock.filter((d) => d.symbol === selectedSymbol).reverse();
      default:
        sourceData = eodStock;
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    }

    return sourceData
      .filter((d) => d.symbol === selectedSymbol)
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
      <div className='pl-3 pt-5'>
        <p className='color: text-zinc-500 text-m font-medium' >{selectedSymbol}</p>
        <p className='font-medium text-l'>{COMPANY_NAMES[selectedSymbol]}</p>
        <div className="flex items-end">
          <p className="font-medium pr-1 text-2xl">$</p>
          <p className="text-5xl font-sans font-medium pt-1">
            {
              // Displays stock price
              (() => {
                const stock = displayStock.find(s => s.symbol === selectedSymbol);
                return stock ? `${Math.round(stock.close * 100) / 100}` : '—';
              })()
            }
          </p>
        </div>
      </div>
      <Line data={chartData} options={options} />
      <div>
        <div className="flex flex-row gap-4 justify-center pr-5">
          <button 
            className={timeRange === "1D" ? "active" : ""}
            onClick={() => setTimeRange("1D")}
          >
            1D
          </button>
          <button 
            className={timeRange === "1W" ? "active" : ""}
            onClick={() => setTimeRange("1W")}
          >
            1W
          </button>
          <button 
            className={timeRange === "1M" ? "active" : ""}
            onClick={() => setTimeRange("1M")}
          >
            1M
          </button>
          <button 
            className={timeRange === "3M" ? "active" : ""}
            onClick={() => setTimeRange("3M")}
          >
            3M
          </button>
          <button 
            className={timeRange === "1Y" ? "active" : ""}
            onClick={() => setTimeRange("1Y")}
          >
            1Y
          </button>
          <button 
            className={timeRange === "YTD" ? "active" : ""}
            onClick={() => setTimeRange("YTD")}
          >
            YTD
          </button>
        </div>
      </div>
    </div>
  );
}
