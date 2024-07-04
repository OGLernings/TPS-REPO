#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkGitStack } from "../lib/cdk-git-stack";

const app = new cdk.App();
new CdkGitStack(app, "CdkGitStack", {
  env: { account: "862165548342", region: "us-east-1" },
});
