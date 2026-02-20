import { useState, useEffect } from 'react';
import { authFetch } from '../components/Utils/authFetch';
import StockList from '../components/StockList/StockList';


function Watchlist({currentUser, setSelectedSymbol, selectedSymbol, displayStock, setIsLoggedIn}) {

    const [watchList, setWatchlist] = useState([]);
    const [watchlistDisplayStock, setWatchlistDisplayStock] = useState([])
    console.log(currentUser)

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
    }, []);

    console.log(watchList)

    useEffect(() => {
        let watchlistStocks = []

        if (watchList[0]) {
            watchList[0].symbols.map((searchSymbol) => {
                watchlistStocks.push(displayStock.find(stock => stock.symbol === searchSymbol))
            })
        }

        setWatchlistDisplayStock(watchlistStocks)

    }, [watchList])


    return (
        <>
            <div>
                <p>WATCHLISTS HERE</p>
                {watchList.map(list => (
                    <div key={list.user}>
                        <h2>{list.name}</h2>
                        <p>{list.symbols.join(", ")}</p>
                    </div>
                    ))}
            </div>
            <div className="border border-stone-800 rounded-t-xl h-full overflow-y-auto w-[21rem] thin-scrollbar">
            <StockList 
                displayStock={watchlistDisplayStock}
                setDisplayStock={setWatchlistDisplayStock}
                setSelectStock={setSelectedSymbol}
                selectedSymbol={selectedSymbol}
            />
            </div>
        </>
    )
}

export default Watchlist