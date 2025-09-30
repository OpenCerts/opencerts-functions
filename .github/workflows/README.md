# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for deploying the OpenCerts Functions to AWS using Serverless Framework.

## Workflows Overview

### 1. `deploy.yml` - Main Deployment Workflow
**Triggers:**
- Push to `main`, `master`, or `develop` branches
- Pull requests to these branches
- Manual workflow dispatch

**Features:**
- Runs tests and linting before deployment
- Automatically determines environment based on branch:
  - `main`/`master` → `prod`
  - `develop` → `stg`
- Deploys all three services: email, storage, and verify
- Manual dispatch allows selecting specific services and environment

**Jobs:**
1. **test** - Runs unit tests, linting, and serverless config validation
2. **determine-deployment** - Determines which services and environment to deploy
3. **deploy-email** - Deploys email service
4. **deploy-storage** - Deploys storage service
5. **deploy-verify** - Deploys verify service
6. **deployment-summary** - Generates deployment summary

### 2. `deploy-service.yml` - Reusable Service Deployment
**Type:** Reusable workflow (called by other workflows)

**Purpose:** 
- Provides a standardized deployment process for each service
- Handles AWS credentials configuration
- Sets up environment variables
- Deploys using Serverless Framework
- Creates deployment artifacts

### 3. `rollback.yml` - Rollback Workflow
**Trigger:** Manual workflow dispatch only

**Features:**
- Rollback specific service or all services
- Choose environment (stg/prod)
- Optionally specify commit SHA to rollback to
- If no commit SHA provided, deploys previous version

### 4. `destroy.yml` - Service Destruction Workflow
**Trigger:** Manual workflow dispatch only

**Features:**
- Destroy specific service or all services
- Requires typing "DESTROY" to confirm
- Safety mechanism to prevent accidental destruction
- Useful for cleaning up test environments

### 5. `tests.yml` - Test-Only Workflow
**Triggers:**
- Push to any branch
- Pull requests

**Purpose:** 
- Runs tests without deployment
- Validates serverless configurations
- Runs linting

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

### AWS Credentials (Required for all services)
- `AWS_ACCESS_KEY_ID` - AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `AWS_REGION` - AWS region (default: ap-southeast-1)

### Email Service Secrets
- `SES_KEY_ID` - AWS SES access key ID
- `SES_SECRET` - AWS SES secret access key
- `SES_REGION` - AWS SES region
- `RECAPTCHA_SECRET` - Google reCAPTCHA secret key
- `EMAIL_API_KEYS` - Comma-separated API keys for email service

### Storage Service Secrets
- `BUCKET_NAME` - S3 bucket name (default: oc-functions-storage)
- `OBJECT_TTL` - Object time-to-live in days (default: 31)
- `ENABLE_STORAGE_UPLOAD_API_KEY` - Enable API key for uploads (default: false)

### Verify Service Secrets
- `NETWORK` - Ethereum network to use (default: sepolia)

### Domain Configuration (Optional)
- `DOMAIN` - Custom domain name
- `CERTIFICATE_DOMAIN` - SSL certificate domain
- `DISABLE_DOMAIN` - Set to 'true' to disable custom domain

## GitHub Environments

It's recommended to set up GitHub Environments for better control:

1. Go to `Settings` → `Environments`
2. Create two environments: `stg` and `prod`
3. For `prod`, add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches (only main/master)

## Usage Examples

### Automatic Deployment
Push to `develop` branch:
```bash
git push origin develop
```
This will automatically deploy to `stg` environment.

Push to `main` branch:
```bash
git push origin main
```
This will automatically deploy to `prod` environment.

### Manual Deployment
1. Go to `Actions` tab in GitHub
2. Select `Deploy to AWS` workflow
3. Click `Run workflow`
4. Choose:
   - Environment (stg/prod)
   - Services to deploy (all, or specific: email,storage,verify)
5. Click `Run workflow`

### Rollback
1. Go to `Actions` tab
2. Select `Rollback Deployment` workflow
3. Click `Run workflow`
4. Choose:
   - Service to rollback
   - Environment
   - (Optional) Commit SHA to rollback to
