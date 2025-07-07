// ABOUTME: Tests DynamoDB connectivity from Lambda environment
// Simple handler to debug connectivity issues

const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Environment:', {
    TABLE_NAME: process.env.TABLE_NAME,
    DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
    AWS_REGION: process.env.AWS_REGION,
    NODE_ENV: process.env.NODE_ENV
  });

  try {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT,
    });

    const command = new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: { S: 'SKU#ITEM-123' },
        SK: { S: 'SKU#ITEM-123' }
      }
    });

    console.log('Attempting DynamoDB GetItem...');
    const response = await client.send(command);
    console.log('DynamoDB response:', JSON.stringify(response, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'DynamoDB connection successful',
        item: response.Item,
        endpoint: process.env.DYNAMODB_ENDPOINT
      })
    };
  } catch (error) {
    console.error('DynamoDB error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'DynamoDB connection failed',
        error: error.message,
        endpoint: process.env.DYNAMODB_ENDPOINT
      })
    };
  }
};