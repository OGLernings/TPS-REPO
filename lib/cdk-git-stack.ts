import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
import { ManualApprovalStep } from "aws-cdk-lib/pipelines";
import { cdkStage } from "./stage-stack";

export class CdkGitStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cdkgit = new CodePipeline(this, "logicalcdkgit", {
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub("OGLernings/TPS-REPO", "main"),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
      pipelineName: "cdkPipeline",
    });

    const devStage = cdkgit.addStage(
      new cdkStage(this, "dev", {
        env: { account: "862165548342", region: "us-east-1" },
      })
    );
    devStage.addPost(
      new ManualApprovalStep("Manual Approval before production")
    );

    const prodStage = cdkgit.addStage(
      new cdkStage(this, "prod", {
        env: { account: "862165548342", region: "us-east-1" },
      })
    );
  }
}
