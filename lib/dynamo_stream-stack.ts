import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from "@aws-cdk/aws-lambda";
import * as sqs from "@aws-cdk/aws-sqs";
import { DynamoEventSource, SqsDlq } from "@aws-cdk/aws-lambda-event-sources";


export class DynamoStreamStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const orderTable = new dynamodb.Table(this, "oederTable", {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const deadLetterQueue = new sqs.Queue(this, "deleteQueue");

    const echoLambda = new lambda.Function(this, "echoLambda", {
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
    });

    echoLambda.addEventSource(
      new DynamoEventSource(orderTable, {
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 5,
        onFailure: new SqsDlq(deadLetterQueue),
        retryAttempts: 10,
      })
    );

  }
}


