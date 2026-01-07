import { COMPANY_NAMES } from '../utils/stockData';
import {useEffect, useState, useRef, useLayoutEffect} from 'react'



function SearchBox({ onChange }) {
    return ( 
    <div>
      <input 
        type="text" 
        onChange={ onChange } 
        placeholder='Search' 
        className='w-full px-4 py-2 bg-zinc-900 border-b border-stone-800 text-white focus:outline-none'
      />
    </div> 
    );
}


export default function StockList({ displayStock, setSelectStock, selectedSymbol }) {
  const [filtered, setFiltered] = useState(displayStock)
  const [searchTerm, setSearchTerm] = useState('');
  const [flashTimes, setFlashTimes] = useState({});

  const previousPrices = useRef({});

  // Filter function that creates a filtered list of stocks based on user input, gets used by the SearchBox componenent
  const Filter = (event) => {
    setSearchTerm(event.target.value.toUpperCase());
  }

  // Checks for search box input and updates filtered state based on input
  useEffect(() => {
    if (searchTerm === '') {
      setFiltered(displayStock);
    } else {
      setFiltered(displayStock.filter(f => 
        f.symbol.toUpperCase().startsWith(searchTerm) ||
        COMPANY_NAMES[f.symbol].toUpperCase().startsWith(searchTerm)
      ));
    }
  }, [displayStock, searchTerm]);


  // Flash text green and red
  useLayoutEffect(() => {
    const changed = [];
    const now = Date.now();
    const newFlashTimes = {};

    displayStock.forEach(stock => {
      const prev = previousPrices.current[stock.symbol];

      if (prev === undefined) {
        previousPrices.current[stock.symbol] = stock.close;
      } else if (prev !== stock.close) {
        newFlashTimes[stock.symbol] = {
          time: now,
          direction: stock.close > prev ? "up" : "down"
        };
        changed.push(stock.symbol)
        previousPrices.current[stock.symbol] = stock.close;
      }
    });

    setFlashTimes(prev => ({ ...prev, ...newFlashTimes }));

    if (changed.length > 0) {                       
      setTimeout(() => {
        setFlashTimes({})
      }, 500);
    }
  }, [displayStock])



  return (
    <div>
      <div className='sticky top-0'>
        <SearchBox onChange={Filter} />
      </div>
      <ul>
        {filtered.map((data) => {
          const isSelected = data.symbol === selectedSymbol;
          const flash = flashTimes[data.symbol];
          const isFlashing = flash && Date.now() - flash.time < 500;

          return (
            <li
              key={data.id}
              onClick={() => setSelectStock(data.symbol)}
              className={`
                flex justify-between items-center
                px-3 py-2 cursor-pointer transition
                ${isSelected ? "bg-zinc-900" : "hover:bg-zinc-900"}
              `}
            >
              <div>
                <div className="text-white font-bold">{COMPANY_NAMES[data.symbol]}</div>
                <div className="text-zinc-400 text-sm">{data.symbol}</div>
              </div>
              
              <div className={
                isFlashing
                  ? flash.direction === "up" ? "text-green-400" : "text-red-500"
                  : "text-white"
              }>
                ${Math.round(data.close * 100) / 100}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


