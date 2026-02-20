import ChartComponent from '../components/Chart/ChartComponent';
import StockList from '../components/StockList/StockList';


function Home({
    displayStock, 
    setDisplayStock, 
    setSelectedSymbol, 
    selectedSymbol, 
    intradayStock, 
    eodStock, 
    timeRange, 
    websocketStock, 
    setTimeRange,
    newsArticle    
    }) {
    console.log("displayStock: ", displayStock)    
    
    return (
        <div className="flex flex-1 overflow-hidden">
          <div className="border border-stone-800 rounded-t-xl h-full overflow-y-auto w-[21rem] thin-scrollbar">
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
    )
}

export default Home