const axios = require('axios');

const API_BASE = 'http://localhost:4566/restapis/o0rbeiz651/test/_user_request_';

async function testAPIs() {
  console.log('Testing Retail Inventory Microservice APIs...\n');

  // Test 1: Get stock availability
  try {
    console.log('1. Testing GET /stock/availability/{sku}');
    const response = await axios.get(`${API_BASE}/stock/availability/ITEM-123`);
    console.log('✓ Success:', response.data);
  } catch (error) {
    console.log('✗ Failed:', error.response?.data || error.message);
  }

  // Test 2: Move stock
  try {
    console.log('\n2. Testing POST /stock/movements');
    const moveData = {
      sku: 'ITEM-123',
      quantity: 10,
      from: {
        locationId: 'WAREHOUSE-01',
        bucket: 'RECEIVING'
      },
      to: {
        locationId: 'WAREHOUSE-01',
        bucket: 'ON_HAND'
      }
    };
    const response = await axios.post(`${API_BASE}/stock/movements`, moveData);
    console.log('✓ Success:', response.data);
  } catch (error) {
    console.log('✗ Failed:', error.response?.data || error.message);
  }

  // Test 3: Check stock after movement
  try {
    console.log('\n3. Checking stock after movement');
    const response = await axios.get(`${API_BASE}/stock/availability/ITEM-123`);
    console.log('✓ Success:', response.data);
  } catch (error) {
    console.log('✗ Failed:', error.response?.data || error.message);
  }
}

testAPIs().catch(console.error);