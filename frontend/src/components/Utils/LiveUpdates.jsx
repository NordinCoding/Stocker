export default function LiveUpdates({ websocketStock }) {
  return (
    <div>
      <h2>Live Updates</h2>
      {websocketStock.symbol ? (
        <p>
          {websocketStock.time} | {websocketStock.symbol}: $
          {websocketStock.price}
        </p>
      ) : (
        <p>Waiting for live data...</p>
      )}
    </div>
  );
}
