const inventoryService = require('../services/inventoryService');

exports.handler = async (event) => {
  try {
    const movement = JSON.parse(event.body);
    await inventoryService.moveStock(movement);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Stock moved successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error moving stock', error: error.message }),
    };
  }
};