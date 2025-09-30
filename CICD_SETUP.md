# CI/CD Pipeline Setup Guide

This guide will help you set up the GitHub Actions CI/CD pipeline for deploying OpenCerts Functions to AWS.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Setup](#aws-setup)
3. [GitHub Setup](#github-setup)
4. [Configuration](#configuration)
5. [Testing the Pipeline](#testing-the-pipeline)
6. [Deployment Workflow](#deployment-workflow)

## Prerequisites

Before setting up the CI/CD pipeline, ensure you have:

- [ ] AWS Account with appropriate permissions
- [ ] GitHub repository with admin access
- [ ] AWS CLI installed and configured (for initial setup)
- [ ] Node.js 18.x installed locally
- [ ] Serverless Framework knowledge

## AWS Setup

### 1. Create IAM User for CI/CD

Create an IAM user specifically for GitHub Actions deployments:

```bash
aws iam create-user --user-name github-actions-opencerts
```

### 2. Attach Required Policies

The IAM user needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "s3:*",
        "dynamodb:*",
        "cloudformation:*",
        "iam:*",
        "logs:*",
        "events:*",
        "cloudwatch:*",
        "route53:*",
        "acm:*"
      ],
      "Resource": "*"
    }
  ]
}
```

**Note:** For production, use more restrictive policies following the principle of least privilege.

Create and attach the policy:

```bash
# Create policy
aws iam create-policy \
  --policy-name OpenCertsDeploymentPolicy \
  --policy-document file://deployment-policy.json

# Attach policy to user
aws iam attach-user-policy \
  --user-name github-actions-opencerts \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/OpenCertsDeploymentPolicy
```

### 3. Generate Access Keys

```bash
aws iam create-access-key --user-name github-actions-opencerts
```

**Save the output securely** - you'll need:
- `AccessKeyId`
- `SecretAccessKey`

### 4. Set Up AWS SES (for Email Service)

1. Verify your sender email address:
```bash
aws ses verify-email-identity --email-address noreply@yourdomain.com --region ap-southeast-1
```

2. If in SES sandbox, verify recipient addresses or request production access

3. Create SES SMTP credentials (optional, if using SMTP):
   - Go to AWS Console → SES → SMTP Settings
   - Create SMTP credentials

### 5. Set Up S3 Bucket (for Storage Service)

The bucket will be created automatically by Serverless Framework, but you can pre-create it:

```bash
aws s3 mb s3://oc-functions-storage-stg --region ap-southeast-1
aws s3 mb s3://oc-functions-storage-prod --region ap-southeast-1
```

### 6. Set Up Custom Domain (Optional)

If using custom domain:

1. **Create hosted zone in Route53:**
```bash
aws route53 create-hosted-zone --name api.yourdomain.com --caller-reference $(date +%s)
```

2. **Request SSL certificate in ACM:**
```bash
aws acm request-certificate \
  --domain-name api.yourdomain.com \
  --subject-alternative-names "*.api.yourdomain.com" \
  --validation-method DNS \
  --region ap-southeast-1
```

3. **Validate certificate** using DNS validation records

## GitHub Setup

### 1. Configure Repository Secrets

Go to your GitHub repository → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add the following secrets:

#### Required Secrets (All Services)
```
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_REGION=ap-southeast-1
```

#### Email Service Secrets
```
SES_KEY_ID=<ses-access-key-id>
SES_SECRET=<ses-secret-access-key>
SES_REGION=ap-southeast-1
RECAPTCHA_SECRET=<your-recaptcha-secret>
EMAIL_API_KEYS=key1:key2:key3
```

#### Storage Service Secrets
```
BUCKET_NAME=oc-functions-storage
OBJECT_TTL=31
ENABLE_STORAGE_UPLOAD_API_KEY=false
```

#### Verify Service Secrets
```
NETWORK=sepolia
```

#### Domain Secrets (Optional)
```
DOMAIN=api.yourdomain.com
CERTIFICATE_DOMAIN=*.api.yourdomain.com
DISABLE_DOMAIN=false
```

### 2. Set Up GitHub Environments

Create two environments for better deployment control:

#### Staging Environment
1. Go to `Settings` → `Environments` → `New environment`
2. Name: `stg`
3. No protection rules needed (optional: add reviewers)

#### Production Environment
1. Go to `Settings` → `Environments` → `New environment`
2. Name: `prod`
3. **Add protection rules:**
   - ✅ Required reviewers (select team members)
   - ✅ Wait timer: 5 minutes (optional)
   - ✅ Deployment branches: `main` and `master` only

### 3. Configure Branch Protection

Protect your main branches:

1. Go to `Settings` → `Branches` → `Add rule`
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

Repeat for `develop` branch with less strict rules.

## Configuration

### 1. Update Serverless Configuration

Ensure your `serverless.yml` files are properly configured:

**Email Service** (`src/email/serverless.yml`):
```yaml
provider:
  stage: "${opt:stage, 'stg'}"
  region: ap-southeast-1
```

**Storage Service** (`src/storage/serverless.yml`):
```yaml
provider:
  stage: ${opt:stage, 'stg'}
  region: ap-southeast-1
```

**Verify Service** (`src/verify/serverless.yml`):
```yaml
provider:
  stage: "${opt:stage, 'stg'}"
  region: "${opt:region, 'ap-southeast-1'}"
```

### 2. Environment Variables

Create `.env` file locally (not committed to git):

```bash
cp .env.example .env
```

Edit `.env` with your local development credentials.

### 3. Test Locally

Before deploying via CI/CD, test locally:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Validate serverless configs
npm run sls-config-check

# Test local deployment (optional)
npm run dev
```

## Testing the Pipeline

### 1. Test the Test Workflow

Create a feature branch and push:

```bash
git checkout -b test/ci-pipeline
git add .
git commit -m "Test CI pipeline"
git push origin test/ci-pipeline
```

This should trigger the `tests.yml` workflow. Check:
- ✅ Tests pass
- ✅ Linting passes
- ✅ Serverless config validation passes

### 2. Test Staging Deployment

Merge to `develop` branch:

```bash
git checkout develop
git merge test/ci-pipeline
git push origin develop
```

This should trigger:
1. Tests workflow
2. Deploy workflow (to `stg` environment)

Monitor the deployment in GitHub Actions tab.

### 3. Verify Deployment

After successful deployment, check:

```bash
# Get API endpoints
cd src/email && sls info --stage stg
cd ../storage && sls info --stage stg
cd ../verify && sls info --stage stg
```

Test the endpoints:

```bash
# Test verify endpoint
curl -X POST https://your-api-gateway-url/stg/verify \
  -H "Content-Type: application/json" \
  -d '{"document": {...}}'

# Test storage endpoint
curl https://your-api-gateway-url/stg/storage/test-id
```

### 4. Test Production Deployment

When ready for production:

```bash
git checkout main
git merge develop
git push origin main
```

This will:
1. Run tests
2. Wait for approval (if configured)
3. Deploy to `prod` environment

## Deployment Workflow

### Automatic Deployments

```
develop branch → stg environment (automatic)
main branch    → prod environment (automatic, with approval)
```

### Manual Deployments

1. Go to `Actions` tab
2. Select `Deploy to AWS`
3. Click `Run workflow`
4. Choose:
   - Environment: `stg` or `prod`
   - Services: `all` or specific services
5. Click `Run workflow`

### Rollback

If deployment fails or issues occur:

1. Go to `Actions` tab
2. Select `Rollback Deployment`
3. Click `Run workflow`
4. Choose:
   - Service to rollback
   - Environment
   - (Optional) Commit SHA
5. Click `Run workflow`

### Emergency Rollback

For immediate rollback to a known good version:

```bash
# Find the last working commit
git log --oneline

# Trigger rollback via GitHub Actions with that commit SHA
```

## Monitoring

### CloudWatch Logs

Monitor Lambda function logs:

```bash
# Email service logs
aws logs tail /aws/lambda/mail-stg-email --follow

# Storage service logs
aws logs tail /aws/lambda/storage-stg-get --follow

# Verify service logs
aws logs tail /aws/lambda/verify-stg-verify --follow
```

### API Gateway Metrics

Check API Gateway metrics in AWS Console:
- Request count
- Latency
- Error rates
- 4xx/5xx errors

### Set Up Alarms

Create CloudWatch alarms for critical metrics:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name opencerts-email-errors \
  --alarm-description "Alert on email service errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

## Troubleshooting

### Common Issues

#### 1. Deployment Fails with Permission Error

**Solution:** Verify IAM user has all required permissions. Check CloudFormation events in AWS Console.

#### 2. Custom Domain Not Working

**Solution:** 
- Verify SSL certificate is validated
- Check Route53 hosted zone
- Set `DISABLE_DOMAIN=true` to deploy without custom domain

#### 3. SES Email Sending Fails

**Solution:**
- Verify sender email in SES
- Check SES sandbox status
- Verify recipient emails (if in sandbox)

#### 4. S3 Bucket Already Exists Error

**Solution:**
- Bucket names must be globally unique
- Change `BUCKET_NAME` secret to a unique value

#### 5. Tests Fail in CI but Pass Locally

**Solution:**
- Check Node.js version matches (18.x)
- Verify all dependencies are in `package.json`
- Check for environment-specific code

### Debug Deployment

Enable verbose logging:

```bash
# In workflow, add --verbose flag
sls deploy --stage stg --verbose
```

Check CloudFormation stack events:

```bash
aws cloudformation describe-stack-events \
  --stack-name mail-stg \
  --max-items 20
```

## Security Best Practices

1. **Rotate Secrets Regularly:** Update AWS access keys and API keys every 90 days
2. **Use Different Credentials:** Use separate AWS accounts or IAM users for stg/prod
3. **Limit Permissions:** Follow principle of least privilege for IAM policies
4. **Enable MFA:** Enable MFA for AWS root account and IAM users
5. **Monitor Access:** Enable CloudTrail and review access logs regularly
6. **Secure Secrets:** Never commit secrets to git, use GitHub Secrets
7. **Review Deployments:** Require code reviews and approvals for production

## Maintenance

### Regular Tasks

- **Weekly:** Review deployment logs and metrics
- **Monthly:** Update dependencies (`npm update`)
- **Quarterly:** Rotate AWS access keys and secrets
- **Annually:** Review and update IAM policies

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Test after updates
npm test
npm run lint

# Deploy to staging first
git checkout develop
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin develop
```

## Support

For issues or questions:

1. Check GitHub Actions workflow logs
2. Review AWS CloudWatch logs
3. Check Serverless Framework documentation
4. Contact the development team

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)

---

**Last Updated:** 2025-09-30
**Version:** 1.0.0
