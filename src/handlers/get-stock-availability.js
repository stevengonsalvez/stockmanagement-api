const inventoryService = require('../services/inventoryService');

exports.handler = async (event) => {
  try {
    const { sku } = event.pathParameters;
    const availability = await inventoryService.getStockAvailability(sku);
    return {
      statusCode: 200,
      body: JSON.stringify(availability),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error getting stock availability', error: error.message }),
    };
  }
};