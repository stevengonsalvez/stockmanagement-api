// ABOUTME: Debug handler to test Lambda execution and environment in LocalStack
// Minimal handler to debug execution issues

exports.handler = async (event, context) => {
  console.log('=== DEBUG HANDLER START ===');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  console.log('Environment Variables:', {
    TABLE_NAME: process.env.TABLE_NAME,
    DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
    AWS_REGION: process.env.AWS_REGION,
    NODE_ENV: process.env.NODE_ENV
  });
  
  try {
    console.log('Handler executing successfully');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Debug handler working',
        timestamp: new Date().toISOString(),
        environment: {
          TABLE_NAME: process.env.TABLE_NAME,
          DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT
        }
      })
    };
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Debug handler failed',
        error: error.message
      })
    };
  }
};