import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { infraStack } from "./infra-stack";

export class cdkStage extends cdk.Stage {
  constructor(scope: Construct, stageName: string, props?: cdk.StageProps) {
    super(scope, stageName, props);
    const demoInfra = new infraStack(this, "infraLogicalID", stageName);
  }
}
