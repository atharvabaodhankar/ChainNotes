import { ethers } from 'ethers';

const FAUCET_API_URL = '/api/faucet';
const FAUCET_STORAGE_KEY = 'chainnotes_faucet_claimed';

/**
 * Check if user has already claimed faucet funds
 */
export function hasClaimedFaucet(address) {
  if (!address) return false;
  
  const claimed = localStorage.getItem(FAUCET_STORAGE_KEY);
  if (!claimed) return false;
  
  try {
    const claimedAddresses = JSON.parse(claimed);
    return claimedAddresses.includes(address.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Mark address as having claimed faucet funds
 */
function markAsClaimed(address) {
  if (!address) return;
  
  const claimed = localStorage.getItem(FAUCET_STORAGE_KEY);
  let claimedAddresses = [];
  
  try {
    claimedAddresses = claimed ? JSON.parse(claimed) : [];
  } catch {
    claimedAddresses = [];
  }
  
  if (!claimedAddresses.includes(address.toLowerCase())) {
    claimedAddresses.push(address.toLowerCase());
    localStorage.setItem(FAUCET_STORAGE_KEY, JSON.stringify(claimedAddresses));
  }
}

/**
 * Check if user needs ETH (balance below threshold)
 */
async function needsETH(address, provider) {
  try {
    const balance = await provider.getBalance(address);
    const threshold = ethers.parseEther('0.001'); // 0.001 ETH threshold
    return balance < threshold;
  } catch (error) {
    console.error('Error checking balance:', error);
    return false;
  }
}

/**
 * Request faucet funds for a new user
 */
export async function requestAutoFaucet(address, signer) {
  try {
    // Check if already claimed
    if (hasClaimedFaucet(address)) {
      return {
        success: false,
        alreadyClaimed: true,
        message: 'Faucet already claimed for this address'
      };
    }

    // Check if user needs ETH
    const provider = signer.provider;
    const needs = await needsETH(address, provider);
    
    if (!needs) {
      markAsClaimed(address);
      return {
        success: false,
        sufficientBalance: true,
        message: 'Address already has sufficient balance'
      };
    }

    // Sign a message to prove ownership
    const message = `ChainNotes Faucet Request\nAddress: ${address}\nTimestamp: ${Date.now()}`;
    const signature = await signer.signMessage(message);

    // Request faucet funds
    const response = await fetch(FAUCET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        signature,
        message
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      markAsClaimed(address);
      return {
        success: true,
        transactionHash: data.transactionHash,
        amount: data.amount,
        explorerUrl: data.explorerUrl,
        message: `Successfully received ${data.amount} ETH!`
      };
    } else {
      return {
        success: false,
        error: data.error || 'Failed to request faucet funds',
        message: data.error || 'Failed to request faucet funds'
      };
    }
  } catch (error) {
    console.error('Auto-faucet error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to request faucet funds'
    };
  }
}

/**
 * Show notification to user about faucet result
 */
export function showFaucetNotification(result) {
  if (result.success) {
    return {
      type: 'success',
      title: '🎉 Welcome Gift Received!',
      message: `You've received ${result.amount} ETH to get started with ChainNotes!`,
      explorerUrl: result.explorerUrl
    };
  } else if (result.alreadyClaimed) {
    return null; // Don't show notification if already claimed
  } else if (result.sufficientBalance) {
    return null; // Don't show notification if they have enough
  } else {
    return {
      type: 'info',
      title: 'Welcome to ChainNotes',
      message: 'You can request test ETH from the faucet button if needed.',
    };
  }
}
