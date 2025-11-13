# 🚀 NotesV2 Deployment Guide

## Prerequisites

✅ You have:
- Hardhat configured
- Sepolia RPC URL in `.env`
- Deployer private key in `.env`
- Sepolia ETH in deployer wallet

## Step-by-Step Deployment

### 1. Compile the Contract

```bash
cd smart-contracts
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 2. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy-v2.js --network sepolia
```

Expected output:
```
🚀 Deploying NotesV2 contract to Sepolia...
📝 Deploying contract...
✅ NotesV2 deployed successfully!
📍 Contract Address: 0x...
```

### 3. Copy Contract Address

Save the contract address from the deployment output. You'll need it for the next steps.

### 4. Update Frontend Environment

Update `frontend/.env`:
```bash
VITE_CONTRACT_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS_HERE
```

### 5. Update Contract ABI

```bash
# Copy the new ABI
cp smart-contracts/artifacts/contracts/NotesV2.sol/NotesV2.json frontend/src/abis/NotesABI.json
```

Or manually:
1. Open `smart-contracts/artifacts/contracts/NotesV2.sol/NotesV2.json`
2. Copy the entire file content
3. Paste into `frontend/src/abis/NotesABI.json`

### 6. Verify Contract on Etherscan (Optional but Recommended)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

### 7. Test the Deployment

```bash
# In frontend directory
cd frontend
npm run dev
```

Then:
1. Connect your wallet
2. Try creating a note with a category
3. Try marking a note as favorite
4. Test all new features

## Troubleshooting

### Issue: "Insufficient funds"
**Solution:** Make sure your deployer wallet has Sepolia ETH
- Get from: https://sepoliafaucet.com/

### Issue: "Network not configured"
**Solution:** Check `smart-contracts/.env` has:
```
SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

### Issue: "Contract not found"
**Solution:** Make sure you compiled first:
```bash
npx hardhat compile
```

### Issue: "ABI mismatch"
**Solution:** Make sure you copied the correct ABI file from NotesV2, not Notes

## Migration from V1 to V2

### Option 1: Fresh Start (Recommended for Testing)
- Deploy NotesV2
- Start with clean slate
- Users create new notes

### Option 2: Data Migration (Advanced)
If you want to migrate existing notes:

1. Export all notes from V1 using the export feature
2. Deploy NotesV2
3. Import notes back (they'll be re-uploaded to IPFS)

### Differences Between V1 and V2

| Feature | V1 (Notes.sol) | V2 (NotesV2.sol) |
|---------|----------------|------------------|
| Basic CRUD | ✅ | ✅ |
| Categories | ❌ | ✅ |
| Favorites | ❌ | ✅ |
| Update Notes | ❌ | ✅ |
| Last Modified | ❌ | ✅ |
| Filter by Category | ❌ | ✅ |
| Get Favorites | ❌ | ✅ |

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract address saved
- [ ] Frontend `.env` updated
- [ ] ABI file updated
- [ ] Contract verified on Etherscan
- [ ] Tested creating notes
- [ ] Tested categories
- [ ] Tested favorites
- [ ] Tested on mobile
- [ ] Documentation updated

## Quick Commands Reference

```bash
# Compile
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy-v2.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# Test locally
npx hardhat test

# Run local node
npx hardhat node
```

## Contract Functions (NotesV2)

### New Functions:
```solidity
// Add note with category
addNote(string ipfsHash, string category)

// Update existing note
updateNote(uint id, string ipfsHash, string category)

// Toggle favorite status
toggleFavorite(uint id)

// Get notes by category
getNotesByCategory(string category)

// Get favorite notes
getFavoriteNotes()

// Get user's categories
getMyCategories()
```

### Existing Functions:
```solidity
// Get all user notes
getMyNotes()

// Delete note
deleteNote(uint id)
```

## Gas Estimates

| Function | Estimated Gas | Cost (20 gwei) |
|----------|--------------|----------------|
| addNote | ~150,000 | ~0.003 ETH |
| updateNote | ~100,000 | ~0.002 ETH |
| toggleFavorite | ~50,000 | ~0.001 ETH |
| deleteNote | ~80,000 | ~0.0016 ETH |

## Security Notes

⚠️ **Important:**
- Never commit private keys to git
- Use environment variables for sensitive data
- Test on testnet before mainnet
- Verify contract source code on Etherscan
- Audit contract before production use

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Hardhat documentation
3. Check Sepolia network status
4. Verify your wallet has sufficient ETH

## Next Steps After Deployment

1. **Update Documentation**
   - Add new contract address to README
   - Update feature documentation

2. **Test Thoroughly**
   - Test all CRUD operations
   - Test new features (categories, favorites)
   - Test on different devices

3. **Monitor**
   - Watch contract on Etherscan
   - Monitor gas usage
   - Track user adoption

4. **Announce**
   - Inform users about new features
   - Provide migration guide if needed
   - Share contract address

---

**Ready to deploy?** Run:
```bash
cd smart-contracts
npx hardhat run scripts/deploy-v2.js --network sepolia
```

Good luck! 🚀