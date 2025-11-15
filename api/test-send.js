import { ethers } from 'ethers';

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TEST_ADDRESS = '0x93111875c8a3e1243d3144701a8a576020e91904';
const AMOUNT = '0.005';

async function sendTestETH() {
  try {
    console.log('🚀 Sending test ETH...');
    console.log('📍 To:', TEST_ADDRESS);
    console.log('💰 Amount:', AMOUNT, 'ETH');
    
    if (!PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not set in environment');
    }
    
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet('0x' + PRIVATE_KEY, provider);
    
    console.log('👛 From:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💵 Faucet balance:', ethers.formatEther(balance), 'ETH');
    
    // Check recipient balance before
    const recipientBalanceBefore = await provider.getBalance(TEST_ADDRESS);
    console.log('📊 Recipient balance before:', ethers.formatEther(recipientBalanceBefore), 'ETH');
    
    // Send transaction
    const tx = await wallet.sendTransaction({
      to: TEST_ADDRESS,
      value: ethers.parseEther(AMOUNT),
      gasLimit: 21000,
    });
    
    console.log('⏳ Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    console.log('✅ Transaction confirmed!');
    console.log('📋 Block:', receipt.blockNumber);
    console.log('⛽ Gas used:', receipt.gasUsed.toString());
    
    // Check recipient balance after
    const recipientBalanceAfter = await provider.getBalance(TEST_ADDRESS);
    console.log('📊 Recipient balance after:', ethers.formatEther(recipientBalanceAfter), 'ETH');
    console.log('🔗 View on Etherscan: https://sepolia.etherscan.io/tx/' + tx.hash);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendTestETH();
