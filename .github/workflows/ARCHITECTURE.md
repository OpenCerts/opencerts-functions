# CI/CD Pipeline Architecture

## Overview

This document describes the architecture and flow of the CI/CD pipeline for OpenCerts Functions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                            │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   develop    │  │     main     │  │   feature/*  │              │
│  │   branch     │  │    branch    │  │   branches   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                       │
│         │ push             │ push             │ push/PR              │
│         ▼                  ▼                  ▼                       │
│  ┌──────────────────────────────────────────────────────┐           │
│  │           GitHub Actions Workflows                    │           │
│  └──────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Workflow Execution                               │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Tests      │  │   Deploy     │  │   Rollback   │              │
│  │   Workflow   │  │   Workflow   │  │   Workflow   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘              │
│         │                  │                                          │
│         ▼                  ▼                                          │
│  ┌──────────────┐  ┌──────────────────────────────┐                │
│  │  Run Tests   │  │  Determine Deployment        │                │
│  │  Lint Code   │  │  Strategy                    │                │
│  │  Validate    │  └──────┬───────────────────────┘                │
│  └──────────────┘         │                                          │
│                            ▼                                          │
│                   ┌────────────────────┐                            │
│                   │  Deploy Services   │                            │
│                   │  (Parallel)        │                            │
│                   └────────┬───────────┘                            │
│                            │                                          │
│         ┌──────────────────┼──────────────────┐                     │
│         ▼                  ▼                  ▼                       │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐                  │
│  │  Email   │      │ Storage  │      │  Verify  │                  │
│  │ Service  │      │ Service  │      │ Service  │                  │
│  └────┬─────┘      └────┬─────┘      └────┬─────┘                  │
└───────┼─────────────────┼─────────────────┼────────────────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     AWS Infrastructure                               │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Lambda     │  │   Lambda     │  │   Lambda     │              │
│  │   (Email)    │  │  (Storage)   │  │  (Verify)    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                       │
│         ▼                  ▼                  ▼                       │
│  ┌──────────────────────────────────────────────────────┐           │
│  │              API Gateway                              │           │
│  └──────────────────────────────────────────────────────┘           │
│         │                  │                  │                       │
│         ▼                  ▼                  ▼                       │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐                  │
│  │   SES    │      │    S3    │      │ Ethereum │                  │
│  │          │      │ DynamoDB │      │ Network  │                  │
│  └──────────┘      └──────────┘      └──────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Workflow Details

### 1. Tests Workflow (`tests.yml`)

```
┌─────────────────────────────────────────┐
│         Push / Pull Request             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Checkout Code (actions/checkout@v4)│
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Setup Node.js (actions/setup-node@v4) │
│   - Version: 18.x                       │
│   - Cache: npm                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Install Dependencies (npm ci)      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Validate Serverless Configurations    │
│   (npm run sls-config-check)            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Run Linter (npm run lint)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Run Tests (npm run test)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         ✅ Tests Complete                │
└─────────────────────────────────────────┘
```

### 2. Deploy Workflow (`deploy.yml`)

```
┌─────────────────────────────────────────┐
│  Push to main/develop or Manual Trigger │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Run Tests Job                  │
│  (Same as tests.yml workflow)           │
└──────────────┬──────────────────────────┘
               │
               ▼ (if tests pass)
┌─────────────────────────────────────────┐
│     Determine Deployment Strategy       │
│  ┌───────────────────────────────────┐  │
│  │ Branch → Environment Mapping:     │  │
│  │ - main/master → prod              │  │
│  │ - develop → stg                   │  │
│  │ - manual → user selected          │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Services to Deploy:               │  │
│  │ - all (default)                   │  │
│  │ - specific services (manual)      │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Deploy Services (Parallel)         │
│  ┌───────────┬───────────┬───────────┐  │
│  │   Email   │  Storage  │  Verify   │  │
│  │  Service  │  Service  │  Service  │  │
│  └─────┬─────┴─────┬─────┴─────┬─────┘  │
│        │           │           │         │
│        └───────────┼───────────┘         │
│                    │                     │
│                    ▼                     │
│    ┌──────────────────────────────┐     │
│    │  deploy-service.yml          │     │
│    │  (Reusable Workflow)         │     │
│    └──────────────────────────────┘     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Generate Deployment Summary       │
└─────────────────────────────────────────┘
```

### 3. Deploy Service Workflow (`deploy-service.yml`)

```
┌─────────────────────────────────────────┐
│    Called by Deploy Workflow            │
│    Input: service-name, path, env       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Checkout Code & Setup Node.js      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Configure AWS Credentials             │
│   (aws-actions/configure-aws-           │
│    credentials@v4)                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Setup Environment Variables           │
│   - Create .env file from secrets       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Install Serverless Framework          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Create Custom Domain (if enabled)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Deploy Service                        │
│   sls deploy --stage <env> --verbose    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Get Deployment Info & Create Artifact │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   ✅ Service Deployed                    │
└─────────────────────────────────────────┘
```

## Environment Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Development Flow                          │
└──────────────────────────────────────────────────────────────┘

Developer
    │
    ▼
┌─────────────┐
│  Feature    │
│  Branch     │
└──────┬──────┘
       │ Create PR
       ▼
┌─────────────┐     ┌──────────────┐
│  Run Tests  │────▶│  Code Review │
└──────┬──────┘     └──────┬───────┘
       │                   │
       │ Tests Pass        │ Approved
       ▼                   ▼
┌─────────────────────────────────┐
│      Merge to develop           │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Auto-Deploy to Staging (stg)   │
│  ┌───────────────────────────┐  │
│  │ - Run Tests               │  │
│  │ - Deploy Email Service    │  │
│  │ - Deploy Storage Service  │  │
│  │ - Deploy Verify Service   │  │
│  └───────────────────────────┘  │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│   Test in Staging Environment   │
└──────────┬──────────────────────┘
           │
           │ If stable
           ▼
┌─────────────────────────────────┐
│      Merge to main              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Auto-Deploy to Production      │
│  (with approval)                │
│  ┌───────────────────────────┐  │
│  │ - Run Tests               │  │
│  │ - Wait for Approval       │  │
│  │ - Deploy Email Service    │  │
│  │ - Deploy Storage Service  │  │
│  │ - Deploy Verify Service   │  │
│  └───────────────────────────┘  │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│   Monitor Production            │
└─────────────────────────────────┘
```

## Service Architecture

### Email Service

```
┌─────────────────────────────────────────┐
│         API Gateway Endpoint            │
│         POST /email                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Lambda Function                 │
│         - Validate request              │
│         - Verify reCAPTCHA              │
│         - Validate certificate          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         AWS SES                         │
│         - Send email                    │
└─────────────────────────────────────────┘
```

### Storage Service

```
┌─────────────────────────────────────────┐
│         API Gateway Endpoints           │
│         GET  /storage/{id}              │
│         POST /storage                   │
│         POST /storage/{id}              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Lambda Functions                │
│         - getHandler                    │
│         - createHandler                 │
│         - createAtIdHandler             │
│         - queueNumberHandler            │
└──────────────┬──────────────────────────┘
               │
               ├──────────────────┐
               ▼                  ▼
┌──────────────────────┐  ┌──────────────┐
│      AWS S3          │  │  DynamoDB    │
│  - Store encrypted   │  │  - Metadata  │
│    documents         │  │  - Queue     │
└──────────────────────┘  └──────────────┘
```

### Verify Service

```
┌─────────────────────────────────────────┐
│         API Gateway Endpoint            │
│         POST /verify                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Lambda Function                 │
│         - Validate document             │
│         - Check integrity               │
│         - Verify issuer                 │
│         - Check revocation              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Ethereum Network                │
│         - Document store contract       │
│         - Token registry                │
└─────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  GitHub Repository                      │
│  ┌───────────────────────────────────┐  │
│  │ - Branch Protection               │  │
│  │ - Required Reviews                │  │
│  │ - Status Checks                   │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  GitHub Secrets                         │
│  ┌───────────────────────────────────┐  │
│  │ - Encrypted at rest               │  │
│  │ - Access controlled               │  │
│  │ - Audit logged                    │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  GitHub Actions                         │
│  ┌───────────────────────────────────┐  │
│  │ - Environment protection          │  │
│  │ - Required approvals              │  │
│  │ - Deployment logs                 │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  AWS IAM                                │
│  ┌───────────────────────────────────┐  │
│  │ - Least privilege policies        │  │
│  │ - Temporary credentials           │  │
│  │ - CloudTrail logging              │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  AWS Services                           │
│  ┌───────────────────────────────────┐  │
│  │ - VPC isolation                   │  │
│  │ - Encryption at rest              │  │
│  │ - Encryption in transit           │  │
│  │ - CloudWatch monitoring           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────┐
│                  Monitoring Stack                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  GitHub Actions                         │
│  - Workflow execution logs              │
│  - Deployment artifacts                 │
│  - Job summaries                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  AWS CloudWatch                         │
│  ┌───────────────────────────────────┐  │
│  │ Lambda Logs                       │  │
│  │ - Invocations                     │  │
│  │ - Errors                          │  │
│  │ - Duration                        │  │
│  │ - Memory usage                    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ API Gateway Logs                  │  │
│  │ - Request count                   │  │
│  │ - Latency                         │  │
│  │ - 4xx/5xx errors                  │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  CloudWatch Alarms                      │
│  - High error rate                      │
│  - High latency                         │
│  - Throttling                           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Notifications                          │
│  - SNS topics                           │
│  - Email alerts                         │
│  - Slack integration                    │
└─────────────────────────────────────────┘
```

## Disaster Recovery

```
┌─────────────────────────────────────────────────────────────┐
│              Disaster Recovery Flow                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Issue Detected                         │
│  - Monitoring alerts                    │
│  - User reports                         │
│  - Health checks fail                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Assess Impact                          │
│  - Check CloudWatch logs                │
│  - Review recent deployments            │
│  - Identify affected services           │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│  Minor Issue │  │ Major Issue  │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  Hotfix      │  │  Rollback    │
│  - Create    │  │  - Use       │
│    branch    │  │    rollback  │
│  - Test      │  │    workflow  │
│  - Deploy    │  │  - Specify   │
│              │  │    commit    │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Verify Fix                             │
│  - Test endpoints                       │
│  - Monitor metrics                      │
│  - Confirm with users                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Post-Mortem                            │
│  - Document incident                    │
│  - Identify root cause                  │
│  - Implement preventive measures        │
└─────────────────────────────────────────┘
```

## Scalability Considerations

- **Lambda Auto-scaling:** Automatic based on request volume
- **API Gateway:** Handles up to 10,000 requests per second by default
- **S3:** Unlimited storage capacity
- **DynamoDB:** On-demand scaling or provisioned capacity
- **Multi-region:** Can be deployed to multiple AWS regions

## Cost Optimization

- **Lambda:** Pay per invocation and execution time
- **API Gateway:** Pay per request
- **S3:** Pay for storage and data transfer
- **CloudWatch:** Free tier covers basic monitoring
- **Optimization tips:**
  - Use appropriate Lambda memory settings
  - Enable S3 lifecycle policies
  - Use DynamoDB on-demand for variable workloads
  - Monitor and optimize cold starts

---

**Last Updated:** 2025-09-30
