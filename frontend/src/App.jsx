import { useState, useEffect } from 'react';
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import 'chartjs-adapter-date-fns'


defaults.maintainAspectRatio = false;
defaults.responsive = true;

function App() {

  const [display_stock, setDisplayStock] = useState ([]);
  const [intraday_stock, setIntradayStock] = useState ([]);
  const [eod_stock, setEODStock] = useState ([]);
  const [websocket_stock, setWebsocket_stock] = useState ([]);

  
  // Hook to fetch each symbol with their most recent close value for display
  useEffect(() => {
    const fetchDisplayStocks = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}display_intraday/`);
      let display_stock_data = await response.json();
      setDisplayStock(display_stock_data);
    };
    fetchDisplayStocks();
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


  // Hook that fetches all data from the intraday table
  useEffect(() => {
    const fetchIntradayStocks = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}mock_stocks/`);
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

  return (
    <>
      <div style={{ height: '600px', width: '1000px' }}>
          <Line
            // THIS GENERATES A GRAPH BASED ON WHICH SYMBOL YOU GIVE IT
            data={{
              labels: eod_stock.filter((data) => data.symbol === "JPM")
              .map((data) => new Date(data.time_epoch_ms).toLocaleString()).reverse(),
              datasets: [
                { 
                  label: "",
                  data: eod_stock.filter((data) => data.symbol === "JPM")
                  .map((data) => Math.round(data.close * 100) / 100).reverse(),
                  borderColor: 'rgba(44, 181, 92, 1)',
                  borderWidth: 1.5,
                  fill: true,
                  pointStyle: 'circle',
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
            }}
            options={{
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  //max: 25, //this is one trading day for intraday
                  type: 'category', //This makes it so that gaps dont exist between trading days
                  grid: {
                    display: false,
                  },
                  ticks: {
                    display: false,
                  }
                },
                y: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    crossAlign: 'far',
                    color: "gray",
                  },
                },
              },
              elements: {
                line: {
                  borderJoinStyle: "round",
                },
              },
            }}
          />
      </div>
      
      <div>
        <h1>Stocks</h1>

        <ul>
          {display_stock.map((data) => (
            <li key={data.id}>
              {data.symbol}: ${Math.round(data.close * 100) / 100}
            </li>
          ))}
        </ul>
        <h2>Live Updates</h2>
        {websocket_stock.symbol ? (
          <p>
            {websocket_stock.time} | {websocket_stock.symbol}: ${websocket_stock.price} 
          </p>
        ) : (
          <p>Waiting for live data...</p>
        )}
      </div>
    </>
  );
}

export default App;
