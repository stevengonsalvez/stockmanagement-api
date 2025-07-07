import axios from 'axios';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'https://fi9fcc9cow.execute-api.localhost.localstack.cloud:4566/prod'; // Replace with your actual API Gateway endpoint

export const getStockAvailability = async (sku: string) => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/stock/availability/${sku}`);
    return response.data;
  } catch (error) {
    console.error('Error getting stock availability:', error);
    throw error;
  }
};

export const moveStock = async (movement: any) => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/stock/movements`, movement);
    return response.data;
  } catch (error) {
    console.error('Error moving stock:', error);
    throw error;
  }
};
