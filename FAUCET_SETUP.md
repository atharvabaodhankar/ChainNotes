# Web3 Notes Faucet Setup Guide

## Overview

The Web3 Notes faucet automatically sends small amounts of Sepolia ETH to first-time users, improving the onboarding experience by eliminating the need to manually request test tokens.

## Architecture

```
User Wallet → Frontend → API Endpoint → Faucet Wallet → User Wallet
     ↓            ↓           ↓             ↓            ↓
  Sign Message → Verify → Check Limits → Send ETH → Update UI
```

## Setup Instructions

### 1. Create Faucet Wallet

```bash
# Generate a new wallet for the faucet
# Save the private key securely - you'll need it for deployment
```

**Important**: 
- Use a dedicated wallet only for the faucet
- Never use your personal wallet
- Fund it with Sepolia ETH from a public faucet

### 2. Fund the Faucet Wallet

Get Sepolia ETH from public faucets:
- https://sepoliafaucet.com/
- https://faucet.sepolia.dev/
- https://sepolia-faucet.pk910.de/

Recommended funding: **1-5 Sepolia ETH** (enough for 200-1000 users)

### 3. Environment Variables

Set these environment variables in your deployment platform:

```bash
# Required
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
FAUCET_PRIVATE_KEY=0x1234567890abcdef... # Your faucet wallet private key

# Optional
FAUCET_AMOUNT=0.005 # Amount to send per request (default: 0.005 ETH)
```

### 4. Vercel Deployment

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Set Environment Variables
```bash
# Set production environment variables
vercel env add SEPOLIA_RPC_URL
vercel env add FAUCET_PRIVATE_KEY
vercel env add FAUCET_AMOUNT
```

#### Deploy
```bash
# Deploy to production
vercel --prod
```

### 5. Alternative Deployment Options

#### Netlify Functions
```javascript
// netlify/functions/faucet.js
exports.handler = async (event, context) => {
  // Same logic as api/faucet.js
};
```

#### Railway
```bash
# Deploy to Railway
railway login
railway init
railway add
railway deploy
```

#### Render
```bash
# Deploy to Render
# Use the web service option with Node.js
```

## Security Features

### 1. Signature Verification
- Users must sign a message with their wallet
- Prevents unauthorized requests
- Ensures wallet ownership

### 2. Rate Limiting
- One request per wallet per 24 hours
- Prevents abuse and spam
- Configurable time window

### 3. Balance Checks
- Only sends to wallets with < 0.001 ETH
- Prevents unnecessary transactions
- Saves faucet funds

### 4. Amount Limits
- Configurable send amount (default: 0.005 ETH)
- Enough for several transactions
- Not too much to encourage abuse

## API Endpoints

### POST /api/faucet

Request Sepolia ETH for a wallet address.

**Request Body:**
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "signature": "0xabcdef...",
  "message": "Request Sepolia ETH for 0x... at 1234567890"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "transactionHash": "0xabcdef123456...",
  "amount": "0.005",
  "recipient": "0x1234567890123456789012345678901234567890",
  "message": "Successfully sent 0.005 ETH to 0x...",
  "explorerUrl": "https://sepolia.etherscan.io/tx/0xabcdef123456..."
}
```

**Error Responses:**
```json
// Rate limited (429)
{
  "error": "Rate limit exceeded. Try again in 12 hours.",
  "nextRequestTime": 1234567890000
}

// Already has balance (400)
{
  "error": "Address already has sufficient balance",
  "currentBalance": "0.015"
}

// Faucet empty (503)
{
  "error": "Faucet is empty. Please try again later.",
  "faucetBalance": "0.001"
}
```

## Frontend Integration

### 1. Import Utilities
```javascript
import { requestSepoliaETH, checkFaucetEligibility } from './utils/faucet';
import FaucetButton from './components/FaucetButton';
```

### 2. Use FaucetButton Component
```jsx
<FaucetButton 
  userAddress={userAddress} 
  isConnected={isConnected} 
/>
```

### 3. Manual Integration
```javascript
// Check if user needs ETH
const needsETH = await checkFaucetEligibility(address, provider);

if (needsETH) {
  // Request ETH from faucet
  const result = await requestSepoliaETH(address, signer);
  console.log('ETH sent:', result.transactionHash);
}
```

## Monitoring & Maintenance

### 1. Monitor Faucet Balance
```javascript
// Check faucet balance
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const balance = await provider.getBalance(FAUCET_WALLET_ADDRESS);
console.log('Faucet balance:', ethers.formatEther(balance), 'ETH');
```

### 2. Refill When Low
- Monitor balance regularly
- Refill when below 0.1 ETH
- Set up alerts for low balance

### 3. Usage Analytics
- Track requests per day
- Monitor success/failure rates
- Identify potential abuse

## Cost Analysis

### Transaction Costs
- Gas per transaction: ~21,000 gas
- Gas price on Sepolia: ~1-10 gwei
- Cost per transaction: ~0.00002-0.0002 ETH

### Monthly Costs (100 users/day)
- Transactions: 3,000/month
- ETH sent: 15 ETH/month (at 0.005 ETH each)
- Gas costs: ~0.006-0.06 ETH/month
- **Total: ~15.06 ETH/month**

## Troubleshooting

### Common Issues

#### 1. "Faucet not configured"
- Check FAUCET_PRIVATE_KEY environment variable
- Ensure private key is valid and has 0x prefix

#### 2. "Insufficient funds"
- Check faucet wallet balance
- Refill from public faucets
- Reduce FAUCET_AMOUNT if needed

#### 3. "Network error"
- Check SEPOLIA_RPC_URL
- Verify RPC endpoint is working
- Try alternative RPC providers

#### 4. "Signature verification failed"
- Check message format
- Ensure signature is from correct wallet
- Verify ethers.js version compatibility

### Debug Mode
```javascript
// Enable debug logging
process.env.NODE_ENV = 'development';
```

## Production Considerations

### 1. Database Integration
Replace in-memory rate limiting with persistent storage:
```javascript
// Use Redis, PostgreSQL, or MongoDB
const lastRequest = await db.get(`faucet:${address}`);
```

### 2. Advanced Rate Limiting
- IP-based limiting
- CAPTCHA integration
- Proof of humanity verification

### 3. Monitoring & Alerts
- Set up balance alerts
- Monitor error rates
- Track usage patterns

### 4. Scaling
- Use multiple faucet wallets
- Implement load balancing
- Add request queuing

## Security Best Practices

1. **Never expose private keys** in client-side code
2. **Use environment variables** for sensitive data
3. **Implement proper rate limiting** to prevent abuse
4. **Monitor transactions** for suspicious activity
5. **Keep faucet balance reasonable** (not too high)
6. **Use dedicated wallet** only for faucet operations
7. **Regular security audits** of the codebase

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages carefully
3. Monitor faucet wallet balance
4. Verify environment variables
5. Test with small amounts first