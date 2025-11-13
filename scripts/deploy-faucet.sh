#!/bin/bash

# Web3 Notes Faucet Deployment Script
# This script helps deploy the faucet to Vercel

echo "🚀 Web3 Notes Faucet Deployment"
echo "================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if required environment variables are set
echo "🔍 Checking environment variables..."

if [ -z "$FAUCET_PRIVATE_KEY" ]; then
    echo "⚠️  FAUCET_PRIVATE_KEY not set"
    echo "Please set your faucet wallet private key:"
    read -s -p "Enter faucet private key (0x...): " FAUCET_PRIVATE_KEY
    echo
fi

if [ -z "$SEPOLIA_RPC_URL" ]; then
    echo "⚠️  SEPOLIA_RPC_URL not set"
    echo "Please enter your Sepolia RPC URL (e.g., Infura, Alchemy):"
    read -p "Enter RPC URL: " SEPOLIA_RPC_URL
fi

if [ -z "$FAUCET_AMOUNT" ]; then
    FAUCET_AMOUNT="0.005"
    echo "ℹ️  Using default faucet amount: $FAUCET_AMOUNT ETH"
fi

# Set environment variables in Vercel
echo "🔧 Setting up Vercel environment variables..."

vercel env add FAUCET_PRIVATE_KEY production <<< "$FAUCET_PRIVATE_KEY"
vercel env add SEPOLIA_RPC_URL production <<< "$SEPOLIA_RPC_URL"
vercel env add FAUCET_AMOUNT production <<< "$FAUCET_AMOUNT"

echo "✅ Environment variables configured"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✨ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Fund your faucet wallet with Sepolia ETH"
echo "2. Test the faucet API endpoint"
echo "3. Monitor faucet balance regularly"
echo ""
echo "🔗 Useful links:"
echo "- Sepolia Faucet: https://sepoliafaucet.com/"
echo "- Sepolia Explorer: https://sepolia.etherscan.io/"
echo "- Vercel Dashboard: https://vercel.com/dashboard"