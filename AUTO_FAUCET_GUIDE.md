# 🎁 Auto-Faucet Feature

ChainNotes now automatically sends test ETH to new users on their first login!

## How It Works

1. **First Login Detection**: When a user connects their wallet for the first time, the app checks if they've already received faucet funds
2. **Balance Check**: Verifies if the user has less than 0.001 ETH
3. **Automatic Transfer**: If eligible, automatically sends 0.005 ETH to get them started
4. **Welcome Notification**: Shows a friendly notification with transaction details

## Features

✅ **One-time per address**: Users can only claim once per wallet address
✅ **Balance threshold**: Only sends if balance is below 0.001 ETH
✅ **Signature verification**: Requires wallet signature to prevent abuse
✅ **Rate limiting**: 24-hour cooldown between requests
✅ **Beautiful notifications**: Animated success messages with Etherscan links

## Environment Variables Required

Add these to your Vercel project:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_faucet_wallet_private_key
FAUCET_AMOUNT=0.005
```

## API Endpoints

### POST /api/faucet
Request faucet funds for a wallet address.

**Request:**
```json
{
  "address": "0x...",
  "signature": "0x...",
  "message": "ChainNotes Faucet Request..."
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "amount": "0.005",
  "explorerUrl": "https://sepolia.etherscan.io/tx/0x..."
}
```

### GET /api/faucet-status
Check faucet wallet status and balance.

**Response:**
```json
{
  "configured": true,
  "faucet": {
    "address": "0x...",
    "balance": "1.5",
    "isLowBalance": false
  },
  "capacity": {
    "requestsRemaining": 300
  }
}
```

## Security Features

- **Signature Verification**: Users must sign a message to prove wallet ownership
- **Rate Limiting**: 24-hour cooldown prevents spam
- **Balance Checks**: Won't send to wallets that already have sufficient funds
- **Local Storage Tracking**: Prevents duplicate claims from same browser

## User Experience

When a new user connects:
1. Wallet connection completes
2. Auto-faucet checks eligibility in background
3. If eligible, sends ETH automatically
4. Shows success notification with transaction link
5. User can start using the app immediately!

## Faucet Wallet Setup

1. Create a new wallet for the faucet (don't use your main wallet!)
2. Fund it with Sepolia ETH from a public faucet
3. Add the private key to Vercel environment variables
4. Monitor balance using the `/api/faucet-status` endpoint

## Manual Faucet Button

Users can also manually request funds using the faucet button in the header if:
- They need more ETH later
- Auto-faucet failed for some reason
- They're using a different wallet

---

**Note**: This feature is designed for testnet only. Never use real ETH or mainnet private keys!
