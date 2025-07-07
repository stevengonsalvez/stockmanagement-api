export interface InventoryItem {
  PK: string; // SKU#{sku}
  SK: string; // LOCATION#{locationId}#BUCKET#{bucket}
  quantity: number;
  version: number;
  lastUpdatedAt: string;
}

export interface StockMovement {
  sku: string;
  from: {
    locationId: string;
    bucket: string;
  };
  to: {
    locationId: string;
    bucket: string;
  };
  quantity: number;
}
