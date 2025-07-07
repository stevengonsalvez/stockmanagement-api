
# Architectural Design Decisions

This document outlines the key architectural and design decisions for the Retail Inventory Microservice.

## 1. DynamoDB Table Design and Partition Key Strategy

**Table Name:** `Inventory`

**Primary Key:**
*   **Partition Key (PK):** `SKU#{sku}` (e.g., `SKU#TSHIRT-RED-L`)
*   **Sort Key (SK):** `LOCATION#{locationId}#BUCKET#{bucket}` (e.g., `LOCATION#WAREHOUSE-01#BUCKET#ON_HAND`)

**Rationale:**

*   **Partition Key (PK):** Using the SKU as the partition key ensures that all inventory data for a single product is co-located in the same partition. This is highly efficient for the most common query: "get all stock for a given SKU." It provides good data distribution, assuming a reasonably large number of SKUs and that access patterns are not heavily skewed towards a small number of "hot" SKUs.
*   **Sort Key (SK):** The composite sort key allows for flexible and efficient querying of inventory within a SKU's partition. We can query for:
    *   A specific location and bucket.
    *   All buckets within a specific location.
    *   All locations.

**Global Secondary Indexes (GSIs):**

1.  **Location-Centric View (GSI1):**
    *   **GSI1PK:** `LOCATION#{locationId}`
    *   **GSI1SK:** `SKU#{sku}#BUCKET#{bucket}`
    *   **Use Case:** Efficiently query all SKUs within a specific location. This is crucial for location-based inventory reports and management.

2.  **Bucket-Centric View (GSI2):**
    *   **GSI2PK:** `BUCKET#{bucket}`
    *   **GSI2SK:** `SKU#{sku}#LOCATION#{locationId}`
    *   **Use Case:** Query for all items in a specific bucket across all locations (e.g., find all `IN_TRANSIT` stock).

**Data Sample:**

| PK              | SK                                       | Quantity | LastUpdatedAt       |
|-----------------|------------------------------------------|----------|---------------------|
| SKU#TSHIRT-RED-L | LOCATION#WAREHOUSE-01#BUCKET#ON_HAND     | 100      | 2025-07-06T10:00:00Z |
| SKU#TSHIRT-RED-L | LOCATION#STORE-05#BUCKET#IN_TRANSIT      | 20       | 2025-07-06T10:05:00Z |
| SKU#JEANS-BLUE-32| LOCATION#WAREHOUSE-01#BUCKET#ON_HAND     | 50       | 2025-07-06T11:00:00Z |

## 2. Consistency Model

*   **Writes (Stock Movements, Adjustments):** **Strongly Consistent Reads within Transactions.** All write operations will be performed within a DynamoDB `TransactWriteItems` operation. When reading data *as part of a write operation* (e.g., checking current quantity before an update), we will use `TransactGetItems` with strong consistency to ensure we are working with the most up-to-date data and avoid race conditions.
*   **Reads (Stock Queries):** **Eventual Consistency.** For all read-only API endpoints (`GET /stock/availability/{sku}`), we will use eventually consistent reads. This provides the best performance and lowest latency, which is acceptable for stock visibility where near-real-time data is sufficient. This also reduces cost.

## 3. Concurrency Control

We will use **Optimistic Locking** for all stock updates.

*   Each item in the DynamoDB table will have a `version` attribute.
*   When updating an item, the `TransactWriteItems` call will include a **Condition Expression** that checks if the `version` number in the database matches the `version` number that was read before the transaction started.
*   If the versions match, the update succeeds, and the `version` number is incremented.
*   If they don't match, it means another process has updated the item in the meantime. The transaction will fail, and our application logic will retry the entire read-modify-write operation.

This approach prevents lost updates and ensures data integrity during concurrent write operations.

## 4. Event Publishing Pattern

We will use the **Transactional Outbox Pattern** to ensure reliable event publishing.

1.  When a stock movement occurs, a `StockMovementEvent` will be created.
2.  This event will be written to the `Inventory` table as part of the same `TransactWriteItems` operation that updates the stock quantities. The event will have a different SK to distinguish it from inventory items (e.g., `EVENT#<eventId>`).
3.  A separate Lambda function, triggered by DynamoDB Streams, will process the new event items from the table.
4.  This Lambda will publish the event to an SNS topic (e.g., `InventoryEvents`). Downstream consumers can subscribe to this topic.
5.  After successfully publishing the event, the Lambda can optionally delete the event item from the `Inventory` table to keep the table clean.

This ensures that an event is only published if the corresponding stock transaction was successful, guaranteeing "at-least-once" delivery and data consistency between our service and downstream systems.

## 5. Caching Strategy

A caching layer is not planned for the initial implementation to maintain simplicity and rely on the performance of DynamoDB. The P99 latency requirement of <100ms for reads is achievable with a well-designed DynamoDB schema and eventually consistent reads.

If performance metrics in production show a need for caching, we can introduce Amazon ElastiCache (Redis) with a write-through or cache-aside pattern for hot SKUs.

## 6. Idempotency

All `POST`, `PUT`, and `PATCH` endpoints will be idempotent.

*   Clients will be expected to provide a unique `Idempotency-Key` in the HTTP header for each transaction.
*   We will create a separate DynamoDB table (`IdempotencyKeys`) with the `Idempotency-Key` as the primary key and a TTL attribute.
*   Before processing a write operation, the service will check if the key exists in this table.
    *   If it exists, the service will immediately return the saved response from the initial request, without re-processing.
    *   If it doesn't exist, the service will process the request, save the `Idempotency-Key` and the response to the table, and then return the response.

This prevents duplicate stock movements or adjustments if a client retries a request due to a network issue.
