import { ethers } from 'ethers';

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const FAUCET_PRIVATE_KEY = process.env.PRIVATE_KEY;
const FAUCET_AMOUNT = process.env.FAUCET_AMOUNT || '0.005';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if faucet is configured
    if (!FAUCET_PRIVATE_KEY) {
      return res.status(500).json({ 
        error: 'Faucet not configured',
        configured: false
      });
    }

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const faucetWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);

    // Get faucet balance
    const balance = await provider.getBalance(faucetWallet.address);
    const balanceETH = ethers.formatEther(balance);

    // Calculate how many requests can be fulfilled
    const amountPerRequest = ethers.parseEther(FAUCET_AMOUNT);
    const requestsRemaining = Math.floor(Number(balance) / Number(amountPerRequest));

    // Get network info
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    // Check if balance is low
    const minimumBalance = ethers.parseEther('0.1'); // 0.1 ETH minimum
    const isLowBalance = balance < minimumBalance;

    return res.status(200).json({
      configured: true,
      faucet: {
        address: faucetWallet.address,
        balance: balanceETH,
        balanceWei: balance.toString(),
        isLowBalance,
        minimumBalance: '0.1'
      },
      settings: {
        amountPerRequest: FAUCET_AMOUNT,
        rateLimitHours: 24
      },
      capacity: {
        requestsRemaining,
        estimatedDaysRemaining: Math.floor(requestsRemaining / 100) // Assuming 100 requests per day
      },
      network: {
        name: network.name,
        chainId: network.chainId.toString(),
        blockNumber
      },
      status: isLowBalance ? 'warning' : 'healthy',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Faucet status error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to get faucet status',
      configured: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}