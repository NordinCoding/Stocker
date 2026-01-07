import { useState, useEffect } from "react";

// function that calculates wether the market is currently open or not for display
function MarketStatus({ estTime }) {
    const estString = estTime.toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        hour12: false 
    });
    
    const estDate = new Date(estString);
    const hours = estDate.getHours();
    const minutes = estDate.getMinutes();
    const day = estDate.getDay();

    // Check if its saturday or sunday, if true market is closed all day
    if (day === 0 || day === 6) {
        return <h2 className="font-mono tracking-wider text-4xl text-red-400">CLOSED</h2>;
    }
    
    // Set isOpen to True if the current EST time is between 9:30am and 4PM EST
    const isOpen = (hours > 9 || (hours === 9 && minutes >= 30)) && hours < 16;

    if (isOpen) {
        return <h2 className="font-mono tracking-wider text-4xl text-green-400">OPEN</h2>;
    } else {
        return <h2 className="font-mono tracking-wider text-4xl text-red-400">CLOSED</h2>;
    }
}


const LiveClockUpdate = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timerID = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timerID);
    }, []);

    const estTime = date.toLocaleTimeString('nl-NL', { timeZone: 'America/New_York' });

    return (
        <div className="flex flex-row justify-center gap-18 pt-10">
            <div className="flex flex-col justify-center pt-10 pl-5 shadow-green-400 shadow-sm border-white/10 rounded-md border-1 border-white h-30 w-65">
                <p className="text-neutral-400" >New York, US / EST</p>
                <h2 className="font-mono tracking-wider text-4xl pb-10">
                {date.toLocaleTimeString('nl-NL', { timeZone: 'America/New_York' })}
                </h2>
            </div>
            <div className="flex flex-col pb-11 w-65 justify-center pl-5 pt-10 shadow-green-400 shadow-sm border-white/10 rounded-md border-1 border-white h-30 ">
                <h2 className="font-mono text-neutral-400">Market Status:</h2>
                <MarketStatus estTime={date} ></MarketStatus>
            </div>
        </div>
        );
};

export default LiveClockUpdate;