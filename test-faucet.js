import { ethers } from 'ethers';

const FAUCET_API = 'http://localhost:3001/api/faucet';
const TEST_ADDRESS = '0x93111875c8a3e1243d3144701a8a576020e91904';

async function testFaucet() {
  try {
    console.log('🧪 Testing faucet for address:', TEST_ADDRESS);
    
    // Create a test wallet to sign the message
    // In real usage, this would be the user's MetaMask wallet
    const testWallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    
    // Create and sign the message
    const message = `ChainNotes Faucet Request\nAddress: ${TEST_ADDRESS}\nTimestamp: ${Date.now()}`;
    const signature = await testWallet.signMessage(message);
    
    console.log('📝 Message:', message);
    console.log('✍️  Signature:', signature);
    
    // Make the request
    const response = await fetch(FAUCET_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: TEST_ADDRESS,
        signature,
        message
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ SUCCESS!');
      console.log('💰 Amount sent:', data.amount, 'ETH');
      console.log('📋 Transaction hash:', data.transactionHash);
      console.log('🔗 Explorer:', data.explorerUrl);
    } else {
      console.log('❌ FAILED:', data.error || data.message);
      console.log('Response:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFaucet();
