export default function StockList({ displayStock, onSelectStock }) {
  return (
    <div>
      <h1>Stocks</h1>
      <ul>
        {displayStock.map((data) => (
          <li 
            className="hover:bg-zinc-900"
            key={data.id}
            onClick={() => onSelectStock(data.symbol)}
            style={{ cursor: "pointer" }}
            >
            {data.symbol}: ${Math.round(data.close * 100) / 100}
          </li>
        ))}
      </ul>
    </div>
  );
}
