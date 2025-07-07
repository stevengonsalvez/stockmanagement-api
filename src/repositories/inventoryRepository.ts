import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand, QueryCommand, TransactGetCommand } from '@aws-sdk/lib-dynamodb';
import { InventoryItem, StockMovement } from '../models/inventory';

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  region: process.env.AWS_REGION || 'us-east-1',
});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME;
console.log('InventoryRepository: Table Name:', tableName);

export const getStockBySku = async (sku: string): Promise<InventoryItem[]> => {
  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `SKU#${sku}`,
    },
    ConsistentRead: false, // Eventual consistency for reads
  });

  const { Items } = await docClient.send(command);
  return Items as InventoryItem[];
};

export const moveStock = async (movement: StockMovement): Promise<void> => {
  const { sku, from, to, quantity } = movement;

  const fromPk = `SKU#${sku}`;
  const fromSk = `LOCATION#${from.locationId}#BUCKET#${from.bucket}`;
  const toPk = `SKU#${sku}`;
  const toSk = `LOCATION#${to.locationId}#BUCKET#${to.bucket}`;

  console.log('moveStock: fromPk:', fromPk, 'fromSk:', fromSk);
  console.log('moveStock: toPk:', toPk, 'toSk:', toSk);

  // 1. Get current state of both items transactionally
  const getCommand = new TransactGetCommand({
    TransactItems: [
            { Get: { TableName: tableName, Key: { PK: fromPk, SK: fromSk }, ConsistentRead: true } },,
      { Get: { TableName: tableName, Key: { PK: toPk, SK: toSk } } },
    ],
  });

  const { Responses } = await docClient.send(getCommand);
  console.log('moveStock: TransactGet Responses:', Responses);
  const [fromItem, toItem] = Responses.map(r => r.Item) as [InventoryItem, InventoryItem | undefined];
  console.log('moveStock: fromItem:', fromItem, 'toItem:', toItem);

  // 2. Validate the 'from' item
  if (!fromItem) {
    throw new Error(`Source stock not found for SKU ${sku} at ${from.locationId}/${from.bucket}`);
  }
  if (fromItem.quantity < quantity) {
    throw new Error(`Insufficient stock for SKU ${sku} at ${from.locationId}/${from.bucket}. Required: ${quantity}, Available: ${fromItem.quantity}`);
  }

  // 3. Prepare the transaction write items
  const transactItems: any[] = [];

  // Update 'from' item
  transactItems.push({
    Update: {
      TableName: tableName,
      Key: { PK: fromPk, SK: fromSk },
      UpdateExpression: 'SET quantity = quantity - :q, version = version + :one, lastUpdatedAt = :now',
      ConditionExpression: 'version = :fromVersion',
      ExpressionAttributeValues: {
        ':q': quantity,
        ':one': 1,
        ':fromVersion': fromItem.version,
        ':now': new Date().toISOString(),
      },
    },
  });

  // Update or create 'to' item
  if (toItem) {
    // If 'to' item exists, update it
    transactItems.push({
      Update: {
        TableName: tableName,
        Key: { PK: toPk, SK: toSk },
        UpdateExpression: 'SET quantity = quantity + :q, version = version + :one, lastUpdatedAt = :now',
        ConditionExpression: 'version = :toVersion',
        ExpressionAttributeValues: {
          ':q': quantity,
          ':one': 1,
          ':toVersion': toItem.version,
          ':now': new Date().toISOString(),
        },
      },
    });
  } else {
    // If 'to' item does not exist, create it
    transactItems.push({
      Put: {
        TableName: tableName,
        Item: {
          PK: toPk,
          SK: toSk,
          quantity: quantity,
          version: 1,
          lastUpdatedAt: new Date().toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      },
    });
  }

  const writeCommand = new TransactWriteCommand({
    TransactItems: transactItems,
  });

  try {
    await docClient.send(writeCommand);
  } catch (error: any) {
    if (error.name === 'TransactionCanceledException') {
      // This indicates a concurrency conflict (optimistic locking failure) or a condition check failure.
      // The service layer should handle this, probably with a retry mechanism.
      throw new Error('Concurrency conflict. Please retry the operation.');
    }
    throw error;
  }
};
