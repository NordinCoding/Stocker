import { COMPANY_NAMES } from '../utils/stockData';

export default function StockList({ displayStock, onSelectStock, selectedSymbol }) {
  return (
    <div>
      <ul>
        {displayStock.map((data) => {
          const isSelected = data.symbol === selectedSymbol;

          return (
            <li
              key={data.id}
              onClick={() => onSelectStock(data.symbol)}
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
              <div>${Math.round(data.close * 100) / 100}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


