function DisplayStockPrice({ displayStock, selectedSymbol }) {
    return (
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
    );
}

export default DisplayStockPrice