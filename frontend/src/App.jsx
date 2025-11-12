import { useState, useEffect } from 'react';
import ChartComponent from './components/ChartComponent';
import StockList from './components/StockList';
import LiveUpdates from './components/LiveUpdates';

import { Chart as ChartJS, defaults } from "chart.js/auto";


defaults.maintainAspectRatio = false;
defaults.responsive = true;

function App() {

  const [displayStock, setDisplayStock] = useState ([]);
  const [intradayStock, setIntradayStock] = useState ([]);
  const [eodStock, setEODStock] = useState ([]);
  const [timeRange, setTimeRange] = useState('1M');
  const [selectedSymbol, setSelectedSymbol] = useState ('AMD');
  const [websocketStock, setWebsocket_stock] = useState ([]);

  
  // Fetch current price for each symbol(Check Django API for logic)
  useEffect(() => {
    const fetchDisplayStocks = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}display_intraday/`);
      let display_stock_data = await response.json();
      setDisplayStock(display_stock_data);
    };
    fetchDisplayStocks();
  }, []);
  

  // Hook that fetches all data from the intraday table
  useEffect(() => {
    const fetchIntradayStocks = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}intraday_stocks/`);
      let intraday_stock_data = await response.json();
      setIntradayStock(intraday_stock_data);
    };
    fetchIntradayStocks();
  }, []);


  // Hook that fetches all data from the EOD table
  useEffect(() => {
    const fetchEODStocks = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}eod_stocks/`);
      let eod_stock_data = await response.json();
      setEODStock(eod_stock_data);
    };
    fetchEODStocks()
  }, []);


  // Hook that connects to the websocket on page load and constantly
  // updates stock prices based on websocket updates
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/stocks/");

    socket.addEventListener("open", () => {
      socket.send("Connection established");
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      console.log("Message from server: ", event.data);

      setWebsocket_stock(data)

      setDisplayStock(prevStock =>
        prevStock.map(item => {
          const update = Array.isArray(data)
            ? data.find(update => update.symbol === item.symbol)
            : data.symbol === item.symbol ? data : null;

          return update ? { ...item, close: update.price } : item;
        })
      )
    });
    return () => socket.close()
  }, []);

  console.log(selectedSymbol)
  
  return (
    <>
      <div className="flex min-h-screen justify-center items-center">
        <div className="flex">
          <div className="border-1 border-stone-800">
            <StockList 
              displayStock={displayStock} 
              onSelectStock={setSelectedSymbol}
            />
          </div>
          <div className="border-t-1 border-r-1 border-b-1 border-stone-800">
            <ChartComponent 
              intradayStock={intradayStock}
              eodStock={eodStock} 
              symbol={selectedSymbol} 
              timeRange={timeRange}
            />
            <div>
              <div className="flex flex-row gap-4 justify-center pr-5">
                <button className="width-5" onClick={() => setTimeRange("1D")}>1D</button>
                <button onClick={() => setTimeRange("1W")}>1W</button>
                <button onClick={() => setTimeRange("1M")}>1M</button>
                <button onClick={() => setTimeRange("3M")}>3M</button>
                <button onClick={() => setTimeRange("1Y")}>1Y</button>
                <button onClick={() => setTimeRange("YTD")}>YTD</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LiveUpdates websocketStock={websocketStock} />
    </>
  );
}

export default App;
