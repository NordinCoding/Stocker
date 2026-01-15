import { useState, useEffect } from 'react';
import ChartComponent from './components/Chart/ChartComponent';
import StockList from './components/StockList/StockList';
import LiveUpdates from './components/Utils/LiveUpdates';
import NavBar from './components/NavBar/NavBar';
import { COMPANY_NAMES } from './utils/stockData';

import { Chart as ChartJS, defaults } from "chart.js/auto";


defaults.maintainAspectRatio = false;
defaults.responsive = true;

function App() {

  const [displayStock, setDisplayStock] = useState ([]);
  const [intradayStock, setIntradayStock] = useState ([]);
  const [eodStock, setEODStock] = useState ([]);
  const [newsArticle, setNewsArticle] = useState([]);
  const [timeRange, setTimeRange] = useState('1W');
  const [selectedSymbol, setSelectedSymbol] = useState ('AAPL');
  const [websocketStock, setWebsocket_stock] = useState ([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState({
    display: false,
    intraday: false,
    eod: false,
    news: false
  })

  // Fetch current price for each symbol(Check Django API for logic)
  useEffect(() => {
    const fetchDisplayStocks = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}intraday_stocks/?latest=true`);
      let display_stock_data = await response.json();
      setDisplayStock(display_stock_data);
      setLoadStatus(prev => ({ ...prev, display: true}))
    };
    fetchDisplayStocks();
  }, []);
  

  // Hook that fetches all data from the intraday table
  useEffect(() => {
    const fetchIntradayStocks = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}intraday_stocks/`);
      let intraday_stock_data = await response.json();
      setIntradayStock(intraday_stock_data);
      setLoadStatus(prev => ({ ...prev, intraday: true}))
    };
    fetchIntradayStocks();
  }, []);


  // Hook that fetches all data from the EOD table
  useEffect(() => {
    const fetchEODStocks = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}eod_stocks/`);
      let eod_stock_data = await response.json();
      setEODStock(eod_stock_data);
      setLoadStatus(prev => ({ ...prev, eod: true}))
    };
    fetchEODStocks()
  }, []);


  // Hook that fetches the relevant news articles from the past 24 Hours
  useEffect (() => {
    const fetchNewsArticles = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}news_articles/?latest=true`);
      let news_articles_data = await response.json();
      setNewsArticle(news_articles_data);
      setLoadStatus(prev => ({ ...prev, news: true}))
    };
    fetchNewsArticles()
  }, []);


  useEffect (() => {
    if (loadStatus.display && loadStatus.intraday && loadStatus.eod && loadStatus.news) {
      setIsLoading(false);
    }
  }, [loadStatus]);


  // Hook that connects to the websocket on page load and constantly
  // updates stock prices based on websocket updates
  useEffect(() => {

    // DEV
    const socket = new WebSocket("ws://localhost:8000/ws/stocks/");
    // PROD
    //const socket = new WebSocket("wss://nordinsprojects.site/stocker-api/ws/stocks/");

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
  
  if (isLoading) {
    return (
    <div className="flex justify-center items-center h-screen gap-1">
      <div className="h-8 w-8 bg-green-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-8 w-8 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-8 w-8 bg-green-400 rounded-full animate-bounce"></div>
    </div>
    )
  }

  return (
    <>
      <div className="flex flex-col min-h-screen justify-center items-center">
        <NavBar></NavBar>
        <div className="flex">
          <div className="border border-stone-800 rounded-t-xl h-screen overflow-y-auto w-[21rem] thin-scrollbar">
            <StockList 
              displayStock={displayStock}
              setDisplayStock={setDisplayStock}
              setSelectStock={setSelectedSymbol}
              selectedSymbol={selectedSymbol}
            />
          </div>
          <div className="border-t-1 border-r-1 border-b-1 border-stone-800 rounded-r-xl">
            <ChartComponent 
              intradayStock={intradayStock}
              eodStock={eodStock} 
              selectedSymbol={selectedSymbol} 
              timeRange={timeRange}
              websocketStock={websocketStock}
              setTimeRange={setTimeRange}
              displayStock={displayStock}
              newsArticle={newsArticle}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
