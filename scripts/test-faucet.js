import { ethers } from 'ethers';

// Test configuration
const FAUCET_API_URL = 'http://localhost:3000/api/faucet'; // Change for production
const TEST_PRIVATE_KEY = '0x' + '1'.repeat(64); // Test private key - DO NOT use in production

async function testFaucet() {
  console.log('🧪 Testing Web3 Notes Faucet...\n');

  try {
    // Create test wallet
    const testWallet = new ethers.Wallet(TEST_PRIVATE_KEY);
    const testAddress = testWallet.address;
    
    console.log('📝 Test wallet address:', testAddress);

    // Create message and signature
    const message = `Request Sepolia ETH for ${testAddress} at ${Date.now()}`;
    const signature = await testWallet.signMessage(message);

    console.log('✍️  Message:', message);
    console.log('🔐 Signature:', signature.substring(0, 20) + '...');

    // Test the faucet API
    console.log('\n🚀 Making faucet request...');
    
    const response = await fetch(FAUCET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        signature,
        message,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Faucet request successful!');
      console.log('💰 Amount sent:', data.amount, 'ETH');
      console.log('🔗 Transaction hash:', data.transactionHash);
      console.log('🌐 Explorer URL:', data.explorerUrl);
    } else {
      console.log('❌ Faucet request failed:');
      console.log('📄 Error:', data.error);
      
      if (data.nextRequestTime) {
        const nextTime = new Date(data.nextRequestTime);
        console.log('⏰ Next request allowed:', nextTime.toLocaleString());
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Test different scenarios
async function runAllTests() {
  console.log('🔬 Running comprehensive faucet tests...\n');

  // Test 1: Valid request
  console.log('Test 1: Valid faucet request');
  await testFaucet();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Invalid signature
  console.log('Test 2: Invalid signature');
  try {
    const response = await fetch(FAUCET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: '0x1234567890123456789012345678901234567890',
        signature: '0xinvalidsignature',
        message: 'Test message',
      }),
    });
    
    const data = await response.json();
    console.log('Response:', data.error || data.message);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Missing fields
  console.log('Test 3: Missing required fields');
  try {
    const response = await fetch(FAUCET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: '0x1234567890123456789012345678901234567890',
        // Missing signature and message
      }),
    });
    
    const data = await response.json();
    console.log('Response:', data.error || data.message);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n✨ All tests completed!');
}

// Run tests
if (process.argv.includes('--all')) {
  runAllTests();
} else {
  testFaucet();
}

export { testFaucet, runAllTests };