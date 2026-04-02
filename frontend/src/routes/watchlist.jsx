import { useState, useEffect } from 'react';
import { authFetch } from '../components/Utils/authFetch';
import { useNavigate } from 'react-router-dom';
import StockList from '../components/StockList/StockList';
import ChartComponent from '../components/Chart/ChartComponent';
import  { COMPANY_NAMES }  from '../utils/stockData';


async function deleteWatchlist(userSelectedWatchList, userWatchLists, setRefreshTrigger) {
    let watchlistID = null

    userWatchLists.map((watchlist) => {
        if (watchlist['name'] === userSelectedWatchList) {
            watchlistID = watchlist['id'];
        }
    })

    const response = await fetch(`${import.meta.env.VITE_API_URL}watchlists/${watchlistID}/`, {
        method: 'DELETE',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`
        },
    });

    if (response.ok) {
        setRefreshTrigger(prev => prev + 1)
    }
}


function WatchListRow({setRefreshTrigger, userWatchLists, userSelectedWatchList, setUserSelectedWatchList, setShowCreateWatchlist}) {
  return (
    <>
        <div className='flex flex-row w-[70rem] place-content-start gap-3 pb-2'>
            {userWatchLists.map((name) => {
                return (
                    <div 
                        className={`flex flex-row rounded-md  bg-stone-900 hover:bg-stone-800
                        ${userSelectedWatchList === name['name'] ? 'border-2 border-green-400' : 'border-2 border-stone-800'}`} 
                        key={name['name']} 
                        onClick={() => setUserSelectedWatchList(name['name'])}>
                        <p className='flex items-center text-md pt-0.5 pb-0.5 pl-2 pr-2 hover:cursor-pointer '>{name['name']}</p>
                        {userSelectedWatchList === name['name'] ? 
                        <button 
                        className='flex pb-1 mr-1 hover:border-0 hover:bg-stone-600 hover:cursor-pointer bg-stone-700 items-center justify-center self-center w-[1.1rem] h-[1.1rem] border-1 border-black text-black rounded-xl'
                        onClick={() => deleteWatchlist(userSelectedWatchList, userWatchLists, setRefreshTrigger
                        )}
                        >
                            x
                        </button>
                        : null}
                    </div>
                )
            })}
            <div 
            className='flex text-xl hover:bg-stone-700 hover:cursor-pointer pb-1 w-[2rem] h-[2rem] items-center justify-center rounded-xl border-2 border-stone-800 bg-stone-900'
            onClick={() => setShowCreateWatchlist(true)}
            >
                +
            </div>
        </div>
    </>
  )
}


function symbolInWatchlist({companySymbol, watchlistSelectedSymbols, setWatchlistSelectedSymbols}) {
    if (!watchlistSelectedSymbols.includes(companySymbol)) {
        setWatchlistSelectedSymbols([...watchlistSelectedSymbols, companySymbol])
    } else {
        setWatchlistSelectedSymbols(watchlistSelectedSymbols.filter(s => s !== companySymbol))
    }
}


async function watchlistPOST({
    watchlistName,
    watchlistSelectedSymbols, 
    currentUser, 
    setShowCreateWatchlist, 
    setWatchlistName, 
    setWatchlistSelectedSymbols,
    setWatchlistFeedback,}) {

    console.log(watchlistSelectedSymbols)
    console.log(watchlistName)
    console.log(currentUser)
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}watchlists/`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
            name: watchlistName,
            symbols: watchlistSelectedSymbols
        })
    });

    console.log(response)
    const data = await response.json()
    console.log(data)

    const timer = setTimeout(() => {
        setWatchlistFeedback("");
    }, 2000);

    if (response.status === 200 || response.status === 201) {
        setShowCreateWatchlist(false);
        setWatchlistName("")
        setWatchlistSelectedSymbols([])
    } else {
        if (data.response) {
            setWatchlistFeedback(data.response[0])
        }
    }
};


