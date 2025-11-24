#!/bin/bash

# ============================================
# AWS SES SMTP Credentials Rotation Script
# ============================================
# This script helps you rotate AWS SES SMTP credentials
# after a security incident.
#
# PREREQUISITES:
# - AWS CLI installed and configured
# - Permissions to manage IAM users and SES
# ============================================

set -e

echo "=========================================="
echo "AWS SES SMTP Credentials Rotation"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IAM_USER_NAME="ses-smtp-user"
EXPOSED_ACCESS_KEY="AKIAVCRW6HKJETE64L5X"
AWS_REGION="${AWS_REGION:-eu-west-1}"

echo -e "${YELLOW}Step 1: Checking exposed credentials${NC}"
echo "Exposed Access Key: $EXPOSED_ACCESS_KEY"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS CLI configuration
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI is configured${NC}"
echo ""

echo -e "${YELLOW}Step 2: Listing current IAM users${NC}"
aws iam list-users --query 'Users[].UserName' --output table

echo ""
echo -e "${YELLOW}Step 3: Listing access keys for SES users${NC}"
echo "Looking for users with 'ses' in their name..."
echo ""

# Find all users with 'ses' in the name
SES_USERS=$(aws iam list-users --query 'Users[?contains(UserName, `ses`)].UserName' --output text)

if [ -z "$SES_USERS" ]; then
    echo -e "${YELLOW}No users with 'ses' in the name found.${NC}"
    echo "Please manually identify the IAM user for SES SMTP."
else
    for USER in $SES_USERS; do
        echo "User: $USER"
        aws iam list-access-keys --user-name "$USER" --output table
        echo ""
    done
fi

echo -e "${YELLOW}Step 4: Instructions to revoke and rotate credentials${NC}"
echo ""
echo -e "${RED}CRITICAL: Execute these commands IMMEDIATELY:${NC}"
echo ""

echo "1. Delete the exposed access key:"
echo "   ${GREEN}aws iam delete-access-key --user-name <IAM_USER_NAME> --access-key-id $EXPOSED_ACCESS_KEY${NC}"
echo ""

echo "2. Create new SMTP credentials in AWS Console:"
echo "   - Go to: https://console.aws.amazon.com/ses/"
echo "   - Navigate to: SMTP Settings > Create My SMTP Credentials"
echo "   - Download and save the credentials securely"
echo ""

echo "3. Update your environment files:"
echo "   - Production: Update .env on the server"
echo "   - Preprod: Update .env.preprod on the server"
echo ""

echo "4. Restart the applications:"
echo "   Production:"
echo "   ${GREEN}ssh root@compliance.3jdigital.solutions 'docker restart studio-compliance-app'${NC}"
echo ""

echo "5. Test email sending:"
echo "   - Try to send a test email from the application"
echo "   - Check CloudWatch logs for any errors"
echo ""

echo -e "${YELLOW}Step 5: Check for unauthorized usage${NC}"
echo ""
echo "Check SES sending statistics:"
echo "   ${GREEN}aws ses get-send-statistics --region $AWS_REGION${NC}"
echo ""

echo "Check CloudWatch Logs (last 24h):"
echo "   Go to: https://console.aws.amazon.com/cloudwatch/"
echo "   Filter by: /aws/ses/"
echo "   Look for suspicious activity"
echo ""

echo -e "${RED}=========================================="
echo "MANUAL STEPS REQUIRED"
echo "==========================================${NC}"
echo ""
echo "This script provides guidance only."
echo "You must manually:"
echo "1. Revoke the exposed credentials in AWS Console"
echo "2. Generate new credentials"
echo "3. Update production/preprod .env files"
echo "4. Restart the applications"
echo "5. Monitor for unauthorized usage"
echo ""

read -p "Press Enter to check SES statistics now (or Ctrl+C to exit)..."

echo ""
echo -e "${YELLOW}SES Send Statistics (last 14 days):${NC}"
aws ses get-send-statistics --region "$AWS_REGION" --output table

echo ""
echo -e "${GREEN}Script completed.${NC}"
echo "Remember to update your .env files with new credentials!"
