// Chart/TimeRangeButtons.jsx
export default function TimeRangeButtons({ timeRange, setTimeRange }) {
  const ranges = ["1D", "1W", "1M", "3M", "1Y", "YTD"];
  
  return (
    <div className="flex flex-row gap-4 justify-center pb-2 border-b-1 border-stone-800">
      {ranges.map(range => (
        <button 
          key={range}
          className={timeRange === range ? "active" : ""}
          onClick={() => setTimeRange(range)}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

