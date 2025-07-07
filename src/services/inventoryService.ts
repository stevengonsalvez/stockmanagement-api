import * as inventoryRepository from '../repositories/inventoryRepository';
import { StockMovement } from '../models/inventory';

export const getStockAvailability = async (sku: string) => {
  const items = await inventoryRepository.getStockBySku(sku);

  // In a real-world scenario, you'd have more complex logic here to
  // determine availability based on bucket types (e.g., ON_HAND - RESERVED)
  const totalStock = items.reduce((acc, item) => acc + item.quantity, 0);

  return { sku, totalStock };
};

export const moveStock = async (movement: StockMovement) => {
  // Add any business logic validation here before calling the repository
  if (movement.quantity <= 0) {
    throw new Error('Quantity must be positive');
  }

  await inventoryRepository.moveStock(movement);
};
