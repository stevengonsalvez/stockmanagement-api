import React, { useState } from 'react';
import { getStockAvailability, moveStock } from './api';

function App() {
  const [sku, setSku] = useState('');
  const [stockData, setStockData] = useState<any>(null);
  const [moveForm, setMoveForm] = useState({
    sku: '',
    fromLocationId: '',
    fromBucket: '',
    toLocationId: '',
    toBucket: '',
    quantity: 0,
  });
  const [message, setMessage] = useState('');

  const handleGetStock = async () => {
    try {
      const data = await getStockAvailability(sku);
      setStockData(data);
      setMessage('');
    } catch (error) {
      setMessage(`Error getting stock: ${error.message}`);
      setStockData(null);
    }
  };

  const handleMoveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await moveStock({
        sku: moveForm.sku,
        from: { locationId: moveForm.fromLocationId, bucket: moveForm.fromBucket },
        to: { locationId: moveForm.toLocationId, bucket: moveForm.toBucket },
        quantity: moveForm.quantity,
      });
      setMessage('Stock moved successfully!');
      // Optionally, refresh stock data after movement
      setSku(moveForm.sku);
      handleGetStock();
    } catch (error) {
      setMessage(`Error moving stock: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Retail Inventory Microservice UI</h1>

      <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h2>Get Stock Availability</h2>
        <input
          type="text"
          placeholder="Enter SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <button onClick={handleGetStock} style={{ padding: '8px 15px' }}>Get Stock</button>
        {stockData && (
          <div style={{ marginTop: '15px' }}>
            <h3>Stock Data for {stockData.sku}</h3>
            <pre>{JSON.stringify(stockData, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h2>Move Stock</h2>
        <form onSubmit={handleMoveStock}>
          <div style={{ marginBottom: '10px' }}>
            <label>SKU:</label>
            <input
              type="text"
              value={moveForm.sku}
              onChange={(e) => setMoveForm({ ...moveForm, sku: e.target.value })}
              required
              style={{ marginLeft: '5px', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>From Location ID:</label>
            <input
              type="text"
              value={moveForm.fromLocationId}
              onChange={(e) => setMoveForm({ ...moveForm, fromLocationId: e.target.value })}
              required
              style={{ marginLeft: '5px', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>From Bucket:</label>
            <input
              type="text"
              value={moveForm.fromBucket}
              onChange={(e) => setMoveForm({ ...moveForm, fromBucket: e.target.value })}
              required
              style={{ marginLeft: '5px', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>To Location ID:</label>
            <input
              type="text"
              value={moveForm.toLocationId}
              onChange={(e) => setMoveForm({ ...moveForm, toLocationId: e.target.value })}
              required
              style={{ marginLeft: '5px', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>To Bucket:</label>
            <input
              type="text"
              value={moveForm.toBucket}
              onChange={(e) => setMoveForm({ ...moveForm, toBucket: e.target.value })}
              required
              style={{ marginLeft: '5px', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Quantity:</label>
            <input
              type="number"
              value={moveForm.quantity}
              onChange={(e) => setMoveForm({ ...moveForm, quantity: parseInt(e.target.value) })}
              required
              style={{ marginLeft: '5px', padding: '8px' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 15px' }}>Move Stock</button>
        </form>
      </div>

      {message && <p style={{ marginTop: '20px', color: 'green' }}>{message}</p>}
    </div>
  );
}

export default App;