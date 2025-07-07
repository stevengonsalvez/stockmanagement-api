import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const inventoryTable = new dynamodb.Table(this, 'Inventory', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT for production
    });

    inventoryTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    inventoryTable.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Lambda Functions
    const moveStockLambda = new lambda.Function(this, 'MoveStock', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'move-stock.handler',
      code: lambda.Code.fromAsset('../../build'),
      environment: {
        TABLE_NAME: inventoryTable.tableName,
        DYNAMODB_ENDPOINT: 'http://localstack:4566',
      },
      timeout: cdk.Duration.seconds(30),
    });

    const getStockAvailabilityLambda = new lambda.Function(this, 'GetStockAvailability', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'get-stock-availability.handler',
      code: lambda.Code.fromAsset('../../build'),
      environment: {
        TABLE_NAME: inventoryTable.tableName,
        DYNAMODB_ENDPOINT: 'http://localstack:4566',
      },
      timeout: cdk.Duration.seconds(30),
    });

    const debugLambda = new lambda.Function(this, 'DebugLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'simple-test.handler',
      code: lambda.Code.fromAsset('../../build'),
      environment: {
        TABLE_NAME: inventoryTable.tableName,
        DYNAMODB_ENDPOINT: 'http://localstack:4566',
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Grant Lambda permissions to access DynamoDB
    inventoryTable.grantReadWriteData(moveStockLambda);
    inventoryTable.grantReadData(getStockAvailabilityLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'InventoryApi', {
      restApiName: 'Inventory Service',
      description: 'This service handles inventory.',
    });

    const stock = api.root.addResource('stock');
    const movements = stock.addResource('movements');
    const availability = stock.addResource('availability');
    const sku = availability.addResource('{sku}');
    const debug = api.root.addResource('debug');

    movements.addMethod('POST', new apigateway.LambdaIntegration(moveStockLambda));
    sku.addMethod('GET', new apigateway.LambdaIntegration(getStockAvailabilityLambda));
    debug.addMethod('GET', new apigateway.LambdaIntegration(debugLambda));
  }
}