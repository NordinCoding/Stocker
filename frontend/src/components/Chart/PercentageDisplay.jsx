// component that dynamically displays price change in percentage dependant on which symbol and timeRange is selected
function PercentageDisplay({ chartPercentage }) {
  const timeRanges = {"1D": "In the last day",
                      "1W": "In the last week",
                      "1M": "In the last month",
                      "3M": "In the last 3 months",
                      "1Y": "In the last year",
                      "YTD": "Since Jan 1st 2022"
  }

  if (chartPercentage.percentage > 0) {
    return (<p className="text-green-400">+{chartPercentage.percentage}% {timeRanges[chartPercentage.timeRange]} (+${chartPercentage.price_change})</p>)
  } else {
    return (<p className="text-red-400">{chartPercentage.percentage}% {timeRanges[chartPercentage.timeRange]} (-${Math.abs(chartPercentage.price_change)})</p>)
  }
}

export default PercentageDisplay