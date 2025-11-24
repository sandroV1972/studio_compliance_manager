#!/bin/bash

# ============================================
# Setup Git Secrets
# ============================================
# This script installs and configures git-secrets
# to prevent committing sensitive data
# ============================================

set -e

echo "=========================================="
echo "Git Secrets Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detected macOS"
    PKG_MANAGER="brew"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Detected Linux"
    if command -v apt-get &> /dev/null; then
        PKG_MANAGER="apt"
    elif command -v yum &> /dev/null; then
        PKG_MANAGER="yum"
    else
        echo -e "${RED}Error: Unsupported package manager${NC}"
        exit 1
    fi
else
    echo -e "${RED}Error: Unsupported OS${NC}"
    exit 1
fi

# Install git-secrets
echo -e "${YELLOW}Step 1: Installing git-secrets${NC}"
if ! command -v git-secrets &> /dev/null; then
    case $PKG_MANAGER in
        brew)
            echo "Installing via Homebrew..."
            brew install git-secrets
            ;;
        apt)
            echo "Installing via apt..."
            sudo apt-get update
            sudo apt-get install -y git-secrets
            ;;
        yum)
            echo "Installing via yum..."
            sudo yum install -y git-secrets
            ;;
    esac
else
    echo -e "${GREEN}✓ git-secrets already installed${NC}"
fi

# Install git-secrets in the repository
echo ""
echo -e "${YELLOW}Step 2: Configuring git-secrets for this repository${NC}"
git secrets --install -f

# Add AWS patterns
echo -e "${YELLOW}Step 3: Adding AWS secret patterns${NC}"
git secrets --register-aws

# Add custom patterns from file
if [ -f ".git-secrets-patterns" ]; then
    echo -e "${YELLOW}Step 4: Adding custom patterns${NC}"
    while IFS= read -r pattern; do
        # Skip comments and empty lines
        if [[ ! "$pattern" =~ ^# ]] && [[ -n "$pattern" ]]; then
            git secrets --add "$pattern" || true
        fi
    done < .git-secrets-patterns
    echo -e "${GREEN}✓ Custom patterns added${NC}"
fi

# List configured patterns
echo ""
echo -e "${YELLOW}Configured patterns:${NC}"
git secrets --list

echo ""
echo -e "${GREEN}=========================================="
echo "Git Secrets Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Git secrets will now:"
echo "1. Scan commits for secrets before committing"
echo "2. Scan commits before pushing"
echo "3. Prevent accidental credential exposure"
echo ""
echo -e "${YELLOW}To scan existing files:${NC}"
echo "  git secrets --scan"
echo ""
echo -e "${YELLOW}To scan entire history:${NC}"
echo "  git secrets --scan-history"
echo ""
echo -e "${YELLOW}Test with a dry run:${NC}"
echo "  echo 'AKIAIOSFODNN7EXAMPLE' | git secrets --scan -"
echo ""
