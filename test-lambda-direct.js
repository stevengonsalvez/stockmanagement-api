const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  }
});

async function testMinimalLambda() {
  try {
    console.log('Testing minimal Lambda function...');
    
    const response = await lambda.send(new InvokeCommand({
      FunctionName: 'CdkStack-DebugLambdaF89F4536-15cdcc5b',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        test: 'payload'
      })
    }));

    if (response.FunctionError) {
      console.error('Function Error:', response.FunctionError);
      const payload = JSON.parse(new TextDecoder().decode(response.Payload));
      console.error('Error details:', JSON.stringify(payload, null, 2));
    } else {
      console.log('Lambda execution status:', response.StatusCode);
      const payload = JSON.parse(new TextDecoder().decode(response.Payload));
      console.log('Lambda response:', JSON.stringify(payload, null, 2));
    }
  } catch (error) {
    console.error('Invocation error:', error);
  }
}

testMinimalLambda();