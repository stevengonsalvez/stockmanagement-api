const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  }
});

async function testLambda() {
  try {
    const response = await lambda.send(new InvokeCommand({
      FunctionName: 'CdkStack-GetStockAvailability6D1C-42cb1b18',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        pathParameters: { sku: 'ITEM-123' },
        httpMethod: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    }));

    const payload = JSON.parse(new TextDecoder().decode(response.Payload));
    console.log('Lambda response:', JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testLambda();