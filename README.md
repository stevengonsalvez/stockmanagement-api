# Retail Inventory Microservice

A high-performance serverless inventory management system built with AWS Lambda, DynamoDB, and API Gateway. This microservice provides real-time stock visibility across multiple locations and inventory buckets, designed to handle 1 million transactions/day across 50,000 SKUs.

## 🏗️ Architecture

- **Runtime**: Node.js 16.x on AWS Lambda
- **Database**: AWS DynamoDB with Global Secondary Indexes
- **API**: RESTful endpoints via API Gateway
- **Infrastructure**: AWS CDK for Infrastructure as Code
- **Local Development**: LocalStack for local AWS simulation

## 📋 Features

### Inventory Buckets
Standard WMS (Warehouse Management System) buckets:
- **ON_HAND**: Available for sale/fulfillment
- **IN_TRANSIT**: Stock moving between locations
- **QUARANTINE**: Stock under quality hold
- **DAMAGED**: Unusable stock
- **RESERVED**: Allocated to orders
- **RECEIVING**: In receiving process
- **PUTAWAY**: Being moved to storage

### Location Hierarchy
- **WAREHOUSE**: Distribution centers with zones/bins
- **STORE**: Retail locations with departments/sections
- **VIRTUAL**: Drop-ship or 3PL locations

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Docker & Docker Compose
- AWS CDK CLI
- cdklocal (for LocalStack deployment)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Start LocalStack**
   ```bash
   docker-compose up -d
   ```

3. **Build Lambda handlers**
   ```bash
   node build-lambda.js
   ```

4. **Deploy infrastructure**
   ```bash
   cd infrastructure/cdk
   npm install
   cdklocal bootstrap
   cdklocal deploy --require-approval never
   ```

5. **Initialize test data**
   ```bash
   cd ../..
   node init-test-data.js
   ```

## 📡 API Endpoints

### Get Stock Availability
```http
GET /stock/availability/{sku}
```

**Response:**
```json
{
  "sku": "ITEM-123",
  "totalStock": 500
}
```

### Move Stock Between Buckets
```http
POST /stock/movements
Content-Type: application/json

{
  "sku": "ITEM-123",
  "quantity": 10,
  "from": {
    "locationId": "WAREHOUSE-01",
    "bucket": "RECEIVING"
  },
  "to": {
    "locationId": "WAREHOUSE-01", 
    "bucket": "ON_HAND"
  }
}
```

**Response:**
```json
{
  "message": "Stock moved successfully"
}
```

## 🧪 Testing

### Run API Tests
```bash
node test-api-full.js
```

### Manual Testing Examples

**Check stock availability:**
```bash
curl -X GET "http://localhost:4566/restapis/{api-id}/test/_user_request_/stock/availability/ITEM-123"
```

**Move stock:**
```bash
curl -X POST "http://localhost:4566/restapis/{api-id}/test/_user_request_/stock/movements" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "ITEM-123",
    "quantity": 10,
    "from": {"locationId": "WAREHOUSE-01", "bucket": "RECEIVING"},
    "to": {"locationId": "WAREHOUSE-01", "bucket": "ON_HAND"}
  }'
```

## 🗄️ Database Design

### DynamoDB Table Structure
- **Partition Key (PK)**: `SKU#{sku}`
- **Sort Key (SK)**: `LOCATION#{locationId}#BUCKET#{bucket}`

### Sample Item
```json
{
  "PK": "SKU#ITEM-123",
  "SK": "LOCATION#WAREHOUSE-01#BUCKET#RECEIVING",
  "quantity": 500,
  "version": 1,
  "lastUpdatedAt": "2025-07-07T12:05:49.002Z"
}
```

### Access Patterns
- Get all stock for a SKU: Query by PK
- Get stock for specific location/bucket: Query by PK + SK
- Atomic stock movements with version control

## 📁 Project Structure

```
/
├── src/
│   ├── handlers/          # Lambda function handlers
│   ├── services/          # Business logic layer  
│   ├── repositories/      # DynamoDB access layer
│   └── models/           # Data models and TypeScript interfaces
├── infrastructure/cdk/    # AWS CDK infrastructure code
├── build/                # Compiled Lambda handlers
├── tests/                # Test files
├── docker-compose.yml    # LocalStack configuration
└── README.md
```

## 🔧 Development

### Building Handlers
The project uses esbuild to bundle Lambda functions with dependencies:

```bash
node build-lambda.js
```

### Environment Variables
Lambda functions use these environment variables:
- `TABLE_NAME`: DynamoDB table name
- `DYNAMODB_ENDPOINT`: LocalStack endpoint (http://localstack:4566)

### LocalStack Configuration
- **Version**: 1.4.0 (Node.js 16 compatibility)
- **Services**: DynamoDB, Lambda, API Gateway, IAM, CloudFormation
- **Port**: 4566

## 🚨 Known Issues & Solutions

### Lambda Runtime Compatibility
- **Issue**: Node.js 18 runtime doesn't work with LocalStack 1.4.0
- **Solution**: Use Node.js 16 runtime (`NODEJS_16_X`)

### DynamoDB Connection
- **Issue**: Lambda functions can't connect to DynamoDB in LocalStack
- **Solution**: Use `http://localstack:4566` as endpoint (not `host.docker.internal`)

### CDK Bootstrap
- **Issue**: CDK deployment fails without bootstrap
- **Solution**: Run `cdklocal bootstrap` before first deployment

## 🔄 CI/CD Considerations

For production deployment:
1. Replace LocalStack endpoints with real AWS services
2. Use proper IAM roles and permissions
3. Implement proper error handling and monitoring
4. Add comprehensive test coverage
5. Set up CloudWatch logging and metrics

## 📊 Performance Targets

- **Scale**: 1 million transactions/day
- **SKUs**: 50,000 active SKUs
- **SLA**: 99.9% availability
- **Latency**: <100ms p99 for reads

## 🤝 Contributing

1. Follow existing code style and patterns
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure LocalStack compatibility

## 📝 License

This project is for demonstration purposes. Please ensure proper licensing for production use.

---

**Generated with Claude Code** 🤖