// Set environment variables
process.env.TABLE_NAME = 'CdkStack-InventoryCFCBEC24-fde6c5ca';
process.env.DYNAMODB_ENDPOINT = 'http://localhost:4566';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';
process.env.AWS_REGION = 'us-east-1';

// Load the handler
const { handler } = require('./build/get-stock-availability.js');

// Create test event
const testEvent = {
  pathParameters: { sku: 'ITEM-123' },
  httpMethod: 'GET',
  headers: { 'Content-Type': 'application/json' }
};

// Test the handler
async function test() {
  try {
    console.log('Testing handler with event:', testEvent);
    const result = await handler(testEvent);
    console.log('Handler result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Handler error:', error);
  }
}

test();