5. Click `Run workflow`

### Destroy Services
1. Go to `Actions` tab
2. Select `Destroy Services` workflow
3. Click `Run workflow`
4. Choose service and environment
5. Type "DESTROY" in the confirmation field
6. Click `Run workflow`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│  │  Tests   │───▶│ Determine│───▶│  Deploy  │            │
│  │          │    │ Strategy │    │ Services │            │
│  └──────────┘    └──────────┘    └──────────┘            │
│                                         │                  │
│                        ┌────────────────┼────────────────┐│
│                        ▼                ▼                ▼││
│                   ┌────────┐      ┌─────────┐    ┌──────┐││
│                   │ Email  │      │ Storage │    │Verify│││
│                   │Service │      │ Service │    │Service│││
│                   └────────┘      └─────────┘    └──────┘││
│                        │                │            │    ││
└────────────────────────┼────────────────┼────────────┼────┘│
                         ▼                ▼            ▼     │
                    ┌────────────────────────────────────┐  │
                    │         AWS Lambda                 │  │
                    │    (via Serverless Framework)      │  │
                    └────────────────────────────────────┘  │
                                                             │
```

## Service Details

### Email Service
- **Path:** `src/email`
- **Function:** Sends emails on behalf of OpenCerts users
- **Dependencies:** AWS SES, reCAPTCHA
- **Endpoint:** `/email`

### Storage Service
- **Path:** `src/storage`
- **Function:** Provides transient file storage with encryption
- **Dependencies:** AWS S3, DynamoDB
- **Endpoints:** `/storage`, `/storage/{id}`
- **Features:** 
  - File encryption
  - Automatic expiration (default 31 days)
  - API key protection (optional)

### Verify Service
- **Path:** `src/verify`
- **Function:** Verifies OpenCerts document validity
- **Dependencies:** Ethereum network connection
- **Endpoint:** `/verify`

## Monitoring Deployments

### View Deployment Status
1. Go to `Actions` tab
2. Click on the running/completed workflow
3. View logs for each job
4. Check deployment summary at the bottom

### Deployment Artifacts
Each deployment creates an artifact containing:
- Service name
- Environment
- Timestamp
- Commit SHA
- Branch name

Artifacts are retained for 30 days.

## Troubleshooting

### Deployment Fails
1. Check the workflow logs in GitHub Actions
2. Verify all required secrets are configured
3. Ensure AWS credentials have necessary permissions
4. Check Serverless Framework configuration

### Domain Issues
If custom domain deployment fails:
1. Verify `DOMAIN` and `CERTIFICATE_DOMAIN` secrets
2. Ensure SSL certificate exists in AWS Certificate Manager
3. Check Route53 hosted zone configuration
4. Set `DISABLE_DOMAIN=true` to deploy without custom domain

### Permission Errors
Ensure AWS IAM user/role has these permissions:
- Lambda: Create, update, delete functions
- API Gateway: Create, update, delete APIs
- S3: Create, manage buckets (for storage service)
- CloudFormation: Create, update, delete stacks
- IAM: Create, manage roles for Lambda
- CloudWatch: Create log groups

## Best Practices

1. **Use Pull Requests:** Always create PRs for code changes to trigger tests
2. **Environment Protection:** Set up branch protection and required reviews for production
3. **Secrets Management:** Rotate secrets regularly, use different secrets for stg/prod
4. **Monitoring:** Set up CloudWatch alarms for Lambda functions
5. **Testing:** Always test in `stg` before deploying to `prod`
6. **Rollback Plan:** Keep track of working commit SHAs for quick rollbacks
7. **Documentation:** Update this README when adding new workflows or secrets

## Version Information

- **GitHub Actions:** v4
- **Node.js:** 18.x
- **Serverless Framework:** 3.x
- **AWS Actions:** v4

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Review Serverless Framework documentation
3. Check AWS CloudWatch logs for Lambda functions
4. Contact the development team
