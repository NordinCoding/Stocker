import { useState, useEffect } from 'react'

function App() {

  const [stock, setStock] = useState ([]);

  useEffect(() => {
    stocks()
  }, []);

  const stocks = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}intraday_stocks/`)

    let stock_data = await response.json()
    console.log(stock_data)

    setStock(stock_data)
  }
  
  return (
    <>
    <div>
      <h1>Stocks</h1>
      <ul>
        {stock.map((data) => {
          return(
            <li key={data.id}>{data.symbol}: ${data.close}</li>
          )
        })}
      </ul>
    </div>
    </>
  );
}

export default App;
