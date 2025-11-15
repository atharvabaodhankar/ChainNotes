import { ethers } from 'ethers';

// Environment variables needed:
// SEPOLIA_RPC_URL - Sepolia RPC endpoint
// FAUCET_PRIVATE_KEY - Private key of the faucet wallet
// FAUCET_AMOUNT - Amount to send (in ETH, e.g., "0.01")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY;
// Ensure private key has 0x prefix
const FAUCET_PRIVATE_KEY = PRIVATE_KEY_RAW ? (PRIVATE_KEY_RAW.startsWith('0x') ? PRIVATE_KEY_RAW : '0x' + PRIVATE_KEY_RAW) : null;
const FAUCET_AMOUNT = process.env.FAUCET_AMOUNT || '0.005'; // 0.005 ETH default
const RATE_LIMIT_HOURS = 24; // 24 hours between requests per address

// Simple in-memory storage for rate limiting (use Redis/DB in production)
const requestHistory = new Map();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, signature, message } = req.body;

    // Validate input
    if (!address || !signature || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: address, signature, message' 
      });
    }

    // Validate Ethereum address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ 
        error: 'Invalid Ethereum address format' 
      });
    }

    // Verify the signature to ensure the user owns the wallet
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(400).json({ 
          error: 'Signature verification failed' 
        });
      }
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid signature' 
      });
    }

    // Check rate limiting
    const now = Date.now();
    const lastRequest = requestHistory.get(address.toLowerCase());
    
    if (lastRequest && (now - lastRequest) < (RATE_LIMIT_HOURS * 60 * 60 * 1000)) {
      const hoursLeft = Math.ceil((RATE_LIMIT_HOURS * 60 * 60 * 1000 - (now - lastRequest)) / (60 * 60 * 1000));
      return res.status(429).json({ 
        error: `Rate limit exceeded. Try again in ${hoursLeft} hours.`,
        nextRequestTime: lastRequest + (RATE_LIMIT_HOURS * 60 * 60 * 1000)
      });
    }

    // Check if faucet is configured
    if (!FAUCET_PRIVATE_KEY) {
      return res.status(500).json({ 
        error: 'Faucet not configured',
        debug: 'PRIVATE_KEY environment variable is not set'
      });
    }

    // Initialize provider and wallet
    let provider, faucetWallet;
    try {
      provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      faucetWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);
    } catch (walletError) {
      console.error('Wallet initialization error:', walletError);
      return res.status(500).json({ 
        error: 'Failed to initialize faucet wallet',
        details: walletError.message
      });
    }

    // Check faucet balance
    const faucetBalance = await faucetWallet.provider.getBalance(faucetWallet.address);
    const amountToSend = ethers.parseEther(FAUCET_AMOUNT);

    if (faucetBalance < amountToSend) {
      return res.status(503).json({ 
        error: 'Faucet is empty. Please try again later.',
        faucetBalance: ethers.formatEther(faucetBalance)
      });
    }

    // Check recipient balance (don't send if they already have enough)
    const recipientBalance = await provider.getBalance(address);
    const minimumBalance = ethers.parseEther('0.001'); // 0.001 ETH

    if (recipientBalance > minimumBalance) {
      return res.status(400).json({ 
        error: 'Address already has sufficient balance',
        currentBalance: ethers.formatEther(recipientBalance)
      });
    }

    // Send the transaction
    const tx = await faucetWallet.sendTransaction({
      to: address,
      value: amountToSend,
      gasLimit: 21000, // Standard ETH transfer
    });

    // Update rate limiting
    requestHistory.set(address.toLowerCase(), now);

    // Return success response
    return res.status(200).json({
      success: true,
      transactionHash: tx.hash,
      amount: FAUCET_AMOUNT,
      recipient: address,
      message: `Successfully sent ${FAUCET_AMOUNT} ETH to ${address}`,
      explorerUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`
    });

  } catch (error) {
    console.error('Faucet error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    
    // Handle specific errors
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(503).json({ 
        error: 'Faucet has insufficient funds' 
      });
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({ 
        error: 'Network error. Please try again later.' 
      });
    }
    
    // Handle RPC rate limiting
    if (error.message && error.message.includes('in-flight transaction limit')) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again in a few minutes.',
        details: 'RPC rate limit reached'
      });
    }

    // Return detailed error for debugging
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      code: error.code,
      type: error.constructor.name
    });
  }
}