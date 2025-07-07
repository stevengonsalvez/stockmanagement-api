const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  }
});

const docClient = DynamoDBDocumentClient.from(client);

async function initTestData() {
  const tableName = 'CdkStack-InventoryCFCBEC24-3fcc0c79';
  
  try {
    // Add some initial stock in RECEIVING bucket
    const item = {
      PK: 'SKU#ITEM-123',
      SK: 'LOCATION#WAREHOUSE-01#BUCKET#RECEIVING',
      quantity: 500,
      version: 1,
      lastUpdatedAt: new Date().toISOString()
    };
    
    const command = new PutCommand({
      TableName: tableName,
      Item: item
    });
    
    await docClient.send(command);
    console.log('Test data initialized successfully');
    console.log('Added:', item);
    
  } catch (error) {
    console.error('Error initializing test data:', error);
  }
}

initTestData();