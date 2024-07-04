import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path = require("path");
import * as connect from 'aws-cdk-lib/aws-connect';

export class infraStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    stageName: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    const cdkIamRole = new iam.Role(this, "cdkIamLogicalId", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: stageName + "cdkIamRoleForLambda040724",
    });
    cdkIamRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess")
    );

    const getGcLambda = new lambda.Function(this, "getGcLambdaLogicalId", {
      handler: "lambda_function.lambda_handler",
      role: cdkIamRole,
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset(path.join(__dirname, "services")),
      timeout: cdk.Duration.seconds(300),
      environment: {
        SERVICENOW_HOST: "dev260937.service-now.com",
        SERVICENOW_PASSWORD: "Tcs@2024!",
        SERVICENOW_USERNAME: "ssant09",
      },
      functionName: stageName + "cdkGetinfoCreateIncidentLambda040724",
    });
    // Amazon Connect Association
    const cfnIntegrationAssociation = new connect.CfnIntegrationAssociation(this, 'MyIntegration',{
      instanceId:'arn:aws:connect:us-east-1:862165548342:instance/9d143828-a3fe-4d38-86f1-bd4a42e2addf',
      integrationArn:'arn:aws:lambda:us-east-1:862165548342:function:' + stageName + "cdkGetinfoCreateIncidentLambda040724",
      integrationType: 'LAMBDA_FUNCTION',
    });
  }
}
