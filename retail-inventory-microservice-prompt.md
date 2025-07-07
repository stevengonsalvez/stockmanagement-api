# Retail Inventory Microservice - Optimized Prompt for Agentic Coder

## System Message (if configurable)
```
You are a senior software architect with deep expertise in serverless architectures (AWS Lambda, DynamoDB), retail inventory management systems, and warehouse management systems (WMS) like RedPrairie/Blue Yonder.
```

## Main Prompt

You are a senior software architect with deep expertise in serverless architectures (AWS Lambda, DynamoDB), retail inventory management systems, and warehouse management systems (WMS) like RedPrairie/Blue Yonder.

### Project Context
You're building a high-performance inventory microservice for a retail company that needs real-time stock visibility across multiple locations and stock states. This service will be the single source of truth for inventory data, integrating with existing WMS systems.

### Technical Requirements
- Runtime: Node.js 20.x on AWS Lambda
- Database: AWS DynamoDB (with Global Secondary Indexes for query patterns)
- API: RESTful endpoints via API Gateway
- Expected Scale: 1 million transactions/day across 50,000 SKUs
- SLA: 99.9% availability, <100ms p99 latency for reads

### Domain Model

#### Inventory Buckets
Standard WMS buckets to support:
- **ON_HAND**: Available for sale/fulfillment
- **IN_TRANSIT**: Stock moving between locations
- **QUARANTINE**: Stock under quality hold
- **DAMAGED**: Unusable stock
- **RESERVED**: Allocated to orders
- **RECEIVING**: In receiving process
- **PUTAWAY**: Being moved to storage

#### Location Hierarchy
- **WAREHOUSE**: Distribution centers with zones/bins
- **STORE**: Retail locations with departments/sections
- **VIRTUAL**: Drop-ship or 3PL locations

### Functional Requirements

**Important**: Think through the architectural design carefully:
1. Consider DynamoDB partition key strategies for even distribution
2. Evaluate consistency models (eventual vs strong) for different operations
3. Design for idempotency in all stock movements
4. Plan for concurrent update handling and race conditions
5. Consider event sourcing for audit trail requirements

#### 1. Stock Query Operations
- Get current stock by SKU across all locations/buckets
- Get stock for specific location/bucket combination
- Support filtering by availability (considering holds/thresholds)
- Aggregate stock across location hierarchies

#### 2. Stock Management Operations
- Atomic stock movements between buckets
- Bulk updates from WMS feeds
- Support for stock adjustments (cycle counts, damages)
- Reservation/allocation with expiry

#### 3. Threshold Management
- Location-specific min/max thresholds
- Automatic alerts when breached
- Safety stock calculations

#### 4. Stock Hold Management
- Quality holds at SKU/lot/location level
- Time-based automatic release
- Hold reason tracking and audit

#### 5. Integration Patterns
- Webhook endpoints for WMS updates
- Event streaming for downstream systems
- Batch import/export capabilities

### Deliverables

Create a production-ready microservice with:

#### 1. Project Structure
```
/src
  /handlers      # Lambda function handlers
  /services      # Business logic layer
  /repositories  # DynamoDB access layer
  /models        # Data models and validation
  /utils         # Shared utilities
  /events        # Event schemas and publishers
/infrastructure
  /cloudformation # or /cdk for IaC
/tests
  /unit
  /integration
```

#### 2. Core Components
- DynamoDB table design with GSIs
- Lambda functions for each API endpoint
- Error handling and retry logic
- Monitoring and alerting setup
- API documentation (OpenAPI/Swagger)

#### 3. Key Design Decisions
Document your choices for:
- Partition key strategy
- Consistency model
- Concurrency control mechanism
- Event publishing pattern
- Caching strategy (if applicable)

#### 4. Code Implementation
Implement these priority endpoints:
- `POST /stock/movements` - Move stock between buckets
- `GET /stock/availability/{sku}` - Get available stock
- `PUT /stock/adjustments` - Process stock adjustments
- `POST /stock/holds` - Create/release holds
- `GET /locations/{locationId}/thresholds` - Get/set thresholds

### Constraints
- Use AWS SDK v3 for all AWS services
- Implement distributed tracing with AWS X-Ray
- All endpoints must be idempotent
- Stock movements must maintain audit trail
- Support eventual consistency for reads, strong consistency for writes
- Use SQS for async processing where appropriate

### Output Format
Begin with architectural overview and key design decisions, then provide:
1. DynamoDB table schema with access patterns
2. Complete Lambda handler implementations
3. Service layer with business logic
4. Repository layer with DynamoDB operations
5. Error handling and monitoring setup
6. Deployment configuration (SAM/CDK)
7. Example API calls and responses
8. Performance optimization recommendations

---

## Usage Instructions

### Variables to Customize
Replace these placeholders based on your specific requirements:
- `1 million transactions/day` → Your expected volume
- `50,000 SKUs` → Your total SKU count
- Add any custom inventory buckets specific to your WMS

### Recommended Settings for Agentic Coders
- **Model**: Use GPT-4 or Claude 3 Opus for best results
- **Temperature**: 0.2-0.3 for consistent code generation
- **Max tokens**: 8192 or higher for comprehensive implementation

### Additional Optimization Tips
1. **Add WMS Integration Details**: If you have specific WMS APIs or data formats, include them in the technical requirements section
2. **Include Business Rules**: Add any specific stock allocation priorities or business logic
3. **Performance Benchmarks**: If you have current system metrics, add them for comparison
4. **Compliance Requirements**: Specify any SOX, PCI, or other compliance needs that affect audit trails
5. **Example Scenarios**: Include 2-3 real stock movement scenarios from your business

### Example Enhancement
To make the prompt even more specific, you could add:

```markdown
#### Example Stock Movement Scenarios
1. **Store Replenishment**: Move 100 units of SKU-123 from WAREHOUSE-01 ON_HAND to STORE-05 IN_TRANSIT
2. **Quality Hold**: Place all units of SKU-456 in WAREHOUSE-02 under QUARANTINE with reason "Failed QC"
3. **Cross-Dock**: Receive 500 units directly to RESERVED bucket for customer order fulfillment
```

### Prompt Chaining Strategy
For very complex implementations, consider breaking this into multiple prompts:
1. **Prompt 1**: DynamoDB schema design and access patterns
2. **Prompt 2**: Core Lambda handlers and API implementation
3. **Prompt 3**: Integration patterns and event streaming
4. **Prompt 4**: Testing strategy and deployment configuration