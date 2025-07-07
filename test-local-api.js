const axios = require('axios');

const API_URL = 'http://localhost:4566/restapis/2toha148bc/prod/_user_request_';

async function testAPI() {
  try {
    // Test 1: Create some initial stock
    console.log('Creating initial stock...');
    const moveResponse = await axios.post(`${API_URL}/stock/movements`, {
      sku: 'ITEM-123',
      from: {
        locationId: 'WAREHOUSE-01',
        bucket: 'RECEIVING'
      },
      to: {
        locationId: 'WAREHOUSE-01',
        bucket: 'ON_HAND'
      },
      quantity: 100
    });
    console.log('Stock movement response:', moveResponse.status);

    // Test 2: Check stock availability
    console.log('\nChecking stock availability...');
    const availabilityResponse = await axios.get(`${API_URL}/stock/availability/ITEM-123`);
    console.log('Stock availability:', availabilityResponse.data);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testAPI();