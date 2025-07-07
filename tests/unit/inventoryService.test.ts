import * as inventoryService from '../../src/services/inventoryService';
import * as inventoryRepository from '../../src/repositories/inventoryRepository';
import { StockMovement } from '../../src/models/inventory';

jest.mock('../../src/repositories/inventoryRepository');

describe('Inventory Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStockAvailability', () => {
    it('should calculate total stock correctly', async () => {
      const mockItems = [
        { PK: 'SKU#TSHIRT', SK: 'LOC#A#BUCKET#ON_HAND', quantity: 100, version: 1, lastUpdatedAt: '' },
        { PK: 'SKU#TSHIRT', SK: 'LOC#B#BUCKET#IN_TRANSIT', quantity: 50, version: 1, lastUpdatedAt: '' },
      ];
      (inventoryRepository.getStockBySku as jest.Mock).mockResolvedValue(mockItems);

      const result = await inventoryService.getStockAvailability('TSHIRT');

      expect(result.sku).toBe('TSHIRT');
      expect(result.totalStock).toBe(150);
    });
  });

  describe('moveStock', () => {
    it('should call the repository to move stock', async () => {
      const movement: StockMovement = {
        sku: 'TSHIRT',
        from: { locationId: 'A', bucket: 'ON_HAND' },
        to: { locationId: 'B', bucket: 'IN_TRANSIT' },
        quantity: 10,
      };

      (inventoryRepository.moveStock as jest.Mock).mockResolvedValue(undefined);

      await inventoryService.moveStock(movement);

      expect(inventoryRepository.moveStock).toHaveBeenCalledWith(movement);
    });

    it('should throw an error for non-positive quantity', async () => {
      const movement: StockMovement = {
        sku: 'TSHIRT',
        from: { locationId: 'A', bucket: 'ON_HAND' },
        to: { locationId: 'B', bucket: 'IN_TRANSIT' },
        quantity: 0,
      };

      await expect(inventoryService.moveStock(movement)).rejects.toThrow('Quantity must be positive');
    });
  });
});
