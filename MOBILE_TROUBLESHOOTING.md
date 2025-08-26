# Mobile MetaMask Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to add Sepolia network" Error

This is a common issue on MetaMask mobile. Here are several solutions:

#### Solution A: Manual Network Addition
1. Open MetaMask mobile app
2. Tap the network dropdown (top center)
3. Tap "Add Network" or "Custom RPC"
4. Fill in these details:

```
Network Name: Sepolia test network
New RPC URL: https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer URL: https://sepolia.etherscan.io/
```

#### Solution B: Use Alternative RPC URLs
If the first RPC doesn't work, try these alternatives:

```
Primary: https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
Backup 1: https://rpc.sepolia.org
Backup 2: https://ethereum-sepolia-rpc.publicnode.com
Backup 3: https://sepolia.gateway.tenderly.co
```

#### Solution C: Clear MetaMask Cache
1. Go to MetaMask Settings
2. Find "Advanced" or "Reset Account"
3. Clear transaction history (this won't affect your funds)
4. Try adding the network again

### 2. Network Addition Keeps Failing

#### Check MetaMask Version
- Update MetaMask to the latest version
- Older versions may have compatibility issues

#### Restart MetaMask
1. Force close MetaMask app
2. Reopen and try again
3. Sometimes a fresh start resolves connection issues

#### Check Internet Connection
- Ensure stable internet connection
- Try switching between WiFi and mobile data

### 3. "User Rejected Request" Error

This happens when:
- You accidentally tapped "Cancel" instead of "Approve"
- MetaMask is locked
- There's a pending transaction

#### Solutions:
1. Make sure MetaMask is unlocked
2. Clear any pending transactions
3. Try the network addition again
4. Tap "Approve" when prompted

### 4. Network Added But Can't Connect

#### Switch to Sepolia Network
1. In MetaMask, tap the network dropdown
2. Select "Sepolia test network"
3. Make sure it's the active network
4. Try connecting your wallet again

#### Check Network Details
Verify the network was added with correct details:
- Chain ID should be `11155111`
- RPC URL should be working
- Currency symbol should be `ETH`

### 5. App Won't Load After Network Switch

#### Refresh the Page
1. In MetaMask browser, pull down to refresh
2. Or close and reopen the dApp tab

#### Clear Browser Cache
1. In MetaMask browser settings
2. Clear cache and cookies
3. Reload the application

### 6. Alternative Solutions

#### Use Different Browser
If MetaMask mobile browser has issues:
1. Try opening in regular mobile browser
2. Use the "Open in MetaMask" button when prompted
3. Or manually copy the URL to MetaMask browser

#### Desktop Alternative
For testing purposes:
1. Use MetaMask browser extension on desktop
2. Add Sepolia network there first
3. It will sync to your mobile app

### 7. Getting Sepolia Test ETH

After successfully adding the network:
1. Visit a Sepolia faucet: https://sepoliafaucet.com/
2. Enter your wallet address
3. Request test ETH for transactions

### 8. Still Having Issues?

#### Check These Common Mistakes:
- ❌ Wrong Chain ID (should be `11155111`, not `0xAA36A7`)
- ❌ Extra spaces in RPC URL
- ❌ Wrong network name format
- ❌ Missing `https://` in URLs

#### Contact Support:
- MetaMask Support: https://support.metamask.io/
- Check MetaMask Status: https://status.metamask.io/

### 9. Prevention Tips

#### For Future Use:
- Always double-check network details before adding
- Keep MetaMask updated
- Use reliable RPC endpoints
- Test with small amounts first

#### Backup Strategy:
- Always have your seed phrase backed up
- Consider using multiple wallets for testing
- Keep some ETH on mainnet for important transactions

---

## Quick Reference

### Sepolia Network Details
```json
{
  "chainName": "Sepolia test network",
  "chainId": "11155111",
  "rpcUrls": ["https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
  "nativeCurrency": {
    "name": "SepoliaETH",
    "symbol": "ETH",
    "decimals": 18
  },
  "blockExplorerUrls": ["https://sepolia.etherscan.io/"]
}
```

### Useful Links
- Sepolia Faucet: https://sepoliafaucet.com/
- Sepolia Explorer: https://sepolia.etherscan.io/
- MetaMask Support: https://support.metamask.io/
- Network Status: https://status.metamask.io/