function CreateWatchList({
    setShowCreateWatchlist, 
    watchlistSelectedSymbols, 
    setWatchlistSelectedSymbols, 
    setWatchlistName, 
    watchlistName, 
    currentUser, 
    }) {


    const companyNames = COMPANY_NAMES
    console.log(companyNames)

    const [watchlistFeedback, setWatchlistFeedback] = useState("")

    const companySymbols = [
        'AAPL','ABBV','ABT','ADBE','AMD','AMZN','AVGO','AXP','BAC',
        'BLK','BRK.B','CAT','CMCSA','COST','CRM','CSCO','CVX','DIS','GE',
        'GOOG','GS','HD','INTU','JNJ','JPM','KO','LLY','MA','MCD','META',
        'MRK','MS','MSFT','MU','NFLX','NOW','NVDA','ORCL','PEP','PG',
        'QCOM','TMO','TMUS','TSLA','TXN','UNH','V','WFC','WMT','XOM',
    ]

    useEffect(() => {
        const handleEscape = async (e) => {
        if (e.key === "Escape") {
            setShowCreateWatchlist(false);
        }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape)
    }, []);

    return (
        <>
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                <div className='flex flex-col h-[30rem] w-[25rem] gap-5 bg-neutral-950 p-5 rounded-lg'>
                    <button
                    className='flex self-end shrink-0 hover:bg-stone-700 hover:cursor-pointer w-[2rem] h-[2rem] items-center justify-center rounded-xl border-2 border-stone-800 bg-stone-900'
                    onClick={() => setShowCreateWatchlist(false)}
                    >X</button>
                    <div className='flex flex-col gap-1'>
                        <p className='flex self-center'>Watchlist name:</p>                        
                        <input
                        value={watchlistName}
                        onChange={(e) => setWatchlistName(e.target.value)} 
                        className='flex self-center border-2 pl-2 pr-2 border-stone-800 rounded-md w-[10rem]'></input>
                    </div>
                    <div className='flex h-0 items-center justify-center text-red-400'>
                        {watchlistFeedback}
                    </div>
                    <p className='flex self-center'>Select the symbols you want in your watchlist</p>
                    <div className='flex self-center border-2 border-stone-900 p-3 rounded-md flex-col w-[20rem] gap-2 overflow-y-auto thin-scrollbar'>
                        {companySymbols.map((companySymbol) => {
                            return (
                                <div 
                                className='flex flex-row gap-2 items-center'
                                key={companySymbol}>
                                    <button
                                    onClick={() => symbolInWatchlist({companySymbol, watchlistSelectedSymbols, setWatchlistSelectedSymbols, setShowCreateWatchlist})}
                                    className={`flex w-[1.3rem] h-[1.3rem] border-1 rounded-md
                                    ${watchlistSelectedSymbols.includes(companySymbol) ? 'border-stone-800 bg-green-400' : 'border-stone-800'}`}>
                                    </button>
                                    {companySymbol}
                                </div>
                            )
                        })}
                    </div>

                    <button 
                    className='flex self-center border-2 border-stone-800 pt-2 pb-2 pl-3 pr-3 rounded-md hover:bg-stone-800 hover:cursor-pointer'
                    onClick={() => watchlistPOST({
                        watchlistSelectedSymbols, 
                        watchlistName, 
                        currentUser, 
                        setShowCreateWatchlist, 
                        setWatchlistSelectedSymbols, 
                        setWatchlistName,
                        setWatchlistFeedback})}>
                    Submit
                    </button>
                </div>
            </div>
        </>
    )
}


function Watchlist({
    currentUser, 
    setSelectedSymbol, 
    selectedSymbol, 
    displayStock, 
    setIsLoggedIn,
    intradayStock, 
    eodStock, 
    timeRange, 
    websocketStock, 
    setTimeRange,
    newsArticle,
    isLoggedIn
    }) {
    
    const [userWatchLists, setUserWatchLists] = useState([]);
    const [userSelectedWatchList, setUserSelectedWatchList] = useState()
    const [watchList, setWatchlist] = useState([]);
    const [watchlistDisplayStock, setWatchlistDisplayStock] = useState([])
    const [showCreateWatchlist, setShowCreateWatchlist] = useState(false)
    const [watchlistSelectedSymbols, setWatchlistSelectedSymbols] = useState([])
    const [watchlistName, setWatchlistName] = useState("")
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    let navigate = useNavigate();

    useEffect(() => {
        authFetch(`${import.meta.env.VITE_API_URL}watchlists/`, { 
            method: "GET", 
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                "Content-Type": "application/json",
            },
        })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(data => setWatchlist(data))
        .catch(() => {
            // if refresh failed, log out user and redirect to home
            localStorage.clear();
            setIsLoggedIn(false);
            navigate("/");
        });
    }, [showCreateWatchlist, refreshTrigger]);


    useEffect(() => {
        if (!isLoggedIn){
            navigate("/");
        }
    }, [isLoggedIn, navigate])


    useEffect(() => {
        let userWatchListsPopulate = []

        watchList.map((lists) => {
            console.log("testing: ", lists)
            let watchListObject = {
                "id":lists.id,
                "name": lists.name
            }
            console.log("testing2: ", watchListObject)
            userWatchListsPopulate.push(watchListObject)
        })
        
        setUserWatchLists(userWatchListsPopulate)

    }, [watchList])


    useEffect(() => {
        let watchlistStocks = []
        let selectedList = null

        if (watchList[0]) {
            watchList.map((list) => {
                if (list.name === userSelectedWatchList) {
                    selectedList = list
                }
            })
        }
        
        if (selectedList) {
            selectedList.symbols.map((searchSymbol) => {
                watchlistStocks.push(displayStock.find(stock => stock.symbol === searchSymbol))
            })
        }

        setWatchlistDisplayStock(watchlistStocks)

    }, [watchList, userSelectedWatchList])


    return (
        <>   
            <WatchListRow 
                userWatchLists={userWatchLists}
                userSelectedWatchList={userSelectedWatchList}
                setUserSelectedWatchList={setUserSelectedWatchList}
                setShowCreateWatchlist={setShowCreateWatchlist}
                setUserWatchLists={setUserWatchLists}
                setRefreshTrigger={setRefreshTrigger}
            />
            <div className="flex flex-1 overflow-hidden">
                <div className="border border-stone-800 rounded-t-xl h-full overflow-y-auto w-[21rem] thin-scrollbar">
                <StockList 
                    displayStock={watchlistDisplayStock}
                    setDisplayStock={setWatchlistDisplayStock}
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

            {showCreateWatchlist && (
                <CreateWatchList
                    setShowCreateWatchlist={setShowCreateWatchlist}
                    watchlistSelectedSymbols={watchlistSelectedSymbols}
                    setWatchlistSelectedSymbols={setWatchlistSelectedSymbols}
                    watchlistName={watchlistName}
                    setWatchlistName={setWatchlistName}
                    currentUser={currentUser}
                />
            )}

        </>
    )
}

export default Watchlist