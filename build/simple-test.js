exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Simple handler works',
      event: event,
      timestamp: new Date().toISOString()
    })
  };
};