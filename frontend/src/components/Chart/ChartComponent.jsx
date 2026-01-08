import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import 'chartjs-adapter-date-fns'
import { COMPANY_NAMES } from '../../utils/stockData';
import LiveClockUpdate from "./LiveClockUpdate";
import PercentageDisplay from "./PercentageDisplay";
import NewsArticles from "./NewsArticlesComponent";
import { getFilteredData, getChartOptions } from "./utils";
import TimeRangeButtons from "./timeRangeButtons";
import DisplayStockPrice from "./DisplayStockPrice";

export default function ChartComponent({
  intradayStock,
  eodStock,
  selectedSymbol,
  timeRange,
  websocketStock,
  setTimeRange,
  displayStock,
  newsArticle
}) {

  const [livePoint, setLivePoint] = useState(null);
  const [chartPercentage, setChartPercentage] = useState({});
  const [currentArticles, setCurrentArticles] = useState([])

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


  // Hook that sets the current articles to articles matched with the current selected symbol
  useEffect(() => {
    const articles = newsArticle.filter(a => a.symbol === selectedSymbol)
    setCurrentArticles(articles)
  }, [selectedSymbol, newsArticle])

  let filteredData = getFilteredData(timeRange, intradayStock, eodStock, selectedSymbol);

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
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, timeZone: 'America/New_York'});
      } else if (timeRange === "YTD") {
        return date.toLocaleDateString('nl-NL', { year: '2-digit', month: '2-digit', day: '2-digit', timeZone: 'America/New_York'});
      } else {
        return date.toLocaleDateString('nl-NL', { month: '2-digit', day: '2-digit', timeZone: 'America/New_York'});
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

  // Check Chart/utils.jsx for options/config function
  const options = getChartOptions(timeRange, liveData);

  return (
    <div style={{ height: "30em", width: "50em" }}>
      <div className='pl-3 pt-5'>
        <p className='color: text-zinc-500 text-m font-medium' >{selectedSymbol}</p>
        <p className='font-medium text-l'>{COMPANY_NAMES[selectedSymbol]}</p>
        <DisplayStockPrice displayStock={displayStock} selectedSymbol={selectedSymbol} ></DisplayStockPrice> 
        <PercentageDisplay chartPercentage={ chartPercentage }></PercentageDisplay>
      </div>
      <Line data={chartData} options={options} />
      <TimeRangeButtons timeRange={timeRange} setTimeRange={setTimeRange}></TimeRangeButtons>
      <LiveClockUpdate></LiveClockUpdate>
      <NewsArticles currentArticles={ currentArticles }></NewsArticles>
    </div>
  );
}
