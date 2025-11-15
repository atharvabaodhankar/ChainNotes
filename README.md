# 📝 Web3 Notes

> A fully decentralized, encrypted note-taking application built on Ethereum blockchain and IPFS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.0-blue)](https://reactjs.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple)](https://sepolia.etherscan.io/)

## 🌟 Overview

Web3 Notes is a production-ready decentralized application (dApp) that combines blockchain technology with distributed file storage to create a censorship-resistant, privacy-focused note-taking platform. Your notes are truly yours - encrypted, immutable, and stored on the blockchain.

### 🎯 Key Features

- ✅ **Decentralized Storage** - Notes stored on Ethereum + IPFS
- ✅ **End-to-End Encryption** - AES-256 client-side encryption
- ✅ **True Ownership** - You control your data via your wallet
- ✅ **Categories & Organization** - Organize notes with custom categories
- ✅ **Favorites System** - Star important notes for quick access
- ✅ **Advanced Search** - Full-text search with multiple filters
- ✅ **Note Templates** - 6 pre-built templates for productivity
- ✅ **Export/Import** - Backup in JSON, Markdown, or Plain Text
- ✅ **Mobile Optimized** - Full mobile support with MetaMask integration
- ✅ **Automated Faucet** - Free Sepolia ETH for new users
- ✅ **Professional UI** - Modern, responsive design

## 🚀 Live Demo

**Contract Address:** `0xc95BC91D0e0Bcb13F288d2341a289D9b0c281b03`  
**Network:** Ethereum Sepolia Testnet  
**Explorer:** [View on Etherscan](https://sepolia.etherscan.io/address/0xc95BC91D0e0Bcb13F288d2341a289D9b0c281b03)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Smart Contract](#-smart-contract)
- [Security](#-security)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 📝 Core Features

#### **Note Management**
- Create, read, update, and delete notes
- Rich text support with markdown
- Automatic encryption before storage
- Immutable blockchain records
- IPFS distributed storage

#### **Organization**
- **Categories** - Organize notes with custom categories
- **Favorites** - Star important notes
- **Search** - Full-text search across all notes
- **Filters** - Filter by category, favorites, date
- **Sorting** - 5 sort options (newest, oldest, title, modified, favorites)

#### **Templates**
6 pre-built note templates:
- 📄 **Blank Note** - Start from scratch
- 👥 **Meeting Notes** - Structured meeting format
- ✅ **To-Do List** - Task checklist
- 💡 **Idea** - Idea development template
- 📖 **Daily Journal** - Daily reflection
- 💻 **Code Snippet** - Code storage with syntax

#### **Export & Import**
- **Export Formats:**
  - JSON (full data with metadata)
  - Markdown (formatted text)
  - Plain Text (simple format)
- **Import:** Restore from JSON backups

#### **Mobile Experience**
- Automatic mobile browser detection
- MetaMask mobile app integration
- Deep linking to MetaMask browser
- Touch-optimized controls
- Responsive layouts
- Platform-specific instructions

#### **Automated Faucet**
- Automatic Sepolia ETH distribution
- One-click request for new users
- Signature verification for security
- 24-hour rate limiting
- Balance checking
- Seamless onboarding

### 🔐 Security Features

- **Client-Side Encryption** - AES-256 encryption
- **Wallet Authentication** - MetaMask integration
- **Signature Verification** - Prove wallet ownership
- **No Server Access** - All encryption happens in browser
- **Encrypted IPFS Storage** - Content unreadable without key
- **Ownership Verification** - Blockchain-based proof

### 📊 Statistics Dashboard

Real-time stats showing:
- Total notes count
- Favorites count
- Categories count
- Notes created this week
- Notes created this month
- On-chain verification status

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│              (React + Vite + TailwindCSS)               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   MetaMask Wallet                        │
│              (Authentication & Signing)                  │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────┐        ┌──────────────────────┐
│   Smart Contract     │        │    IPFS Storage      │
│  (Ethereum Sepolia)  │        │     (Pinata)         │
│                      │        │                      │
│  - Note metadata     │        │  - Encrypted content │
│  - Ownership         │        │  - Distributed       │
│  - Categories        │        │  - Permanent         │
│  - Favorites         │        │                      │
└──────────────────────┘        └──────────────────────┘
```

### Data Flow

#### Creating a Note:
```
1. User writes note → 2. Encrypt (AES-256) → 3. Upload to IPFS
                                                      ↓
                                              4. Get IPFS hash
                                                      ↓
5. Display note ← 6. Confirm transaction ← 7. Store hash on blockchain
```

#### Reading Notes:
```
1. Query blockchain → 2. Get IPFS hashes → 3. Fetch from IPFS
                                                      ↓
                                              4. Decrypt content
                                                      ↓
                                              5. Display notes
```

### Technology Stack

#### **Frontend**
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Ethers.js v6** - Blockchain interaction
- **Axios** - HTTP client
- **CryptoJS** - Encryption

#### **Blockchain**
- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Development framework
- **Ethereum Sepolia** - Testnet deployment
- **OpenZeppelin** - Security standards

#### **Storage**
- **IPFS** - Distributed file system
- **Pinata** - IPFS pinning service

#### **Backend (Optional)**
- **Vercel Edge Functions** - Serverless API
- **Node.js 18+** - Runtime

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MetaMask** browser extension or mobile app
- **Sepolia ETH** (get from faucet or use built-in automated faucet)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/web3-notes.git
cd web3-notes
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install smart contract dependencies
cd ../smart-contracts
npm install
```

3. **Configure environment variables**

**Frontend** (`frontend/.env`):
```env
VITE_CONTRACT_ADDRESS=0xc95BC91D0e0Bcb13F288d2341a289D9b0c281b03
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_key
VITE_PINATA_SECRET_JWT=your_pinata_jwt
VITE_SECRET=Web3Notes_SecureKey_2025
```

**Smart Contracts** (`smart-contracts/.env`):
```env
SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

4. **Start the development server**
```bash
cd frontend
npm run dev
```

5. **Open your browser**
```
http://localhost:5173
```

### Quick Start Guide

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve MetaMask connection
   - Switch to Sepolia network (automatic)

2. **Get Free ETH** (if needed)
   - Click "Get Free ETH" button
   - Sign the message
   - Receive 0.005 Sepolia ETH

3. **Create Your First Note**
   - Click the "+" button
   - Enter title and content
   - Optionally add a category
   - Click "Add Note"
   - Confirm transaction in MetaMask

4. **Explore Features**
   - Search notes
   - Filter by category
   - Mark favorites
   - Use templates
   - Export your data

## 📖 Usage

### Creating Notes

```javascript
// With category
1. Click "+" button
2. Fill in title and content
3. Add category (e.g., "Work", "Personal")
4. Click "Add Note"
5. Confirm transaction

// Using templates
1. Click template icon in header
2. Choose a template
3. Edit pre-filled content
4. Save note
```

### Organizing Notes

```javascript
// Search
- Type in search bar
- Results filter in real-time

// Filter by category
- Click "Filters" button
- Select category from dropdown

// Mark as favorite
- Click star icon on note card
- Toggle on/off

// Sort notes
- Newest first
- Oldest first
- Title (A-Z)
- Recently modified
- Favorites first
```

### Exporting Data

```javascript
// Export
1. Click export icon in header
2. Choose format (JSON/Markdown/Text)
3. File downloads automatically

// Import
1. Click export icon in header
2. Switch to "Import" tab
3. Select JSON file
4. Notes are uploaded to blockchain
```

## 📜 Smart Contract

### NotesV2 Contract

**Address:** `0xc95BC91D0e0Bcb13F288d2341a289D9b0c281b03`  
**Network:** Ethereum Sepolia Testnet

### Contract Structure

```solidity
struct Note {
    uint id;              // Unique identifier
    string ipfsHash;      // IPFS content hash
    address owner;        // Note owner
    uint timestamp;       // Creation time
    string category;      // Note category
    bool isFavorite;      // Favorite flag
    uint lastModified;    // Last update time
}
```

### Main Functions

```solidity
// Create note with category
function addNote(string memory _ipfsHash, string memory _category) external

// Update existing note
function updateNote(uint _id, string memory _ipfsHash, string memory _category) external

// Toggle favorite status
function toggleFavorite(uint _id) external

// Get all user notes
function getMyNotes() external view returns (Note[] memory)

// Get notes by category
function getNotesByCategory(string memory _category) external view returns (Note[] memory)

// Get favorite notes
function getFavoriteNotes() external view returns (Note[] memory)

// Get user's categories
function getMyCategories() external view returns (string[] memory)

// Delete note
function deleteNote(uint _id) external
```

### Gas Costs (Estimated)

| Function | Gas Used | Cost @ 20 gwei |
|----------|----------|----------------|
| addNote | ~150,000 | ~0.003 ETH |
| updateNote | ~100,000 | ~0.002 ETH |
| toggleFavorite | ~50,000 | ~0.001 ETH |
| deleteNote | ~80,000 | ~0.0016 ETH |
| getMyNotes | 0 (view) | Free |

## 🔒 Security

### Encryption

**Algorithm:** AES-256  
**Key Derivation:** SHA-256(walletAddress + secretPhrase)  
**Location:** Client-side only

```javascript
// Encryption process
1. Generate key from wallet address
2. Encrypt note content with AES-256
3. Upload encrypted data to IPFS
4. Store IPFS hash on blockchain

// Decryption process
1. Fetch encrypted data from IPFS
2. Generate key from wallet address
3. Decrypt with AES-256
4. Display plaintext content
```

### What's Protected

✅ **Note content** - Fully encrypted  
✅ **Note titles** - Encrypted with content  
✅ **Privacy** - Only wallet owner can decrypt  

### What's Public

❌ **IPFS hashes** - Visible on blockchain  
❌ **Note count** - Number of notes per user  
❌ **Timestamps** - Creation/modification times  
❌ **Categories** - Category names (not content)  
❌ **Wallet addresses** - Public by design  

### Security Best Practices

1. **Never share your private key**
2. **Backup your wallet seed phrase**
3. **Use strong passwords for MetaMask**
4. **Verify contract addresses**
5. **Test with small amounts first**

## 🛠️ Development

### Project Structure

```
web3-notes/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/           # Utility functions
│   │   ├── abis/            # Contract ABIs
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   └── package.json
│
├── smart-contracts/         # Solidity contracts
│   ├── contracts/
│   │   ├── Notes.sol        # V1 contract (legacy)
│   │   └── NotesV2.sol      # V2 contract (current)
│   ├── scripts/
│   │   ├── deploy.js        # V1 deployment
│   │   └── deploy-v2.js     # V2 deployment
│   ├── test/                # Contract tests
│   └── hardhat.config.cjs
│
├── api/                     # Serverless functions
│   ├── faucet.js           # Automated faucet
│   └── faucet-status.js    # Faucet monitoring
│
└── docs/                    # Documentation
    ├── FEATURES.md
    ├── DEPLOYMENT_GUIDE.md
    ├── INTEGRATION_GUIDE.md
    └── MIGRATION_V1_TO_V2.md
```

### Running Tests

```bash
# Smart contract tests
cd smart-contracts
npx hardhat test

# Frontend tests
cd frontend
npm run test
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Output in frontend/dist/
```

### Deploying Smart Contract

```bash
# Compile contracts
cd smart-contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy-v2.js --network sepolia

# Verify on Etherscan (optional)
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## 🚀 Deployment

### Frontend Deployment

**Recommended:** Vercel, Netlify, or GitHub Pages

```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

### Faucet Deployment

**Platform:** Vercel Edge Functions

```bash
# Set environment variables
vercel env add FAUCET_PRIVATE_KEY
vercel env add SEPOLIA_RPC_URL

# Deploy
vercel --prod
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 Features Comparison

### vs Traditional Note Apps

| Feature | Web3 Notes | Google Keep | Evernote |
|---------|-----------|-------------|----------|
| **Data Ownership** | ✅ You own it | ❌ Company owns | ❌ Company owns |
| **Privacy** | ✅ Encrypted | ⚠️ Server access | ⚠️ Server access |
| **Censorship Resistant** | ✅ Decentralized | ❌ Can be deleted | ❌ Can be deleted |
| **Permanence** | ✅ Blockchain | ⚠️ Can shut down | ⚠️ Can shut down |
| **No Account Needed** | ✅ Wallet only | ❌ Email required | ❌ Email required |
| **Open Source** | ✅ Transparent | ❌ Proprietary | ❌ Proprietary |

### vs Other Web3 Note Apps

| Feature | Web3 Notes | Others |
|---------|-----------|--------|
| **Mobile Support** | ✅ Excellent | ⚠️ Limited |
| **Automated Faucet** | ✅ Built-in | ❌ Manual |
| **Templates** | ✅ 6 templates | ⚠️ Few/None |
| **Export Options** | ✅ 3 formats | ⚠️ Limited |
| **Search & Filter** | ✅ Advanced | ⚠️ Basic |
| **Categories** | ✅ Unlimited | ⚠️ Limited |
| **UI/UX** | ✅ Modern | ⚠️ Basic |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Test on mobile devices
- Check gas optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin** - Smart contract libraries
- **Hardhat** - Development framework
- **Ethers.js** - Ethereum library
- **Pinata** - IPFS pinning service
- **TailwindCSS** - Styling framework
- **Heroicons** - Icon library

## 📞 Support

- **Documentation:** Check the `/docs` folder
- **Issues:** [GitHub Issues](https://github.com/yourusername/web3-notes/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/web3-notes/discussions)

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- ✅ Core note functionality
- ✅ Encryption
- ✅ Mobile support
- ✅ Automated faucet
- ✅ Categories & favorites
- ✅ Search & filter
- ✅ Templates
- ✅ Export/Import

### Phase 2 (Next)
- 🔄 Rich text editor (Markdown support)
- 🔄 Note sharing (encrypted links)
- 🔄 Collaborative notes
- 🔄 File attachments (images, PDFs)
- 🔄 Voice notes
- 🔄 Note linking (backlinks)

### Phase 3 (Future)
- 📅 Reminders & notifications
- 📅 Multi-wallet support
- 📅 Cross-chain support
- 📅 AI-powered features
- 📅 Browser extension
- 📅 Desktop app

### Phase 4 (Long-term)
- 🎯 Team workspaces
- 🎯 Public note sharing
- 🎯 Monetization options
- 🎯 API for developers
- 🎯 Plugin system
- 🎯 Mobile native apps

## 📈 Stats

- **Smart Contract:** NotesV2.sol
- **Contract Address:** `0xc95BC91D0e0Bcb13F288d2341a289D9b0c281b03`
- **Network:** Ethereum Sepolia
- **Total Features:** 30+
- **Components:** 15+
- **Lines of Code:** 5000+
- **Build Size:** 629 KB (211 KB gzipped)

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

**Built with ❤️ for the decentralized web**

**Web3 Notes** - Your notes, your keys, your data.
