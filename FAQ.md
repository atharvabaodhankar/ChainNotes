# ❓ Frequently Asked Questions (FAQ)

## 📋 Table of Contents

- [General Questions](#general-questions)
- [Technical Questions](#technical-questions)
- [Security & Privacy](#security--privacy)
- [Blockchain & Immutability](#blockchain--immutability)
- [Costs & Economics](#costs--economics)
- [Usage & Features](#usage--features)
- [Troubleshooting](#troubleshooting)

---

## General Questions

### What is Web3 Notes?

Web3 Notes is a decentralized note-taking application that stores your notes on the Ethereum blockchain and IPFS. Unlike traditional note apps (Google Keep, Evernote), you truly own your data - no company can access, modify, or delete your notes.

### Why should I use Web3 Notes instead of Google Keep or Evernote?

**Advantages:**
- ✅ **True Ownership** - You control your data via your wallet
- ✅ **Privacy** - End-to-end encrypted, no server access
- ✅ **Censorship Resistant** - No one can delete your notes
- ✅ **Permanent** - Notes stored forever on blockchain
- ✅ **No Account** - Just connect your wallet
- ✅ **Open Source** - Transparent and auditable

**Trade-offs:**
- ⚠️ **Gas Costs** - Small fee for each transaction (~$0.01 on testnet)
- ⚠️ **Blockchain Speed** - 10-15 seconds for confirmation
- ⚠️ **Learning Curve** - Need to understand wallets and blockchain

### Do I need cryptocurrency to use this?

**For Testnet (Current):**
- No! We provide an automated faucet that gives you free Sepolia ETH
- Just click "Get Free ETH" and you'll receive 0.005 ETH instantly

**For Mainnet (Future):**
- Yes, you'll need real ETH for gas fees
- Estimated cost: ~$2-5 per note (depending on gas prices)

### Is this free to use?

**Currently:** Yes! Running on Sepolia testnet with free test ETH

**Future Mainnet:**
- Creating notes: ~$2-5 per note
- Reading notes: Free (no gas cost)
- Deleting notes: ~$1-3 per note
- Updating notes: ~$1-3 per note

---

## Technical Questions

### How does Web3 Notes work?

```
1. You write a note
2. Note is encrypted in your browser (AES-256)
3. Encrypted note uploaded to IPFS
4. IPFS hash stored on Ethereum blockchain
5. Only you can decrypt and read the note
```

**Key Components:**
- **Frontend** - React app in your browser
- **MetaMask** - Your wallet for authentication
- **Smart Contract** - Stores note metadata on Ethereum
- **IPFS** - Stores encrypted note content
- **Pinata** - Keeps IPFS content available

### What is IPFS and why do you use it?

**IPFS (InterPlanetary File System)** is a distributed file storage network.

**Why we use it:**
- ✅ **Cheap** - No gas costs for large content
- ✅ **Distributed** - Content stored across many nodes
- ✅ **Content-Addressed** - Files identified by hash
- ✅ **Permanent** - Content can't be changed

**Why not store everything on blockchain:**
- ❌ **Expensive** - Storing 1KB costs ~$50-100 on mainnet
- ❌ **Limited** - Block size restrictions
- ❌ **Slow** - Not optimized for large data

### What blockchain do you use?

**Current:** Ethereum Sepolia Testnet
- Free test network
- Same features as mainnet
- Perfect for testing and learning

**Future:** Ethereum Mainnet
- Real ETH required
- Production-ready
- Maximum security

**Why Ethereum:**
- ✅ Most secure and decentralized
- ✅ Largest developer ecosystem
- ✅ Best tooling and support
- ✅ Proven track record

---

## Security & Privacy

### How secure are my notes?

**Very secure!** Multiple layers of protection:

1. **Client-Side Encryption (AES-256)**
   - Military-grade encryption
   - Encrypted before leaving your browser
   - Key derived from your wallet address

2. **Blockchain Security**
   - Immutable records
   - Cryptographic proof of ownership
   - Distributed consensus

3. **Wallet Security**
   - Private keys never shared
   - MetaMask security features
   - Hardware wallet support

### Can anyone read my notes?

**No!** Here's what's public vs private:

**Public (Visible on Blockchain):**
- ❌ IPFS hash (just a random string)
- ❌ Your wallet address
- ❌ Number of notes you have
- ❌ Timestamps
- ❌ Category names

**Private (Encrypted):**
- ✅ Note title
- ✅ Note content
- ✅ All text you write

**Example:**
```
Public: "QmXxx123..." (meaningless hash)
Private: "My secret diary entry..." (only you can decrypt)
```

### What if I lose my wallet?

**⚠️ Critical:** If you lose your wallet, you lose access to your notes forever!

**Best Practices:**
1. **Backup your seed phrase** - Write it down on paper
2. **Store securely** - Safe, safety deposit box
3. **Never share** - Not even with support
4. **Test recovery** - Make sure you can restore
5. **Use hardware wallet** - For maximum security

**Export regularly:**
- Use the export feature to backup notes
- Store JSON files in multiple locations
- Can re-import to a new wallet if needed

### Can the developers access my notes?

**Absolutely not!** Here's why:

1. **No Backend** - We don't run any servers
2. **Client-Side Encryption** - Happens in your browser
3. **No Keys** - We never see your encryption keys
4. **Open Source** - You can verify the code
5. **Decentralized** - No central point of control

**Even if we wanted to:**
- We can't decrypt your notes
- We can't delete your notes
- We can't modify your notes
- We can't access your wallet

### What encryption do you use?

**Algorithm:** AES-256 (Advanced Encryption Standard)

**Key Generation:**
```javascript
key = SHA256(walletAddress + secretPhrase)
```

**Why it's secure:**
- ✅ Military-grade encryption
- ✅ 2^256 possible keys (impossible to brute force)
- ✅ Industry standard
- ✅ Used by governments and banks

**Attack Resistance:**
- Time to brute force: Longer than age of universe
- Quantum resistance: Currently secure
- Known vulnerabilities: None

---

## Blockchain & Immutability

### If blockchain is immutable, how can I delete notes?

**Great question!** This is the "blockchain paradox."

**The Truth:**
- You **cannot** physically delete data from blockchain
- The transaction history is **permanent**
- But you **can** make notes inaccessible

**How "Deletion" Works:**

1. **Logical Deletion (Blockchain)**
   ```solidity
   // Before
   notes[1] = {id: 1, hash: "QmAbc...", owner: 0x123...}
   
   // After "deletion"
   notes[1] = {id: 0, hash: "", owner: 0x000...}
   ```
   - Note marked as deleted in contract state
   - Removed from your note list
   - Won't appear in queries

2. **Physical Deletion (IPFS)**
   ```javascript
   // Unpin from Pinata
   await pinata.unpin(ipfsHash)
   ```
   - Content removed from IPFS
   - File becomes unavailable
   - Can't be retrieved anymore

**What Remains:**
- ✅ Transaction history (that you created/deleted a note)
- ✅ IPFS hash (but content is gone)
- ❌ Note content (deleted from IPFS)
- ❌ Ability to read the note (marked as deleted)

**Analogy:**
Think of it like burning a book:
- The library record shows you once had a book (blockchain)
- But the book itself is burned and gone (IPFS)
- No one can read it anymore

### Can I edit notes or are they permanent?

**Yes, you can edit!** The V2 contract supports updates.

**How Updates Work:**

1. **Edit the note** in the UI
2. **New encrypted version** uploaded to IPFS
3. **New IPFS hash** stored on blockchain
4. **Old IPFS content** can be unpinned
5. **Last modified timestamp** updated

**What's Preserved:**
- ✅ Note ID stays the same
- ✅ Creation timestamp preserved
- ✅ Ownership unchanged
- ✅ Update history on blockchain

**What Changes:**
- ✅ IPFS hash (new content)
- ✅ Last modified timestamp
- ✅ Category (if changed)

### What happens if Ethereum goes down?

**Short Answer:** Ethereum won't "go down" - it's decentralized.

**Long Answer:**

**Ethereum Network:**
- Runs on 1000+ nodes worldwide
- No single point of failure
- Would require shutting down internet globally
- Has 99.99%+ uptime since 2015

**If a node goes down:**
- Other nodes continue working
- Your notes remain accessible
- No data loss

**If IPFS goes down:**
- Content distributed across many nodes
- Pinata provides redundancy
- Can use multiple IPFS gateways
- Content remains available

**Worst Case Scenario:**
- Export your notes regularly
- Keep JSON backups
- Can re-upload to new IPFS provider
- Blockchain data always accessible

### Can the government censor my notes?

**Very difficult!** Here's why:

**Blockchain Censorship Resistance:**
- ✅ Distributed across 1000+ nodes globally
- ✅ No central authority
- ✅ Would need to shut down entire network
- ✅ Nodes in multiple countries

**IPFS Censorship Resistance:**
- ✅ Content distributed globally
- ✅ Multiple gateways available
- ✅ Can run your own node
- ✅ Content-addressed (can't be changed)

**Encryption Protection:**
- ✅ Even if accessed, content is encrypted
- ✅ Only you have the decryption key
- ✅ Unreadable without your wallet

**Limitations:**
- ⚠️ Government could block website access
- ⚠️ Could block MetaMask
- ⚠️ Could block IPFS gateways

**Workarounds:**
- ✅ Use VPN
- ✅ Access via Tor
- ✅ Run local IPFS node
- ✅ Use alternative frontends

---

## Costs & Economics

### How much does it cost to use?

**Sepolia Testnet (Current):**
- Creating notes: **FREE** (test ETH)
- Reading notes: **FREE**
- Deleting notes: **FREE** (test ETH)
- Storage: **FREE** (Pinata free tier)

**Ethereum Mainnet (Future):**
| Action | Gas | Cost @ 20 gwei | Cost @ 50 gwei |
|--------|-----|----------------|----------------|
| Create Note | 150,000 | $0.60 | $1.50 |
| Update Note | 100,000 | $0.40 | $1.00 |
| Delete Note | 80,000 | $0.32 | $0.80 |
| Toggle Favorite | 50,000 | $0.20 | $0.50 |
| Read Notes | 0 | **FREE** | **FREE** |

**IPFS Storage:**
- First 1GB: **FREE** (Pinata)
- Additional: $0.15/GB/month

### Why do I need to pay gas fees?

**Gas fees** pay for:
1. **Miners/Validators** - Process your transaction
2. **Network Security** - Maintain blockchain
3. **Storage** - Store data permanently
4. **Computation** - Execute smart contract

**Think of it like:**
- Postage stamp for mail
- Transaction fee for bank transfer
- Hosting fee for website

**Why it's worth it:**
- ✅ Permanent storage
- ✅ True ownership
- ✅ Censorship resistance
- ✅ No monthly subscription

### Is there a monthly subscription?

**No!** Unlike traditional apps:

**Traditional Apps:**
- ❌ $5-15/month forever
- ❌ Lose access if you stop paying
- ❌ Company owns your data

**Web3 Notes:**
- ✅ Pay once per note
- ✅ Own it forever
- ✅ No recurring fees
- ✅ You own your data

**Cost Comparison (1 year):**
```
Evernote Premium: $8/month × 12 = $96/year
Web3 Notes: $2/note × 50 notes = $100 one-time

After 2 years:
Evernote: $192
Web3 Notes: $100 (same notes, no additional cost)
```

### Can I get a refund if I delete a note?

**No.** Gas fees are non-refundable because:

1. **Already Paid** - Miners already processed transaction
2. **Blockchain Permanent** - Transaction recorded forever
3. **Network Costs** - Computational resources used

**Think of it like:**
- Postage stamp - Can't get refund after mailing
- Concert ticket - Can't refund after attending
- Restaurant meal - Can't refund after eating

**Best Practice:**
- Test on Sepolia first (free)
- Be sure before creating notes
- Export regularly for backup

---

## Usage & Features

### How do categories work?

**Categories** help organize your notes:

**Creating:**
```
1. Create/edit note
2. Enter category name (e.g., "Work", "Personal")
3. Category saved on blockchain
4. Auto-added to your category list
```

**Using:**
```
1. Click "Filters"
2. Select category
3. Only notes in that category show
```

**Features:**
- ✅ Unlimited categories
- ✅ Auto-suggest existing categories
- ✅ Filter by category
- ✅ Category statistics
- ✅ Stored on blockchain

### What are favorites for?

**Favorites** let you star important notes:

**Usage:**
```
1. Click star icon on note
2. Note marked as favorite
3. Filter to show only favorites
4. Sort favorites first
```

**Benefits:**
- ✅ Quick access to important notes
- ✅ Separate from categories
- ✅ Toggle on/off easily
- ✅ Stored on blockchain

### How does search work?

**Full-text search** across all your notes:

**Searches:**
- ✅ Note titles
- ✅ Note content
- ✅ Real-time results
- ✅ Case-insensitive

**Filters:**
- Category
- Favorites only
- Date range
- Sort order

**Example:**
```
Search: "meeting"
Results: All notes containing "meeting" in title or content
```

### Can I share notes with others?

**Currently:** No, notes are private to your wallet

**Future Plans:**
- 🔄 Encrypted sharing links
- 🔄 Share with specific addresses
- 🔄 Collaborative notes
- 🔄 Public notes (optional)

**Workaround:**
- Export note as text
- Share via traditional methods
- Recipient can import

### What are templates?

**Pre-built note formats** for common use cases:

**Available Templates:**
1. **Blank Note** - Empty canvas
2. **Meeting Notes** - Agenda, attendees, action items
3. **To-Do List** - Checkboxes and tasks
4. **Idea** - Structured idea development
5. **Daily Journal** - Reflection prompts
6. **Code Snippet** - Code with syntax

**Usage:**
```
1. Click template icon
2. Choose template
3. Pre-filled content appears
4. Edit and save
```

### How do I export my notes?

**3 Export Formats:**

**1. JSON (Recommended)**
```json
{
  "id": 1,
  "title": "My Note",
  "content": "Note content...",
  "category": "Work",
  "timestamp": 1234567890
}
```
- Full data with metadata
- Can be re-imported
- Best for backups

**2. Markdown**
```markdown
# My Note

**Created:** 2024-01-01
**Category:** Work

Note content...
```
- Formatted text
- Readable in any editor
- Good for sharing

**3. Plain Text**
```
MY NOTE
Created: 2024-01-01
Category: Work

Note content...
```
- Simple format
- Universal compatibility
- Smallest file size

---

## Troubleshooting

### MetaMask isn't connecting

**Solutions:**

1. **Unlock MetaMask**
   - Click MetaMask extension
   - Enter password

2. **Check Network**
   - Switch to Sepolia testnet
   - Click "Switch Network" button

3. **Refresh Page**
   - Hard refresh (Ctrl+Shift+R)
   - Clear cache

4. **Reinstall MetaMask**
   - Backup seed phrase first!
   - Uninstall and reinstall

### Transaction failed

**Common Causes:**

1. **Insufficient Gas**
   - Get more Sepolia ETH from faucet
   - Click "Get Free ETH"

2. **Wrong Network**
   - Switch to Sepolia
   - Check network in MetaMask

3. **Gas Price Too Low**
   - Increase gas limit
   - Try again

4. **Contract Error**
   - Check error message
   - Verify contract address

### Notes not loading

**Solutions:**

1. **Check Connection**
   - Verify wallet connected
   - Check network (Sepolia)

2. **IPFS Issues**
   - Wait a few seconds
   - Refresh page
   - Try different IPFS gateway

3. **Clear Cache**
   - Clear browser cache
   - Hard refresh

4. **Check Console**
   - Open browser console (F12)
   - Look for error messages

### Can't decrypt notes

**Causes:**

1. **Wrong Wallet**
   - Notes encrypted with different wallet
   - Switch to correct wallet

2. **Corrupted Data**
   - IPFS content unavailable
   - Try different gateway

3. **Wrong Network**
   - Switch to Sepolia
   - Verify contract address

**Prevention:**
- Always use same wallet
- Export notes regularly
- Keep backups

### Mobile issues

**Solutions:**

1. **Use MetaMask App**
   - Download MetaMask mobile
   - Open site in MetaMask browser

2. **Deep Link**
   - Click "Open in MetaMask"
   - Automatically opens in app

3. **Manual Setup**
   - Add Sepolia network manually
   - Follow on-screen instructions

---

## Still Have Questions?

**Resources:**
- 📖 [Full Documentation](./README.md)
- 🚀 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- ✨ [Features List](./FEATURES.md)
- 🔧 [Integration Guide](./INTEGRATION_GUIDE.md)

**Support:**
- 💬 [GitHub Discussions](https://github.com/yourusername/web3-notes/discussions)
- 🐛 [Report Issues](https://github.com/yourusername/web3-notes/issues)
- 📧 Email: support@web3notes.com

**Community:**
- 🐦 Twitter: [@web3notes](https://twitter.com/web3notes)
- 💬 Discord: [Join Server](https://discord.gg/web3notes)
- 📱 Telegram: [Join Group](https://t.me/web3notes)

---

**Can't find your question?** [Ask on GitHub Discussions](https://github.com/yourusername/web3-notes/discussions) 💬
