import { ethers } from 'ethers';

const FAUCET_API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/faucet' 
  : 'http://localhost:3000/api/faucet';

/**
 * Request Sepolia ETH from the faucet
 * @param {string} address - User's wallet address
 * @param {object} signer - Ethers signer object
 * @returns {Promise<object>} - Faucet response
 */
export const requestSepoliaETH = async (address, signer) => {
  try {
    // Create a message to sign for verification
    const message = `Request Sepolia ETH for ${address} at ${Date.now()}`;
    
    // Sign the message
    const signature = await signer.signMessage(message);

    // Make the API request
    const response = await fetch(FAUCET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        signature,
        message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Faucet request failed');
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error('Faucet request error:', error);
    throw error;
  }
};

/**
 * Check if user is eligible for faucet (has low balance)
 * @param {string} address - User's wallet address
 * @param {object} provider - Ethers provider
 * @returns {Promise<boolean>} - Whether user is eligible
 */
export const checkFaucetEligibility = async (address, provider) => {
  try {
    const balance = await provider.getBalance(address);
    const minimumBalance = ethers.parseEther('0.001'); // 0.001 ETH
    
    return balance < minimumBalance;
  } catch (error) {
    console.error('Error checking faucet eligibility:', error);
    return false;
  }
};

/**
 * Get user's current ETH balance
 * @param {string} address - User's wallet address  
 * @param {object} provider - Ethers provider
 * @returns {Promise<string>} - Balance in ETH
 */
export const getUserBalance = async (address, provider) => {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting user balance:', error);
    return '0';
  }
};

/**
 * Format faucet error messages for user display
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export const formatFaucetError = (error) => {
  const message = error.message || error.toString();
  
  if (message.includes('Rate limit exceeded')) {
    return 'You can only request ETH once per day. Please try again later.';
  }
  
  if (message.includes('already has sufficient balance')) {
    return 'Your wallet already has enough ETH for transactions.';
  }
  
  if (message.includes('Faucet is empty')) {
    return 'The faucet is temporarily empty. Please try again later.';
  }
  
  if (message.includes('Signature verification failed')) {
    return 'Wallet verification failed. Please try again.';
  }
  
  if (message.includes('Network error')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return 'Failed to request ETH. Please try again later.';
};