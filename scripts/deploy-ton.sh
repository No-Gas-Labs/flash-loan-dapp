#!/bin/bash

# TON Flash Loan Contract Deployment Script
# This script deploys the flash loan contract to TON testnet

set -e

echo "Starting TON Flash Loan Contract Deployment..."

# Configuration
TONCENTER_API_KEY="your_toncenter_api_key"
WALLET_MNEMONIC="your_wallet_mnemonic_here"

# Install dependencies
echo "Installing TON dependencies..."
npm install -g @ton/blueprint @ton/ton @ton/crypto

# Navigate to TON contracts
cd ../contracts/ton

# Build the project
echo "Building TON contracts..."
npx blueprint build

# Deploy to testnet
echo "Deploying to TON testnet..."
npx blueprint run deploy-flashloan --testnet --api-key $TONCENTER_API_KEY

# Initialize liquidity pool
echo "Initializing liquidity pool..."
npx blueprint run init-pool --testnet --api-key $TONCENTER_API_KEY

echo "TON Flash Loan Contract deployed successfully!"