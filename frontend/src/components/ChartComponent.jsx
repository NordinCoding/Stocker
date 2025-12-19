import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import 'chartjs-adapter-date-fns'
import { COMPANY_NAMES } from '../utils/stockData';


// component that dynamically displays price change in percentage dependant on which symbol and timeRange is selected
function PercentageDisplay({ chartPercentage }) {
  const timeRanges = {"1D": "In the last day",
                      "1W": "In the last week",
                      "1M": "In the last month",
                      "3M": "In the last 3 months",
                      "1Y": "In the last year",
                      "YTD": "Since beginning"
  }

  if (chartPercentage.percentage > 0) {
    return (<p className="text-green-400">+{chartPercentage.percentage}% {timeRanges[chartPercentage.timeRange]} (+${chartPercentage.price_change})</p>)
  } else {
    return (<p className="text-red-400">{chartPercentage.percentage}% {timeRanges[chartPercentage.timeRange]} (-${Math.abs(chartPercentage.price_change)})</p>)
  }
}


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
  const [chartPercentage, setChartPercentage] = useState({});

  // Reset Live point when user Selects different symbol to prevent prices from carrying over
  useEffect(() => {
    setLivePoint(null);
  }, [selectedSymbol]);

  // Listen for websocket updates
  useEffect(() => {
    if (!websocketStock) return;

    const update = Array.isArray(websocketStock)
      ? websocketStock.find(s => s.symbol === selectedSymbol)
      : websocketStock.symbol === selectedSymbol ? websocketStock : null;

    if (update && update.symbol === selectedSymbol) {
      setLivePoint({
        time: Date.now(),
        price: update.price
      });

    }
  }, [websocketStock, selectedSymbol]);


  // Hook to get the difference between first and last index of the currently selected graphs array in percentage
  useEffect(() => {
    if (!filteredData || filteredData.length < 2) return;

    let first_index = filteredData[0].close;
    const last_index =
      livePoint && (timeRange === "1D" || timeRange === "1W")
        ? livePoint.price
        : filteredData[filteredData.length - 1].close;
    let percentage = (last_index - first_index) / first_index * 100;
    setChartPercentage({"percentage": Number(percentage).toFixed(2),
                        "timeRange": timeRange,
                        "price_change": Number(last_index - first_index).toFixed(2)});
  }, [selectedSymbol, timeRange, intradayStock, eodStock, livePoint]);



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

    sourceData = sourceData
      .filter((d) => d.symbol === selectedSymbol)
      .filter((d) => new Date(d.time_epoch_ms) >= cutoffDate)
      .reverse();

    return sourceData
  };

  let filteredData = getFilteredData();

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
    labels: liveData.map((d) => {
      const date = new Date(d.time_epoch_ms);
      if (timeRange === "1D") {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true});
      } else if (timeRange === "YTD") {
        return date.toLocaleDateString('nl-NL', { year: '2-digit', month: '2-digit', day: '2-digit' });
      } else {
        return date.toLocaleDateString('nl-NL', { month: '2-digit', day: '2-digit' });
      }
    }),
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
    layout: {
      padding: {
        left: 0,
        right: 0
      }
    },
    scales: {
      x: {
        offset: false,
        bounds: 'ticks',
        
        // Remove some ticks from the start and one from the end to make the graph look nicer
        afterBuildTicks: (scale) => {
          if (timeRange === "1Y") {
            scale.ticks = scale.ticks.slice(5);
          } else if (timeRange === "YTD") {
            scale.ticks = scale.ticks.slice(scale.ticks.length * 0.04, -1);
          } else {
            scale.ticks = scale.ticks.slice(1, -1);
          }
        },

        grid: { 
          display: true,
          drawOnChartArea: false,
          drawTicks: true,
          tickLength: 10,
          color: '#555',
        },
        ticks: {
          maxTicksLimit: 12,
          autoSkip: true,
          color: '#555',
        },
      },
      y: { 
        position: 'right',
        grid: { display: true,
                color: '#555',
                drawOnChartArea: false,
                drawTicks: false,
         }, 
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
        <div><PercentageDisplay chartPercentage={ chartPercentage }></PercentageDisplay></div>
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
