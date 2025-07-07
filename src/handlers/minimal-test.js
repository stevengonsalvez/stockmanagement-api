// ABOUTME: Absolute minimal test handler to verify Lambda execution
// No dependencies, just basic JavaScript

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Minimal handler works',
      timestamp: new Date().toISOString()
    })
  };
};