#!/bin/bash

# SUI Flash Loan Contract Deployment Script
# This script deploys the flash loan contract to SUI testnet

set -e

echo "Starting SUI Flash Loan Contract Deployment..."

# Configuration
SUI_NETWORK="testnet"
SUI_ADDRESS="your_sui_address"
PRIVATE_KEY="your_private_key"

# Install SUI CLI
echo "Installing SUI CLI..."
curl -sSfL https://raw.githubusercontent.com/MystenLabs/sui/main/crates/sui-install/sui-install.sh | sh

# Navigate to SUI contracts
cd ../contracts/sui

# Build the project
echo "Building SUI contracts..."
sui move build

# Deploy to testnet
echo "Deploying to SUI testnet..."
sui client publish --gas-budget 100000000 --skip-dependency-verification

# Initialize liquidity pool
echo "Initializing liquidity pool..."
sui client call --function create_pool --module flashloan --package [PACKAGE_ID] \
  --args 1000000000 10 8000 --gas-budget 10000000

echo "SUI Flash Loan Contract deployed successfully!"