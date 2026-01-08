// Filter which dataset to use based on which option was chosen
export const getFilteredData = (timeRange, intradayStock, eodStock, selectedSymbol) => {
    let sourceData;
    let cutoffDate = new Date();

    switch (timeRange) {
        case "1D":
        sourceData = intradayStock;
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        break;
        case "1W":
        sourceData = intradayStock;
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
        case "1M":
        sourceData = eodStock;
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
        case "3M":
        sourceData = eodStock;
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        break;
        case "1Y":
        sourceData = eodStock;
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
        case "YTD":
        return eodStock.filter((d) => d.symbol === selectedSymbol).reverse();
        default:
        sourceData = eodStock;
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    }

    sourceData = sourceData
        .filter((d) => d.symbol === selectedSymbol)
        .filter((d) => new Date(d.time_epoch_ms) >= cutoffDate)
        .reverse();

    return sourceData
};


// Config/settings for the line charts
export const getChartOptions = (timeRange, liveData) => {
    return {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const item = liveData[index];
            return new Date(item.time_epoch_ms).toLocaleString('nl-NL', {
              timeZone: 'America/New_York'
            });
          }
        }
      }
    },
    animation: false,
    layout: {
      padding: {
        left: 0,
        right: 0
      }
    },
    scales: {
      x: {
        offset: false,
        bounds: 'ticks',
        
        // Remove some ticks from the start and one from the end to make the x axis fit better
        afterBuildTicks: (scale) => {
          if (timeRange === "1Y") {
            scale.ticks = scale.ticks.slice(6);
          } else if (timeRange === "YTD") {
            scale.ticks = scale.ticks.slice(scale.ticks.length * 0.04, -1);
          } else if (timeRange === "1W" || timeRange === "3M") {
            scale.ticks = scale.ticks.slice(2);
          } else {
            scale.ticks = scale.ticks.slice(1, -1);
          }
        },

        grid: { 
          display: true,
          drawOnChartArea: false,
          drawTicks: true,
          tickLength: 10,
          color: '#555',
        },
        ticks: {
          maxTicksLimit: 12,
          autoSkip: true,
          color: '#555',
        },
      },
      y: { 
        position: 'right',
        grid: { display: true,
                color: '#555',
                drawOnChartArea: false,
                drawTicks: false,
         }, 
        ticks: { color: "gray" } 
      },
    },
  };
}